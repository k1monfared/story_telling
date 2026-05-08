#!/usr/bin/env python3
"""
Apply canonical tag vocabulary to all SKILL.md files.

Reads each SKILL.md, takes existing tags, runs them through TAG_MAP,
adds any name-based bonus tags, dedupes, and writes back.
"""
import os
import re
import sys
from pathlib import Path

import yaml

ROOT = Path(__file__).parent

TAG_MAP = {
    # Phase
    "preparation": ["preparation"],
    "orientation": ["preparation"],
    "alignment": ["preparation"],
    "closing": ["closing"],
    "commitment": ["closing"],
    "decision": ["closing"],
    "in-the-moment": ["in-the-moment"],
    # Action
    "diagnostic": ["diagnose"],
    "diagnosis": ["diagnose"],
    "critique": ["diagnose", "text"],
    "reaction": ["diagnose"],
    "pattern": ["diagnose"],
    "reading": ["diagnose", "text"],
    "close-reading": ["diagnose", "text"],
    "inquiry": ["inquire"],
    "asking": ["inquire"],
    "seeking": ["inquire"],
    "soliciting": ["inquire"],
    "eliciting": ["inquire"],
    "listening": ["listen"],
    "reframe": ["reframe"],
    "perspective": ["reframe"],
    "asserting": ["assert"],
    "expression": ["assert"],
    "containment": ["contain"],
    "exercise": ["experiment"],
    "cutting": ["cut"],
    "omission": ["cut"],
    "editing": ["revision", "cut"],
    "revision": ["revision"],
    "escalation": ["iterate"],
    "sequencing": ["structure"],
    # Focus
    "drafting": ["text"],
    "writing-process": ["text"],
    "craft": ["text"],
    "reader": ["text"],
    "workshop": ["text", "diagnose"],
    "teaching": ["text"],
    "composition": ["text", "structure"],
    "conversation": ["exchange"],
    "receiving": ["exchange"],
    "relationships": ["relationship"],
    "relational": ["relationship"],
    "mismatch": ["relationship"],
    # Topic
    "emotion": ["emotion"],
    "emotional-regulation": ["emotion", "self"],
    "mindfulness": ["self"],
    "attention": ["self"],
    "identity": ["identity"],
    "identity-trigger": ["identity", "triggers"],
    "relationship-trigger": ["relationship", "triggers"],
    "truth-trigger": ["triggers", "intent-impact"],
    "all-three-conversations": ["emotion", "identity", "exchange"],
    "feelings-conversation": ["emotion", "exchange"],
    "identity-conversation": ["identity", "exchange"],
    "what-happened-conversation": ["diagnose", "exchange", "intent-impact"],
    "distortion": ["distortion"],
    "blind-spot": ["blind-spot"],
    "boundaries": ["boundaries"],
    "coaching": ["coaching"],
    "evaluation": ["evaluation"],
    "belief": ["identity", "text"],
    "acceptance": ["growth"],
    "accountability": ["accountability"],
    # Craft
    "structure": ["structure"],
    "plot": ["structure"],
    "theme": ["structure", "text"],
    "causality": ["structure"],
    "voice": ["voice"],
    "register": ["voice"],
    "prose": ["voice"],
    "language": ["voice"],
    "vocabulary": ["voice"],
    "description": ["voice"],
    "imagery": ["voice"],
    "strangeness": ["voice"],
    "pacing": ["pacing"],
    "pace": ["pacing"],
    "point-of-view": ["point-of-view"],
    "characterization": ["characterization"],
    "interiority": ["characterization"],
    "climax": ["climax"],
    "endings": ["endings"],
    "resolution": ["endings"],
    "constraint": ["structure"],
    # Stance
    "growth-mindset": ["growth"],
    "mindset": ["growth"],
    # Misc dropped or repurposed
    "process": [],
    "framework": [],
    "script": [],
    "system": [],
    "wiring": ["identity"],
    "change": [],
    "action": [],
    "problem-solving": ["exchange"],
    "models": [],
    "premise": [],
    "learning": [],
    "intuition": [],
    "disposition": [],
}

