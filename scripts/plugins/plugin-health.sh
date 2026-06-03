#!/usr/bin/env bash

source "$(dirname "$0")/plugin-lib.sh"

safe_log INFO "Running plugin health checks..."

export REPORT_FILE="$REPO_ROOT/docs/reports/generated/plugin-health.md"
mkdir -p "$(dirname "$REPORT_FILE")"

echo "# Plugin Health Report" > "$REPORT_FILE"
echo "Generated at: $(date -u +'%Y-%m-%dT%H:%M:%SZ')" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

get_enabled_plugins | python3 -c "
import sys, json, urllib.request, urllib.error
import os

plugins = json.load(sys.stdin)
report_file = os.environ.get('REPORT_FILE')

with open(report_file, 'a') as f:
    for p in plugins:
        app_id = p.get('app_id')
        rt = p.get('runtime', {})
        health_urls = rt.get('health_urls', [])
        
        f.write(f'## {app_id}\n')
        
        if not health_urls:
            f.write('- No health URLs configured.\n')
            continue
            
        for url in health_urls:
            try:
                # Set a low timeout so we don't hang if service is down
                req = urllib.request.Request(url)
                with urllib.request.urlopen(req, timeout=2) as response:
                    status = response.getcode()
                    f.write(f'- {url}: **✅ OK** ({status})\n')
            except urllib.error.URLError as e:
                f.write(f'- {url}: **❌ UNREACHABLE** ({e.reason})\n')
            except Exception as e:
                f.write(f'- {url}: **❌ ERROR** ({str(e)})\n')
        
        f.write('\n')
"

safe_log INFO "Health report written to $REPORT_FILE"
