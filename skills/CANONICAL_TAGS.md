# Canonical Tag Vocabulary

The skills library uses a faceted tag set so users can compose queries like
`emotion AND (identity OR triggers) NOT cut`.

Tags are flat strings (no `facet:tag` syntax), but the UI groups them by facet
for browsability. Each skill carries any number of tags from any facet.

## Facets

### Phase — when in the workflow this applies
- `preparation` — before starting (clarifying purpose, gathering context, prepping yourself)
- `in-the-moment` — during the activity (a move you make live)
- `revision` — after, looking back to improve
- `closing` — wrapping up, committing, deciding what's next

### Action — what kind of move it is
- `diagnose` — figure out what's actually happening
- `inquire` — ask, question, seek
- `listen` — receive, hear out
- `reframe` — recast the situation or stance
- `assert` — express, state your view
- `separate` — split conflated things apart
- `sort` — classify into kinds
- `contain` — set a boundary, mitigate impact
- `experiment` — try out, test
- `cut` — remove, omit
- `iterate` — revise repeatedly toward a target

### Focus — what's being worked on
- `self` — internal state, own thinking
- `text` — a story or draft (Saunders)
- `other` — the other person
- `exchange` — the conversation, the feedback transaction
- `relationship` — ongoing dynamic between people

### Topic — specific subject matter
- `emotion` — feelings, emotional content
- `identity` — self-concept, who-am-I
- `intent-impact` — separating what was meant from what landed
- `contribution` — both-sides contribution to a system
- `triggers` — emotional triggers (truth, relationship, identity)
- `purpose` — clarifying the why
- `distortion` — cognitive distortion patterns
- `coaching` — coaching vs evaluation
- `evaluation` — judgment, assessment
- `blind-spot` — what you can't see in yourself
- `boundaries` — limits, what you'll and won't accept
- `accountability` — owning your part

### Craft — story-craft elements (Saunders)
- `structure` — story structure, plot, causality
- `voice` — narrator voice, register, prose, language
- `pacing` — rhythm, pace
- `point-of-view` — POV
- `characterization` — character building, interiority
- `climax` — the climactic moment
- `endings` — the close

### Stance — mental disposition
- `curiosity` — genuine inquiry, openness
- `growth` — growth mindset

## Mapping from old tags

See `update_tags.py` for the full mapping. Most old tags collapse to one or two
canonical tags. Some old tags (`process`, `framework`, `system`, `disposition`,
`models`) were too generic and were dropped.
