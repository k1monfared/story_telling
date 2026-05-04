# Process — distilling skills from a book

This document is book-agnostic. It defines how to take any book and produce a set of skills for the library, applying the same gate, the same saturation rule, and the same refactor discipline that produced the existing skills.

## When to use this process

When you want to add a new book (or any extended source) to the library. For a one-off skill from a short article or conversation, write the SKILL.md directly using the format documented in `skills/README.md`.

## Setup (one time per book)

1. Place the source file (epub, pdf, etc.) wherever you store books.
2. Convert the source to plain text using `pandoc`, `ebook-convert`, or `pdftotext` (do not read the epub or pdf directly — they include layout artifacts that distort line-by-line work). Save the text alongside the source file in the same folder.
3. Pick a short slug for the book (lowercase, dash-separated). Examples: `saunders`, `feedback`, `difficult`.
4. Create `skills/<slug>/` with subfolders `_process/` and `recipes/`. Add a `.gitkeep` to each empty subfolder until it has content.
5. Skim the table of contents and any preface or introduction. Write `skills/<slug>/_book.md` capturing the author's overall framework, key vocabulary, and the lens the book reads itself through. This is the parent context every skill in the book inherits — it lets individual skills stay small.

## Per-chapter pass

For each chapter in turn:

1. Read the chapter once end-to-end without extracting. The point is to hold the chapter's shape in mind.
2. Re-read line by line. As you notice a candidate move, append an entry to `skills/<slug>/_process/candidates.log` (loglog format). One entry per candidate:
   - chapter and location (page, section, named scene)
   - one-line paraphrase of the move
   - one-line guess at the situation it applies to
3. At the end of the line-by-line pass, run the **gate** on each candidate. To pass the gate, all four must be true:
   - You can write a concrete action (the move itself).
   - You can write an observable signal that tells you it worked.
   - You can write a counter — the recognizable failure mode the skill prevents.
   - The move is not already obtainable from an existing skill in the library.
4. For each candidate that passes the gate, create `skills/<slug>/<skill-slug>/SKILL.md` using the format in `skills/README.md`. Cite the chapter and location in the `sources` frontmatter and the `Source` body section.
5. For each candidate that fails the gate:
   - If it's a refinement of an existing skill, fold it into that skill (additional `Source` bullet, alternate trigger, sharper condition). No new file.
   - If the action / signal / counter is too vague, drop it. No new file.
6. In `candidates.log`, mark every candidate with its outcome: `→ promoted to <slug>`, `→ folded into <slug>`, or `→ dropped because <reason>`. The log records every decision.

## Saturation rule

Each chapter terminates explicitly:

1. **First pass = extract.** The steps above.
2. **Saturation check.** Before re-reading, append a paragraph to `skills/<slug>/_process/saturation.log` with one entry per chapter, structured as:
   - what kinds of moves came out of this chapter
   - what kinds of moves the chapter is about that did *not* make the gate
   - why those didn't make it (too vague, already covered, scenario-specific in a way no skill could capture)
   If the second category is non-empty and convincing, do one more sweep. Otherwise the chapter is **saturated**.
3. **No squeezing.** Once saturated, the chapter is closed for *new* skills. Subsequent reads are for **refactoring only** — clarifying phrasing, shortening, merging duplicates. New skills cannot be born on a re-read of a saturated chapter. If a re-read genuinely surfaces something new, the saturation note was wrong; record the reopen in `saturation.log` (with the new candidate and why the original note missed it) and update the note. Do not silently add.
4. **Refactor pass is its own activity.** Each pass logs its changes to `skills/<slug>/_process/refactor.log`: which skill(s) changed, what changed, why. The pass is bounded — when an additional pass produces no clearer phrasing or merger, the book is closed.

## Per-book finalization

After all chapters are saturated:

1. Cross-reference pass — go through every skill in the book and set `related:` links (`extends`, `refines`, `contrasts`) to other skills in the library, in this book and elsewhere.
2. Recipe pass — identify scenarios where two or more atomic skills fire in a known order. Write composed recipes:
   - in `skills/<slug>/recipes/` if all atomic skills are from this book
   - in `skills/cross-book/` if atomic skills come from more than one book
3. Catalog update — open `skills/CATALOG.md` and add the new skills under the relevant scenarios. Add new scenarios if the book introduced situations the catalog didn't have.
4. Optional external sources — for skills where one or two complementary external references (papers, essays, frameworks) genuinely sharpen the move, add them to the `sources` frontmatter and the `Source` body section. Same gate as for skills: clarify, don't ambiguate.
5. Closing entry — add a final entry to `refactor.log` declaring the book closed (or, if intentional, marked open for future passes).
6. Run the validator: `python3 tools/validate_skills.py`. Fix any errors before declaring done.

## Discipline

- **No extended verbatim text from the source.** Frameworks, named techniques, chapter pointers, and brief one-line attributed quotes (when the exact phrasing *is* the technique) are fair to cite. Long passages are not.
- **No invented examples.** `Worked micro-example` paraphrases a scenario the book itself uses. If the book has no concrete factual example to draw on for a given skill, omit the section rather than fabricate one.
- **The trail is committed.** Candidates, saturation, refactor logs all stay in `_process/`. They make the library auditable and the process repeatable.
- **Clarify, don't ambiguate.** Every addition must make the library more useful, not larger. A candidate that doesn't pass the gate does not get in.

## Cross-reference taxonomy

In `related:` frontmatter and the `Related skills` body section:

- **`extends`** — this skill builds on another and adds something new on top. Both still apply.
- **`refines`** — this skill is the narrower, more specific version of another. If both could fire, the refinement wins.
- **`contrasts`** — two skills give advice that pulls in opposite directions because they apply in different conditions. Each skill must name the *condition* under which to choose it. A contrast without a stated condition is a bug — sharpen the conditions or merge the skills.

## SKILL.md format

See `skills/README.md` for the canonical format and `skills/<book>/<any-skill>/SKILL.md` for examples (once skills exist).
