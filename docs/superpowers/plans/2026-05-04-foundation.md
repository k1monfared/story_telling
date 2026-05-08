# Storytelling Skills Library — Foundation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold the library directory structure, write the book-agnostic PROCESS.md, write the validator that enforces SKILL.md format, and convert the three initial book sources to plain text — leaving the project ready to begin per-book extraction.

**Architecture:** Plain markdown for all docs (skills, catalog, README, PROCESS). A small Python validator under `tools/` enforces format rules on `skills/**/SKILL.md`. Book text conversion uses `pandoc`/`ebook-convert`/`pdftotext` and writes alongside the source files in `/home/k1/books/text/...` (not in this repo).

**Tech Stack:** markdown, Python 3 (stdlib only), pytest, PyYAML (already on system), pandoc / ebook-convert / pdftotext.

**Spec:** `docs/superpowers/specs/2026-05-04-storytelling-skills-design.md`

---

### Task 1: Create the empty library scaffolding

**Files:**
- Create: `skills/saunders/_process/.gitkeep`
- Create: `skills/saunders/recipes/.gitkeep`
- Create: `skills/feedback/_process/.gitkeep`
- Create: `skills/feedback/recipes/.gitkeep`
- Create: `skills/difficult/_process/.gitkeep`
- Create: `skills/difficult/recipes/.gitkeep`
- Create: `skills/cross-book/.gitkeep`

- [ ] **Step 1: Create directories with .gitkeep placeholders**

```bash
cd /home/k1/public/marginalia
mkdir -p skills/saunders/_process skills/saunders/recipes
mkdir -p skills/feedback/_process skills/feedback/recipes
mkdir -p skills/difficult/_process skills/difficult/recipes
mkdir -p skills/cross-book
touch skills/saunders/_process/.gitkeep skills/saunders/recipes/.gitkeep
touch skills/feedback/_process/.gitkeep skills/feedback/recipes/.gitkeep
touch skills/difficult/_process/.gitkeep skills/difficult/recipes/.gitkeep
touch skills/cross-book/.gitkeep
```

- [ ] **Step 2: Verify structure**

Run: `find skills -type d | sort`
Expected:
```
skills
skills/cross-book
skills/difficult
skills/difficult/_process
skills/difficult/recipes
skills/feedback
skills/feedback/_process
skills/feedback/recipes
skills/saunders
skills/saunders/_process
skills/saunders/recipes
```

- [ ] **Step 3: Commit**

```bash
git add skills/
git commit -m "Scaffold skills/ library directory structure"
```

---

### Task 2: Write skills/README.md

**Files:**
- Create: `skills/README.md`

- [ ] **Step 1: Write the file**

Content:

```markdown
# Skills Library

A library of distilled, actionable skills for telling stories and communicating effectively, sourced from books and complemented by targeted external research.

## How to use this library

### Find a skill by situation

Open `CATALOG.md` and find your situation in the scenario index. Each scenario points to one or more skills, in order.

### Read a skill

Each skill lives at `skills/<book>/<skill-slug>/SKILL.md`. The file has:

- **When to reach for this** — the recognizable situation. Read this first.
- **The move** — numbered steps. The thing to actually do.
- **Signal it landed** — what's observably true if the skill worked.
- **Probe before & after** — a simple before/after check you can run on yourself.
- **Failure mode this prevents** — what goes wrong if you skip it.
- **Worked micro-example** — a short scenario the source book actually uses, paraphrased.
- **Source** — the chapter/section in the source book.
- **Related skills** — other skills that extend, refine, or contrast with this one.

### How Claude Code uses this library

The frontmatter `description` of each SKILL.md names the situation in which the skill should fire. Claude triggers on description-matching when invoking the skill via the standard skill-loading mechanism. Humans don't need to use Claude to use this library — every skill is fully self-contained as a markdown file.

## How the library is organized

Top-level folders are by source book:

- `saunders/` — *A Swim in a Pond in the Rain* (George Saunders)
- `feedback/` — *Thanks for the Feedback* (Stone & Heen)
- `difficult/` — *Difficult Conversations* (Stone, Patton, Heen)
- `cross-book/` — composed recipes that draw from atomic skills in 2+ books

Each book folder contains:

- `_book.md` — the author's framework, vocabulary, and lens
- `_process/` — the trail of extraction (candidates, saturation, refactor logs)
- `<skill-slug>/SKILL.md` — atomic skills, one folder each
- `recipes/<recipe-slug>/SKILL.md` — composed recipes scoped to this book

## How to add a new book

See `PROCESS.md` at the project root. Adding a book is mechanical: pick a slug, create `skills/<slug>/` with the same shape, and run the process.

## How to validate the library

Run the validator from the project root:

\`\`\`bash
python3 tools/validate_skills.py
\`\`\`

This checks every SKILL.md for required frontmatter fields, required body sections, valid types, and resolvable cross-references.
```

