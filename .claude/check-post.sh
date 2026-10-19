#!/usr/bin/env bash
# Mechanical checks for a post, so the rules a command can check do not depend on attention.
# Usage: .claude/check-post.sh content/posts/YYYY-MM-DD-slug.md
# FAIL lines break a rule of CLAUDE.md. LOOK lines can be false alarms and need a human read.
# Callouts are checked by the Hugo build itself: run `hugo --panicOnWarning` as well.
# Runs on macOS: bash 3.2, BSD grep, sed and awk.

set -u
export LC_ALL=en_US.UTF-8

post="${1:-}"
if [ -z "$post" ] || [ ! -f "$post" ]; then
  echo "Usage: $0 content/posts/YYYY-MM-DD-slug.md" >&2
  exit 2
fi

repo="$(cd "$(dirname "$0")/.." && pwd)"
fails=0

fail() { echo "FAIL  $1"; fails=$((fails + 1)); }
look() { echo "LOOK  $1"; }

# front: the front matter, between the first two --- lines.
front_of() { awk 'NR == 1 && $0 == "---" { inside = 1; next } inside && $0 == "---" { exit } inside { print }' "$1"; }
front="$(front_of "$post")"
# field: a front matter value as the reader sees it. Handles plain, "double" and 'single' quoted values,
# and >- or |- block scalars, whose indented lines are joined with spaces.
field() {
  printf '%s\n' "$front" | awk -v key="$1" '
    block { if ($0 ~ /^[ \t]/ || $0 == "") { line = $0; sub(/^[ \t]+/, "", line); if (line != "") value = value (value == "" ? "" : " ") line; next } exit }
    index($0, key ":") == 1 {
      value = substr($0, length(key) + 2); sub(/^ +/, "", value); sub(/ +$/, "", value)
      if (value ~ /^[>|][-+]?$/) { block = 1; value = ""; next }
      if (value ~ /^".*"$/) { value = substr(value, 2, length(value) - 2); gsub(/\\"/, "\"", value); gsub(/\\\\/, "\\", value) }
      else if (value ~ /^\x27.*\x27$/) { value = substr(value, 2, length(value) - 2); gsub(/\x27\x27/, "\x27", value) }
      exit
    }
    END { print value }'
}

