# Atlas of Feelings — curator notes

This folder produces the data for the interactive feelings selector at `docs/atlas/`.

## Files

- `_book.md` — book metadata for the Marginalia index card.
- `feelings.source.md` — one section per feeling. The hand-curated seed: name, place, definition, atlas quote (where available), and a few use examples. **Edit this file** to refine definitions or add quotes; the build pipeline reads it and combines with embedding/LLM signals.
- `feelings.build.py` — pipeline. Reads `feelings.source.md` and emits `docs/data/atlas-feelings.json`. Steps:
  1. Parse the source file into per-feeling records.
  2. Look up `valence` and `energy` from the NRC-VAD lexicon (skipped with sane defaults if the lexicon file is absent).
  3. Compute embeddings for each feeling's concatenated description text. Two backends: `sentence-transformers` (local, default) or OpenAI `text-embedding-3-small` (env `OPENAI_API_KEY`).
  4. UMAP-project to 2D for the graph backdrop.
  5. For each feeling, take cosine-nearest 3-5 neighbors **constrained to the same Atlas Place or its adjacent Places** as `variations`.
  6. For each feeling, call an LLM (Anthropic or OpenAI) to propose `complementaries`: 4-8 *non-synonymous, often-co-occurring* feelings from the list of 87. Cached on disk so reruns are cheap.
  7. Write the JSON.

## Running the pipeline

```bash
# minimal (no embeddings, no LLM): produces a stub JSON with placeholder edges
python feelings.build.py --stub

# full (requires either ANTHROPIC_API_KEY or OPENAI_API_KEY for complementaries,
# and the sentence-transformers package or an OPENAI_API_KEY for embeddings)
python feelings.build.py
```

The `--stub` mode is what ships if no API access is available; complementaries fall back to within-place pairings and variations to alphabetical neighbors. The UI works either way; the quality of edges scales with the pipeline.

## Refining the data

After launch, the cheapest way to improve quality is editing `feelings.source.md` directly: better definitions sharpen embeddings; explicit "often shows up with" hints in the prose can be lifted into complementaries by the LLM step. The `--cache-dir` flag preserves prior LLM responses so a reedit only costs the changed feelings.
