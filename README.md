# Marginalia

A personal library of skills extracted from books, organized by domain (literature, communication, relationships) and browsable through a web viewer.

**Status**: 🔵 Beta | **Mode**: 🤖 Claude Code | **Updated**: 2026-05-08

## What this is

Each book in the library produces:

- A **reading log** — the book's concepts laid out as a foldable tree (`docs/data/<book>.loglog`)
- A set of **skills** — discrete actionable moves the book teaches, each as a `SKILL.md` file with a recognizable situation, the move itself, success signals, failure modes, a worked micro-example, and source pointers

Currently:

- **Literature**: A Swim in a Pond in the Rain (George Saunders)
- **Communication**: Thanks for the Feedback (Stone & Heen), Difficult Conversations (Stone, Patton, Heen)
- **Relationships**: Polysecure (Jessica Fern)

## Browsing

Run the static site locally:

```
cd docs && python3 -m http.server 8765
```

Open `http://localhost:8765/` and navigate.

## Adding a book

See `PROCESS.md` for the complete add-a-book guide. It covers source-text extraction, the loglog format, the SKILL.md structure, the canonical tag vocabulary, and how to register the new book in the web viewer.

## Validating

```
python3 tools/validate_skills.py
```

## Documentation

- `PROCESS.md` — comprehensive add-a-book guide
- `skills/README.md` — how to read a SKILL.md
- `skills/CATALOG.md` — scenario index across all books
- `skills/CANONICAL_TAGS.md` — the canonical tag vocabulary
- `STATUS.log` — project status and progress
- `CLAUDE.md` — Claude Code conventions for working in this repo

