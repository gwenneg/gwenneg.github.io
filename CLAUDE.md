# Writing a blog post in this repo

This file is the contract for every post written here with Claude.
Read it in full before touching `_posts/`.
When the author corrects a phrasing, a word, or a structural choice during a session, offer to add the correction to this file at the end of the session, so the same correction never has to be made twice.

## The blog

- Jekyll site with the minimal-mistakes theme, deployed by GitHub Pages from `main`.
- Posts are AsciiDoc files in `_posts/`, named `YYYY-MM-DD-slug.adoc`. Images live in `assets/images/posts/<slug>/`.
- Posts are experience reports: something the author experimented with, built, or adopted at work, and that is not well documented elsewhere.
- The author leads a team shipping cloud services at Red Hat. French, fluent in English.
- Read the three most recent posts before drafting to match the voice and structure.

## Inputs

A post usually starts from a notes file the author kept during the work, usually a local markdown file possibly outside this repo, sometimes weeks old.
Ask for its path if it was not given.
The notes file, the repositories it refers to, their documentation, and pages the author points at are the only sources.

## Workflow

1. **Read** this file, the notes, the last three posts, and the referenced repositories. Ask the author for the goal of the post if the notes do not state it: what the reader must learn, and what the post must convince them of.
2. **Angles.** Propose three angles, each with a title candidate, what the reader learns, and the persuasion goal. The author picks by number. If the author says to just start, skip this step, pick the angle the notes support best, and say which one was picked.
3. **Draft** the full post in one pass, following the structure of recent posts. Keep a sources ledger in a scratch file: one line per factual claim with its source. Mark every claim without a source in the draft with `// TODO source`. Never drop the mark silently. Before showing any text, reread every sentence and simplify it. The author should never have to ask for a simpler phrasing twice in the same session.
4. **Refine** section by section. Offer rewrites as numbered options and wait for a number. Move to the next section only when the author says so. When the author asks for validation before edits, make no edit without it.
5. **Images.** Propose one or two placements that break long text: the section, a filename, the alt text, and what the image should show. Diagrams are drawn by the author in Excalidraw. The `.excalidraw` source is committed next to the PNG export.
6. **Metadata.** Three title candidates, three excerpts, tags checked against the vocabulary of existing posts. Filename date and `:revdate:` must match or the post does not appear.
7. **Completeness check.** Compare the draft with the notes and the repositories. List what is missing. Take time on this step.
8. **Review** from every angle listed below. Report only real issues, with location, problem, and proposed fix. Repeat until a pass finds nothing. Do not invent issues to avoid an empty pass.
9. **Cleanup.** Remove every TODO, comment, and open question. Delete the sources ledger.
10. **Publish.** Branch `blog/<slug>`, commits prefixed `blog: `, signed. One PR, commits squashed, description kept current with the post. Never put session links or private information in commits or PRs. When the Ruby toolchain is available, run `bundle exec jekyll build` before opening the PR to catch AsciiDoc rendering errors.
11. **Announce.** Draft a LinkedIn announcement and a Slack message into a scratch file for copy-paste. Rules under Announcements.
12. **Corrections.** List the words, phrasings, and structural preferences the author rejected during the session and offer to add them here. Changes to this file always go in their own branch and PR, never in the PR of a post.

## Content rules

- The reader must learn something they cannot get from existing docs. Firsthand experience is the value. No rehash.
- Every statement comes from a source: the notes, the code, the docs, or a fetched page. Nothing from memory or training data.
- Double-check every statement before it stays in the draft.
- When a third-party tool, a date, or a standard is mentioned, fetch the page instead of recalling it.
- No invented anecdotes or stories. If it is not in the notes or the code, it does not go in.
- Nothing overstated. Future work is stated as future work. Planned features are not described as shipped.
- Examples must be realistic and specific. No generic filler examples, and no example the AI could infer from the code alone.
- Acknowledge every risk. When in doubt, advise caution. Several approaches to one problem are fine.
- Show the output when there is one: a picture of the top plus a link to the full example.
- Credit is explicit: what the author built alone, what the team did.
- When linking claude-ichiba, say it is the author's own marketplace.
- When the author asks whether something is true or accurate, check the source before answering. Never answer from memory.
- When editing one section of a post, check every other section for consistency with the change.
- Introduce the subject as new. No history of a previous version unless that is the angle. No traces of obsolete names, scores, or approaches.
- Answer the reader's practical questions: how to install, where the output lands, how to read it.
- Re-sync the post with the implementation whenever the code changes, before and after publication.

