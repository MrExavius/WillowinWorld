---
target: WillowinWorld homepage S/AAA critique
total_score: 24
p0_count: 0
p1_count: 4
timestamp: 2026-07-30T23-30-39Z
slug: site-index-html
---
Method: dual-agent (A: impeccable_design_a · B: impeccable_technical_b)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|------:|-----------|
| 1 | Visibility of System Status | 3/4 | Filters, theme and modals report state; collapsed FAQ state is inconsistent for assistive technology. |
| 2 | Match System / Real World | 3/4 | The game language is mostly clear; several production terms need context. |
| 3 | User Control and Freedom | 3/4 | Escape and focus return work; contact handoff is not recoverable when no mail client opens. |
| 4 | Consistency and Standards | 3/4 | The four-game gallery is coherent; the lower page repeats one card grammar too often. |
| 5 | Error Prevention | 2/4 | Native form constraints exist, but the default inquiry and mailto reset can cause mistakes and data loss. |
| 6 | Recognition Rather Than Recall | 2/4 | Mobile game links and filters hide options in unlabelled horizontal scrollers. |
| 7 | Flexibility and Efficiency | 2/4 | Anchors and filters help; important mobile contact and footer actions remain inefficient. |
| 8 | Aesthetic and Minimalist Design | 2/4 | Hero and games are distinctive; the middle becomes visually repetitive and the footer is overloaded. |
| 9 | Error Recovery | 1/4 | “Send Message” does not send, offers no reliable fallback, and clears the draft. |
| 10 | Help and Documentation | 3/4 | FAQ and press material are useful, but accordion semantics are incomplete. |
| **Total** | | **24/40** | **Acceptable — a strong brand foundation with release-level UX gaps.** |

## Anti-Patterns Verdict

**LLM assessment:** The authored canvas world, mascot and real game art prevent the first two sections from feeling generic. Below the game gallery, repeated rounded translucent cards, wide shadows, repeated eyebrows and decorative diagonal stripes bring back recognizable AI landing-page grammar.

**Deterministic scan:** `detect.mjs --json site/index.html` returned `[]` with exit code 0. The detector produced no false positives, but its rules do not cover the runtime accessibility, touch-target, contact-handoff or canvas-occlusion defects confirmed in the browser.

**Visual overlays:** Mutable injection succeeded, but `detect.js` was blocked by the page’s Trusted Types CSP. No reliable user-visible overlay was created. Browser screenshots, accessibility snapshots and direct measurements were used as fallback evidence.

## Overall Impression

WillowinWorld already owns a distinctive magical visual world and presents four truthful game identities better than a generic indie studio template. The largest opportunity is not a new background: it is making the foreground interaction layer as trustworthy and deliberate as the art.

## What’s Working

1. The fixed canvas world, existing layered background and mascot create recognizable studio identity in both themes.
2. The desktop 2×2 games gallery keeps all four projects equal while preserving their separate art direction.
3. Concrete statuses, mechanics, devlogs and press assets build credible production trust.

## Priority Issues

### [P1] Contact flow promises sending but only opens `mailto:`

- **Why it matters:** The highest-stakes conversion can lose the user’s draft and report success when no email client opens.
- **Fix:** Rename the action to “Prepare email”, expose the address and “Copy message” fallback, keep the draft, and default the inquiry to General.
- **Suggested command:** `$impeccable harden`

### [P1] Collapsed FAQ answers remain in the accessibility tree

- **Why it matters:** Visual state, `aria-expanded` and screen-reader state disagree across all seven items.
- **Fix:** Add `aria-controls`, stable panel IDs and synchronized `hidden`/`inert` state.
- **Suggested command:** `$impeccable audit`

### [P1] Fourteen hidden promo-letter buttons pollute keyboard navigation

- **Why it matters:** Keyboard users tab through nearly invisible Easter-egg controls between real sections.
- **Fix:** Remove inactive letters from the tab and accessibility trees; only expose them after an explicit hunt activation.
- **Suggested command:** `$impeccable harden`

### [P1] The fixed mascot can cover narrow-screen text and actions

- **Why it matters:** At 320–390 px it can visually cover the H1, a filter and footer links.
- **Fix:** Preserve the mascot but define mobile safe zones or collision-aware placement. This remains constrained by the owner’s request not to mute, remove or materially reposition it.
- **Suggested command:** `$impeccable adapt`

### [P2] Mobile discovery relies on invisible horizontal scrolling

- **Why it matters:** Four game links and five filters are not all visible, weakening the promise that the games are equal.
- **Fix:** Show four world links as 2×2 and allow filters to wrap.
- **Suggested command:** `$impeccable layout`

### [P2] Footer touch targets and duplicated utilities are too dense

- **Why it matters:** Twenty footer controls measure around 20 px high; 23 of 57 visible mobile interactives are below 44 px in one dimension.
- **Fix:** Remove duplicate utility actions and provide at least 44 px target height without turning every link into a pill.
- **Suggested command:** `$impeccable adapt`

### [P2] Reduced motion still runs the continuous canvas loop

- **Why it matters:** The preference reduces particles but retains breathing/drift and a roughly 31 fps canvas loop.
- **Fix:** Render a static mascot/world frame when reduced motion is requested.
- **Suggested command:** `$impeccable optimize`

## Persona Red Flags

**Jordan (first-timer):** On mobile, two world links and some filters are initially hidden; production terminology is not always explained; Nature Seed’s hero-scale scene can be read as flagship priority.

**Riley (stress tester):** A missing email client can discard contact intent; collapsed FAQ answers remain exposed; hidden promo controls appear in the tab order.

**Casey (distracted mobile user):** Contact requires too many steps, horizontal scroll affordances are invisible, and footer targets are small.

**Publisher / press evaluator:** Production facts are strong, but the final contact handoff feels less mature than the rest of the studio presentation.

## Minor Observations

- Light `--muted-2` reaches about 3.95:1 on the lightest background and should be darkened.
- The mobile menu label remains “Open menu” while open.
- The final CTA’s very large radius and wide shadow are a visible template tell.
- The page has no root overflow at 1440, 390 or 320 px and local assets returned successfully.
- Semantic landmarks, heading order, image alt coverage, modal focus trap, filter live status and Escape behavior are solid.

## Questions to Consider

1. What is the one action that should win in the first five seconds: open a game, inspect the press kit, or contact the studio?
2. If the four games are equal, should all four always be visible without a horizontal gesture?
3. Can a control honestly say “Send Message” when the site does not send anything?
4. Which lower-page proof is essential enough to keep, and which repeated card can be removed?
