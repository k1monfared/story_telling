# Atlas of the Heart — Feelings Source

The 87 feelings of *Atlas of the Heart* (Brown, 2021), grouped by Brown's 13 "Places We Go". The build pipeline (`feelings.build.py`) parses this file to produce `docs/data/atlas-feelings.json`.

Each section is one feeling. Heading is the display name; slug is auto-derived (lowercased, hyphenated). Fields:

- `place` — Brown's chapter group, exact wording.
- `definition` — concise, ≤2 sentences. Hand-curated; embeddings reference this text.
- `examples` — 2-3 short situations; semicolon-separated.
- `often_with` — comma-separated hints used to seed the LLM "complementaries" pass. Not authoritative; a starting point for review.

To refine after launch, edit definitions and `often_with` here, then rerun the build. Quality scales with this file.

---

## Stress
- place: When Things Are Uncertain or Too Much
- definition: The feeling of being pressured by demands we believe exceed what we can manage. Tied to a specific load that has to be handled now.
- examples: A tight deadline stacked on three other deadlines; a sick kid the night before a presentation; a difficult conversation we keep dreading.
- often_with: overwhelm, anxiety, irritability, frustration, exhaustion

## Overwhelm
- place: When Things Are Uncertain or Too Much
- definition: An extreme level of stress that has tipped the system into shutdown — we cannot sort, prioritize, or take a next step. The mind blanks.
- examples: Standing in the middle of a kitchen full of dishes, paralyzed; staring at a project plan you can no longer see; a grief that flattens scheduling.
- often_with: stress, despair, helplessness, exhaustion, paralysis

## Anxiety
- place: When Things Are Uncertain or Too Much
- definition: An emotion characterized by a sense of uncertainty about the future and the inability to control or predict outcomes. Felt in the body before the mind.
- examples: Pacing while waiting for a test result; a tight chest before a meeting that has not started yet; running scenarios at 3 a.m.
- often_with: worry, dread, fear, vulnerability, avoidance

## Worry
- place: When Things Are Uncertain or Too Much
- definition: A chain of repeated, often catastrophic thoughts about a possible threat. The cognitive partner of anxiety; we worry to feel like we're doing something.
- examples: Replaying a conversation looking for damage; mentally cataloguing what could go wrong on a trip; rehearsing a child's worst-case future.
- often_with: anxiety, fear, dread, vigilance, fatigue

## Avoidance
- place: When Things Are Uncertain or Too Much
- definition: A coping move where we deny, ignore, or pull away from a stressor. Not a feeling per se but a behavior fueled by feeling — usually to keep anxiety down.
- examples: Refusing to open the bill; canceling the doctor's appointment again; suddenly cleaning the kitchen instead of writing the email.
- often_with: anxiety, dread, shame, relief, guilt

## Excitement
- place: When Things Are Uncertain or Too Much
- definition: An energized anticipation of something good. Closely related to anxiety in the body; meaning is what tells them apart.
- examples: The morning of a long-awaited trip; a job interview you actually want; a first date you chose.
- often_with: anxiety, joy, anticipation, vulnerability, hope

## Dread
- place: When Things Are Uncertain or Too Much
- definition: A heavy, anticipatory fear of a negative event whose arrival feels inevitable. Time runs differently inside it.
- examples: The Sunday-night feeling about Monday morning; the week before a hard medical test; the drive to a hard goodbye.
- often_with: anxiety, fear, sadness, foreboding-joy, avoidance

## Fear
- place: When Things Are Uncertain or Too Much
- definition: A primal response to a present threat that mobilizes the body to fight, flee, or freeze. Often confused with anxiety, which is about the future.
- examples: Brakes failing on a hill; a footstep behind you in a parking lot; your child stepping into the street.
- often_with: anxiety, dread, vulnerability, anger, panic

## Vulnerability
- place: When Things Are Uncertain or Too Much
- definition: The emotion we experience during times of uncertainty, risk, and emotional exposure. Brown's signature: the birthplace of love, belonging, joy, courage, empathy, and creativity.
- examples: Sharing a draft; saying "I love you" first; raising a hand to disagree.
- often_with: courage, fear, anxiety, hope, shame

