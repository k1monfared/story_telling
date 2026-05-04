# Storytelling & Communication Skills Library — Design

## Purpose

Build a library of distilled, actionable skills for telling stories and communicating effectively. Skills are extracted from books (and other sources, where useful) by running a repeatable process. Each skill must clarify rather than ambiguate: it states a recognizable situation, a concrete move, an observable signal of success, and the failure mode it prevents.

The deliverable is two things:
1. **The library** — a growing set of skills, organized by source.
2. **The process** — a repeatable methodology for distilling skills from any book. The first three books listed below are the first application of the process, not the whole of it. The same process should produce comparable skills for the next book added.

The library is dual-audience:
- **Humans** read a skill to learn it and reference it when they need it. Discovery is supported by a scenario-based catalog.
- **Claude Code** loads skills via standard frontmatter (`name`, `description`) and triggers on situation-language in the description.

## Initial source books

1. **A Swim in a Pond in the Rain** — George Saunders. Source files at `/home/k1/books/text/literature/`. Concerned with how stories work and what makes them land on a reader.
2. **Thanks for the Feedback** — Douglas Stone & Sheila Heen. Source files at `/home/k1/books/text/communication/`. Concerned with how to receive feedback well.
3. **Difficult Conversations** — Stone, Patton, Heen. Source files at `/home/k1/books/text/communication/`. Concerned with navigating hard conversations between people.

These three sit on a coherent arc: telling a story → hearing other people's accounts (including about yourself) → exchanging accounts in real time. Skills will sometimes complement, extend, or contradict across books; the library handles this explicitly (see Cross-references).

The plain-text version of each book is generated once during setup (see Extraction process) and stored in the same folder as the original epub/pdf — alongside the source, not in this project repo. The project repo holds the skills and the process trail, not the book text.

## Granularity (atomic + composed)

Two layers:

- **Atomic skill** — one coherent move with 2-5 sub-steps and a clear trigger. The unit a person can grab and apply in the moment.
- **Composed recipe** — chains 2+ atomic skills in a known order for a recurring scenario. Lives in `recipes/` inside its dominant book, or in `cross-book/` if it draws atomic skills from more than one book.

## Directory layout

```
skills/
  saunders/                     # A Swim in a Pond in the Rain
    _book.md                    # author's framework, vocabulary, lens
    _process/                   # committed trail of the extraction
      candidates.log            # running list of moves noticed during reading
      saturation.log            # per-chapter "what came out / what didn't / why"
      refactor.log              # changes made on re-reads, with reasons
    <skill-slug>/SKILL.md       # one folder per atomic skill
    recipes/
      <recipe-slug>/SKILL.md    # composed recipes scoped to this book
  feedback/                     # Thanks for the Feedback (same shape)
    _book.md
    _process/
    <skill-slug>/SKILL.md
    recipes/
  difficult/                    # Difficult Conversations (same shape)
    _book.md
    _process/
    <skill-slug>/SKILL.md
    recipes/
  cross-book/                   # composed recipes drawing from 2+ books
    <recipe-slug>/SKILL.md
  CATALOG.md                    # scenario-indexed pointers
  README.md                     # how to use this library
PROCESS.md                      # the extraction methodology (book-agnostic)
```

`_book.md` per book holds the parent framing the author insists on, so individual skills can stay small without losing the parent logic. `_process/` is the committed trail of the extraction — candidates noticed, saturation calls, refactor decisions — so the library is auditable and a future maintainer can see how a skill came to exist. `cross-book/` is the only home for recipes that span books, making "where does this live?" mechanical. `CATALOG.md` indexes by scenario (e.g., "I'm revising a draft," "I'm receiving harsh criticism," "the conversation is going sideways") with ordered pointers into the per-book skills, so discovery works without violating the by-book home rule.

`PROCESS.md` at the project root documents the extraction methodology in book-agnostic form. Adding a new book later means: pick a slug, create `skills/<slug>/` with the same shape (`_book.md`, `_process/`, skills, `recipes/`), and run the process from `PROCESS.md`. Nothing in the existing structure has to change.

## SKILL.md format

Every skill (atomic or composed) uses this skeleton:

```markdown
---
name: <skill-slug>
description: <one-sentence trigger written for Claude. Names the situation, not the move.>
type: atomic | composed
book: saunders | feedback | difficult | cross-book
sources:
  - book: saunders | feedback | difficult
    location: "ch N, section/essay name, around the rule about <X>"
    note: "primary source"
  - external: "URL or citation for complementary research, optional"
related:
  - extends: <other-skill-slug>
  - refines: <other-skill-slug>
  - contrasts: <other-skill-slug>
  - composed-of: [<atomic-1>, <atomic-2>]   # composed only
tags: [<scenario>, <capability>, ...]
---

# <Human-readable title>

## When to reach for this
2-4 sentences naming the recognizable situation. Plain prose for humans; concrete enough for Claude to pattern-match.

## The move
Numbered, imperative steps. Each step is one decision or action. Doable without re-reading the source book.

## Signal it landed
What is observably true if the skill worked. Stated as a check on the artifact (a draft, a transcript, the next sentence the other person says), not on the user's feelings.

## Probe before & after
1. Before applying — capture <one specific thing>.
2. After applying — same probe.
3. Compare. The skill landed if <criterion>.

## Failure mode this prevents
The recognizable mistake the skill is built against. One paragraph.

## Worked micro-example
A scenario the source book actually uses, cited and paraphrased in our own words. Brief. Omitted entirely if the book has no concrete factual example to draw on — never fabricated.

## Source
- Bullet to chapter/section in the source book and what is discussed there. Distillation only — no extended verbatim quotes.
- Any complementary external sources, if added.

## Related skills
- See also: <skill-slug> — one-line why it's related.
```

### Format conventions

- **`description`** is for Claude's trigger logic. It names the *situation*, not the move (e.g., "Use when revising a paragraph that summarizes events instead of dramatizing"). The body of the skill describes the move.
- **`Probe before & after`** operationalizes the effectiveness check. Same probe applied twice, so the comparison is meaningful. A skill that cannot articulate a probe is not added.
- **`Worked micro-example`** must be factual: drawn from a scenario the source book actually discusses, paraphrased in our own words with citation. No invented examples. No extended verbatim passages. A one-line attributed quote is permitted only when the exact phrasing is the technique itself (e.g., a named term the author coins).

## Cross-references and contradictions

The `related:` frontmatter (and the `Related skills` body section) handle overlap explicitly:

- **`extends`** — the skill builds on another and adds something new on top. Both still apply.
- **`refines`** — the skill is the narrower, more specific version of another. If both could fire, the refinement wins.
- **`contrasts`** — two skills give advice that pulls in opposite directions because they apply in different conditions. Each skill must name the *condition* under which to choose it.

A contradiction without a stated condition is a bug. When extraction surfaces one, we either sharpen the conditions on both skills until the contradiction resolves, or merge them into one skill with branching guidance. We do not leave silent contradictions in the library.

## Extraction process (per book)

### Setup (one time per book)

1. Convert the source to plain text using `pandoc`, `ebook-convert`, or `pdftotext` (do not read the epub or pdf directly). Output goes alongside the source file, in the same folder as the book itself (e.g., `/home/k1/books/text/literature/<book>.txt`). The text version is stored with the book, not in this project repo.
2. Skim the table of contents and write `skills/<book>/_book.md`: the author's overall framework, key vocabulary, and the lens the book reads itself through. This is the parent context every skill in the book inherits.

### Per-chapter pass

1. Read the chapter once end-to-end without extracting, just to hold the shape.
2. Re-read line by line. Append to `skills/<book>/_process/candidates.log` (loglog format) with one entry per noticed move: chapter and location, one-line paraphrase, one-line guess at the situation it applies to. No SKILL.md writing yet.
3. At end of chapter, run the **gate** on each candidate:
   - Can we write a concrete action, an observable signal, and a counter (failure mode)? If any are vague, drop or merge.
   - Does this give a move not already obtainable from an existing skill in the library? If not, fold it into the existing skill (refinement, alternate trigger, additional `Source` bullet) instead of creating a new file.
4. Surviving candidates become SKILL.md files, with `sources` frontmatter and the `Source` body section citing chapter and location.
5. Mark each candidate in `candidates.log` with its outcome (`→ promoted to <skill-slug>`, `→ folded into <skill-slug>`, `→ dropped because <reason>`). The log becomes a record of every decision.

