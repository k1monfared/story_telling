"""Tests for the skill validator."""
from pathlib import Path

import pytest

from tools.validate_skills import (
    SkillValidationError,
    load_skill,
    validate_body,
    validate_book_matches_parent,
    validate_frontmatter,
)

FIXTURES = Path(__file__).parent / "fixtures"


def test_load_skill_parses_valid_frontmatter():
    skill_path = (
        FIXTURES
        / "valid"
        / "skills"
        / "example"
        / "example-skill"
        / "SKILL.md"
    )
    skill = load_skill(skill_path)
    assert skill.frontmatter["name"] == "example-skill"
    assert skill.frontmatter["type"] == "atomic"
    assert skill.frontmatter["book"] == "example"


def test_load_skill_raises_on_missing_frontmatter():
    skill_path = (
        FIXTURES
        / "missing_frontmatter"
        / "skills"
        / "example"
        / "bad-skill"
        / "SKILL.md"
    )
    with pytest.raises(SkillValidationError, match="no frontmatter"):
        load_skill(skill_path)


def test_validate_frontmatter_accepts_valid():
    skill_path = (
        FIXTURES
        / "valid"
        / "skills"
        / "example"
        / "example-skill"
        / "SKILL.md"
    )
    validate_frontmatter(load_skill(skill_path))


def test_validate_frontmatter_rejects_missing_description():
    skill_path = (
        FIXTURES
        / "missing_field"
        / "skills"
        / "example"
        / "bad-skill"
        / "SKILL.md"
    )
    skill = load_skill(skill_path)
    with pytest.raises(SkillValidationError, match="missing required field 'description'"):
        validate_frontmatter(skill)


def test_validate_frontmatter_rejects_invalid_type():
    skill_path = (
        FIXTURES
        / "valid"
        / "skills"
        / "example"
        / "example-skill"
        / "SKILL.md"
    )
    skill = load_skill(skill_path)
    skill.frontmatter["type"] = "compound"
    with pytest.raises(SkillValidationError, match="type 'compound' is not one of"):
        validate_frontmatter(skill)


def test_validate_body_accepts_valid():
    skill_path = (
        FIXTURES
        / "valid"
        / "skills"
        / "example"
        / "example-skill"
        / "SKILL.md"
    )
    validate_body(load_skill(skill_path))


def test_validate_body_rejects_missing_section():
    skill_path = (
        FIXTURES
        / "missing_section"
        / "skills"
        / "example"
        / "bad-skill"
        / "SKILL.md"
    )
    skill = load_skill(skill_path)
    with pytest.raises(SkillValidationError, match="missing required body section 'Signal it landed'"):
        validate_body(skill)


def test_validate_book_matches_parent_accepts_match():
    skill_path = (
        FIXTURES
        / "valid"
        / "skills"
        / "example"
        / "example-skill"
        / "SKILL.md"
    )
    validate_book_matches_parent(load_skill(skill_path))


def test_validate_book_matches_parent_rejects_mismatch():
    skill_path = (
        FIXTURES
        / "valid"
        / "skills"
        / "example"
        / "example-skill"
        / "SKILL.md"
    )
    skill = load_skill(skill_path)
    skill.frontmatter["book"] = "wrong-book"
    with pytest.raises(SkillValidationError, match="book 'wrong-book' does not match parent directory 'example'"):
        validate_book_matches_parent(skill)


def test_validate_book_matches_parent_allows_cross_book_in_recipes():
    skill_path = (
        FIXTURES
        / "valid"
        / "skills"
        / "example"
        / "example-skill"
        / "SKILL.md"
    )
    skill = load_skill(skill_path)
    skill.path = Path("skills/cross-book/some-recipe/SKILL.md")
    skill.frontmatter["book"] = "cross-book"
    skill.frontmatter["type"] = "composed"
    validate_book_matches_parent(skill)