## Comparison
- place: When We Compare
- definition: The crush of conformity from one side and competition from the other. We measure ourselves against others on the wrong axes.
- examples: Scrolling someone's promotion announcement and feeling smaller; eyeing a friend's parenting at a party; ranking yourself by salary.
- often_with: envy, jealousy, shame, insecurity, resentment

## Admiration
- place: When We Compare
- definition: A response to seeing something or someone that exceeds standards in a way we want to emulate. Pulls us up rather than pushing us down.
- examples: Watching a teacher work a room; reading a paragraph that lifts the whole book; seeing a friend handle hard news with grace.
- often_with: reverence, awe, freudenfreude, gratitude, hope

## Reverence
- place: When We Compare
- definition: A deeper form of admiration mixed with awe and wonder; reserved for what feels sacred or beyond the ordinary.
- examples: A cathedral; a child's birth; a piece of music you cannot reduce to language.
- often_with: awe, wonder, gratitude, humility, love

## Envy
- place: When We Compare
- definition: Wanting what another person has and feeling the lack as a burn. About possession or quality, not the relationship.
- examples: Wanting the ease your colleague seems to have; wishing you had your friend's marriage; coveting a house you visited.
- often_with: comparison, resentment, shame, longing, inadequacy

## Jealousy
- place: When We Compare
- definition: Fear of losing a relationship or its quality to a rival. Always involves three: you, the loved one, and the threat.
- examples: A partner laughing easily with someone else; a best friend's new closeness with a coworker; a child's bond with a grandparent.
- often_with: insecurity, fear, anger, betrayal, vulnerability

## Resentment
- place: When We Compare
- definition: A close cousin of envy: the feeling that someone is getting away with something we earned, or that what we want is being unfairly given to someone else.
- examples: A peer promoted past you; a sibling's lighter workload at home; a partner who never has to ask for time off.
- often_with: envy, anger, comparison, exhaustion, contempt

## Schadenfreude
- place: When We Compare
- definition: Pleasure at someone else's misfortune. Often mild and quick; sharper if it lands on someone who lorded over us.
- examples: A reckless driver who passed you getting a ticket up the road; a smug colleague's pitch falling flat; a public figure's downfall.
- often_with: contempt, envy, anger, justice, embarrassment

## Freudenfreude
- place: When We Compare
- definition: Joy at another's success — the warm twin of schadenfreude. The capacity to fully celebrate good things happening to other people.
- examples: A friend's book deal lighting you up; a teammate's win you cheered all night; a partner's promotion you feel in your own chest.
- often_with: joy, admiration, gratitude, love, generosity

## Boredom
- place: When Things Don't Go as Planned
- definition: An emotional state of low arousal, low engagement, and dissatisfaction — wanting to do something but unable to find anything that feels worth doing.
- examples: Sunday afternoon stretched too long; the third day of a vacation you didn't choose; minute thirty of a meeting that should have been an email.
- often_with: restlessness, irritability, sadness, disconnection, avoidance

## Disappointment
- place: When Things Don't Go as Planned
- definition: The sadness of unmet expectation. Bigger than frustration; quieter than grief.
- examples: A job offer that didn't come; a friend who forgot your birthday; a holiday that didn't feel like the holiday.
- often_with: sadness, regret, frustration, hurt, resignation

## Expectations
- place: When Things Don't Go as Planned
- definition: Unspoken pictures of how something will go. Not a feeling, but the soil in which disappointment, frustration, and resentment grow.
- examples: Planning a perfect dinner in your head; assuming a partner will know what you need; building the wedding before the relationship.
- often_with: disappointment, resentment, hurt, hope, anxiety

## Regret
- place: When Things Don't Go as Planned
- definition: A backward-looking sadness over a choice we wish we had made differently. Brown frames it as a teacher when held with self-compassion.
- examples: The job you turned down; the words you said in anger; the year you let pass without calling.
- often_with: sadness, shame, longing, guilt, self-compassion

## Discouragement
- place: When Things Don't Go as Planned
- definition: Loss of motivation after repeated obstacles. Heart-leaving-the-work.
- examples: The fourth rejection on a manuscript; a child's school slipping back again; the same conversation with a partner with no movement.
- often_with: resignation, sadness, frustration, hopelessness, exhaustion

## Resignation
- place: When Things Don't Go as Planned
- definition: A flat acceptance after we've concluded our effort won't matter. The handle release.
- examples: Closing a project you stopped believing in; a marriage that's gone quiet; an institution you've stopped writing to.
- often_with: discouragement, sadness, exhaustion, hopelessness, apathy

