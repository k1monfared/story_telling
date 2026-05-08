# Marginalia — Skills

A personal library of skills extracted from book-length sources, organized by domain (literature, communication, relationships) and made browsable through a web viewer.

## How to use this library

### Find a skill by situation

Open `CATALOG.md` and find your situation in the scenario index. Each scenario points to one or more skills, in order.

### Read a skill

Each skill lives at `skills/<book>/<skill-slug>/SKILL.md`. The body sections, in order:

- **When to reach for this** — the recognizable situation. Read this first.
- **The move** — numbered steps. The thing to actually do.
- **Signal it landed** — what's observably true if the skill worked.
- **Probe before & after** — a simple before/after check you can run on yourself.
- **Failure mode this prevents** — what goes wrong if you skip it.
- **Worked micro-example** — a short scenario the source book actually uses, paraphrased.
- **Reflection prompts** *(optional)* — end-of-chapter questions from books that supply them (e.g. Polysecure).
- **Source** — the chapter/section in the source book.
- **Related skills** — other skills that extend, refine, or contrast with this one.

### How Claude Code uses this library

The frontmatter `description` of each SKILL.md names the situation in which the skill should fire. Claude triggers on description-matching when invoking the skill via the standard skill-loading mechanism. Humans don't need to use Claude to use this library — every skill is self-contained as a markdown file.

## How the library is organized

Top-level folders are by source book:

- `saunders/` — *A Swim in a Pond in the Rain* (George Saunders) — Literature
- `feedback/` — *Thanks for the Feedback* (Stone & Heen) — Communication
- `difficult/` — *Difficult Conversations* (Stone, Patton, Heen) — Communication
- `polysecure/` — *Polysecure* (Jessica Fern) — Relationships
- `cross-book/` — composed recipes that draw from atomic skills in 2+ books

Each book folder contains:

- `_book.md` — the author's framework, vocabulary, and lens
- `_process/` — the trail of extraction (candidates, saturation, refactor logs)
- `<skill-slug>/SKILL.md` — atomic skills, one folder each
- `recipes/<recipe-slug>/SKILL.md` — composed recipes scoped to this book

## Tag vocabulary

Skills use a canonical tag vocabulary defined in `CANONICAL_TAGS.md`: 40 tags across 6 facets (Phase, Action, Focus, Topic, Craft, Stance). Don't invent per-book tags — extend the canonical vocabulary if you need new terms, and update both `CANONICAL_TAGS.md` and the FACETS list in `docs/shared/skills-viewer.js` together.

After writing a batch of skills, run the normalizer:

```bash
python3 skills/update_tags.py
```

## How to add a new book

See `PROCESS.md` at the project root. It's the comprehensive end-to-end guide covering content extraction, SKILL.md format, canonical tags, the build pipeline, and the web infrastructure.

## How to validate the library

Run the validator from the project root:

```bash
python3 tools/validate_skills.py
```

This checks every SKILL.md for required frontmatter fields, required body sections, valid types, and resolvable cross-references.
