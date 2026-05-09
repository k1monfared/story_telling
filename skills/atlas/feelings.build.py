#!/usr/bin/env python3
"""Build atlas-feelings.json from feelings.source.md.

Two modes:
  --stub       no embeddings, no LLM. Uses heuristic place-level coords and
               within-place neighbors. Always works. Ships if ML deps absent.
  (default)    full pipeline. Requires either:
                 - sentence-transformers + umap-learn (local, no API key) for embeddings
                 - or OPENAI_API_KEY + umap-learn for OpenAI embeddings
               And for complementaries:
                 - ANTHROPIC_API_KEY (preferred) or OPENAI_API_KEY
               Falls back to stub for any missing piece, prints a warning.

Output: docs/data/atlas-feelings.json (one record per feeling).
"""

import argparse
import json
import os
import re
import sys
from pathlib import Path

BASE_DIR = Path(__file__).parent.parent.parent  # marginalia/
SOURCE_FILE = Path(__file__).parent / "feelings.source.md"
OUTPUT_FILE = BASE_DIR / "docs" / "data" / "atlas-feelings.json"
CACHE_DIR = Path(__file__).parent / ".cache"

PLACE_INDEX = {
    "When Things Are Uncertain or Too Much": 0,
    "When We Compare": 1,
    "When Things Don't Go as Planned": 2,
    "When It's Beyond Us": 3,
    "When Things Aren't What They Seem": 4,
    "When We're Hurting": 5,
    "With Others": 6,
    "When We Fall Short": 7,
    "When We Search for Connection": 8,
    "When the Heart Is Open": 9,
    "When Life Is Good": 10,
    "When We Feel Wronged": 11,
    "To Self-Assess": 12,
}

PLACE_VALENCE_ENERGY = {
    "When Things Are Uncertain or Too Much": (-0.45, +0.55),
    "When We Compare":                         (-0.35, +0.10),
    "When Things Don't Go as Planned":         (-0.50, +0.10),
    "When It's Beyond Us":                     (+0.55, +0.45),
    "When Things Aren't What They Seem":       (+0.10, +0.05),
    "When We're Hurting":                      (-0.80, -0.40),
    "With Others":                             (+0.30, +0.05),
    "When We Fall Short":                      (-0.55, -0.05),
    "When We Search for Connection":           (-0.20, -0.10),
    "When the Heart Is Open":                  (+0.40, +0.20),
    "When Life Is Good":                       (+0.75, +0.15),
    "When We Feel Wronged":                    (-0.65, +0.65),
    "To Self-Assess":                          (+0.30, +0.10),
}

