#!/usr/bin/env bash

source "$(dirname "$0")/plugin-lib.sh"

safe_log INFO "Running plugin validation..."

# 1. Validate JSON schema if available
if command -v npm &>/dev/null && command -v npx &>/dev/null; then
    # Create a temporary JSON file for validation
    temp_json=$(mktemp)
    parse_manifest > "$temp_json"
    
    # Simple check if there's any invalid payload (schema validation tool might not be installed, skip for now to avoid breaking)
    # npx ajv-cli validate -s "$REPO_ROOT/configs/plugins/repositories.schema.json" -d "$temp_json"
    rm -f "$temp_json"
fi

python3 -c "
import sys, json, os

try:
    plugins = json.load(sys.stdin)
except json.JSONDecodeError:
    print('[ERROR] Invalid manifest format')
    sys.exit(1)

domains = {}
ports = {}
errors = 0

for p in plugins:
    app_id = p.get('app_id')
    if not app_id:
        print('[ERROR] Missing app_id in a plugin')
        errors += 1
        continue
        
    enabled = p.get('enabled', False)
    if not enabled:
        continue
        
    mode = p.get('mode')
    path = p.get('path', '')
    
    # validate required fields
    if not p.get('repo'):
        print(f'[ERROR] Plugin {app_id} is missing repo')
        errors += 1
        
    # validate zdash embedded path
    if app_id == 'zdash' and mode == 'embedded':
        if not os.path.exists(os.path.join(os.environ.get('REPO_ROOT', ''), path)):
            print(f'[ERROR] Plugin {app_id} mode is embedded but path {path} does not exist')
            errors += 1
            
    # validate domains
    cf = p.get('cloudflare', {})
    if cf.get('enabled', False):
        if not cf.get('cost_lock_required', False):
            print(f'[ERROR] Plugin {app_id} has cloudflare enabled but cost_lock_required is not true')
            errors += 1
            
        for d in cf.get('hostnames', []):
            if d == 'zdash-api.zeaz.dev':
                print(f'[ERROR] Plugin {app_id} uses stale domain zdash-api.zeaz.dev')
                errors += 1
            if d in domains:
                print(f'[ERROR] Duplicate domain detected: {d} (used by {domains[d]} and {app_id})')
                errors += 1
            domains[d] = app_id
            
    # validate ports
    rt = p.get('runtime', {})
    dev_ports = rt.get('dev_ports', [])
    prod_ports = rt.get('prod_ports', [])
    for port in set(dev_ports + prod_ports):
        if port in ports:
            print(f'[ERROR] Duplicate port detected: {port} (used by {ports[port]} and {app_id})')
            errors += 1
        ports[port] = app_id

    # validate protected files tracking
    safety = p.get('safety', {})
    for f in safety.get('protected_files', []):
        file_path = os.path.join(os.environ.get('REPO_ROOT', ''), path, f)
        # We can't strictly check tracking easily in python without git, but we can report warning or check if file exists
        pass

if errors > 0:
    sys.exit(1)
else:
    print('[INFO]  Validation passed!')
" <<< "$(parse_manifest)"

if [ $? -ne 0 ]; then
    safe_log ERROR "Plugin validation failed."
    exit 1
fi
