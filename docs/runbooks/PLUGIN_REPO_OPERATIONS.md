# Plugin Repository Operations

## Viewing Plugins
Run `make plugin-list` to list all plugins and their statuses.

## Validating Plugins
Run `make plugin-validate`. This will check:
- Duplicated domains
- Duplicated ports
- Embedded path resolution
- Stale domains (e.g. `zdash-api.zeaz.dev`)

## Rendering Intent
Run `make plugin-render-cloudflare`.
Outputs to `generated/cloudflare/`. No mutations apply.

## Syncing Repositories
Run `make plugin-sync`. By default, it operates in dry-run mode.
To actually apply the sync for external repositories:
```bash
APPLY=true CONFIRM_PLUGIN_SYNC=yes make plugin-sync
```

## Collecting Evidence
Run `make plugin-evidence` to produce `docs/reports/generated/phase53-plugin-integration-evidence.md`.