# Per-feeling overrides where the place average is misleading.
FEELING_OVERRIDES = {
    "stress":          (-0.55, +0.70),
    "overwhelm":       (-0.65, +0.55),
    "anxiety":         (-0.55, +0.65),
    "worry":           (-0.50, +0.45),
    "avoidance":       (-0.30, -0.10),
    "excitement":      (+0.75, +0.80),
    "dread":           (-0.65, +0.30),
    "fear":            (-0.70, +0.75),
    "vulnerability":   (-0.05, +0.30),
    "joy":             (+0.85, +0.65),
    "happiness":       (+0.80, +0.30),
    "calm":            (+0.65, -0.45),
    "contentment":     (+0.70, -0.15),
    "gratitude":       (+0.75, +0.10),
    "tranquility":     (+0.70, -0.55),
    "relief":          (+0.55, -0.05),
    "foreboding-joy":  (+0.30, +0.35),
    "anger":           (-0.70, +0.80),
    "contempt":        (-0.60, +0.20),
    "disgust":         (-0.65, +0.30),
    "dehumanization":  (-0.85, +0.45),
    "hate":            (-0.85, +0.55),
    "anguish":         (-0.90, +0.10),
    "despair":         (-0.85, -0.55),
    "hopelessness":    (-0.80, -0.35),
    "sadness":         (-0.65, -0.30),
    "grief":           (-0.80, -0.20),
    "shame":           (-0.80, -0.10),
    "humiliation":     (-0.75, +0.30),
    "embarrassment":   (-0.20, +0.20),
    "guilt":           (-0.55, +0.05),
    "perfectionism":   (-0.40, +0.35),
    "self-compassion": (+0.45, -0.10),
    "love":            (+0.80, +0.30),
    "heartbreak":      (-0.85, -0.10),
    "betrayal":        (-0.80, +0.30),
    "trust":           (+0.55, +0.00),
    "self-trust":      (+0.55, +0.05),
    "defensiveness":   (-0.40, +0.35),
    "flooding":        (-0.55, +0.65),
    "hurt":            (-0.55, -0.05),
    "boredom":         (-0.30, -0.50),
    "frustration":     (-0.55, +0.45),
    "disappointment":  (-0.45, -0.10),
    "regret":          (-0.40, -0.15),
    "discouragement":  (-0.50, -0.20),
    "resignation":     (-0.40, -0.45),
    "awe":             (+0.65, +0.30),
    "wonder":          (+0.65, +0.35),
    "curiosity":       (+0.55, +0.30),
    "interest":        (+0.45, +0.15),
    "surprise":        (+0.20, +0.55),
    "confusion":       (-0.10, +0.10),
    "amusement":       (+0.65, +0.30),
    "bittersweetness": (+0.10, -0.10),
    "nostalgia":       (+0.20, -0.20),
    "irony":           (+0.05, +0.05),
    "sarcasm":         (-0.30, +0.20),
    "paradox":         (+0.10, +0.10),
    "cognitive-dissonance": (-0.25, +0.30),
    "comparison":      (-0.40, +0.15),
    "admiration":      (+0.55, +0.20),
    "reverence":       (+0.65, +0.10),
    "envy":            (-0.40, +0.30),
    "jealousy":        (-0.55, +0.55),
    "resentment":      (-0.55, +0.10),
    "schadenfreude":   (+0.10, +0.20),
    "freudenfreude":   (+0.70, +0.30),
    "compassion":      (+0.45, +0.05),
    "empathy":         (+0.30, +0.10),
    "sympathy":        (+0.10, -0.10),
    "pity":            (-0.20, -0.10),
    "boundaries":      (+0.20, +0.10),
    "comparative-suffering": (-0.40, -0.10),
    "belonging":       (+0.75, +0.10),
    "fitting-in":      (-0.30, +0.10),
    "connection":      (+0.70, +0.20),
    "disconnection":   (-0.55, -0.30),
    "insecurity":      (-0.50, +0.10),
    "invisibility":    (-0.55, -0.20),
    "loneliness":      (-0.70, -0.30),
    "lovelessness":    (-0.75, -0.30),
    "pride":           (+0.65, +0.30),
    "hubris":          (+0.05, +0.40),
    "humility":        (+0.45, -0.10),
    "self-righteousness": (-0.30, +0.40),
}


def slugify(name):
    s = name.lower().strip()
    s = re.sub(r"[\s_]+", "-", s)
    s = re.sub(r"[^a-z0-9-]", "", s)
    return s


def parse_source(path):
    """Parse feelings.source.md into a list of feeling dicts."""
    text = path.read_text(encoding="utf-8")
    feelings = []
    current = None

    for line in text.split("\n"):
        m = re.match(r"^##\s+(.+?)\s*$", line)
        if m:
            if current:
                feelings.append(current)
            name = m.group(1)
            current = {
                "id": slugify(name),
                "name": name,
                "place": "",
                "definition": "",
                "examples": [],
                "often_with": [],
                "_raw_often_with": "",
            }
            continue
        if current is None:
            continue

        m = re.match(r"^-\s*place:\s*(.+)$", line)
        if m:
            current["place"] = m.group(1).strip()
            continue
        m = re.match(r"^-\s*definition:\s*(.+)$", line)
        if m:
            current["definition"] = m.group(1).strip()
            continue
        m = re.match(r"^-\s*examples:\s*(.+)$", line)
        if m:
            ex_text = m.group(1).strip()
            current["examples"] = [e.strip() for e in re.split(r";\s*", ex_text) if e.strip()]
            continue
        m = re.match(r"^-\s*often_with:\s*(.+)$", line)
        if m:
            raw = m.group(1).strip()
            current["_raw_often_with"] = raw
            current["often_with"] = [slugify(t) for t in re.split(r",\s*", raw) if t.strip()]
            continue

    if current:
        feelings.append(current)
    return feelings


