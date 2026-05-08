#!/usr/bin/env python3
"""
Remove craft tags (story-craft-only) from feedback and difficult skills.
These tags collided with the metaphorical sense of the same words in those
books (e.g. "internal voice" got the saunders narrator-voice tag).
"""
from pathlib import Path
import re
import yaml

ROOT = Path(__file__).parent
CRAFT_TAGS = {
    "structure", "voice", "pacing", "point-of-view",
    "characterization", "climax", "endings",
}
NON_SAUNDERS = ["feedback", "difficult"]


def update_file(path: Path) -> bool:
    text = path.read_text()
    m = re.match(r"^---\n(.*?)\n---\n(.*)$", text, re.S)
    if not m:
        return False
    fm_text, body = m.group(1), m.group(2)
    fm = yaml.safe_load(fm_text) or {}
    tags = fm.get("tags") or []
    new_tags = [t for t in tags if t not in CRAFT_TAGS]
    if new_tags == tags:
        return False
    fm["tags"] = new_tags
    new_fm = yaml.dump(fm, sort_keys=False, allow_unicode=True, width=10000).rstrip()
    path.write_text(f"---\n{new_fm}\n---\n{body}")
    return True


def main():
    changed = 0
    for book in NON_SAUNDERS:
        for skill in sorted((ROOT / book).rglob("SKILL.md")):
            if update_file(skill):
                changed += 1
                print(f"  stripped craft tags from {skill.relative_to(ROOT)}")
    print(f"\nUpdated {changed} files.")


if __name__ == "__main__":
    main()
