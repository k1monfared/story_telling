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

```bash
python3 tools/validate_skills.py
```

This checks every SKILL.md for required frontmatter fields, required body sections, valid types, and resolvable cross-references.
