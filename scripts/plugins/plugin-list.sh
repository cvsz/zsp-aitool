#!/usr/bin/env bash

source "$(dirname "$0")/plugin-lib.sh"

safe_log INFO "Loaded manifest from $PLUGIN_MANIFEST"
echo ""
printf "%-15s %-10s %-20s %-20s %-8s %-40s %-20s %-40s\n" "APP_ID" "MODE" "REPO" "PATH" "ENABLED" "DOMAINS" "PORTS" "HEALTH_URLS"
echo "---------------------------------------------------------------------------------------------------------------------------------------------------------------"

parse_manifest | python3 -c "
import sys, json

plugins = json.load(sys.stdin)
for p in plugins:
    app_id = p.get('app_id', '')
    mode = p.get('mode', '')
    repo = p.get('repo', '')
    path = p.get('path', '')
    enabled = 'Y' if p.get('enabled', False) else 'N'
    
    # Domains
    cf = p.get('cloudflare', {})
    hostnames = cf.get('hostnames', [])
    domains = ', '.join(hostnames) if hostnames else ''
    
    # Ports
    rt = p.get('runtime', {})
    dev_ports = rt.get('dev_ports', [])
    prod_ports = rt.get('prod_ports', [])
    all_ports = list(set(dev_ports + prod_ports))
    ports = ', '.join(map(str, all_ports))
    
    # Health URLs
    hurls = rt.get('health_urls', [])
    health_urls = ', '.join(hurls)
    
    print(f\"{app_id:<15} {mode:<10} {repo:<20} {path:<20} {enabled:<8} {domains:<40} {ports:<20} {health_urls:<40}\")
"
