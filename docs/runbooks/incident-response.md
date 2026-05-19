# Incident Response Checklist (Post-Launch)

## Triage priorities

1. **Availability**: app down, login unavailable, or dashboard inaccessible.
2. **Data safety**: cross-user/org exposure, secret leakage, unsafe file download.
3. **Render stability**: queue jam, stale jobs, worker inactive unexpectedly.

## Immediate triage steps

1. Record timestamp and incident owner.
2. Run `npm run health`.
3. Run `npm run hyperframes:queue-status`.
4. Run `npm run hyperframes:worker:watchdog`.
5. Review recent journals:
   - `journalctl -u zsp-aitool -n 120 -l --no-pager`
   - `journalctl -u zsp-hyperframes-worker -n 120 -l --no-pager`
6. Capture `df -h` and identify disk pressure.

## Containment rules

- Never disclose internal filesystem paths to users.
- Never disclose secrets or full stack traces.
- Keep operator UI read-only for system service control.
- If render incidents persist, disable real worker only through explicit manual operator action documented in existing HyperFrames runbooks.

## Recovery verification

After stabilization, re-run:

- `npm run health`
- `npm run hyperframes:queue-status`
- `npm run hyperframes:worker:watchdog`
- Route smoke checks from `scripts/post-launch/smoke-routes.sh`

## Post-incident follow-up

- Document root cause and timeline.
- Identify preventive action (test, guardrail, or documentation).
- Add/update regression tests when code changes are required.