- [ ] **Step 2: Commit**

```bash
git add skills/README.md
git commit -m "Add skills/README.md describing library use and structure"
```

---

### Task 3: Write skills/CATALOG.md skeleton

**Files:**
- Create: `skills/CATALOG.md`

- [ ] **Step 1: Write the file**

Content:

```markdown
# Catalog — by scenario

Use this index to find the right skill in the moment. Scenarios are organized by what you are doing, not by which book the skill came from. Each scenario lists ordered pointers to skills.

This catalog is updated during per-book finalization. New scenarios are added when needed; existing scenarios get more pointers as the library grows.

---

## Telling a story / writing fiction

### I'm drafting and don't know what comes next

(no skills yet)

### I'm revising a draft that feels flat

(no skills yet)

### I want to know whether my story is working on a reader

(no skills yet)

---

## Receiving feedback

### Someone is giving me feedback I don't agree with

(no skills yet)

### Feedback I received earlier is still bothering me

(no skills yet)

### I want feedback but no one is giving it to me

(no skills yet)

---

## Difficult conversations

### A conversation is going sideways and I don't know why

(no skills yet)

### I need to raise something that will land badly

(no skills yet)

### The other person and I see what happened completely differently

(no skills yet)

---

## Cross-cutting

### I'm trying to understand someone else's account

(no skills yet)

### My emotional reaction is in the way

(no skills yet)
```

- [ ] **Step 2: Commit**

```bash
git add skills/CATALOG.md
git commit -m "Add CATALOG.md skeleton with empty scenario index"
```

---

### Task 4: Write PROCESS.md (book-agnostic methodology)

**Files:**
- Create: `PROCESS.md`

- [ ] **Step 1: Write the file**

Content:

```markdown
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
```

- [ ] **Step 2: Commit**

```bash
git add PROCESS.md
git commit -m "Add PROCESS.md (book-agnostic extraction methodology)"
```

---

### Task 5: Write a failing validator test (frontmatter parsing)

**Files:**
- Create: `tools/__init__.py`
- Create: `tools/validate_skills.py`
- Create: `tools/test_validate_skills.py`
- Create: `tools/fixtures/valid/skills/example/example-skill/SKILL.md`
- Create: `tools/fixtures/missing_frontmatter/skills/example/bad-skill/SKILL.md`

- [ ] **Step 1: Create empty modules**

```bash
touch tools/__init__.py tools/validate_skills.py
```

- [ ] **Step 2: Create fixture files**

Create `tools/fixtures/valid/skills/example/example-skill/SKILL.md`:

```markdown
---
name: example-skill
description: Use when demonstrating that the validator parses frontmatter correctly.
type: atomic
book: example
sources:
  - book: example
    location: "imagined ch 1"
    note: "primary source"
tags: [test]
---

# Example skill

## When to reach for this
A test fixture for the validator.

## The move
1. Do nothing.

## Signal it landed
The validator passes.

## Probe before & after
1. Before applying — note that the test runs.
2. After applying — note that the test still runs.
3. Compare. The skill landed if both noted.

## Failure mode this prevents
Validator regression.

## Source
- Imagined ch 1.

## Related skills
- (none)
```

Create `tools/fixtures/missing_frontmatter/skills/example/bad-skill/SKILL.md`:

```markdown
# Bad skill

This file has no frontmatter at all.
```

- [ ] **Step 3: Write the failing test**

Create `tools/test_validate_skills.py`:

