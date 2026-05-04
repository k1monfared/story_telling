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


def validate_book_matches_parent(skill: Skill) -> None:
    """Frontmatter 'book' must match the directory under skills/.

    For skills under skills/<book>/<slug>/SKILL.md, book == <book>.
    For skills under skills/<book>/recipes/<slug>/SKILL.md, book == <book>.
    For skills under skills/cross-book/<slug>/SKILL.md, book == 'cross-book'.
    """
    parts = skill.path.parts
    try:
        skills_idx = parts.index("skills")
    except ValueError as exc:
        raise SkillValidationError(
            f"{skill.path}: not under a 'skills/' directory"
        ) from exc
    if skills_idx + 1 >= len(parts):
        raise SkillValidationError(f"{skill.path}: cannot determine book from path")
    parent_book = parts[skills_idx + 1]
    declared_book = skill.frontmatter["book"]
    if declared_book != parent_book:
        raise SkillValidationError(
            f"{skill.path}: book '{declared_book}' does not match parent directory '{parent_book}'"
        )


RELATED_VERBS = ("extends", "refines", "contrasts", "composed-of")


def validate_related_references(skill: Skill, all_skill_slugs: set[str]) -> None:
    """Every slug referenced in related: must exist in the library."""
    related = skill.frontmatter.get("related", [])
    if not related:
        return
    if not isinstance(related, list):
        raise SkillValidationError(
            f"{skill.path}: 'related' must be a list, got {type(related).__name__}"
        )
    for entry in related:
        if not isinstance(entry, dict):
            raise SkillValidationError(
                f"{skill.path}: each 'related' entry must be a mapping"
            )
        for verb, target in entry.items():
            if verb not in RELATED_VERBS:
                raise SkillValidationError(
                    f"{skill.path}: related verb '{verb}' is not one of {RELATED_VERBS}"
                )
            targets = target if isinstance(target, list) else [target]
            for slug in targets:
                if slug not in all_skill_slugs:
                    raise SkillValidationError(
                        f"{skill.path}: related '{verb}' points to unknown skill '{slug}'"
                    )
