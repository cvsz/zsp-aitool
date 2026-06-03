#!/usr/bin/env bash

source "$(dirname "$0")/plugin-lib.sh"

safe_log INFO "Gathering evidence..."

EVIDENCE_FILE="$REPO_ROOT/docs/reports/generated/phase53-plugin-integration-evidence.md"
mkdir -p "$(dirname "$EVIDENCE_FILE")"

cat << 'EOF' > "$EVIDENCE_FILE"
# Phase 53: Hybrid Plugin Integration Evidence
Generated at: $(date -u +'%Y-%m-%dT%H:%M:%SZ')

## 1. Configured Plugins

```
EOF

bash "$REPO_ROOT/scripts/plugins/plugin-list.sh" >> "$EVIDENCE_FILE"

cat << 'EOF' >> "$EVIDENCE_FILE"
```

## 2. Plugin Health Check

```markdown
EOF

cat "$REPO_ROOT/docs/reports/generated/plugin-health.md" 2>/dev/null >> "$EVIDENCE_FILE" || echo "Health report not found." >> "$EVIDENCE_FILE"

cat << 'EOF' >> "$EVIDENCE_FILE"
```

## 3. Rendered Cloudflare Intent

### Ingress
```yaml
EOF

cat "$REPO_ROOT/generated/cloudflare/plugins-ingress.yml" 2>/dev/null >> "$EVIDENCE_FILE" || echo "Ingress not found." >> "$EVIDENCE_FILE"

cat << 'EOF' >> "$EVIDENCE_FILE"
```

### DNS Intent
```yaml
EOF

cat "$REPO_ROOT/generated/cloudflare/plugins-dns-intent.yaml" 2>/dev/null >> "$EVIDENCE_FILE" || echo "DNS intent not found." >> "$EVIDENCE_FILE"

cat << 'EOF' >> "$EVIDENCE_FILE"
```

## 4. Git Status

```
EOF

git status --short >> "$EVIDENCE_FILE"

cat << 'EOF' >> "$EVIDENCE_FILE"
```
EOF

safe_log INFO "Evidence written to $EVIDENCE_FILE"