## Frustration
- place: When Things Don't Go as Planned
- definition: The rough heat that comes when something we want is being blocked or going slower than it should.
- examples: A wifi that won't connect; a kid not putting on shoes; an answer no one seems to have.
- often_with: anger, irritability, stress, disappointment, helplessness

## Awe
- place: When It's Beyond Us
- definition: The feeling of being in the presence of something vast that transcends our understanding of the world. Smaller in self, larger in being.
- examples: A clear night under the Milky Way; a great speech that quiets a room; a child's first steps.
- often_with: wonder, reverence, humility, gratitude, smallness

## Wonder
- place: When It's Beyond Us
- definition: The pull to keep exploring something we don't fully understand. The cousin of awe that wants to know more rather than only stand still.
- examples: An octopus opening a jar; the first frost on grass; a child's question about death.
- often_with: awe, curiosity, interest, humility, surprise

## Confusion
- place: When It's Beyond Us
- definition: The state of being unable to make sense of competing or insufficient information. Often a precursor to learning.
- examples: A diagnosis with too many possibilities; a partner's unexpected reaction; a math problem that won't resolve.
- often_with: curiosity, frustration, vulnerability, anxiety, doubt

## Curiosity
- place: When It's Beyond Us
- definition: An interest in learning something more, with a willingness to be wrong. Brown emphasizes that curiosity requires acknowledging a gap in our knowledge.
- examples: A new field you keep reading about; a question you can't shake; a person whose worldview you want to understand.
- often_with: interest, wonder, humility, courage, surprise

## Interest
- place: When It's Beyond Us
- definition: A milder, sustained engagement with something. The everyday energy that becomes curiosity when it deepens.
- examples: A book you keep picking up; a podcast you finish; a co-worker's project you ask about each week.
- often_with: curiosity, engagement, attention, wonder, calm

## Surprise
- place: When It's Beyond Us
- definition: The brief jolt that follows the unexpected. Pure surprise lasts seconds; what we feel after is a different emotion (delight, fear, etc.).
- examples: A friend showing up unannounced; a deer in the yard; a decision that landed differently than predicted.
- often_with: delight, fear, awe, joy, confusion

## Amusement
- place: When Things Aren't What They Seem
- definition: A pleasurable, often light response to incongruity — when something is unexpected in a benign way. Different from happiness.
- examples: A child's mispronunciation; a small absurdity in a serious meeting; a joke at the right moment.
- often_with: joy, happiness, surprise, connection, relief

## Bittersweetness
- place: When Things Aren't What They Seem
- definition: A poignant mix of sadness and joy held at the same time. Brown links it to transitions and the bone-deep awareness of impermanence.
- examples: A child's last day of elementary school; a parent's wedding speech; the last visit to a house you're selling.
- often_with: nostalgia, gratitude, sadness, longing, love

## Nostalgia
- place: When Things Aren't What They Seem
- definition: A wistful affection for the past, often more sweet than the past actually was. A sentimental longing.
- examples: A song that returns you to college; a smell from your grandmother's kitchen; a photograph from a summer you remember more fondly each year.
- often_with: bittersweetness, longing, sadness, gratitude, love

## Cognitive Dissonance
- place: When Things Aren't What They Seem
- definition: The discomfort of holding two beliefs that contradict, or of acting against what we say we believe. The pressure to resolve it can be as strong as a feeling.
- examples: Buying from a company whose ethics you criticize; voting for someone whose temperament you dislike; a kindness from a person you've decided is cruel.
- often_with: confusion, shame, anxiety, anger, vulnerability

## Paradox
- place: When Things Aren't What They Seem
- definition: The recognition that two seemingly opposite things can be true at once. Brown notes the felt experience of paradox carries its own emotional charge.
- examples: Loving someone you can't be with; needing solitude and connection in the same hour; mourning a relief.
- often_with: bittersweetness, awe, humility, confusion, peace

## Irony
- place: When Things Aren't What They Seem
- definition: The mismatch between expectation and reality, said or noticed in a way that highlights the gap.
- examples: The surgeon afraid of needles; the fire station that burns down; the love letter that arrived after the breakup.
- often_with: amusement, sadness, surprise, bittersweetness, contempt

