# Animation plans

Produced by the `improve-animations` skill (audit of the Currently → Listening
vinyl player's musical-note motion). Plans are self-contained: an executor with
no context from the audit can apply them verbatim.

| # | Title | Severity | Status |
| --- | --- | --- | --- |
| 001 | Make the vinyl note motion interruptible and physically timed | MEDIUM | DONE |
| 002 | Dissolve the CRT poster through snow on a channel change | LOW | TODO |

## Execution order

1. **001** — done.
2. **002** — independent of 001; touches different files (`CRTScreen.tsx`).

## Notes

- Scope is limited to `src/components/objects/RecordPlayer.tsx` and the note block
  in `src/index.css`. No other section, backend, or data flow is in scope.
- Both audit findings were merged into 001 because they rewrite the same note
  lifecycle in the same two files; splitting them would leave the state machine
  half-migrated between plans.