## Confidentiality

- Do not disclose employer-internal configuration, security details, tools, forms, or approval processes in a public post.
- Real-world examples may be reused only when nothing identifies the employer or the repository they come from.
- Claims must hold for readers outside the employer.

## Style

- Plain, direct phrasing. No fancy expressions, no jargon. The idea carries the sentence, not the wording. This is the rule the author corrects most.
- Correct English. No typos, no grammar mistakes.
- Easy read. Good flow inside each section and deliberate transitions between sections.
- A Claude Code beginner must be able to follow. Explain terms on first use.
- Impersonal opening is fine, then switch to I and we. Neutral phrasing over self-referential phrasing.
- No word repeated three times in one paragraph. No information repeated across sections.
- Not too many subsections, but no walls of text. Refine the content first, decide subsections at the end.

## Never write

- Em dashes. Semicolons.
- Words: churn, sway, steer, vouch, weighted, skew, inert, lingers, warrants, "structural rather than advisory". Prefer: influence (for weighted, sway, steer).
- Phrases: "The part I care most about", "I'd rather name it than hide it", "unknown unknowns", "of mine", "I'm most proud of", endings that start with "Curious".
- Aphorisms. Bold inside prose. "Exactly" more than a few times per post.
- Any sentence pattern that reads as AI-written. The post carries an AI disclosure, and must still read as human-written. Starter list, to be extended from the author's corrections:
  - "It's not X, it's Y" contrasts, and "not just X" openers.
  - Three-item lists of adjectives or nouns added for rhythm.
  - A rhetorical question followed by its answer. "The result?"
  - Openers such as "Here's the thing", "Let's dive in", "In this post, we'll explore". Closers that restate the post.
  - Filler words: delve, leverage, seamless, robust, crucial, landscape, navigate, unlock, empower, game-changer, at its core, "that's where X comes in".
  - A short punchy sentence added after a long one for effect.

## AsciiDoc conventions

- Header, in this order: title line, `:imagesdir:` when the post has images, `:page-excerpt:`, `:page-tags:`, `:revdate:`.
- Excerpt of at most 157 characters. The theme's `archive-single.html` applies `truncate: 160`, and that count includes the ellipsis it adds, so anything longer is cut mid-word on the post list. The excerpt must convince a reader to open the post.
- Tags: lowercase, consistent with existing posts.
- First block after the header (after the header image when there is one):

      [NOTE]
      ====
      This post was written with the help of AI.
      ====

- One sentence per line. External links end with `^`. Internal links use `link:/YYYY/MM/DD/slug.html[text]`.
- Admonitions: NOTE, TIP, IMPORTANT.
- Steps go in lists, numbered from 1. Examples go in code blocks, not inline. A command snippet says it is typed in the Claude Code session. Callouts use `<1>`.
- Images: `image:name.png[alt="...", width="800px"]`. Light theme screenshots. Add `role=bordered` when a screenshot could be mistaken for post text.
- A header image, when there is one, is named `header.png` and sits between the header and the AI note.
- Recent posts end with a "Try it" style section and a "What's next" section.

## Review angles

Run all of them, every pass:

1. Typos and English mistakes.
2. Accuracy and consistency of every statement against its source.
3. Overstated claims and future work described as present.
4. Repetitions within and between sections.
5. Easy read.
6. Plain phrasing.
7. Flow and articulation between sections.
8. AI tells: anything that reads AI-generated, rewritten as natural text.
9. Does the post achieve its stated goal.
10. Every rule in this file.
11. Confidentiality.
12. Anything else that looks relevant and was not asked for.

## Announcements

- LinkedIn: short, no emoji, appealing, mention what is next. Never "I'm most proud of".
- Slack, internal channels: shorter and more direct. Say the author takes questions.
