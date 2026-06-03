# Hybrid Plugin Integration Architecture

## Overview
Zeaz Platform operates as a monorepo control plane, but with multiple pluggable integrated applications (`zDash`, `zVeO`, `zWallet`). 

We define a manifest-first integration strategy located at `configs/plugins/repositories.yaml`.

## Modes
1. **Embedded**: Native integration (e.g., `zDash`). Source code resides in `apps/<app_id>`. Zeaz Platform orchestrates and runs its tests seamlessly.
2. **External**: For loosely coupled plugins. Source code is NOT embedded in `apps/`. Cloned to `external/<app_id>` only when synced. Zeaz Platform orchestrates routing, domains, and tunnels for external plugins dynamically based on manifest definitions.

## Cloudflare Integration
Cloudflare configurations are rendered dynamically from the manifest via `scripts/plugins/plugin-render-cloudflare.sh`. Paid features are explicitly disallowed unless overridden via `cost_lock_required`.

## Safety Guardrails
- **Dry Run Default**: Scripts default to dry runs. Mutations require `APPLY=true`.
- **Cost Locks**: Enforced for Cloudflare resources.
- **Port/Domain Collision**: Handled via `plugin-validate.sh`.
