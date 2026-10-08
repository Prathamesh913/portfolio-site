# Animation plans

Produced by the `improve-animations` skill. Plans are self-contained: an executor with
no context from the audit can apply them verbatim.

| # | Title | Severity | Status |
| --- | --- | --- | --- |
| 001 | Make the vinyl note motion interruptible and physically timed | MEDIUM | DONE |
| 002 | Dissolve the CRT poster through snow on a channel change | LOW | TODO |
| 003 | Rewrite CRT power as interruptible transitions with a composite-only line flash | MEDIUM | DONE |

## Execution order

1. **001** — done.
2. **003** — independent of 002; touches `CRTScreen.tsx` + the CRT power block in `src/index.css`. Run before 002 if both are open: 003 rewrites the tube's motion mechanism that 002's poster dissolve layers onto.
3. **002** — independent; re-check its file:line references after 003 lands (same files).

## Notes

- 001's scope was `src/components/objects/RecordPlayer.tsx` and the note block
  in `src/index.css`. Its two findings were merged because they rewrite the same note
  lifecycle in the same two files; splitting them would leave the state machine
  half-migrated between plans.
- 003 merges the audit's performance + easing + interruptibility findings (plus the
  curve-unification, reduced-motion fade, and panel press feedback) for the same
  reason: one 30-line power state machine. Executing them as sequential plans would
  have each executor tearing out the previous one's mechanism (keyframes, then
  transitions). Deferred, not dropped: tying the LED wink-out to the exact frame
  the line dies (needs the 003 mechanism in place first).