```python
"""Tests for the skill validator."""
from pathlib import Path

import pytest

from tools.validate_skills import (
    SkillValidationError,
    load_skill,
)

FIXTURES = Path(__file__).parent / "fixtures"


def test_load_skill_parses_valid_frontmatter():
    skill_path = (
        FIXTURES
        / "valid"
        / "skills"
        / "example"
        / "example-skill"
        / "SKILL.md"
    )
    skill = load_skill(skill_path)
    assert skill.frontmatter["name"] == "example-skill"
    assert skill.frontmatter["type"] == "atomic"
    assert skill.frontmatter["book"] == "example"


def test_load_skill_raises_on_missing_frontmatter():
    skill_path = (
        FIXTURES
        / "missing_frontmatter"
        / "skills"
        / "example"
        / "bad-skill"
        / "SKILL.md"
    )
    with pytest.raises(SkillValidationError, match="no frontmatter"):
        load_skill(skill_path)
```

- [ ] **Step 4: Run the test, verify it fails**

Run: `cd /home/k1/public/marginalia && python3 -m pytest tools/test_validate_skills.py -v`
Expected: FAIL with `ImportError` or `ModuleNotFoundError` (validator has no symbols yet).

- [ ] **Step 5: Implement minimal `load_skill`**

Replace `tools/validate_skills.py` with:

```python
"""Validator for SKILL.md files in the storytelling skills library."""
from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

import yaml


class SkillValidationError(Exception):
    """Raised when a SKILL.md file fails validation."""


@dataclass
class Skill:
    path: Path
    frontmatter: dict
    body: str


def load_skill(path: Path) -> Skill:
    """Parse a SKILL.md file into frontmatter + body. Raises on malformed input."""
    text = path.read_text(encoding="utf-8")
    if not text.startswith("---\n"):
        raise SkillValidationError(f"{path}: no frontmatter (file does not start with '---')")
    rest = text[4:]
    end_marker = rest.find("\n---\n")
    if end_marker == -1:
        raise SkillValidationError(f"{path}: no frontmatter terminator (missing closing '---')")
    fm_text = rest[:end_marker]
    body = rest[end_marker + 5 :]
    try:
        frontmatter = yaml.safe_load(fm_text) or {}
    except yaml.YAMLError as exc:
        raise SkillValidationError(f"{path}: frontmatter YAML invalid: {exc}") from exc
    if not isinstance(frontmatter, dict):
        raise SkillValidationError(f"{path}: frontmatter is not a mapping")
    return Skill(path=path, frontmatter=frontmatter, body=body)
```

- [ ] **Step 6: Run the test, verify it passes**

Run: `cd /home/k1/public/marginalia && python3 -m pytest tools/test_validate_skills.py -v`
Expected: 2 passed.

- [ ] **Step 7: Commit**

```bash
git add tools/
git commit -m "Add validator load_skill with frontmatter parsing tests"
```

---

### Task 6: Validate required frontmatter fields

**Files:**
- Modify: `tools/validate_skills.py`
- Modify: `tools/test_validate_skills.py`
- Create: `tools/fixtures/missing_field/skills/example/bad-skill/SKILL.md`

- [ ] **Step 1: Create new fixture**

Create `tools/fixtures/missing_field/skills/example/bad-skill/SKILL.md`:

```markdown
---
name: bad-skill
type: atomic
book: example
sources: []
tags: []
---

# Bad skill

Missing description field.
```

- [ ] **Step 2: Add failing tests**

Append to `tools/test_validate_skills.py`:

```python
from tools.validate_skills import validate_frontmatter


def test_validate_frontmatter_accepts_valid():
    skill_path = (
        FIXTURES
        / "valid"
        / "skills"
        / "example"
        / "example-skill"
        / "SKILL.md"
    )
    validate_frontmatter(load_skill(skill_path))


def test_validate_frontmatter_rejects_missing_description():
    skill_path = (
        FIXTURES
        / "missing_field"
        / "skills"
        / "example"
        / "bad-skill"
        / "SKILL.md"
    )
    skill = load_skill(skill_path)
    with pytest.raises(SkillValidationError, match="missing required field 'description'"):
        validate_frontmatter(skill)


def test_validate_frontmatter_rejects_invalid_type():
    skill_path = (
        FIXTURES
        / "valid"
        / "skills"
        / "example"
        / "example-skill"
        / "SKILL.md"
    )
    skill = load_skill(skill_path)
    skill.frontmatter["type"] = "compound"
    with pytest.raises(SkillValidationError, match="type 'compound' is not one of"):
        validate_frontmatter(skill)
```