## Sarcasm
- place: When Things Aren't What They Seem
- definition: A sharp form of irony aimed at a target. Often a vehicle for unexpressed anger or contempt; less often a clear bid for connection.
- examples: "Oh, perfect timing"; "What a great idea"; "No, please, take all day."
- often_with: anger, contempt, hurt, disconnection, embarrassment

## Anguish
- place: When We're Hurting
- definition: An almost unbearable, acute pain that overwhelms the body and the language for it. Not the steady ache of grief but the sharp intake.
- examples: The phone call that someone has died; finding out a partner's affair; a child diagnosed with something terrible.
- often_with: grief, despair, hopelessness, shock, exhaustion

## Hopelessness
- place: When We're Hurting
- definition: The belief that nothing we do will change a bad situation. Brown links it to a learned pattern, not a personality trait.
- examples: The fifth job rejection in a row; a chronic illness that won't budge; an institution that won't move.
- often_with: despair, sadness, exhaustion, resignation, helplessness

## Despair
- place: When We're Hurting
- definition: A profound hopelessness of long duration; a loss of light. More structural than situational.
- examples: A long depression; the dark middle of a chronic illness; the end of something you cannot rebuild.
- often_with: hopelessness, sadness, anguish, loneliness, exhaustion

## Sadness
- place: When We're Hurting
- definition: A heavy, slow emotion in response to loss or disappointment. Sadness wants company; trying to skip past it is what often goes wrong.
- examples: A friend moving away; the end of a season of life; a piece of music that finds the soft place.
- often_with: grief, disappointment, longing, love, gratitude

## Grief
- place: When We're Hurting
- definition: The experience of loss. Brown describes three foundational elements: loss, longing, and feeling lost. Not a stage but a long process.
- examples: A parent's death; the end of a marriage; the version of yourself you can't return to.
- often_with: sadness, anguish, longing, love, gratitude

## Compassion
- place: With Others
- definition: The recognition of another's suffering with the wish for them to be relieved of it. Brown distinguishes it from empathy: empathy is the door, compassion is the way of standing.
- examples: Sitting with a friend in a hospital; a kind word to a stranger having a hard day; tenderness toward your own struggling self.
- often_with: empathy, love, sadness, courage, humility

## Pity
- place: With Others
- definition: A response to suffering from above — feeling sorry for someone, often with a felt distance. Closer to contempt than to compassion.
- examples: Looking at someone's trouble and being relieved it isn't yours; charity that congratulates the giver; a "how sad" that ends the conversation.
- often_with: contempt, distance, discomfort, superiority, embarrassment

## Empathy
- place: With Others
- definition: An emotional skill set: perspective-taking, staying out of judgment, recognizing emotion, communicating it. Brown insists empathy is *not* a feeling — it is a practice.
- examples: Pausing your own story to find the feeling under your friend's words; saying "that sounds really hard" without trying to fix; staying.
- often_with: compassion, vulnerability, sadness, connection, love

## Sympathy
- place: With Others
- definition: A response that acknowledges suffering from a distance, often by offering condolence. Less risky than empathy and less connecting.
- examples: A "thinking of you" card; "I'm sorry for your loss" said and moved past; a flower delivery to a hospital you won't visit.
- often_with: pity, distance, kindness, awkwardness, sadness

## Boundaries
- place: With Others
- definition: Knowing what's okay and not okay with us, and clearly communicating it. Not a feeling but inseparable from feelings; their absence shows up as resentment, exhaustion, and contempt.
- examples: "I can't take this call right now"; "I won't talk to you when you speak to me that way"; "Yes to dinner; no to staying over."
- often_with: courage, anxiety, relief, integrity, vulnerability

## Comparative Suffering
- place: With Others
- definition: The trap of ranking pain — telling ourselves our suffering doesn't count because someone else has it worse. Brown warns it shrinks empathy in both directions.
- examples: "I shouldn't complain when others have cancer"; "Who am I to be tired with my privilege?"; "It's not as bad as her divorce."
- often_with: shame, guilt, disconnection, minimization, exhaustion

## Shame
- place: When We Fall Short
- definition: The intensely painful feeling that we are flawed and unworthy of love and belonging. About *who we are*, not what we did.
- examples: A failure that makes you want to disappear; a memory you cannot tell anyone; a small public mistake that loops in your head for days.
- often_with: humiliation, guilt, embarrassment, perfectionism, disconnection

