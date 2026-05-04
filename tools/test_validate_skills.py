"""Tests for the skill validator."""
from pathlib import Path

import pytest

from tools.validate_skills import (
    SkillValidationError,
    load_skill,
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
