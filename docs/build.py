#!/usr/bin/env python3
"""
Build script: reads all SKILL.md files from skills/ and generates JSON files in docs/data/.
"""

import os
import re
import json
import yaml
from pathlib import Path

BASE_DIR = Path(__file__).parent.parent  # marginalia/
DOCS_DATA = Path(__file__).parent / "data"
DOCS_DATA.mkdir(parents=True, exist_ok=True)

BOOKS = ["saunders", "feedback", "difficult", "polysecure"]

SECTION_KEYS = {
    "When to reach for this": "when",
    "The move": "move",
    "Signal it landed": "signal",
    "Probe before & after": "probe",
    "Failure mode this prevents": "failure",
    "Worked micro-example": "example",
    "Reflection prompts": "reflection_prompts",
    "Source": "source",
    "Related skills": "related_skills",
}


def md_to_html(text):
    """Convert a markdown string to HTML. Handles the patterns used in SKILL.md files."""
    if not text:
        return ""

    lines = text.split("\n")
    output = []
    i = 0

    def escape(s):
        return (s.replace("&", "&amp;")
                  .replace("<", "&lt;")
                  .replace(">", "&gt;"))

    def inline(s):
        """Convert inline markdown (bold, italic, code, backtick) within a string."""
        # Escape HTML special chars first
        s = escape(s)
        # Bold: **text**
        s = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", s)
        # Italic: *text* (not already processed by bold)
        s = re.sub(r"(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)", r"<em>\1</em>", s)
        # Code: `text`
        s = re.sub(r"`([^`]+)`", r"<code>\1</code>", s)
        return s

    while i < len(lines):
        line = lines[i]

        # Skip empty lines (handled by paragraph logic)
        if line.strip() == "":
            i += 1
            continue

        # ## Header → h4
        m = re.match(r"^#{2,}\s+(.*)", line)
        if m:
            output.append(f"<h4>{inline(m.group(1))}</h4>")
            i += 1
            continue

        # Numbered list
        if re.match(r"^\d+\.\s", line):
            output.append("<ol>")
            while i < len(lines) and re.match(r"^\d+\.\s", lines[i]):
                item_text = re.sub(r"^\d+\.\s+", "", lines[i])
                # collect continuation lines (indented)
                i += 1
                while i < len(lines) and lines[i].startswith("   "):
                    item_text += " " + lines[i].strip()
                    i += 1
                output.append(f"<li>{inline(item_text)}</li>")
            output.append("</ol>")
            continue

        # Bullet list
        if re.match(r"^[-*]\s", line):
            output.append("<ul>")
            while i < len(lines) and re.match(r"^[-*]\s", lines[i]):
                item_text = re.sub(r"^[-*]\s+", "", lines[i])
                i += 1
                # collect continuation lines (indented)
                while i < len(lines) and lines[i].startswith("  "):
                    item_text += " " + lines[i].strip()
                    i += 1
                output.append(f"<li>{inline(item_text)}</li>")
            output.append("</ul>")
            continue

        # Bold line acting as paragraph heading (e.g., **Step X:**)
        # just treat as paragraph

        # Regular paragraph: collect until blank line
        para_lines = []
        while i < len(lines) and lines[i].strip() != "" and not re.match(r"^#{2,}\s", lines[i]) and not re.match(r"^[-*]\s", lines[i]) and not re.match(r"^\d+\.\s", lines[i]):
            para_lines.append(lines[i])
            i += 1
        if para_lines:
            para_text = " ".join(para_lines)
            output.append(f"<p>{inline(para_text)}</p>")

    return "\n".join(output)


def parse_skill_md(filepath, slug, is_recipe):
    """Parse a SKILL.md file and return a skill dict."""
    text = filepath.read_text(encoding="utf-8")

    # Split frontmatter and body
    if text.startswith("---"):
        # find closing ---
        end = text.index("---", 3)
        fm_text = text[3:end].strip()
        body = text[end + 3:].strip()
    else:
        fm_text = ""
        body = text.strip()

    try:
        fm = yaml.safe_load(fm_text) or {}
    except Exception:
        fm = {}

    # Parse body sections
    sections_raw = {}
    current_key = None
    current_lines = []

    for line in body.split("\n"):
        # Check for ## Header
        m = re.match(r"^##\s+(.*)", line)
        if m:
            if current_key and current_lines:
                sections_raw[current_key] = "\n".join(current_lines).strip()
            header_name = m.group(1).strip()
            current_key = SECTION_KEYS.get(header_name)
            current_lines = []
        else:
            if current_key is not None:
                current_lines.append(line)

    if current_key and current_lines:
        sections_raw[current_key] = "\n".join(current_lines).strip()

    # Convert sections to HTML
    sections_html = {}
    for key, raw_text in sections_raw.items():
        sections_html[key] = md_to_html(raw_text)

    return {
        "slug": slug,
        "name": fm.get("name", slug),
        "type": fm.get("type", "atomic"),
        "description": fm.get("description", ""),
        "tags": fm.get("tags") or [],
        "related": fm.get("related") or [],
        "sources": fm.get("sources") or [],
        "sections_html": sections_html,
        "is_recipe": is_recipe,
    }


def collect_skills(book):
    """Collect all skills for a book from skills/<book>/ directory."""
    book_dir = BASE_DIR / "skills" / book
    skills = []

    if not book_dir.exists():
        print(f"  Warning: {book_dir} does not exist")
        return skills

    for entry in sorted(book_dir.iterdir()):
        if entry.name.startswith("_") or not entry.is_dir():
            continue
        if entry.name == "recipes":
            # Recurse into recipes
            recipes_dir = entry
            for recipe_entry in sorted(recipes_dir.iterdir()):
                if not recipe_entry.is_dir():
                    continue
                skill_file = recipe_entry / "SKILL.md"
                if skill_file.exists():
                    try:
                        skill = parse_skill_md(skill_file, recipe_entry.name, is_recipe=True)
                        skills.append(skill)
                        print(f"  [recipe] {recipe_entry.name}")
                    except Exception as e:
                        print(f"  ERROR parsing {skill_file}: {e}")
        else:
            skill_file = entry / "SKILL.md"
            if skill_file.exists():
                try:
                    skill = parse_skill_md(skill_file, entry.name, is_recipe=False)
                    skills.append(skill)
                    print(f"  [skill]  {entry.name}")
                except Exception as e:
                    print(f"  ERROR parsing {skill_file}: {e}")

    return skills


def main():
    for book in BOOKS:
        print(f"\nProcessing book: {book}")
        skills = collect_skills(book)
        out_path = DOCS_DATA / f"{book}-skills.json"
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump(skills, f, indent=2, ensure_ascii=False)
        print(f"  -> wrote {len(skills)} skills to {out_path}")


if __name__ == "__main__":
    main()
