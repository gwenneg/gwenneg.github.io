# Writing blog posts in this repo

<!--
Notes for the maintainer. Claude Code strips block HTML comments before loading this file, so they cost no context.
- Order of the file: what is true in every session, then the two workflows, then the rules for the post, then the checks, then shipping.
- Each rule lives in one place. The workflows point at the rules by section title. Before adding a rule, search for the one it would duplicate.
- The list "Tells taken from public lists" under "Never write" comes from Wikipedia's "Signs of AI writing" and the blader/humanizer skill, not from the author's corrections. Prune it freely.
- Anthropic's guidance for this kind of file: concrete rules, a reason next to a rule, emphasis on one line at most, and a target of about 200 lines. This file is longer, and blank lines and headings account for much of it. If rules start being skipped, move the two workflows into skills before cutting rules. https://code.claude.com/docs/en/memory
-->

This file is the contract for every post written here with Claude.
Read it in full before touching `_posts/`.
The author leads: Claude proposes and checks, the author decides.

## The blog and its reader

- Jekyll site with the minimal-mistakes remote theme. A GitHub Actions workflow builds and deploys it on every push to `main`, so a merged PR is a published post.
- Posts are AsciiDoc files in `_posts/`, named `YYYY-MM-DD-slug.adoc`. Images live in `assets/images/posts/<slug>/`.
- Posts are experience reports: something the author experimented with, built, or adopted at work, and that is not well documented elsewhere.
- The author leads a team shipping cloud services at Red Hat. French, fluent in English.
- The reader is a developer outside Red Hat who may have just started with Claude Code. They must be able to follow every sentence.
- The three most recent posts are the reference for voice and structure. Where a post and this file disagree, this file wins, because some posts are older than some rules.

## Sources

A post usually starts from a notes file the author kept during the work, usually a local markdown file possibly outside this repo, sometimes weeks old.
Ask for its path if it was not given.
The only sources are the notes file, the repositories it refers to, their documentation, pages the author points at, and pages this file says to fetch.

- Every statement comes from one of these sources. Nothing comes from memory or training data, and nothing is invented: no anecdote, no story, no number. If it is not in a source, it does not go in.
- When a third-party tool, a date, or a standard is mentioned, fetch the page instead of recalling it.
- Every command, file name, option, and code block is copied from a source, never typed from memory.
- When the notes and the code disagree, the code wins, and the author is told about the difference.
- When a fact can change, the sentence says when it was true: "no fix as of September 2026".
- Re-sync the post with the implementation whenever the code changes, before and after publication.
- Double-check every statement before it stays in the draft.

## Working with the author

These rules apply in both workflows.

Before showing any text, a draft as much as an option, reread every sentence and simplify it.
The author should never have to ask for a simpler phrasing twice in the same session.

### Proposing a rewrite

- Offer rewrites as numbered options and wait for a number.
- Two or three options, one recommended, with a one-line reason.
- Read the paragraph above and the paragraph below before writing an option. An option never repeats what the lines around it already say.
- Cutting the sentence is a valid option. Offer it when the information is stated nearby.
- When a rewrite depends on the next sentence, rewrite both together.
- When the author gives the direction of a rewrite, every option follows that direction. Do not offer earlier ideas again.

### Editing

- When the author asks for validation before edits, make no edit without it.
- When the author answers with their own wording, apply it as written. Then check its grammar and its fit with the lines around it, and report problems instead of fixing them silently.
- The author also edits the file during the session. Read the file again before any edit that depends on the lines around it. Never revert an edit the author made.
- After an edit, check every other section for consistency with the change, and check the sentences that pointed at the old wording, in every section.

### Answering

- When the author asks whether something is true or accurate, check the source before answering. Never answer from memory.
- When the author says a statement is inaccurate, check the source first, then say what the source shows, then offer rewrites. Look for the same inaccuracy elsewhere in the post and report it.
- When asked whether an edit is the best possible one, read the whole section again and answer honestly. Say yes when it is. Do not invent an alternative to have something to propose.
- When asked to verify the author's edits, read the whole diff word by word. Check typos, doubled words, whitespace, and link brackets. Also check consistency with the rest of the post: contractions, short forms such as "repo", capitals, code font.

