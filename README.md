# gwenneg.github.io

The blog is built with [Hugo](https://gohugo.io) and deployed to GitHub Pages by `.github/workflows/hugo.yml` on every push to `main`.

## Write a post

Add a Markdown file to `content/posts/`, named `YYYY-MM-DD-slug.md`.
The date and the URL (`/YYYY/MM/DD/slug.html`) come from the file name.

```markdown
---
title: The title of the post
description: The excerpt shown on the home page, 157 characters at most.
tags: [ai, claude code]
---

> [!NOTE]
> This post was written with the help of AI.
```

Images go in `static/assets/images/posts/<slug>/`.

## What Markdown supports here

| Feature | How to write it |
|---|---|
| Admonition | `> [!NOTE]`, `> [!TIP]`, `> [!IMPORTANT]`, `> [!WARNING]`, `> [!CAUTION]` on the first line of a quote |
| Code block title | ```` ```json {title="renovate.jsonc"} ```` |
| Callouts | End a code line with `// <1>`, `# <1>`, `-- <1>` or `<1>`, then add a numbered list followed by `{.callouts}` on its own line. Write `\<1>` for a literal `<1>`. The build fails when the numbers in the code are not exactly 1 to N, where N is the number of list items, or when the list does not come right after its code block. |
| Section anchor | `## Try it {#try-it}`, linked with `[Try it](#try-it)` |
| Table column widths | `{cols="1,3"}` on the line right after the table, one relative width per column. The build fails when the count does not match the columns |
| Figure caption | `![alt text](/assets/images/posts/slug/file.png "Caption")` |
| Bordered screenshot | `{.bordered}` on the line after the image |
| Image width | `{width="85%"}` or `{width="800px"}` on the line after the image. Kept for the posts converted from AsciiDoc: new posts use no width, so a wide image fills the column |
| Collapsible block | `{{< details summary="Click here" >}}` … `{{< /details >}}` |
| Numbered sections | `sectnums: true` in the front matter. `{.unnumbered}` after a `##` heading leaves that section out of the numbering |

Links open in a new tab, except links to a section of the same page and links to localhost.
Tags are written in lowercase, and a space in a tag shows as a hyphen: `claude code` becomes `claude-code`.

## After each deployment

The workflow then runs `.github/smoke-test.sh` against https://gwenneg.com.
It waits until the site serves the commit just deployed (the home page carries it in a `build-commit` meta tag), then checks the home page, the newest and oldest posts, the tags and search pages, the stylesheet and scripts, the search index, the feed, the sitemap, the 404 page, the HTTPS certificate, and the redirects from `http://` and `www.`.
A failed check fails the workflow, and GitHub sends its usual failure email.

## Run the blog locally

Install Hugo (the version is on the `FROM` line of `.github/build/Dockerfile`), then:

```shell
hugo server
```

The blog is served on http://localhost:1313 and reloads on every change.

Or, with Docker, run it in the image CI builds with, which has the exact Hugo and Pagefind versions:

```shell
docker build --tag blog-build .github/build
docker run --rm -it --user "$(id -u):$(id -g)" --env HOME=/tmp --env HUGO_CACHEDIR=/tmp/hugo_cache \
  --publish 1313:1313 --volume "$PWD:/project" --workdir /project blog-build hugo server --bind 0.0.0.0
```

Dependabot keeps both versions up to date: Hugo on the `FROM` line of the Dockerfile, Pagefind in `.github/build/package.json`.

## Search

The search page uses [Pagefind](https://pagefind.app), which indexes the built site after Hugo runs.
Only the text of the posts is indexed.
To try search locally, install Pagefind (the version is in `.github/build/package.json`), then build the index into `static/`, where `hugo server` serves it:

```shell
hugo && pagefind --site public --output-path static/pagefind
```

Run the command again after a post changes. The local index is not committed.

## Arcade cameos

Now and then, one short retro pixel animation plays inside the top bar of the home page, behind its text: a UFO beaming up a cow, a snake eating an apple, falling blocks clearing a row, a game of Pong, a runner jumping three obstacles, three coins popping up, or Pac-Man chasing three ghosts.
At most one plays per page view, on about a third of the views, and never twice within three minutes. Readers who ask their system for less motion never get one.
The checks run in a small inline script in `layouts/baseof.html`, which loads `assets/js/arcade.js` only when an animation will play.

## License

- The posts in `content/` are licensed under [CC BY 4.0](content/LICENSE): you can share and adapt them, including commercially, if you give credit, link to the license, and say whether you made changes.
- The code snippets in the posts, and everything else in this repository except the fonts, are licensed under the [Apache License 2.0](LICENSE).
- The Geist and Geist Mono fonts in `static/fonts/` are by the Geist Project Authors and licensed under the [SIL Open Font License 1.1](static/fonts/LICENSE-geist.txt).
