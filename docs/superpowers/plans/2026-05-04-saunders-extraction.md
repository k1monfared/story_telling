# Saunders Extraction Plan — *A Swim in a Pond in the Rain*

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Per-chapter passes iterate within a single task and check off each chapter as it's saturated.

**Goal:** Process Saunders's *A Swim in a Pond in the Rain* through the extraction pipeline defined in `PROCESS.md`. End state: every chapter is saturated, atomic skills + any recipes are in `skills/saunders/`, the catalog points to them, the validator passes.

**Architecture:** Setup once → per-chapter pass (loop, governed by the saturation rule) → finalization (cross-references, recipes, catalog, external sources, validation). The trail (`candidates.log`, `saturation.log`, `refactor.log`) is committed.

**Tech Stack:** Plain markdown for skills, loglog for process trail, `tools/validate_skills.py` for validation. Source text at `/home/k1/books/text/literature/A Swim in a Pond in the Rain.txt`.

**Spec:** `docs/superpowers/specs/2026-05-04-storytelling-skills-design.md`
**Process:** `PROCESS.md`

---

## Discipline reminders (read before starting any task)

These are non-negotiable. The plan and spec already encode them; this is a hard reminder for the executor.

- **No extended verbatim text from the book.** Frameworks, named techniques, chapter pointers, and a one-line attributed quote (when the exact phrasing *is* the technique) are fair to cite. Long passages are not. If you're tempted to quote a paragraph, distill instead.
- **No invented examples.** A `Worked micro-example` section paraphrases a scenario the book itself uses, with citation. If the book has no concrete factual example for a given skill, omit the section. Do not fabricate.
- **Apply the gate strictly.** A candidate becomes a skill only if all four are true: concrete action, observable signal, recognizable failure mode, and not already obtainable from an existing skill. If anything is vague, drop or fold.
- **Saturate, don't squeeze.** Once a chapter is declared saturated in `saturation.log`, it is closed for new skills. Re-reads are for refactor only. If a re-read genuinely surfaces something new, the saturation note was wrong — record the reopen explicitly.
- **The trail is committed.** Every candidate, gate decision, saturation paragraph, and refactor entry goes into `skills/saunders/_process/` and is committed.

---

### Task 1: Write `_book.md` for Saunders

**Files:**
- Create: `skills/saunders/_book.md`

The point of `_book.md` is to capture the parent context every Saunders skill inherits, so individual skills can stay small. It's not a summary of the book; it's the lens.

- [ ] **Step 1: Read the book's table of contents and any preface/introduction**

Read the source text from the start, going as far as the first story or first essay (whichever comes first). Do not read past that — `_book.md` distills only the framing the author lays out before the work starts.

Read: `Read tool, file_path="/home/k1/books/text/literature/A Swim in a Pond in the Rain.txt", offset=1, limit=500` (adjust limit as needed to reach the end of the introduction without crossing into the first story).

- [ ] **Step 2: Draft `_book.md`**

Cover, in your own words:
- The author's stated project (what is the book trying to do).
- The author's vocabulary (named concepts the author uses repeatedly — list them, distill what each means).
- The lens (the standpoint Saunders takes when reading a story; e.g., the "what does the reader notice / what does the reader want next" question is central).
- The structure (story → essay-on-the-story pattern, names of the four Russian writers, count of stories).
- The implicit promise to the reader (what the book teaches by demonstration vs. by argument).

Length target: 250-500 words. No long quotes. No invented examples.

- [ ] **Step 3: Validate the file is well-formed markdown and commit**