### Recording corrections

When the author corrects or rejects a word, a phrasing, or a structural choice, add a line to a corrections list in a scratch file at that moment, so the end of the session does not depend on memory.

## Workflow: a new post

1. **Read** this file, the notes, the three most recent posts, and the referenced repositories. If the notes do not state the goal of the post, ask the author: what the reader must learn, and what the post must convince them of. Create the sources ledger in a scratch file and write the goal in one sentence at its top.
2. **Angles.** Propose three angles, each with a title candidate, what the reader learns, and the persuasion goal. The author picks by number. Then list the planned sections, one line each, so the author can reorder or cut before any prose exists. If the author says to just start, skip the choice and the section list, pick the angle the notes support best, and say which one was picked.
3. **Draft** the full post in one pass, following "The shape of a post". Fill the sources ledger: one line per factual claim with its source. Mark every claim without a source in the draft with `// TODO source`. Never drop the mark silently.
4. **Refine** section by section, following "Working with the author". Move to the next section only when the author says so.
5. **Images.** Propose one or two placements that break long text: the section, a filename, the alt text, and what the image should show. Diagrams are drawn by the author in Excalidraw. The `.excalidraw` source is committed next to the PNG export.
6. **Metadata.** Three title candidates, three excerpts, and tags, following "AsciiDoc conventions".
7. **Completeness check.** Compare the draft with the notes and the repositories. List what is missing. Take time on this step.
8. **Review**, following "Checks".
9. **Cleanup.** Remove every TODO, comment, and open question. Go through the done list in "Checks". Delete the sources ledger.
10. **Publish**, following "Git and pull requests".
11. **Announce.** Draft a LinkedIn announcement and a Slack message into a scratch file for copy-paste, following "Announcements".
12. **Corrections**, following "Maintaining this file".

## Workflow: a published post

A session can start from a post that is already published.
The workflow for a new post does not apply, only these steps:

1. Read this file and the whole post. Compare the post with the current state of the repositories it describes, and report what is out of sync before anything else.
2. Run `.claude/check-post.sh` on the post, then list what the script and the first read found against this file, with line numbers. Make no edit from that list without a number or an explicit ask.
3. The author quotes a sentence and says what is wrong with it. Answer with numbered options, following "Working with the author".
4. When the author asks to ship a batch of fixes, follow "Git and pull requests".

## Content rules

### The post is worth reading

- The reader must learn something they cannot get from existing docs. Firsthand experience is the value. No rehash.
- Examples must be realistic and specific. No generic filler examples, and no example the AI could infer from the code alone.
- Answer the reader's practical questions: how to install, where the output lands, how to read it.
- Show the output when there is one: a picture of the top plus a link to the full example.
- Introduce the subject as new. No history of a previous version unless that is the angle. No traces of obsolete names, scores, or approaches.

### The post is accurate

- Keep apart what a tool does, what it recommends, what it enforces, and what the user decides. "The plugin keeps X manual" is wrong when the plugin only recommends it. "Never bumped by a bot" is wrong when the bot still opens the PR and only the merge is manual.
- Check a statement about a whole group ("none of the three options is...") against each member of the group. One member that breaks it makes the statement wrong.
- Nothing overstated. Future work is stated as future work. Planned features are not described as shipped.
- Accuracy comes before style. Never simplify a sentence into something the source does not say.

### The post states its limits

- State the limit of an option where the option is introduced, in the same sentence as its benefit.
- Acknowledge every risk. When in doubt, advise caution. Several approaches to one problem are fine.

### Credit

- Credit is explicit: what the author built alone, what the team did.
- When linking claude-ichiba, say it is the author's own marketplace.

## Confidentiality

- Do not disclose employer-internal configuration, security details, tools, forms, or approval processes in a public post.
- Real-world examples may be reused only when nothing identifies the employer or the repository they come from.
- Claims must hold for readers outside the employer.
- When a fact cannot be told without breaking these rules, leave it out and tell the author.

## Style

Plain, direct phrasing. No fancy expressions, no jargon. The idea carries the sentence, not the wording.
This is the rule the author corrects most.

### Sentences