def heuristic_coords(feelings):
    """Place feelings on the valence/energy plane using place defaults + overrides + within-place jitter."""
    by_place = {}
    for f in feelings:
        by_place.setdefault(f["place"], []).append(f)

    for place, items in by_place.items():
        cx, cy = PLACE_VALENCE_ENERGY.get(place, (0.0, 0.0))
        for i, f in enumerate(items):
            # within-place jitter forms a small ring so points don't overlap
            angle = (i / max(len(items), 1)) * 6.28318
            jx = 0.07 * (1 if (i % 2 == 0) else -1) * (i + 1) * 0.4
            jy = 0.05 * ((i % 3) - 1)
            ox, oy = FEELING_OVERRIDES.get(f["id"], (cx + jx, cy + jy))
            f["valence"] = round(max(-1.0, min(1.0, ox)), 3)
            f["energy"]  = round(max(-1.0, min(1.0, oy)), 3)


def heuristic_umap(feelings):
    """Stub UMAP: scale valence/energy out to a larger plane and add a small angle term per place
    to give the graph view a backdrop with visible regional structure even without real embeddings."""
    for f in feelings:
        place_idx = PLACE_INDEX.get(f["place"], 0)
        angle = place_idx * (6.28318 / 13)
        # rotate the valence/energy point slightly per place for a galaxy-like spread
        x = f["valence"] * 8.0 + 1.5 * (place_idx % 5 - 2) * 0.1
        y = f["energy"] * 8.0 + 1.5 * (place_idx % 7 - 3) * 0.1
        # small place-coherent offset
        x += 1.0 * round(0.6 * (place_idx - 6) / 6, 3)
        y += 0.6 * round((place_idx % 3 - 1), 3)
        f["umap"] = [round(x, 3), round(y, 3)]


def derive_variations_stub(feelings):
    """Variations stub: pick up to 4 within-place neighbors (alphabetical by id), excluding self."""
    by_place = {}
    for f in feelings:
        by_place.setdefault(f["place"], []).append(f)

    for f in feelings:
        siblings = [s for s in by_place[f["place"]] if s["id"] != f["id"]]
        siblings_sorted = sorted(siblings, key=lambda s: s["id"])
        f["variations"] = [s["id"] for s in siblings_sorted[:4]]


def derive_complementaries_stub(feelings):
    """Complementaries stub: use the often_with hints from the source file, intersected with the 87."""
    valid_ids = {f["id"] for f in feelings}
    for f in feelings:
        comps = [c for c in f["often_with"] if c in valid_ids and c != f["id"]]
        # Trim to 6
        f["complementaries"] = comps[:6]


