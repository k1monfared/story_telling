"""Validator for SKILL.md files in the storytelling skills library."""
from __future__ import annotations

import re
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