Run: `cd /home/k1/public/marginalia && python3 tools/validate_skills.py`
Expected: still `OK — 0 SKILL.md file(s) validated.` (No SKILL.md files yet; `_book.md` isn't validated by the script.)

```bash
git add skills/saunders/_book.md
git commit -m "Saunders: write _book.md (author's framework, vocabulary, lens)"
```

---

### Task 2: Build the chapter manifest

**Files:**
- Create: `skills/saunders/_process/chapter-manifest.log`

The manifest is the index we walk during the per-chapter loop. It identifies each chapter (story or essay) in reading order and records line ranges in the source text. This makes the per-chapter task mechanical: "go to lines X-Y and read."

- [ ] **Step 1: Identify chapter boundaries in the source text**

Read the full source text in chunks (use the Read tool with offset/limit to walk through). Each time a chapter starts, note:
- chapter index (1, 2, 3…)
- chapter type (`story` or `essay`)
- chapter title (as it appears in the book)
- starting line number in the text
- the next chapter's starting line minus one = ending line number

For the Saunders book in particular, expect a paired structure: story by a Russian writer, then an essay by Saunders on that story. Both are chapters for our purposes — the gate decides what becomes a skill.

- [ ] **Step 2: Write `chapter-manifest.log` in loglog format**

```
- Saunders chapter manifest
    - source: /home/k1/books/text/literature/A Swim in a Pond in the Rain.txt
    - generated: 2026-05-04

- Chapter 1
    - type: <story | essay>
    - title: <as in book>
    - lines: <start>-<end>
    - status: pending

- Chapter 2
    - type: <story | essay>
    - title: <as in book>
    - lines: <start>-<end>
    - status: pending

[…and so on for every chapter…]
```

`status:` values are `pending`, `saturated`, or `closed-for-refactor`. The manifest is the source of truth for chapter progression.

- [ ] **Step 3: Commit**

```bash
git add skills/saunders/_process/chapter-manifest.log
git commit -m "Saunders: build chapter manifest (the per-chapter walk index)"
```

---

### Task 3: Initialize the trail logs

**Files:**
- Create: `skills/saunders/_process/candidates.log`
- Create: `skills/saunders/_process/saturation.log`
- Create: `skills/saunders/_process/refactor.log`

- [ ] **Step 1: Write empty (header-only) log files**

`skills/saunders/_process/candidates.log`:
```
- Saunders extraction candidates
    - format: per candidate, list chapter, location, paraphrase, situation, outcome
    - outcomes: → promoted to <slug>, → folded into <slug>, → dropped because <reason>
```

`skills/saunders/_process/saturation.log`:
```
- Saunders saturation calls
    - format: one entry per chapter when first-pass extraction completes
    - entry shape:
        - what came out of this chapter
        - what kinds of moves the chapter is about that did NOT make the gate
        - why those did not make it
        - decision: saturated | re-sweep needed
```

`skills/saunders/_process/refactor.log`:
```
- Saunders refactor decisions
    - format: per refactor entry, list affected skill(s), what changed, why
    - entries appear after a chapter is saturated, when re-reads surface clearer phrasing or merger opportunities
```

- [ ] **Step 2: Delete the .gitkeep placeholder now that the dir has real files**

```bash
rm skills/saunders/_process/.gitkeep
```

- [ ] **Step 3: Commit**

```bash
git add -A skills/saunders/_process/
git commit -m "Saunders: initialize trail logs (candidates, saturation, refactor)"
```

---

### Task 4: Per-chapter extraction pass (iterative)

**Files (per chapter, may or may not be created — gate decides):**
- Append to: `skills/saunders/_process/candidates.log`
- Append to: `skills/saunders/_process/saturation.log`
- Maybe-create: `skills/saunders/<skill-slug>/SKILL.md` (one per surviving candidate)

This task is a loop. The chapter manifest (Task 2) determines how many iterations. Each iteration follows the procedure documented in `PROCESS.md` § "Per-chapter pass" and § "Saturation rule". Below is the operational checklist for *one* chapter; mark each chapter checkbox as that chapter saturates.

**Per-chapter checklist (apply to each chapter in turn):**

For each chapter, do the following in order:

a. **Read pass 1 (shape).** Read the chapter end-to-end without taking notes. Hold the chapter's shape in mind.

b. **Read pass 2 (line-by-line).** Re-read line by line. For each candidate move, append an entry to `candidates.log` (loglog format):
   ```
   - Chapter <N>: <title>
       - location: <line range or section name>
       - paraphrase: <one-line move>
       - situation: <one-line trigger>
       - outcome: TBD
   ```

c. **Apply the gate.** For each candidate from pass 2:
   - Can you write a concrete action?
   - Can you write an observable signal that tells you it worked?
   - Can you write the failure mode it prevents?
   - Is the move not already obtainable from an existing skill in the library?
   If all four are yes → promote. If any are no → either fold into an existing skill or drop.

d. **Promote: write SKILL.md.** For each promoted candidate, create `skills/saunders/<skill-slug>/SKILL.md` using the format in `skills/README.md`. Required:
   - Frontmatter: `name`, `description` (situation language for Claude trigger), `type: atomic`, `book: saunders`, `sources` (with chapter and location), `tags`.
   - Body sections in order: When to reach for this, The move, Signal it landed, Probe before & after, Failure mode this prevents, Worked micro-example (optional, only if a factual book scenario fits), Source, Related skills (may be `(none)` for now — set during finalization).
   - In `candidates.log`, replace `outcome: TBD` with `outcome: → promoted to <skill-slug>`.

e. **Fold or drop.** For folded candidates: edit the existing SKILL.md (add a `sources` bullet, add a refinement to a step, sharpen a condition). Mark `outcome: → folded into <skill-slug>`. For dropped candidates: mark `outcome: → dropped because <one-line reason>`.

f. **Saturation note.** Write the chapter's saturation paragraph in `saturation.log`:
   ```
   - Chapter <N>: <title>
       - what came out: <list of skill slugs promoted or folded>
       - what didn't make the gate: <kinds of moves the chapter is about that did NOT pass>
       - why: <why those didn't pass — too vague, already covered, scenario-bound>
       - decision: saturated | re-sweep needed
   ```
   If `re-sweep needed`: do another pass, then re-write the entry as `saturated`.

g. **Update manifest.** In `chapter-manifest.log`, change the chapter's `status: pending` to `status: saturated`.

h. **Run the validator.** New skills must pass validation before commit.
   ```bash
   cd /home/k1/public/marginalia && python3 tools/validate_skills.py
   ```
   Expected: `OK — N SKILL.md file(s) validated.` Fix any errors before commit.

i. **Commit the chapter's work.**
   ```bash
   git add skills/saunders/
   git commit -m "Saunders ch <N>: <one-line summary, e.g., '3 skills from <chapter title>, dramatization-focused'>"
   ```

**Track chapter progress here:**

- [ ] Chapter 1 saturated
- [ ] Chapter 2 saturated
- [ ] Chapter 3 saturated
- [ ] Chapter 4 saturated
- [ ] Chapter 5 saturated
- [ ] Chapter 6 saturated
- [ ] Chapter 7 saturated
- [ ] Chapter 8 saturated
- [ ] Chapter 9 saturated
- [ ] Chapter 10 saturated
- [ ] Chapter 11 saturated
- [ ] Chapter 12 saturated
- [ ] Chapter 13 saturated
- [ ] Chapter 14 saturated
- [ ] Chapter 15 saturated
- [ ] Chapter 16 saturated

(If the manifest has fewer or more chapters than 16, adjust this list. Add more checkboxes if needed; check off only the actual chapters in the manifest.)

---

### Task 5: Cross-reference pass

**Files:**
- Modify: every `skills/saunders/<slug>/SKILL.md` that has a related skill

After all chapters are saturated, walk the entire Saunders skill set and set `related:` links.

- [ ] **Step 1: List all Saunders skills**

```bash
cd /home/k1/public/marginalia
ls skills/saunders/*/SKILL.md
```

- [ ] **Step 2: For each skill, identify relationships**

For each skill, ask:
- Does any other Saunders skill **extend** this one (build on it and add something new)? Add `extends: <other-slug>` to *that* skill's `related:` block.
- Does any other Saunders skill **refine** this one (narrower, more specific case)? Add `refines: <other-slug>` to the narrower skill.
- Does any other Saunders skill **contrast** with this one (advice in opposite directions, different conditions)? Add `contrasts: <other-slug>` to *both* skills, and ensure each skill's `When to reach for this` names the condition under which it applies.

A contrast without a stated condition is a bug. Sharpen the conditions or merge the skills.

Update the `related:` frontmatter and the `Related skills` body section to match. The body should have one bullet per relationship in plain language.

- [ ] **Step 3: Run validator**

```bash
python3 tools/validate_skills.py
```
Expected: clean (`related:` references resolve to existing skill slugs).

- [ ] **Step 4: Log the cross-reference pass**

Append to `skills/saunders/_process/refactor.log`:
```
- Cross-reference pass
    - date: 2026-05-04 (or current)
    - changed: <count> skills had related: links added
    - notes: <any merges or condition-sharpening that happened>
```

- [ ] **Step 5: Commit**

```bash
git add skills/saunders/
git commit -m "Saunders: cross-reference pass, set related: links"
```

---

### Task 6: Recipe pass (composed skills)

**Files:**
- Maybe-create: `skills/saunders/recipes/<recipe-slug>/SKILL.md` (zero or more)

A recipe is a composed skill that chains 2+ atomic Saunders skills in a known order for a recurring scenario.

- [ ] **Step 1: Identify recipe candidates**

Walk the Saunders skill set and look for scenarios where two or more atomic skills fire in a known order. Examples of what a recipe might look like (made-up shape, not actual content): "When you've drafted a scene that feels flat, run skill-A first, then skill-B if the flatness persists." A recipe must give an order; if the order doesn't matter, it's not a recipe.

- [ ] **Step 2: For each recipe candidate, apply the gate**

Same gate as for atomic skills:
- concrete action (the chain)
- observable signal that the chain landed
- recognizable failure mode
- not already obtainable from an existing recipe

- [ ] **Step 3: Write each surviving recipe as `skills/saunders/recipes/<slug>/SKILL.md`**

Same SKILL.md format as atomic, with:
- `type: composed`
- `book: saunders`
- `related:` includes `composed-of: [<atomic-1>, <atomic-2>, …]`
- `The move` lays out the chain in order, naming each atomic skill and what it contributes at that step.

- [ ] **Step 4: Run validator**

```bash
python3 tools/validate_skills.py
```
Expected: clean.

- [ ] **Step 5: Delete recipes/.gitkeep if recipes were written**

```bash
ls skills/saunders/recipes/
# if any recipe folders exist:
rm skills/saunders/recipes/.gitkeep
```

- [ ] **Step 6: Commit**

If no recipes were warranted:
```bash
# nothing to commit — just record the decision in refactor.log:
# "- Recipe pass: no Saunders-only recipes warranted at this time."
```

If recipes were written:
```bash
git add skills/saunders/recipes/
git commit -m "Saunders: write composed recipes (<count> recipes)"
```

---

### Task 7: Update CATALOG.md

**Files:**
- Modify: `skills/CATALOG.md`

Open the catalog and add Saunders skills under the relevant scenarios. Add new scenarios if Saunders introduced situations the catalog doesn't have.

- [ ] **Step 1: For each scenario in the catalog, list relevant Saunders skills**

For each scenario heading in `CATALOG.md`, walk the Saunders skill set and decide:
- Which of these skills, if any, applies to this scenario?
- In what order would a person try them?

Add the skills as bullets under the scenario, replacing `(no skills yet)` when the section becomes non-empty:
```markdown
### I'm revising a draft that feels flat

- `saunders/<skill-slug>` — one-line description
- `saunders/<another-slug>` — one-line description
```

- [ ] **Step 2: Add new scenarios if needed**

If Saunders introduced a kind of situation no existing scenario captures, add a new heading. Keep the structure: top-level by domain ("Telling a story / writing fiction"), then `### Scenario`, then bullets.

- [ ] **Step 3: Commit**

```bash
git add skills/CATALOG.md
git commit -m "Catalog: add Saunders skills under relevant scenarios"
```

---

### Task 8: Optional external sources pass

**Files:**
- Maybe-modify: any `skills/saunders/<slug>/SKILL.md` whose move benefits from an external complement

For each Saunders skill, ask: is there one or two complementary external sources (papers, essays, established frameworks) that genuinely *sharpen* this skill? Same gate as for skills: clarify, don't ambiguate.

- [ ] **Step 1: Identify candidate skills for external augmentation**

Most skills won't need this. Look for skills where:
- The move references a concept that has a well-known formal treatment elsewhere (e.g., a named cognitive bias, a craft-rule that has a famous formulation in another book or essay).
- A short pointer to that external treatment would help a reader who wants to go deeper.

- [ ] **Step 2: Add external sources where warranted**

Add to the skill's `sources` frontmatter:
```yaml
sources:
  - book: saunders
    location: "<chapter and location>"
    note: "primary source"
  - external: "<URL or full citation>"
    note: "<one-line on what this complement adds>"
```

And add a corresponding bullet to the `Source` body section.

- [ ] **Step 3: Run validator**

```bash
python3 tools/validate_skills.py
```
Expected: clean.

- [ ] **Step 4: Commit (if any changes)**

```bash
git add skills/saunders/
git commit -m "Saunders: add external complements where they sharpen the skill"
```

---

### Task 9: Closing entry and final validation

**Files:**
- Modify: `skills/saunders/_process/refactor.log`
- Modify: `STATUS.log`

- [ ] **Step 1: Write the closing entry**

Append to `skills/saunders/_process/refactor.log`:
```
- Book closed
    - date: 2026-05-04 (or current)
    - skill count: <N atomic + N composed>
    - re-open conditions: <if any — e.g., "if a future book introduces a sharper version of <skill>, refactor here">
```

- [ ] **Step 2: Run the full validator one last time**

```bash
cd /home/k1/public/marginalia
python3 tools/validate_skills.py
```
Expected: `OK — <count> SKILL.md file(s) validated.` with no errors.

- [ ] **Step 3: Run all tests**

```bash
python3 -m pytest tools/ -v
```
Expected: 14 passed.

- [ ] **Step 4: Update STATUS.log**

Update the stage and current focus:
- Stage: MVP (Saunders book complete)
- Next Milestone: Begin *Thanks for the Feedback* extraction
- Mark `[x] _book.md for Saunders written`, `[x] All Saunders chapters extracted, gated, saturated`, `[x] Saunders skills cross-referenced and added to CATALOG.md` under the MVP section.
- Add Recent Progress: `- 2026-05-04: Saunders book closed. <N> atomic + <N> composed skills.`

- [ ] **Step 5: Commit closure**

```bash
git add skills/saunders/_process/refactor.log STATUS.log
git commit -m "Saunders: book closed. <N> skills, library validates clean."
```

---

## Self-review checklist (run after writing this plan)

- [x] Spec coverage: Setup, per-chapter pass, saturation rule, finalization, cross-references, recipes, catalog update, external sources, closing — all addressed.
- [x] No placeholders — every step has either concrete content or a procedure to follow with stated outputs and checks.
- [x] Type / convention consistency — slug names, log shapes, validator commands all match the spec, foundation, and existing files.
- [x] Discipline reminders are at the top so they don't get skipped.
- [x] The plan is iterative where the work is intrinsically iterative (per-chapter loop) and concrete where setup and finalization are mechanical.

## What this plan does NOT cover

- Processing *Thanks for the Feedback* or *Difficult Conversations* — each gets its own plan, written after this one closes.
- Cross-book recipes — written after at least two books are processed.