# Bonus tags inferred from skill slug substrings.
SLUG_BONUS = [
    (r"intent|impact", ["intent-impact"]),
    (r"contribut", ["contribution"]),
    (r"purpose|why", ["purpose"]),
    (r"third-story|and-stance|curiosit", ["curiosity"]),
    (r"boundar", ["boundaries"]),
    (r"trigger", ["triggers"]),
    (r"climax", ["climax"]),
    (r"endings|ending", ["endings"]),
    (r"cut\b|cutting|truncat", ["cut"]),
    (r"reframe", ["reframe"]),
    (r"separate|disentangle|distinguish", ["separate"]),
    (r"sort", ["sort"]),
    (r"listen", ["listen"]),
    (r"\bask\b|ask-", ["inquire"]),
    (r"contain", ["contain"]),
    (r"feeling|emotion", ["emotion"]),
    (r"identity", ["identity"]),
    (r"distortion|catch-the-wrong", ["distortion"]),
    (r"coach", ["coaching"]),
    (r"evaluat", ["evaluation"]),
    (r"experiment", ["experiment"]),
    (r"revis", ["revision"]),
    (r"voice|register|skaz", ["voice"]),
    (r"pacing|pace", ["pacing"]),
    (r"point-of-view|vantage", ["point-of-view"]),
    (r"characterization|character", ["characterization"]),
    (r"structure|plot", ["structure"]),
    (r"\bdraft|drafting", ["text", "in-the-moment"]),
    (r"workshop|critique", ["diagnose", "text"]),
    (r"close|commit", ["closing"]),
    (r"prepare|preparation", ["preparation"]),
    (r"acknowledge|express-feel", ["assert"]),
    (r"diagnos", ["diagnose"]),
    (r"reframe|shift-from", ["reframe"]),
    (r"identif", ["diagnose"]),
]


def map_tags(old_tags, slug):
    new = []
    for t in old_tags or []:
        new.extend(TAG_MAP.get(t, [t]))
    for pattern, bonuses in SLUG_BONUS:
        if re.search(pattern, slug):
            new.extend(bonuses)
    # dedupe preserving order
    seen = set()
    out = []
    for t in new:
        if t and t not in seen:
            seen.add(t)
            out.append(t)
    return out


def update_file(path: Path, dry_run=False):
    text = path.read_text()
    m = re.match(r"^---\n(.*?)\n---\n(.*)$", text, re.S)
    if not m:
        print(f"  SKIP (no frontmatter): {path}")
        return None
    fm_text, body = m.group(1), m.group(2)
    try:
        fm = yaml.safe_load(fm_text)
    except Exception as e:
        print(f"  SKIP (bad yaml): {path}: {e}")
        return None
    if not isinstance(fm, dict):
        return None

    slug = fm.get("name") or path.parent.name
    old_tags = fm.get("tags") or []
    new_tags = map_tags(old_tags, slug)

    if old_tags == new_tags:
        return ("unchanged", old_tags, new_tags)

    fm["tags"] = new_tags
    new_fm = yaml.dump(fm, sort_keys=False, allow_unicode=True, width=10000).rstrip()
    new_text = f"---\n{new_fm}\n---\n{body}"

    if not dry_run:
        path.write_text(new_text)
    return ("changed", old_tags, new_tags)


def main():
    dry_run = "--dry" in sys.argv
    books = ["saunders", "feedback", "difficult", "polysecure"]
    total = 0
    changed = 0
    all_new_tags = set()
    skipped_reasons = []

    for book in books:
        bdir = ROOT / book
        if not bdir.is_dir():
            continue
        for skill in sorted(bdir.rglob("SKILL.md")):
            total += 1
            result = update_file(skill, dry_run=dry_run)
            if result is None:
                continue
            status, old, new = result
            if status == "changed":
                changed += 1
                if dry_run:
                    print(f"  {book}/{entry.name}")
                    print(f"    old: {old}")
                    print(f"    new: {new}")
            all_new_tags.update(new)

    print(f"\nProcessed: {total}")
    print(f"Changed: {changed}")
    print(f"\nUnique tags after mapping: {len(all_new_tags)}")
    for t in sorted(all_new_tags):
        print(f"  {t}")


if __name__ == "__main__":
    main()