def write_output(feelings, out_path):
    out_path.parent.mkdir(parents=True, exist_ok=True)
    payload = {
        "places": list(PLACE_INDEX.keys()),
        "feelings": [
            {
                "id": f["id"],
                "name": f["name"],
                "place": f["place"],
                "definition": f["definition"],
                "examples": f["examples"],
                "valence": f["valence"],
                "energy": f["energy"],
                "umap": f["umap"],
                "variations": f["variations"],
                "complementaries": f["complementaries"],
            }
            for f in feelings
        ],
    }
    out_path.write_text(json.dumps(payload, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"Wrote {len(feelings)} feelings to {out_path}")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--stub", action="store_true",
                    help="Skip ML/LLM steps; use heuristic neighbors. Always works.")
    ap.add_argument("--cache-dir", default=str(CACHE_DIR),
                    help="Directory for caching LLM/embedding responses (full mode only)")
    args = ap.parse_args()

    feelings = parse_source(SOURCE_FILE)
    if len(feelings) != 87:
        print(f"WARNING: parsed {len(feelings)} feelings, expected 87", file=sys.stderr)

    heuristic_coords(feelings)
    heuristic_umap(feelings)
    derive_variations_stub(feelings)
    derive_complementaries_stub(feelings)

    if not args.stub:
        # Full mode upgrades the stub fields where it can. Each step degrades gracefully.
        try:
            embeddings = compute_embeddings(feelings)
            replace_with_embedding_variations(feelings, embeddings)
            replace_with_umap_projection(feelings, embeddings)
            print("Embeddings: applied")
        except Exception as e:
            print(f"Embeddings: skipped ({e})", file=sys.stderr)

        try:
            replace_with_llm_complementaries(feelings, Path(args.cache_dir))
            print("LLM complementaries: applied")
        except Exception as e:
            print(f"LLM complementaries: skipped ({e})", file=sys.stderr)

    write_output(feelings, OUTPUT_FILE)


# ──────────────────────────────────────────────────────────────────────
# Full-mode helpers. Imports happen inside so --stub works without deps.
# ──────────────────────────────────────────────────────────────────────

def compute_embeddings(feelings):
    """Returns dict {id: vector}. Tries OpenAI first if key present, then sentence-transformers."""
    import numpy as np

    texts = [
        f"{f['name']}. {f['place']}. {f['definition']} Examples: {' '.join(f['examples'])}"
        for f in feelings
    ]

    if os.environ.get("OPENAI_API_KEY"):
        from openai import OpenAI
        client = OpenAI()
        resp = client.embeddings.create(model="text-embedding-3-small", input=texts)
        return {f["id"]: np.array(d.embedding) for f, d in zip(feelings, resp.data)}

    from sentence_transformers import SentenceTransformer
    model = SentenceTransformer("all-mpnet-base-v2")
    vecs = model.encode(texts, normalize_embeddings=True)
    return {f["id"]: v for f, v in zip(feelings, vecs)}


def replace_with_embedding_variations(feelings, embeddings):
    import numpy as np
    by_place = {}
    for f in feelings:
        by_place.setdefault(f["place"], []).append(f)

    place_neighbors = build_place_adjacency()

    for f in feelings:
        own = embeddings[f["id"]]
        candidate_places = {f["place"]} | place_neighbors.get(f["place"], set())
        cands = [c for c in feelings if c["place"] in candidate_places and c["id"] != f["id"]]
        scored = sorted(
            cands,
            key=lambda c: float(np.dot(own, embeddings[c["id"]])
                                / (np.linalg.norm(own) * np.linalg.norm(embeddings[c["id"]]))),
            reverse=True,
        )
        f["variations"] = [c["id"] for c in scored[:5]]


def replace_with_umap_projection(feelings, embeddings):
    import numpy as np
    import umap
    ids = [f["id"] for f in feelings]
    matrix = np.stack([embeddings[i] for i in ids])
    reducer = umap.UMAP(n_components=2, n_neighbors=10, min_dist=0.4, random_state=42)
    proj = reducer.fit_transform(matrix)
    for f, (x, y) in zip(feelings, proj):
        f["umap"] = [round(float(x), 3), round(float(y), 3)]


