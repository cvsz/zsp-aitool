#!/usr/bin/env bash

# plugin-lib.sh
# Core library for Zeaz Platform Hybrid Plugin Integration

export REPO_ROOT=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
export PLUGIN_MANIFEST="$REPO_ROOT/configs/plugins/repositories.yaml.example"

# Fallback to example if user hasn't made a local copy
if [ -f "$REPO_ROOT/configs/plugins/repositories.yaml" ]; then
    PLUGIN_MANIFEST="$REPO_ROOT/configs/plugins/repositories.yaml"
fi

safe_log() {
    local level=$1
    shift
    local msg="$*"
    # Redact common token patterns
    msg=$(echo "$msg" | sed -E 's/(ey[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,})/[REDACTED_JWT]/g')
    msg=$(echo "$msg" | sed -E 's/(ghp|gho|ghu|ghs|ghr)_[a-zA-Z0-9]{36}/[REDACTED_GITHUB_TOKEN]/g')
    msg=$(echo "$msg" | sed -E 's/([0-9a-fA-F]{32,})/[REDACTED_HEX_TOKEN]/g')
    
    if [ "$level" = "ERROR" ]; then
        echo "[ERROR] $msg" >&2
    elif [ "$level" = "WARN" ]; then
        echo "[WARN]  $msg"
    else
        echo "[INFO]  $msg"
    fi
}

run_command() {
    local cmd="$1"
    local dir="$2"
    
    if [ "$APPLY" = "true" ]; then
        safe_log INFO "Running: $cmd (in $dir)"
        (cd "$dir" && eval "$cmd")
    else
        safe_log INFO "[DRY RUN] Would run: $cmd (in $dir)"
    fi
}

parse_manifest() {
    # Extract JSON representation of the plugins using python3
    if ! command -v python3 &>/dev/null; then
        safe_log ERROR "python3 is required to parse the manifest."
        exit 1
    fi
    
    python3 -c "
import sys, json, yaml
try:
    with open('$PLUGIN_MANIFEST', 'r') as f:
        data = yaml.safe_load(f)
    print(json.dumps(data.get('plugins', [])))
except Exception as e:
    sys.exit(1)
"
}

get_enabled_plugins() {
    parse_manifest | python3 -c "
import sys, json
plugins = json.load(sys.stdin)
enabled = [p for p in plugins if p.get('enabled', False)]
print(json.dumps(enabled))
"
}
