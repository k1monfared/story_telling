---
name: example-skill
description: Use when demonstrating that the validator parses frontmatter correctly.
type: atomic
book: example
sources:
  - book: example
    location: "imagined ch 1"
    note: "primary source"
tags: [test]
---

# Example skill

## When to reach for this
A test fixture for the validator.

## The move
1. Do nothing.

## Signal it landed
The validator passes.

## Probe before & after
1. Before applying — note that the test runs.
2. After applying — note that the test still runs.
3. Compare. The skill landed if both noted.

## Failure mode this prevents
Validator regression.

## Source
- Imagined ch 1.

## Related skills
- (none)