- Correct English. No typos, no grammar mistakes.
- Explain terms on first use.
- Every sentence names its object. "The repository to set up" does not say what is set up: write "the repository where you want to enable automerge".
- Once a wording is chosen for an action, reuse it wherever the same action comes back.
- Name a thing before describing it. Do not announce "one more protection" and give its name a sentence later.
- Refer to list items and options by name, never by position. No "the first part", "the second", "the former".
- No qualifying clause at the end of a sentence when the limit is stated nearby. Cut it, or move the limit to where the option is introduced.
- Impersonal opening is fine, then switch to I and we. Neutral phrasing over self-referential phrasing.

### Repetition

- No word repeated three times in one paragraph.
- No information repeated across sections, and none repeated a few lines apart inside a section.

### Flow and structure

- Easy read. Good flow inside each section and deliberate transitions between sections.
- A list is introduced by a full, plain phrase. "What a shared preset does well:", not "For a shared preset:" or "Against it:".
- Not too many subsections, but no walls of text. Refine the content first, decide subsections at the end.

## Never write

The post carries an AI disclosure, and must still read as human-written.
When one of these is removed, rewrite the whole sentence in plain words. Swapping each em dash for a colon or for parentheses leaves the same sentence, and it reads the same.

- Em dashes. Semicolons.
- Words: churn, sway, steer, vouch, weighted, skew, inert, lingers, warrants, "structural rather than advisory". Prefer: influence (for weighted, sway, steer).
- Phrases: "The part I care most about", "I'd rather name it than hide it", "unknown unknowns", "of mine", "I'm most proud of", endings that start with "Curious".
- Aphorisms. Bold inside prose. "Exactly" more than a few times per post.
- Any sentence pattern that reads as AI-written. List from the author's corrections, to be extended:
  - "It's not X, it's Y" contrasts, and "not just X" openers.
  - Three-item lists of adjectives or nouns added for rhythm.
  - A rhetorical question followed by its answer. "The result?"
  - Openers such as "Here's the thing", "Let's dive in", "In this post, we'll explore". Closers that restate the post.
  - Filler words: delve, leverage, seamless, robust, crucial, landscape, navigate, unlock, empower, game-changer, at its core, "that's where X comes in".
  - A short punchy sentence added after a long one for effect.
- Tells taken from public lists:
  - A clause starting with an "-ing" verb at the end of a sentence, added to comment on it: "..., highlighting the need for a review".
  - "Serves as", "stands as", "acts as" where "is" works.
  - A sentence that announces the point before making it: "It is worth noting that", "The key insight is".
  - Inflated importance: "a pivotal step", "a testament to".
  - Vague attribution: "many developers", "experts say".
  - Intensifiers: very, really, truly, incredibly.
  - A section whose first sentence repeats its title.

## The shape of a post

This is what the recent posts do. The angle can change it.

- The opening states the reader's problem, then names what the author built or learned, with its link, then says in one sentence what the post explains.
- After the opening, when it applies: a TIP for the reader in a hurry that points at the "Try it" section, and an IMPORTANT block that says who the post does not apply to.
- A section title says what the section answers: "Why Renovate merges the PR itself".
- Recent posts end with a "Try it" style section, then a "What's next" section whose last line asks the reader for feedback, in plain words: "If you try MintMaker Automerge on one of your repositories, please let me know how the run went."

## AsciiDoc conventions

- Header, in this order: title line, `:imagesdir:` when the post has images, `:page-excerpt:`, `:page-tags:`, `:revdate:`. Filename date and `:revdate:` must match or the post does not appear.
- Excerpt of at most 157 characters. The theme's `archive-single.html` applies `truncate: 160`, and that count includes the ellipsis it adds, so anything longer is cut mid-word on the post list. The excerpt must convince a reader to open the post. It can open in the first person ("I built a Claude Code plugin that..."). Count the characters with a command, never by eye, including for candidates that are not in the file yet.
- Tags: lowercase, checked against the vocabulary of existing posts.
- First block after the header (after the header image when there is one):

      [NOTE]
      ====
      This post was written with the help of AI.
      ====