## Self-Compassion
- place: When We Fall Short
- definition: Treating yourself the way you'd treat a friend in pain. Brown draws on Kristin Neff: self-kindness, common humanity, mindfulness.
- examples: Speaking gently to yourself after a mistake; remembering "this is hard for everyone, not just me"; pausing the inner critic.
- often_with: courage, vulnerability, calm, humility, healing

## Perfectionism
- place: When We Fall Short
- definition: A defensive move dressed as a virtue: trying to earn approval and avoid shame by being flawless. A twenty-ton shield, in Brown's words.
- examples: Reworking a memo for the seventh time; not posting because it isn't good enough; refusing to start what you can't finish perfectly.
- often_with: shame, anxiety, exhaustion, paralysis, avoidance

## Guilt
- place: When We Fall Short
- definition: A useful feeling about an action: "I did something bad." Brown contrasts it with shame ("I am bad"). Guilt motivates repair.
- examples: Snapping at your partner and feeling the urge to apologize; missing a friend's important day; sending a clumsy email and wanting to fix it.
- often_with: shame, regret, accountability, courage, anxiety

## Humiliation
- place: When We Fall Short
- definition: Feeling we have been unjustly degraded by another. Different from shame in that we don't agree we deserve it. Combustible.
- examples: A boss tearing into you in front of the team; a public callout that wasn't fair; a rejection delivered cruelly.
- often_with: shame, anger, contempt, hurt, embarrassment

## Embarrassment
- place: When We Fall Short
- definition: The mild, fleeting feeling of having a small social misstep witnessed. Blushes more than burns. Connects rather than isolates.
- examples: Tripping on a stage step; calling someone the wrong name; spinach in your teeth at lunch.
- often_with: amusement, shame, vulnerability, humor, relief

## Belonging
- place: When We Search for Connection
- definition: The feeling of being accepted *as you are* — not for being like everyone else. Brown's distinction: belonging never asks you to change to fit.
- examples: A long table where you don't perform; a group that makes room for your weird; a partner who knows the unedited you.
- often_with: connection, love, vulnerability, gratitude, joy

## Fitting In
- place: When We Search for Connection
- definition: The shadow of belonging: assessing what others want and adjusting to be accepted. Costs us the truth of who we are.
- examples: Laughing at jokes you don't find funny; staying quiet about your beliefs in the room; performing the version that gets approved.
- often_with: shame, loneliness, anxiety, disconnection, exhaustion

## Connection
- place: When We Search for Connection
- definition: The energy that exists between people when they feel seen, heard, and valued. The exchange that nourishes both sides.
- examples: A conversation that changes your week; a long hug at the right moment; a meeting that ends with everyone lifted.
- often_with: belonging, love, joy, vulnerability, gratitude

## Disconnection
- place: When We Search for Connection
- definition: The felt absence of connection. Often quiet — a slow draining rather than an event.
- examples: Sitting next to a partner and feeling alone; a workplace where no one knows you; a family meal without conversation.
- often_with: loneliness, sadness, invisibility, hurt, numbness

## Insecurity
- place: When We Search for Connection
- definition: The chronic feeling of not being enough. Differs from situational self-doubt; insecurity follows you between contexts.
- examples: Always scanning a room for who is judging you; reading neutral messages as cold; needing repeated reassurance.
- often_with: shame, comparison, anxiety, jealousy, fitting-in

## Invisibility
- place: When We Search for Connection
- definition: Feeling unseen in a way that erodes our sense of mattering. Linked by Brown to dehumanization at the social scale.
- examples: A child whose teacher never calls on them; an aging parent whose questions get answered by others; a junior colleague whose ideas are repeated by someone louder.
- often_with: loneliness, sadness, disconnection, anger, shame

## Loneliness
- place: When We Search for Connection
- definition: The distress of perceived social isolation. Not the same as being alone; you can be lonely in a crowd and content in solitude.
- examples: A holiday without anyone who knows you well; a marriage where you've stopped talking; a group chat where you don't quite fit.
- often_with: sadness, disconnection, longing, despair, invisibility