# body: the numbered lines of the post after the front matter, without fenced code blocks.
# A fence closes on a line of the same character, at least as long as the opening one, with nothing after it.
body="$(awk '
  NR == 1 && $0 == "---" { front = 1; next }
  front { if ($0 == "---") front = 0; next }
  match($0, /^ *(```+|~~~+)/) {
    run = substr($0, RSTART, RLENGTH); sub(/^ */, "", run); rest = substr($0, RSTART + RLENGTH)
    if (fence == "") { fence = run; next }
    if (substr(run, 1, 1) == substr(fence, 1, 1) && length(run) >= length(fence) && rest ~ /^ *$/) { fence = ""; next }
  }
  fence != "" { next }
  { print NR ":" $0 }
' "$post")"

# text: what a reader reads. The title, the excerpt and the body, without inline code, link targets,
# heading attributes, shortcodes and entities.
text="$( { printf '0:%s\n0:%s\n' "$(field title)" "$(field description)"; printf '%s\n' "$body"; } \
  | sed -E 's/`[^`]*`//g; s/\]\([^)]*\)/]/g; s#<?https?://[^ >)]+>?##g; s/\{[#.][^}]*\}//g; s/\{\{<[^>]*>\}\}//g; s/TL;DR/TLDR/g; s/&[a-z#0-9]+;//g')"

# Reports every line of a source that matches a pattern: hits <fail|look> <label> <source> <pattern>
hits() {
  local level="$1" label="$2" source="$3" pattern="$4" out
  out="$(printf '%s\n' "$source" | grep -iE -e "$pattern")"
  [ -z "$out" ] && return
  while IFS= read -r line; do "$level" "$label: $line"; done <<EOF
$out
EOF
}

# Front matter. The date and the URL come from the file name.
basename "$post" | grep -qE '^[0-9]{4}-[0-9]{2}-[0-9]{2}-[a-z0-9-]+\.md$' || fail "file name is not YYYY-MM-DD-slug.md: $(basename "$post")"
[ -n "$front" ] || fail "no front matter between --- lines"
printf '%s\n' "$front" | grep -qE '^date:' && look "a date: field, the date already comes from the file name"

title="$(field title)"
description="$(field description)"
[ -n "$title" ] || fail "no title"
excerpt_length="$(printf '%s' "$description" | wc -m | tr -d ' ')"
[ "$excerpt_length" -gt 0 ] || fail "no description, the excerpt"
[ "$excerpt_length" -le 157 ] || fail "excerpt is $excerpt_length characters, the limit is 157"
printf '%s\n%s\n' "$title" "$description" | grep -qE "[[:alpha:]]'[[:alpha:]]" && fail "straight apostrophe in the title or the excerpt, write ’ (can’t, let’s)"

# The AI note is the first block, after the header image when there is one.
# The header image can have a caption, and attributes such as {width="800px"} on the next line.
first="$(printf '%s\n' "$body" | sed -E 's/^[0-9]+://' | grep -v '^ *$' \
  | awk 'header && /^\{[^}]*\}$/ { header = 0; next } { header = 0 } /^!\[[^]]*\]\([^)]*\/header\.png( "[^"]*")?\)$/ { header = 1; next } { print }' \
  | head -2 | tr '\n' '|')"
[ "$first" = "> [!NOTE]|> This post was written with the help of AI.|" ] || fail "the AI note is missing or is not the first block"

# Tags: a tag no other post uses is allowed, but it must be a choice.
tag_list() { sed -n 's/^tags: *\[\(.*\)\]/\1/p' | tr ',' '\n' | sed -E 's/^ *//; s/ *$//; s/^"(.*)"$/\1/'; }
other_tags="$(for other in "$repo"/content/posts/*.md; do [ "$(basename "$other")" = "$(basename "$post")" ] || front_of "$other"; done | tag_list)"
tags="$(printf '%s\n' "$front" | tag_list)"
[ -n "$tags" ] || fail "no tags: [...] line in the front matter"
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

# Markdown conventions
hits fail "AsciiDoc syntax left in a Markdown post" "$body" "^[0-9]+:(=+ |\[(NOTE|TIP|IMPORTANT|WARNING|CAUTION|source[^]]*)\]$|====$|:[a-z-]+: )|link:[^ []+\[|image::?[^ []+\[|<<[^>]+>>"
hits fail "link text ending with ^, links open in a new tab on their own" "$body" "\^\]\("
hits fail "a level-1 heading, the title comes from the front matter" "$body" "^[0-9]+:# "
hits look "bare URL, a link needs a text" "$(printf '%s\n' "$body" | sed -E 's/`[^`]*`//g; s/\]\([^)]*\)/]/g')" "https?://"
# An image takes its attributes on the same line or on the next one.
hits fail "image with a width" "$(printf '%s\n' "$body" | awk -F: '{ line = $0; sub(/^[0-9]+:/, "", line) } prev && line ~ /^ *\{[^}]*width/ { print prevline " " line } { prev = (line ~ /^ *!\[[^]]*\]\([^)]*\) *$/); prevline = $0 } line ~ /!\[[^]]*\]\([^)]*\)\{[^}]*width/ { print }')" "width"
hits fail "image without alt text" "$body" "!\[\]\("
hits look "bold, not allowed inside prose" "$body" "\*\*[^*]+\*\*"
# __bold__ too, ignoring inline code such as `__init__`
hits look "bold, not allowed inside prose" "$(printf '%s\n' "$body" | awk '{ line = $0; gsub(/`[^`]*`/, "", line); if (line ~ /__[^_]+__/) print }')" "."
hits look "leftover TODO or comment, a TODO source mark goes only when its source is found" "$body" "TODO|<!--"

# The marker of a numbered list item ("1. ") is dropped first, it does not end a sentence.
sentences="$(printf '%s\n' "$body" | grep -vE '^[0-9]+: *\|' | awk '{ line = $0; sub(/^[0-9]+: *([0-9]+[.)] +)?/, "", line); if (line ~ /[a-z0-9)`*][.!?] [A-Z]/) print }')"
[ -z "$sentences" ] || while IFS= read -r line; do look "several sentences on one line: $line"; done <<EOF
$sentences
EOF

# Images exist: absolute paths are served from static/
for image in $(printf '%s\n' "$body" | grep -oE '!\[[^]]*\]\([^) ]+' | sed -E 's/^.*\]\(//'); do
  case "$image" in
    /*) [ -f "$repo/static$image" ] || fail "image not found: static$image" ;;
    *) fail "image path is not absolute (/assets/images/posts/<slug>/...): $image" ;;
  esac
done

# Links to other posts point at an existing post, as /YYYY/MM/DD/slug.html: without .html, the link works on GitHub Pages
# but not in `hugo server`.
for link in $(printf '%s\n' "$body" | grep -oE '\]\(/[0-9]{4}/[0-9]{2}/[0-9]{2}/[^)#]+' | sed -E 's/^\]\(//'); do
  case "$link" in *.html) ;; *) fail "link to a post without .html: $link" ;; esac
  file="$(printf '%s' "$link" | sed -E 's#\.html$##; s#^/([0-9]{4})/([0-9]{2})/([0-9]{2})/(.*)$#\1-\2-\3-\4.md#')"
  [ -f "$repo/content/posts/$file" ] || fail "link to a post that does not exist: $link"
done

# Cross-references resolve to a heading, and their text is the heading's title.
# A heading's id is its {#id} attribute, or Hugo's github-style id: lowercase, punctuation dropped, spaces as hyphens.
headings="$(printf '%s\n' "$body" | sed -E 's/^[0-9]+://' | grep -E '^#{2,6} ' | awk '{
  line = $0; sub(/^#+ /, "", line)
  id = ""
  if (match(line, /\{#[^ }]+/)) id = substr(line, RSTART + 2, RLENGTH - 2)
  title = line; sub(/ *\{[^}]*\} *$/, "", title)
  if (id == "") { id = tolower(title); gsub(/`/, "", id); gsub(/[^[:alnum:] _-]/, "", id); gsub(/ /, "-", id) }
  plain = title; gsub(/`/, "", plain)
  print id "\t" plain
}')"
refs="$(printf '%s\n' "$body" | grep -oE '\[[^]]+\]\(#[^)]+\)' | sort -u)"
while IFS= read -r ref; do
  [ -z "$ref" ] && continue
  anchor="$(printf '%s' "$ref" | sed -E 's/^.*\]\(#//; s/\)$//')"
  label="$(printf '%s' "$ref" | sed -E 's/^\[//; s/\]\(#.*$//; s/`//g')"
  heading="$(printf '%s\n' "$headings" | awk -F '\t' -v a="$anchor" '$1 == a { print $2; exit }')"
  if [ -z "$heading" ]; then
    fail "cross-reference to a missing anchor: #$anchor"
  elif [ "$heading" != "$label" ]; then
    look "cross-reference text is not the section title: [$label](#$anchor), the title is \"$heading\""
  fi
done <<EOF
$refs
EOF

echo
if [ "$fails" -eq 0 ]; then
  echo "No FAIL. Read every LOOK line above before calling the post clean."
else
  echo "$fails FAIL."
  exit 1
fi
