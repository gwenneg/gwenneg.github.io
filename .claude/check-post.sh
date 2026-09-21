#!/usr/bin/env bash
# Mechanical checks for a post, so the rules a command can check do not depend on attention.
# Usage: .claude/check-post.sh _posts/YYYY-MM-DD-slug.adoc
# FAIL lines break a rule of CLAUDE.md. LOOK lines can be false alarms and need a human read.
# Runs on macOS: bash 3.2, BSD grep, sed and awk.

set -u
export LC_ALL=en_US.UTF-8

post="${1:-}"
if [ -z "$post" ] || [ ! -f "$post" ]; then
  echo "Usage: $0 _posts/YYYY-MM-DD-slug.adoc" >&2
  exit 2
fi

repo="$(cd "$(dirname "$0")/.." && pwd)"
fails=0

fail() { echo "FAIL  $1"; fails=$((fails + 1)); }
look() { echo "LOOK  $1"; }

# body: the numbered lines of the post, without the delimited blocks (code, passthrough, comments)
# and without the header attributes. A block closes only on the delimiter that opened it.
body="$(awk '
  /^(----|\.\.\.\.|\+\+\+\+|\/\/\/\/)$/ { if (open == "") open = $0; else if ($0 == open) open = ""; next }
  open != "" { next }
  /^:[a-z-]+:/ { next }
  { print NR ":" $0 }
' "$post")"

# text: what a reader reads. The body plus the excerpt, without inline code, link targets and entities.
text="$( { grep -n '^:page-excerpt:' "$post"; printf '%s\n' "$body"; } \
  | sed -E 's/`[^`]*`//g; s#(https?://|link:|xref:)[^[ ]+##g; s/TL;DR/TLDR/g; s/&[a-z#0-9]+;//g')"

# Reports every line of a source that matches a pattern: hits <fail|look> <label> <source> <pattern>
hits() {
  local level="$1" label="$2" source="$3" pattern="$4" out
  out="$(printf '%s\n' "$source" | grep -iE -e "$pattern")"
  [ -z "$out" ] && return
  while IFS= read -r line; do "$level" "$label: $line"; done <<EOF
$out
EOF
}

# Header
file_date="$(basename "$post" | cut -c1-10)"
revdate="$(sed -n 's/^:revdate: *//p' "$post")"
[ "$file_date" = "$revdate" ] || fail "filename date ($file_date) and :revdate: ($revdate) differ, the post will not appear"

excerpt_length="$(sed -n 's/^:page-excerpt: *//p' "$post" | tr -d '\n' | wc -m | tr -d ' ')"
[ "$excerpt_length" -gt 0 ] || fail "no :page-excerpt:"
[ "$excerpt_length" -le 157 ] || fail "excerpt is $excerpt_length characters, the limit is 157"

order="$(grep -E '^:(imagesdir|page-excerpt|page-tags|revdate):' "$post" | sed -E 's/^(:[a-z-]+:).*/\1/' | tr '\n' ' ')"
case "$order" in
  ":page-excerpt: :page-tags: :revdate: " | ":imagesdir: :page-excerpt: :page-tags: :revdate: ") ;;
  *) fail "header attributes missing or out of order: $order" ;;
esac

grep -q '^This post was written with the help of AI\.$' "$post" || fail "the AI note is missing"

# Tags: a tag no other post uses is allowed, but it must be a choice.
other_tags="$(ls "$repo"/_posts/*.adoc | grep -v "/$(basename "$post")\$" | xargs sed -n 's/^:page-tags: *\[\(.*\)\]/\1/p' | tr ',' '\n' | sed 's/^ *//; s/ *$//')"
tags="$(sed -n 's/^:page-tags: *\[\(.*\)\]/\1/p' "$post" | tr ',' '\n' | sed 's/^ *//; s/ *$//')"
while IFS= read -r tag; do
  [ -z "$tag" ] && continue
  [ "$tag" = "$(printf '%s' "$tag" | tr '[:upper:]' '[:lower:]')" ] || fail "tag is not lowercase: $tag"
  printf '%s\n' "$other_tags" | grep -qxF -e "$tag" || look "tag used by no other post: $tag"