- [ ] **Step 3: Run the tests, verify they fail**

Run: `cd /home/k1/public/marginalia && python3 -m pytest tools/test_validate_skills.py -v`
Expected: 3 new tests fail with `ImportError: cannot import name 'validate_frontmatter'`.

- [ ] **Step 4: Implement `validate_frontmatter`**

Append to `tools/validate_skills.py`:

```python
REQUIRED_FRONTMATTER_FIELDS = ("name", "description", "type", "book", "sources", "tags")
VALID_TYPES = ("atomic", "composed")


def validate_frontmatter(skill: Skill) -> None:
    """Validate required frontmatter fields are present and have valid values."""
    fm = skill.frontmatter
    for field in REQUIRED_FRONTMATTER_FIELDS:
        if field not in fm:
            raise SkillValidationError(
                f"{skill.path}: missing required field '{field}' in frontmatter"
            )
    if fm["type"] not in VALID_TYPES:
        raise SkillValidationError(
            f"{skill.path}: type '{fm['type']}' is not one of {VALID_TYPES}"
        )
    if not isinstance(fm["sources"], list):
        raise SkillValidationError(
            f"{skill.path}: 'sources' must be a list, got {type(fm['sources']).__name__}"
        )
    if not isinstance(fm["tags"], list):
        raise SkillValidationError(
            f"{skill.path}: 'tags' must be a list, got {type(fm['tags']).__name__}"
        )
```

- [ ] **Step 5: Run the tests, verify they pass**

Run: `cd /home/k1/public/marginalia && python3 -m pytest tools/test_validate_skills.py -v`
Expected: 5 passed.

- [ ] **Step 6: Commit**

```bash
git add tools/
git commit -m "Validator: enforce required frontmatter fields and valid type"
```

---

### Task 7: Validate required body sections

**Files:**
- Modify: `tools/validate_skills.py`
- Modify: `tools/test_validate_skills.py`
- Create: `tools/fixtures/missing_section/skills/example/bad-skill/SKILL.md`

- [ ] **Step 1: Create fixture missing a body section**

Create `tools/fixtures/missing_section/skills/example/bad-skill/SKILL.md`:

```markdown
---
name: bad-skill
description: Test fixture missing a required body section.
type: atomic
book: example
sources: []
tags: []
---

# Bad skill

## When to reach for this
Missing the rest.

## The move
1. Step one.

## Source
- Imagined.
```

(Note: missing `Signal it landed`, `Probe before & after`, `Failure mode this prevents`, `Related skills`.)

- [ ] **Step 2: Add failing tests**

Append to `tools/test_validate_skills.py`:

```python
from tools.validate_skills import validate_body


def test_validate_body_accepts_valid():
    skill_path = (
        FIXTURES
        / "valid"
        / "skills"
        / "example"
        / "example-skill"
        / "SKILL.md"
    )
    validate_body(load_skill(skill_path))


def test_validate_body_rejects_missing_section():
    skill_path = (
        FIXTURES
        / "missing_section"
        / "skills"
        / "example"
        / "bad-skill"
        / "SKILL.md"
    )
    skill = load_skill(skill_path)
    with pytest.raises(SkillValidationError, match="missing required body section 'Signal it landed'"):
        validate_body(skill)
```

- [ ] **Step 3: Run the tests, verify they fail**

Run: `cd /home/k1/public/marginalia && python3 -m pytest tools/test_validate_skills.py -v`
Expected: 2 new tests fail with `ImportError: cannot import name 'validate_body'`.

- [ ] **Step 4: Implement `validate_body`**

Append to `tools/validate_skills.py`:

```python
import re

REQUIRED_BODY_SECTIONS = (
    "When to reach for this",
    "The move",
    "Signal it landed",
    "Probe before & after",
    "Failure mode this prevents",
    "Source",
    "Related skills",
)


def validate_body(skill: Skill) -> None:
    """Validate the SKILL.md body has all required H2 sections."""
    headings = set(re.findall(r"^##\s+(.+?)\s*$", skill.body, flags=re.MULTILINE))
    for section in REQUIRED_BODY_SECTIONS:
        if section not in headings:
            raise SkillValidationError(
                f"{skill.path}: missing required body section '{section}'"
            )
```