- One sentence per line. Every link ends with `^` so it opens in a new tab, internal links included: `link:/YYYY/MM/DD/slug.html[text^]`.
- A cross-reference uses the title of its section as link text: `<<own-merge,Why Renovate merges the PR itself>>`. Never "the next section", "the merge section", or "below". A comma in the title is fine, Asciidoctor splits at the first comma only.
- Admonitions: NOTE, TIP, IMPORTANT, WARNING. WARNING is for a risk the reader could miss.
- Steps go in lists, numbered from 1. Examples go in code blocks, not inline. A command snippet says it is typed in the Claude Code session. Callouts use `<1>`.
- Images: `image:name.png[alt="..."]`, with no `width`, so a wide image uses the full content width. Light theme screenshots. Add `role=bordered` when a screenshot could be mistaken for post text.
- A header image, when there is one, is named `header.png` and sits between the header and the AI note.

## Checks

### Mechanical checks

Run `.claude/check-post.sh _posts/<file>.adoc` before every review pass and before every commit.
It checks what a command can check: the header, the excerpt length, the tags, the never-write words, the links, the images, the cross-references, leftover TODOs.
Fix every FAIL line. Read every LOOK line: it can be a false alarm, so keep the sentence when it is correct.
A `// TODO source` mark is reported as LOOK. It goes away when its source is found, never by deleting the mark.
When a rule of this file becomes checkable by a command, add it to the script.

### Review angles

Run all of them, every pass.
Report only real issues, with location, problem, and proposed fix.
Repeat until a pass finds nothing. Do not invent issues to avoid an empty pass.

1. Typos and English mistakes.
2. Accuracy and consistency of every statement against its source. For each claim about a tool, check the verb: does the tool do it, recommend it, or leave it to the user. For each claim about a group, check every member.
3. Overstated claims and future work described as present.
4. Repetitions within and between sections.
5. Easy read.
6. Plain phrasing.
7. Flow and articulation between sections.
8. AI tells: anything that reads AI-generated, rewritten as natural text.
9. Does the post achieve its stated goal. Check each section against the goal sentence, and report a section that does not serve it.
10. Every rule in this file.
11. Confidentiality.
12. Links and snippets: every external link resolves and its page says what the sentence claims, and every command and code block matches its source.
13. Anything else that looks relevant and was not asked for.

### Fresh-reader pass

After the review passes, a subagent that has seen neither the notes nor the drafting reads the post as a Claude Code beginner.
Claude writes five questions the post must answer, from the goal sentence, and gives the subagent only the post and the questions.

- It lists every sentence it had to read twice, and every sentence that does not say what it is about.
- It answers the five questions from the post alone. A wrong or missing answer is an issue.

Report its list and its answers to the author as they are, next to the five questions, with a proposed fix for each real issue.

### Done list

- `.claude/check-post.sh` reports no FAIL, and every LOOK line was read.
- The last review pass found nothing, and the fresh-reader list went to the author.
- Every claim in the sources ledger has a source, and no `// TODO source` is left.
- The author picked the title, the excerpt, and the tags.

## Git and pull requests

- Never merge a PR. Open one only at the Publish step or when the author asks.
- Never put session links or private information in commits or PRs.
- Commits are signed and prefixed `blog: `.
- When the Ruby toolchain is available, run `bundle exec jekyll build` before opening a PR to catch AsciiDoc rendering errors.
- A new post: branch `blog/<slug>`, one PR, commits squashed, description kept current with the post.
- Fixes to a published post: each batch goes in a new `blog/` branch created from an up-to-date `main`, with one signed commit and one PR. Check the state of the previous PR first: when it is merged, never push to its branch again. Squash when a PR has more than one commit.
- When the author says a PR is merged, check the deploy of the merge commit with `gh run list --branch main --limit 1`, and check that the post URL returns the page.

## Announcements

- LinkedIn: short, no emoji, appealing, mention what is next.
- Slack, internal channels: shorter and more direct. Say the author takes questions.
- "Never write" applies to both.

## Maintaining this file

- At the end of a session, show the corrections list and offer to add it here, so the same correction never has to be made twice.
- A correction goes in the section where Claude will need it, with the rejected wording and the accepted one when there is a pair. A banned word or phrase also goes in `.claude/check-post.sh`.
- Before adding a rule, look for the rule it repeats or contradicts, and merge them.
- Changes to this file always go in their own branch and PR, never in the PR of a post.