def replace_with_llm_complementaries(feelings, cache_dir):
    """Asks an LLM (Anthropic preferred) to propose 4-8 *complementary*, non-synonym co-occurring feelings."""
    cache_dir.mkdir(parents=True, exist_ok=True)
    valid_ids = {f["id"] for f in feelings}
    listing = "\n".join(f"- {f['id']}: {f['name']} ({f['place']})" for f in feelings)

    if os.environ.get("ANTHROPIC_API_KEY"):
        from anthropic import Anthropic
        client = Anthropic()
        provider = "anthropic"
    elif os.environ.get("OPENAI_API_KEY"):
        from openai import OpenAI
        client = OpenAI()
        provider = "openai"
    else:
        raise RuntimeError("no ANTHROPIC_API_KEY or OPENAI_API_KEY")

    for f in feelings:
        cache_path = cache_dir / f"{f['id']}.json"
        if cache_path.exists():
            f["complementaries"] = json.loads(cache_path.read_text())[:6]
            continue

        prompt = (
            f"Below is the full list of 87 feelings from Brené Brown's *Atlas of the Heart*, "
            f"each with its slug, display name, and 'Place We Go' chapter:\n\n{listing}\n\n"
            f"For the feeling **{f['name']}** (id: {f['id']}, place: {f['place']}), "
            f"return 4–8 *other* feelings *from this list* that **commonly co-occur** "
            f"with {f['name']} in real lived experience but are **different in kind** — "
            f"not synonyms, not variations, not opposites. Think about what someone "
            f"actually feels at the same time as {f['name']}, even if it seems "
            f"contradictory.\n\n"
            f"Definition for context: {f['definition']}\n\n"
            f"Return ONLY a JSON array of slugs (lowercase, hyphenated), no prose. "
            f"Each slug must appear in the list above."
        )

        if provider == "anthropic":
            resp = client.messages.create(
                model="claude-opus-4-7",
                max_tokens=400,
                messages=[{"role": "user", "content": prompt}],
            )
            raw = resp.content[0].text.strip()
        else:
            resp = client.chat.completions.create(
                model="gpt-4o",
                messages=[{"role": "user", "content": prompt}],
            )
            raw = resp.choices[0].message.content.strip()

        try:
            arr = json.loads(re.search(r"\[.*\]", raw, re.S).group(0))
        except Exception:
            print(f"  parse failure for {f['id']}: {raw[:80]}", file=sys.stderr)
            continue
        comps = [s for s in arr if s in valid_ids and s != f["id"]][:6]
        if comps:
            f["complementaries"] = comps
            cache_path.write_text(json.dumps(comps), encoding="utf-8")


def build_place_adjacency():
    """Manually-curated adjacency between Brown's 13 Places. Used to constrain variation neighbors
    so we don't pull 'envy' as a 'variation' of 'sadness' (different in kind)."""
    adj = {
        "When Things Are Uncertain or Too Much": {"When We Feel Wronged", "When We're Hurting", "When We Search for Connection"},
        "When We Compare":                        {"When We Fall Short", "When We Feel Wronged", "To Self-Assess"},
        "When Things Don't Go as Planned":        {"When We're Hurting", "When We Feel Wronged", "When Things Are Uncertain or Too Much"},
        "When It's Beyond Us":                    {"When Life Is Good", "When Things Aren't What They Seem"},
        "When Things Aren't What They Seem":      {"When It's Beyond Us", "When We're Hurting", "When Life Is Good"},
        "When We're Hurting":                     {"When We Search for Connection", "When the Heart Is Open", "When Things Don't Go as Planned"},
        "With Others":                             {"When the Heart Is Open", "When We Search for Connection"},
        "When We Fall Short":                      {"When We Compare", "To Self-Assess", "When We Search for Connection"},
        "When We Search for Connection":          {"When We're Hurting", "When the Heart Is Open", "With Others"},
        "When the Heart Is Open":                  {"With Others", "When Life Is Good", "When We're Hurting"},
        "When Life Is Good":                       {"When the Heart Is Open", "When It's Beyond Us"},
        "When We Feel Wronged":                    {"When Things Don't Go as Planned", "When Things Are Uncertain or Too Much", "When We Compare"},
        "To Self-Assess":                          {"When We Compare", "When We Fall Short"},
    }
    return adj


if __name__ == "__main__":
    main()