- [ ] **Step 5: Run the tests, verify they pass**

Run: `cd /home/k1/public/marginalia && python3 -m pytest tools/test_validate_skills.py -v`
Expected: 7 passed.

- [ ] **Step 6: Commit**

```bash
git add tools/
git commit -m "Validator: enforce required body sections"
```

---

### Task 8: Validate book field matches parent directory

**Files:**
- Modify: `tools/validate_skills.py`
- Modify: `tools/test_validate_skills.py`

- [ ] **Step 1: Add failing tests**

Append to `tools/test_validate_skills.py`:

```python
from tools.validate_skills import validate_book_matches_parent


def test_validate_book_matches_parent_accepts_match():
    skill_path = (
        FIXTURES
        / "valid"
        / "skills"
        / "example"
        / "example-skill"
        / "SKILL.md"
    )
    validate_book_matches_parent(load_skill(skill_path))


def test_validate_book_matches_parent_rejects_mismatch():
    skill_path = (
        FIXTURES
        / "valid"
        / "skills"
        / "example"
        / "example-skill"
        / "SKILL.md"
    )
    skill = load_skill(skill_path)
    skill.frontmatter["book"] = "wrong-book"
    with pytest.raises(SkillValidationError, match="book 'wrong-book' does not match parent directory 'example'"):
        validate_book_matches_parent(skill)


def test_validate_book_matches_parent_allows_cross_book_in_recipes():
    # Simulate skills/cross-book/some-recipe/SKILL.md
    skill_path = (
        FIXTURES
        / "valid"
        / "skills"
        / "example"
        / "example-skill"
        / "SKILL.md"
    )
    skill = load_skill(skill_path)
    skill.path = Path("skills/cross-book/some-recipe/SKILL.md")
    skill.frontmatter["book"] = "cross-book"
    skill.frontmatter["type"] = "composed"
    validate_book_matches_parent(skill)
```

- [ ] **Step 2: Run, verify failures**

Run: `cd /home/k1/public/marginalia && python3 -m pytest tools/test_validate_skills.py -v`
Expected: 3 new tests fail with `ImportError`.

- [ ] **Step 3: Implement `validate_book_matches_parent`**

Append to `tools/validate_skills.py`:

```python
def validate_book_matches_parent(skill: Skill) -> None:
    """Frontmatter 'book' must match the directory under skills/.

    For skills under skills/<book>/<slug>/SKILL.md, book == <book>.
    For skills under skills/<book>/recipes/<slug>/SKILL.md, book == <book>.
    For skills under skills/cross-book/<slug>/SKILL.md, book == 'cross-book'.
    """
    parts = skill.path.parts
    try:
        skills_idx = parts.index("skills")
    except ValueError as exc:
        raise SkillValidationError(
            f"{skill.path}: not under a 'skills/' directory"
        ) from exc
    if skills_idx + 1 >= len(parts):
        raise SkillValidationError(f"{skill.path}: cannot determine book from path")
    parent_book = parts[skills_idx + 1]
    declared_book = skill.frontmatter["book"]
    if declared_book != parent_book:
        raise SkillValidationError(
            f"{skill.path}: book '{declared_book}' does not match parent directory '{parent_book}'"
        )
```

- [ ] **Step 4: Run, verify pass**

Run: `cd /home/k1/public/marginalia && python3 -m pytest tools/test_validate_skills.py -v`
Expected: 10 passed.

- [ ] **Step 5: Commit**

```bash
git add tools/
git commit -m "Validator: enforce book field matches parent directory"
```

---

### Task 9: Validate cross-references resolve

**Files:**
- Modify: `tools/validate_skills.py`
- Modify: `tools/test_validate_skills.py`

- [ ] **Step 1: Add failing tests**

Append to `tools/test_validate_skills.py`:

```python
from tools.validate_skills import validate_related_references


def test_validate_related_references_accepts_existing_targets():
    skill_path = (
        FIXTURES
        / "valid"
        / "skills"
        / "example"
        / "example-skill"
        / "SKILL.md"
    )
    skill = load_skill(skill_path)
    skill.frontmatter["related"] = [{"extends": "example-skill"}]
    validate_related_references(skill, all_skill_slugs={"example-skill"})


def test_validate_related_references_rejects_missing_target():
    skill_path = (
        FIXTURES
        / "valid"
        / "skills"
        / "example"
        / "example-skill"
        / "SKILL.md"
    )
    skill = load_skill(skill_path)
    skill.frontmatter["related"] = [{"extends": "nonexistent-skill"}]
    with pytest.raises(SkillValidationError, match="related 'extends' points to unknown skill 'nonexistent-skill'"):
        validate_related_references(skill, all_skill_slugs={"example-skill"})
```

- [ ] **Step 2: Run, verify failures**

Run: `cd /home/k1/public/marginalia && python3 -m pytest tools/test_validate_skills.py -v`
Expected: 2 new tests fail with `ImportError`.

- [ ] **Step 3: Implement `validate_related_references`**

Append to `tools/validate_skills.py`:

```python
RELATED_VERBS = ("extends", "refines", "contrasts", "composed-of")


def validate_related_references(skill: Skill, all_skill_slugs: set[str]) -> None:
    """Every slug referenced in related: must exist in the library."""
    related = skill.frontmatter.get("related", [])
    if not related:
        return
    if not isinstance(related, list):
        raise SkillValidationError(
            f"{skill.path}: 'related' must be a list, got {type(related).__name__}"
        )
    for entry in related:
        if not isinstance(entry, dict):
            raise SkillValidationError(
                f"{skill.path}: each 'related' entry must be a mapping"
            )
        for verb, target in entry.items():
            if verb not in RELATED_VERBS:
                raise SkillValidationError(
                    f"{skill.path}: related verb '{verb}' is not one of {RELATED_VERBS}"
                )
            targets = target if isinstance(target, list) else [target]
            for slug in targets:
                if slug not in all_skill_slugs:
                    raise SkillValidationError(
                        f"{skill.path}: related '{verb}' points to unknown skill '{slug}'"
                    )
```

- [ ] **Step 4: Run, verify pass**

Run: `cd /home/k1/public/marginalia && python3 -m pytest tools/test_validate_skills.py -v`
Expected: 12 passed.

- [ ] **Step 5: Commit**

```bash
git add tools/
git commit -m "Validator: enforce related-references resolve"
```

---

### Task 10: CLI entry point that walks the skills/ tree

**Files:**
- Modify: `tools/validate_skills.py`
- Modify: `tools/test_validate_skills.py`

- [ ] **Step 1: Add failing test**

Append to `tools/test_validate_skills.py`:

```python
from tools.validate_skills import validate_tree


def test_validate_tree_returns_zero_for_empty_root(tmp_path):
    (tmp_path / "skills").mkdir()
    errors = validate_tree(tmp_path / "skills")
    assert errors == []


def test_validate_tree_reports_errors_per_file(tmp_path):
    skill_dir = tmp_path / "skills" / "example" / "bad-skill"
    skill_dir.mkdir(parents=True)
    (skill_dir / "SKILL.md").write_text("# Bad\n\nNo frontmatter.\n")
    errors = validate_tree(tmp_path / "skills")
    assert len(errors) == 1
    assert "no frontmatter" in errors[0]
```

- [ ] **Step 2: Run, verify failures**

Run: `cd /home/k1/public/marginalia && python3 -m pytest tools/test_validate_skills.py -v`
Expected: 2 new tests fail with `ImportError`.

- [ ] **Step 3: Implement `validate_tree` and `__main__` block**

Append to `tools/validate_skills.py`:

```python
import sys


def validate_tree(skills_root: Path) -> list[str]:
    """Validate every SKILL.md under skills_root. Return list of error messages."""
    errors: list[str] = []
    skill_files = sorted(skills_root.rglob("SKILL.md"))

    # First pass: load all and gather slugs for cross-reference resolution.
    loaded: list[Skill] = []
    all_slugs: set[str] = set()
    for skill_path in skill_files:
        try:
            skill = load_skill(skill_path)
        except SkillValidationError as exc:
            errors.append(str(exc))
            continue
        loaded.append(skill)
        name = skill.frontmatter.get("name")
        if isinstance(name, str):
            all_slugs.add(name)

    # Second pass: full validation.
    for skill in loaded:
        for check in (validate_frontmatter, validate_body, validate_book_matches_parent):
            try:
                check(skill)
            except SkillValidationError as exc:
                errors.append(str(exc))
        try:
            validate_related_references(skill, all_slugs)
        except SkillValidationError as exc:
            errors.append(str(exc))

    return errors


def main() -> int:
    project_root = Path(__file__).resolve().parent.parent
    skills_root = project_root / "skills"
    if not skills_root.exists():
        print(f"No skills/ directory at {skills_root}", file=sys.stderr)
        return 1
    errors = validate_tree(skills_root)
    if errors:
        for err in errors:
            print(err, file=sys.stderr)
        print(f"\n{len(errors)} error(s).", file=sys.stderr)
        return 1
    skill_count = sum(1 for _ in skills_root.rglob("SKILL.md"))
    print(f"OK — {skill_count} SKILL.md file(s) validated.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
```

- [ ] **Step 4: Run pytest, verify all pass**

Run: `cd /home/k1/public/marginalia && python3 -m pytest tools/test_validate_skills.py -v`
Expected: 14 passed.

- [ ] **Step 5: Run validator on the actual library**

Run: `cd /home/k1/public/marginalia && python3 tools/validate_skills.py`
Expected: `OK — 0 SKILL.md file(s) validated.`

- [ ] **Step 6: Commit**

```bash
git add tools/
git commit -m "Validator: tree walker + CLI entry point"
```

---

### Task 11: Convert *A Swim in a Pond in the Rain* to plain text

**Files:**
- Create: `/home/k1/books/text/literature/A Swim in a Pond in the Rain.txt`

- [ ] **Step 1: Convert epub to text**

```bash
ebook-convert "/home/k1/books/text/literature/A Swim in a Pond in the Rain _ In Which Four Russians Give a -- George Saunders; OverDrive, Inc -- Penguin Random House LLC, New York, 2021 -- Random -- 9781526624253 -- 348a2e699a1c64c80087064b593dfa3c -- Anna’s Archive.epub" "/home/k1/books/text/literature/A Swim in a Pond in the Rain.txt"
```

- [ ] **Step 2: Verify output exists and looks like text**

Run: `wc -l "/home/k1/books/text/literature/A Swim in a Pond in the Rain.txt"`
Expected: a non-trivial line count (likely > 5000 lines).

Run: `file "/home/k1/books/text/literature/A Swim in a Pond in the Rain.txt"`
Expected: UTF-8 (or ASCII) text.

No commit — this file is outside the project repo.

---

### Task 12: Convert *Thanks for the Feedback* to plain text

**Files:**
- Create: `/home/k1/books/text/communication/Thanks for the Feedback.txt`

- [ ] **Step 1: Convert epub to text**

```bash
ebook-convert "/home/k1/books/text/communication/Stone, Heen - Thanks for the Feedback - 2015.epub" "/home/k1/books/text/communication/Thanks for the Feedback.txt"
```

- [ ] **Step 2: Verify output exists**

Run: `wc -l "/home/k1/books/text/communication/Thanks for the Feedback.txt"`
Expected: non-trivial line count.

No commit — outside the project repo.

---

### Task 13: Convert *Difficult Conversations* to plain text

**Files:**
- Create: `/home/k1/books/text/communication/Difficult Conversations.txt`

- [ ] **Step 1: Convert epub to text**

```bash
ebook-convert "/home/k1/books/text/communication/Stone-Patton- Heen, Difficult Conversations, 2011.epub" "/home/k1/books/text/communication/Difficult Conversations.txt"
```

- [ ] **Step 2: Verify output exists**

Run: `wc -l "/home/k1/books/text/communication/Difficult Conversations.txt"`
Expected: non-trivial line count.

No commit — outside the project repo.

---

### Task 14: Update STATUS.log to reflect foundation complete

**Files:**
- Modify: `STATUS.log`

- [ ] **Step 1: Replace STATUS.log content**

Replace the entire file with:

```
- Project Status
    - Last Updated: 2026-05-04
    - Development Mode: Claude Code
    - Stage: POC
    - Next Milestone: First book extraction (Saunders) — produces first SKILL.md files

- Development Stages
    - [x] Initial Setup
        - Created: 2026-05-03
        - Repository initialized
        - Basic structure in place
        - Template copied from claude_code_project_template
    - [x] Proof of Concept (POC) — foundation
        - Completed: 2026-05-04
        - Goal: Validate the library design with scaffolding, methodology, and validator
        - Success criteria:
            - [x] Skills library directory structure created
            - [x] Book-agnostic PROCESS.md written
            - [x] SKILL.md validator with full test coverage
            - [x] All three initial books converted to plain text
    - [] Minimum Viable Product (MVP)
        - Goal: Saunders book fully processed end-to-end
        - Core features:
            - [] _book.md for Saunders written
            - [] All Saunders chapters extracted, gated, saturated
            - [] Saunders skills cross-referenced and added to CATALOG.md
        - Known issues:
            - None yet
    - [] Beta Release
        - Goal: All three initial books processed
        - Missing features:
            - [] Thanks for the Feedback fully processed
            - [] Difficult Conversations fully processed
            - [] Cross-book recipes written
        - Active users: N/A
        - Stability: Pre-release
    - [] Production Ready
        - Goal: Library is auditable and contributors can add new books
        - Deployment status: Not deployed
        - Documentation: PROCESS.md + skills/README.md complete
        - Tests: validator tests passing
    - [] Maintenance Mode
        - Core complete and stable
        - Nice-to-haves queued:
            - Generated CATALOG.md from frontmatter tags
            - HTML render of skills via loglog
            - Search across skills

- Technical Details
    - Tech Stack:
        - Markdown for all documentation and skills
        - Python 3 + pytest + PyYAML for the validator
        - pandoc / ebook-convert / pdftotext for source conversion
        - loglog for status tracking and process logs
    - Key Files:
        - PROCESS.md — book-agnostic extraction methodology
        - skills/README.md — how to use the library
        - skills/CATALOG.md — scenario index
        - tools/validate_skills.py — SKILL.md validator
        - docs/superpowers/specs/2026-05-04-storytelling-skills-design.md — design
    - Architecture Notes:
        - Skills organized by source book; cross-book/ holds composed recipes that span books
        - Each book's _process/ folder is the committed extraction trail
        - Source book text lives alongside the source files in the books folder, not in this repo

- Current Focus
    - Active Tasks:
        - [] Begin Saunders extraction (per separate plan)
    - Blockers:
        - None
    - Recent Progress:
        - 2026-05-04: Foundation complete — scaffolding, PROCESS.md, validator, all books converted to text

- Notes
    - Use loglog format for all documentation
    - Update "Last Updated" date when making changes
    - Run /home/k1/public/update_project_status.sh after updates
    - Convert to markdown: loglog STATUS.log > STATUS.md
```

- [ ] **Step 2: Commit**

```bash
git add STATUS.log
git commit -m "Update STATUS.log: foundation complete, POC stage achieved"
```

---

### Task 15: Run the validator one final time and verify clean state

- [ ] **Step 1: Run validator**

Run: `cd /home/k1/public/marginalia && python3 tools/validate_skills.py`
Expected: `OK — 0 SKILL.md file(s) validated.`

- [ ] **Step 2: Run all tests**

Run: `cd /home/k1/public/marginalia && python3 -m pytest tools/ -v`
Expected: 14 passed.

- [ ] **Step 3: Verify git is clean**

Run: `git status`
Expected: `nothing to commit, working tree clean`

No commit — verification only.

---

## Self-review checklist (run after writing this plan)

- [x] Spec coverage: every section of the design spec is addressed
  - Directory layout → Task 1
  - SKILL.md format → enforced by validator (Tasks 5-9)
  - Cross-references → validated in Task 9
  - Extraction process → documented in PROCESS.md (Task 4)
  - Discipline notes → carried into PROCESS.md
  - Adding a new book later → documented in PROCESS.md
- [x] No placeholders — all code is concrete
- [x] Type consistency — `Skill`, `SkillValidationError`, function signatures consistent across tasks
- [x] Each task is bite-sized
- [x] Frequent commits

## What this plan does NOT cover

- Writing `_book.md` for any of the three books — that is per-book setup, handled in the per-book extraction plans.
- Reading any chapter, extracting any candidates, or writing any SKILL.md content — same.
- Cross-book recipes — written after at least two books have skills.
