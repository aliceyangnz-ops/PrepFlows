---
name: AI Parse hospitality text parser quirks
description: Root causes of the 4 bugs found in parseHospitalityText() in aiParse.ts, and their fixes
---

## Quirk 1 — Cross-line digit match (guest count)

**Rule:** Use `[^\S\r\n]*` (not `\s*`) between a number and a keyword when the text spans multiple lines.

**Why:** `\s*` matches newlines, so "Level 2\nGuests:" was captured as "2 guests" by the fallback pattern. The fix also adds a labeled `^guests?|pax:` pattern as priority 1 (multiline `m` flag).

**How to apply:** Any `(\d+)\s*keyword` guest-count style regex should use `[^\S\r\n]*` unless cross-line matching is intentional.

## Quirk 2 — Function type overridden by menu content

**Rule:** Always check for an explicit `Type:` label first before doing full-text keyword scanning for function type.

**Why:** The typeMap scanned `lower` (entire normalised text), so "canapé" in a menu course section triggered "Canapés" before "set menu" could be reached.

**How to apply:** In `parseHospitalityText`, the `explicitTypeM` check (confidence 95) now runs before the keyword scan, which is restricted to the header block before the MENU section (confidence 80).

## Quirk 3 — Time regex missing space after colon

**Rule:** When a regex ends in a literal `:` before a capture group, add `\s*` before the group.

**Why:** "Start Time: 18:00" has a space after the colon; the capture group `((?:\d{1,2})...)` didn't allow for it.

## Quirk 4 — SERVICE TIMELINE section parser

**Rule:** The line-by-line section scanner pattern is: find header line, trim leading `\r?\n`, skip leading blanks (`continue`), break on first blank after content (`seenContent` flag), stop at all-caps section headers.

**Why:** A regex with `[\s\S]*?` and the `m` flag caused `\s*$` to match at end of the first line, collapsing the capture. Also the slice starts right AFTER the header text on the same line, so the first split element is always `""`.
