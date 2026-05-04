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