### Saturation rule

Each chapter terminates explicitly:

1. **First pass = extract.** Steps above.
2. **Saturation check.** Before re-reading, append a paragraph to `skills/<book>/_process/saturation.log` (one entry per chapter): what kinds of moves came out of this chapter, what kinds the chapter is about that did *not* make the gate, and why. If the second category is non-empty and convincing, do one more sweep. Otherwise the chapter is saturated.
3. **No squeezing.** Once saturated, the chapter is closed for new skills. Subsequent reads are for refactoring only — clarifying, shortening, merging duplicates. New skills cannot be born on a re-read of a saturated chapter; if a re-read surfaces something genuinely new, the saturation note was wrong, and we reopen the chapter explicitly (record the reopen in `saturation.log`) and update the note rather than silently adding.
4. **Refactor pass is its own activity.** Each pass logs its changes to `skills/<book>/_process/refactor.log`: which skill(s) changed, what changed, why. Bounded: when an additional pass produces no clearer phrasing or merger, the book is closed.

### Per-book finalization

1. Pass over all skills from the book to set `related:` links.
2. Identify recipe candidates: scenarios where 2+ atomic skills fire in a known order. Write composed recipes in `<book>/recipes/` (or `cross-book/` if applicable).
3. Update `CATALOG.md` with new skills under relevant scenarios.
4. Optional: search for one or two complementary external sources per skill (papers, essays, established frameworks). Add to `sources` only if they sharpen the skill. Same gate as for skill additions.
5. Add a final entry to `refactor.log` declaring the book closed (or, if intentional, marked open for future passes).

## Discipline notes

- **No extended verbatim text from the books.** Frameworks, named techniques, and chapter pointers are fair to cite. Long passages are not. Worked micro-examples paraphrase the book's own scenarios — never invented, never reproduced at length.
- **The trail is committed.** Candidates, saturation calls, and refactor decisions all live in `skills/<book>/_process/` and stay with the repo. The library is the primary deliverable; the trail is the secondary deliverable that makes the library auditable and the process repeatable.
- **Clarify, don't ambiguate.** Every addition must make the library more useful, not larger. If a candidate doesn't pass the gate, it does not get in.

## Scope of this spec

This spec defines a **generalizable process** for distilling skills from books, applied first to three initial books. The process is intended to be reused for additional books later.

This spec covers:
- The library's directory structure, file format, and conventions.
- The extraction process, gate, saturation rule, and finalization.
- The cross-reference taxonomy.
- The shape of the per-book trail (`_process/` logs).
- The book-agnostic methodology document (`PROCESS.md`).

This spec does NOT cover:
- The actual content of any skills (those will be produced by running the extraction process).
- Any tooling beyond the standard converters (`pandoc`, `ebook-convert`, `pdftotext`) and the existing loglog/markdown stack.
- Any UI or rendering layer beyond plain markdown SKILL.md files and a markdown CATALOG.md.

## Order of execution (initial books)

1. Saunders — *A Swim in a Pond in the Rain* (first, as instructed).
2. Stone & Heen — *Thanks for the Feedback*.
3. Stone, Patton, Heen — *Difficult Conversations*.

Each book runs through Setup → per-chapter passes → saturation → finalization before the next book begins. Cross-book recipes are written after the second and third books, when there are atomic skills in more than one book to compose from.

## Adding a new book later

The process is designed so that adding a new book is mechanical and does not require changing any existing structure:

1. Pick a slug for the book (lowercase, dash-separated, short).
2. Create `skills/<slug>/` with `_book.md`, `_process/` (empty), and `recipes/`.
3. Place the source epub/pdf wherever you store books, generate the plain text alongside, and run the process from `PROCESS.md`.
4. After finalization, refresh `CATALOG.md` so the new skills appear under the right scenarios. Existing cross-book recipes may now be reachable from one more book — update their `composed-of` and `Related skills` if so.

A new book never invalidates existing skills. It may, on review, surface refactor candidates (e.g., a Saunders skill and a new-book skill that turn out to be the same move). Those refactors run through the normal refactor-pass discipline, logged in the relevant `_process/refactor.log`.