## Love
- place: When the Heart Is Open
- definition: Brown's working definition: we cultivate love when we allow our most vulnerable and powerful selves to be deeply seen and known. A practice, not only a feeling.
- examples: Telling someone the hard true thing; tending a long marriage; choosing a difficult honesty.
- often_with: vulnerability, connection, joy, gratitude, fear

## Lovelessness
- place: When the Heart Is Open
- definition: A bell hooks-rooted concept Brown adopts: a culture or self that has accepted love's absence as normal. The slow ache of an unfed heart.
- examples: A relationship where care has become transactional; a family that calls control love; a self that has stopped expecting tenderness.
- often_with: loneliness, despair, hopelessness, sadness, disconnection

## Heartbreak
- place: When the Heart Is Open
- definition: The grief specific to lost love or betrayed love. A whole-body event. Brown distinguishes it from disappointment by its depth and duration.
- examples: A breakup; a friendship that died; a child's estrangement.
- often_with: grief, anguish, sadness, longing, betrayal

## Trust
- place: When the Heart Is Open
- definition: Choosing to make something important to you vulnerable to the actions of someone else. Brown teaches BRAVING (boundaries, reliability, accountability, vault, integrity, non-judgment, generosity) as its anatomy.
- examples: Telling a friend a secret; depending on a partner for childcare; counting on a colleague's report.
- often_with: vulnerability, connection, courage, love, hope

## Self-Trust
- place: When the Heart Is Open
- definition: The same BRAVING qualities applied inwardly: keeping promises to ourselves, owning what's ours, not abandoning ourselves to please others.
- examples: Following through on a thirty-minute walk you committed to; not over-explaining a "no"; trusting your read of a situation.
- often_with: courage, integrity, calm, self-compassion, boundaries

## Betrayal
- place: When the Heart Is Open
- definition: The breach of trust that wounds the relational fabric. Brown highlights *disengagement* — slow, quiet betrayal — as more painful than dramatic acts.
- examples: A partner's affair; a friend who shared what you told them; a slow drift in which someone stopped showing up.
- often_with: hurt, anger, grief, distrust, heartbreak

## Defensiveness
- place: When the Heart Is Open
- definition: A protective posture against perceived attack. Often kicks in before we know we're hurt. Closes the door we wanted to keep open.
- examples: Cutting off a partner mid-feedback; explaining instead of listening; turning a question into an interrogation.
- often_with: shame, anger, fear, hurt, flooding

## Flooding
- place: When the Heart Is Open
- definition: Gottman's term that Brown carries forward: a physiological tidal wave during conflict that takes us offline. Heart racing, ears ringing, language gone.
- examples: Mid-fight, suddenly unable to track what your partner said; tears that won't let words through; the urge to leave the room or shut down.
- often_with: defensiveness, anger, fear, shame, exhaustion

## Hurt
- place: When the Heart Is Open
- definition: The quieter relational pain underneath anger and defensiveness. The thing we're often actually feeling when we look angry.
- examples: A partner's offhand jab that lands; being left out of a plan; a friend's silence after good news.
- often_with: sadness, anger, betrayal, defensiveness, vulnerability

## Joy
- place: When Life Is Good
- definition: An intense, often unbidden feeling of delight; lifts the body. Brown links joy to gratitude as an inseparable practice.
- examples: A baby's belly laugh; a sudden snowfall on a quiet morning; a shared look across a room of people you love.
- often_with: gratitude, happiness, foreboding-joy, love, awe

## Happiness
- place: When Life Is Good
- definition: A more stable, evaluative satisfaction with how life is going. Slower than joy, less dependent on the moment.
- examples: A good year reviewed at New Year's; a season of work that's flowing; the quiet of a Sunday that didn't go wrong.
- often_with: contentment, gratitude, calm, joy, love

## Calm
- place: When Life Is Good
- definition: A grounded, low-arousal stability that creates perspective and de-escalates urgency. Brown calls calm a chosen response, not an absence of feeling.
- examples: The breath you take before a hard conversation; a long walk after a hard week; the silence of a clear desk.
- often_with: tranquility, contentment, relief, presence, gratitude

## Contentment
- place: When Life Is Good
- definition: The quiet satisfaction of "this is enough." Not maximal joy; sufficient peace.
- examples: A simple meal eaten slowly; a Friday night in; a long-running friendship that asks nothing.
- often_with: gratitude, calm, happiness, tranquility, love