done <<EOF
$tags
EOF

# Never write. Word stems, so "steering" and "leveraging" are caught too.
hits fail "em or en dash" "$text" "—|–"
hits fail "semicolon" "$text" ";"
hits fail "banned word" "$text" "(^|[^a-z])(churn|sway|steer|vouch|weighted|skew|inert([^a-z]|$)|linger|warrant|delv|leverag|seamless|robust|crucial|landscape|navigat|unlock|empower|game[- ]changer)"
hits fail "banned phrase" "$text" "structural rather than advisory|the part I care most about|I['’]d rather name it than hide it|unknown unknowns|of mine([^a-z]|$)|most proud of|at its core|that['’]s where .* comes? in|here['’]s the thing|let['’]s dive in|in this post,? (we|I)( will|['’]ll)|the result\?"
hits look "possible \"not X, it's Y\" contrast" "$text" "(is|are|was|it['’]s|that['’]s) not .*, (it|that|they)(['’]s| is| are)|(isn['’]t|aren['’]t|wasn['’]t) .*, (it|that|they)(['’]s| is| are)|not (just|only)|n['’]t (just|only)"
hits look "tell from the public lists" "$text" "(^|[^a-z])(serves? as|stands? as|acts? as|worth noting|key insight|pivotal|testament to|many developers|experts say|very|really|truly|incredibly)([^a-z]|$)"
hits look "sentence that starts with Curious" "$text" "^[0-9]+:Curious"
hits look "position instead of a name" "$text" "the (former|latter)|the (next|previous|above|first|second|third|last) (section|part|option|one)"

exactly="$(printf '%s\n' "$text" | grep -ciw "exactly")"
[ "$exactly" -le 3 ] || look "\"exactly\" appears on $exactly lines"

# AsciiDoc conventions
hits fail "link without ^" "$body" "(https?://[^[ ]+|link:[^[ ]+)\[[^]]*[^]^]\]|(https?://[^[ ]+|link:[^[ ]+)\[\]"
hits look "bare URL, a link needs a text and ^" "$body" "https?://[^[ ]+( |$)"
hits fail "image with a width" "$body" "image:.*width="
hits look "bold, not allowed inside prose" "$body" "(^|[^*])\*[^* ][^*]*\*"
hits look "leftover TODO or comment, a TODO source mark goes only when its source is found" "$body" "TODO|^[0-9]+://"

sentences="$(printf '%s\n' "$body" | grep -E '[a-z0-9)`][.!?] [A-Z]' | grep -vE '^[0-9]+:\|')"
[ -z "$sentences" ] || while IFS= read -r line; do look "several sentences on one line: $line"; done <<EOF
$sentences
EOF

# Images exist
imagesdir="$(sed -n 's/^:imagesdir: *//p' "$post")"
for image in $(printf '%s\n' "$body" | grep -oE 'image::?[^[ ]+\[' | sed -E 's/^image::?//; s/\[$//'); do
  [ -f "$repo$imagesdir/$image" ] || fail "image not found: $imagesdir/$image"
done

# Cross-references resolve, to an anchor or to a section title
targets="$(printf '%s\n' "$body" | grep -oE '<<[^>]+>>' | sed -E 's/^<<//; s/>>$//; s/,.*//' | sort -u)"
while IFS= read -r target; do
  [ -z "$target" ] && continue
  grep -qF -e "[[$target]]" -e "[[$target," -e "[#$target]" -e "[#$target." -e "[#$target," "$post" && continue
  awk -v t="$target" '/^=+ / { sub(/^=+ /, ""); if ($0 == t) found = 1 } END { exit !found }' "$post" && continue
  fail "cross-reference without an anchor: $target"
done <<EOF
$targets
EOF

echo
if [ "$fails" -eq 0 ]; then
  echo "No FAIL. Read every LOOK line above before calling the post clean."
else
  echo "$fails FAIL."
  exit 1
fi
