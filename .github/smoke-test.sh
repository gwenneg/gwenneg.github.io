#!/usr/bin/env bash
# Checks that the live blog serves the version that was just deployed, and that its main pages work.
# Usage: .github/smoke-test.sh https://gwenneg.com <commit sha>
# Run by .github/workflows/hugo.yml after each deployment. Any failed check fails the workflow.
set -uo pipefail

base="${1%/}"
commit="$2"
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT
fails=0

ok() { echo "ok    $1"; }
fail() { echo "FAIL  $1"; fails=$((fails + 1)); }

# fetch <path> <file>: prints the HTTP status. A query string skips the CDN's cached copy of pages.
# A failed connection prints 000.
fetch() { curl -sS --max-time 30 -o "$2" -w '%{http_code}' "$base$1" 2>/dev/null; }

# expect <path> <status> [text...]: the page answers with this status and contains every text.
expect() {
  local path="$1" status="$2" got file="$tmp/page"
  shift 2
  got="$(fetch "$path" "$file")"
  if [ "$got" != "$status" ]; then fail "$path answered $got, expected $status"; return; fi
  for text in "$@"; do
    grep -qF -- "$text" "$file" || { fail "$path does not contain: $text"; return; }
  done
  ok "$path ($status)"
}

# 1. Wait until the new version is live: Pages can serve the previous one for a few minutes.
echo "Waiting for $base to serve $commit"
for attempt in $(seq 1 "${SMOKE_WAIT_ATTEMPTS:-40}"); do
  # a new query string each time: the CDN would keep serving its copy of a URL it already cached
  fetch "/?smoke=$commit-$attempt" "$tmp/home" >/dev/null
  # the minifier drops the quotes it can: match the tag with or without them
  grep -qE "<meta name=\"?build-commit\"? content=\"?$commit\"?>" "$tmp/home" && break
  [ "$attempt" = "${SMOKE_WAIT_ATTEMPTS:-40}" ] && { fail "the home page still does not show commit $commit"; exit 1; }
  sleep 15
done
ok "the home page shows commit $commit"

# 2. The feed and the sitemap list what Hugo published, without drafts and future-dated posts.
#    The newest post is the feed's first entry, the oldest is the earliest post in the sitemap.
#    The feed must hold the 10 newest posts of the sitemap, newest date first.
fetch "/feed.xml?smoke=$commit" "$tmp/feed" > "$tmp/feed.status"
fetch "/sitemap.xml?smoke=$commit" "$tmp/sitemap" > "$tmp/sitemap.status"
if [ "$(cat "$tmp/feed.status")" = 200 ] && [ "$(cat "$tmp/sitemap.status")" = 200 ] \
  && posts="$(python3 - "$tmp/feed" "$tmp/sitemap" <<'PY'
import re, sys, xml.etree.ElementTree as ET
from urllib.parse import urlparse
atom, sm = "{http://www.w3.org/2005/Atom}", "{http://www.sitemaps.org/schemas/sitemap/0.9}"
feed = [urlparse(e.find(atom + "link").get("href")).path for e in ET.parse(sys.argv[1]).getroot().iter(atom + "entry")]
posts = {urlparse(l.text).path for l in ET.parse(sys.argv[2]).getroot().iter(sm + "loc")
         if l.text and re.search(r"/\d{4}/\d{2}/\d{2}/[^/]+\.html$", l.text)}
date = lambda path: path[1:11]
# Hugo orders posts of the same day by title: compare dates, not the order within a day
newest_dates = sorted((date(p) for p in posts), reverse=True)[:10]
if not posts or not set(feed) <= posts or [date(p) for p in feed] != newest_dates:
    print(f"      the feed lists {feed[:3]}..., the sitemap's newest dates are {newest_dates[:3]}...", file=sys.stderr)
    sys.exit(1)
print(feed[0], min(posts), len(posts))
PY
)"; then
  read -r newest_url oldest_url count <<< "$posts"
  ok "/feed.xml and /sitemap.xml are valid and agree: $count posts, the newest is $newest_url"
else
  fail "/feed.xml or /sitemap.xml is missing, invalid, or they disagree on the newest posts"
  newest_url="" oldest_url=""
fi

expect "/?smoke=$commit" 200 "/feed.xml" ${newest_url:+"$newest_url"}
[ -n "$newest_url" ] && expect "$newest_url?smoke=$commit" 200 "<h1" "id=prose" "giscus" "canonical"
[ -n "$oldest_url" ] && expect "$oldest_url?smoke=$commit" 200 "<h1" "id=prose"
expect "/tags/?smoke=$commit" 200 "tag-cloud"
expect "/search/?smoke=$commit" 200 "searchInput"
expect "/favicon.svg" 200 "<svg"

# 3. The stylesheet and the scripts the home page links to, with their fingerprinted names.
for asset in $(grep -oE '(href|src)="?/(css|js)/[^" >]+' "$tmp/home" | sed -E 's/^(href|src)="?//' | sort -u); do
  expect "$asset" 200
done

# 4. The search index Pagefind built after Hugo.
expect "/pagefind/pagefind.js" 200
if [ "$(fetch "/pagefind/pagefind-entry.json" "$tmp/entry")" = 200 ] \
  && python3 -c 'import json,sys; d=json.load(open(sys.argv[1])); sys.exit(0 if d.get("languages") else 1)' "$tmp/entry"; then
  ok "/pagefind/pagefind-entry.json lists an index"
else
  fail "/pagefind/pagefind-entry.json is missing or lists no index"
fi

# 5. A missing page gets the blog's own 404 page, with a 404 status.
expect "/smoke-test-missing-page-$commit" 404 "404: no such page"

# 6. HTTPS: the certificate is valid for 14 more days, and http:// and www. redirect to the site.
case "$base" in
  https://*)
    host="${base#https://}"
    expiry="$(echo | openssl s_client -connect "$host:443" -servername "$host" 2>/dev/null | openssl x509 -noout -checkend $((14 * 86400)) >/dev/null 2>&1 && echo valid)"
    [ "$expiry" = valid ] && ok "the certificate is valid for 14 more days" || fail "the certificate expires within 14 days, or could not be read"
    for from in "http://$host/" "https://www.$host/" "http://www.$host/"; do
      to="$(curl -sS --max-time 30 -o /dev/null -w '%{http_code} %{redirect_url}' "$from" 2>/dev/null)"
      [ "$to" = "301 $base/" ] && ok "$from redirects to $base/" || fail "$from answered \"$to\", expected a 301 to $base/"
    done
    ;;
esac

echo
if [ "$fails" -eq 0 ]; then echo "The blog is healthy."; else echo "$fails check(s) failed."; exit 1; fi