## Gratitude
- place: When Life Is Good
- definition: An active practice of noticing and naming what we're glad for. Brown couples gratitude with joy: people who experience deep joy practice gratitude.
- examples: Naming three things at dinner; a thank-you note for a small kindness; a pause to appreciate the body that carried you through the day.
- often_with: joy, contentment, awe, love, humility

## Foreboding Joy
- place: When Life Is Good
- definition: The dress rehearsal of disaster mid-joy: the moment of happiness clipped by the fear of losing it. Brown's antidote is gratitude.
- examples: Looking at a sleeping child and bracing for tragedy; a great date hitting "this can't last"; checking flights for accidents during a vacation.
- often_with: joy, anxiety, vulnerability, dread, gratitude

## Relief
- place: When Life Is Good
- definition: The release that follows the lifting of a stressor. Often mistaken for happiness; relief usually flags what was hard before it.
- examples: Test results coming back clear; a flight landed safely; a deadline shipped.
- often_with: gratitude, calm, exhaustion, vulnerability, joy

## Tranquility
- place: When Life Is Good
- definition: A still, serene calm; deeper than ordinary calm; something close to what meditators call equanimity.
- examples: An early-morning lake before anyone else is up; a long bath; a moment in which nothing wants anything from you.
- often_with: calm, contentment, awe, gratitude, presence

## Anger
- place: When We Feel Wronged
- definition: A response to perceived violation, injustice, or threat. Brown calls anger a "catalyst feeling" — useful when held with curiosity, dangerous when used to mask hurt.
- examples: Someone cutting in line at airport security; a child mistreated by a teacher; a system that failed someone you love.
- often_with: hurt, frustration, contempt, fear, courage

## Contempt
- place: When We Feel Wronged
- definition: The view that another is beneath us. Gottman names it the strongest predictor of divorce. The sneer at the back of the throat.
- examples: An eye roll at a partner; mocking a colleague to your team; a tone that talks down.
- often_with: anger, disgust, dehumanization, disconnection, shame

## Disgust
- place: When We Feel Wronged
- definition: A gut-level rejection — originally evolved for food safety, now also wired to moral and social judgments.
- examples: A smell turning your stomach; a story of cruelty; a behavior you call "gross."
- often_with: contempt, anger, hate, dehumanization, fear

## Dehumanization
- place: When We Feel Wronged
- definition: The act of denying another person their full humanity. Brown calls it the gateway to atrocity. Begins quietly, in language and category.
- examples: Calling a group "animals"; a slur slipped into a joke; treating an employee as a function rather than a person.
- often_with: contempt, hate, disgust, fear, anger

## Hate
- place: When We Feel Wronged
- definition: A long, organized hostility toward a person or group. Different from anger by its duration and dehumanizing quality.
- examples: A grudge that has organized your last decade; an enemy you no longer remember meeting; a politics that names a class of people enemies.
- often_with: contempt, anger, dehumanization, fear, grief

## Self-Righteousness
- place: When We Feel Wronged
- definition: The certainty that we are morally superior to those we disagree with. Closes inquiry; protects against shame.
- examples: A debate you stop trying to learn from; a parenting choice that makes others wrong; a politics that requires no humility.
- often_with: contempt, anger, shame, defensiveness, disconnection

## Pride
- place: To Self-Assess
- definition: A pleasurable feeling of self-respect tied to an accomplishment. Brown distinguishes it from hubris by its connection to effort and humility.
- examples: A child finishing a hard exam; a difficult conversation handled well; a long project shipped.
- often_with: joy, gratitude, accomplishment, humility, vulnerability

## Hubris
- place: To Self-Assess
- definition: Excessive pride disconnected from reality. Brown's frame: an inflated self that rejects feedback. Often masks shame underneath.
- examples: A leader certain they need no one's input; a colleague invulnerable to feedback; a partner who never thinks they're wrong.
- often_with: contempt, shame, defensiveness, disconnection, fear

## Humility
- place: To Self-Assess
- definition: A grounded, accurate sense of self — knowing one's worth and one's limits. Different from humiliation; humility is chosen.
- examples: Saying "I don't know" in a meeting; thanking someone whose help you needed; pausing before judging.
- often_with: courage, gratitude, curiosity, calm, self-compassion
