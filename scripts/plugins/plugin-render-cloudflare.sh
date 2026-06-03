#!/usr/bin/env bash

source "$(dirname "$0")/plugin-lib.sh"

safe_log INFO "Rendering Cloudflare intents..."

mkdir -p "$REPO_ROOT/generated/cloudflare"
export INGRESS_FILE="$REPO_ROOT/generated/cloudflare/plugins-ingress.yml"
export DNS_FILE="$REPO_ROOT/generated/cloudflare/plugins-dns-intent.yaml"

# Header
echo "# Auto-generated ingress rules for Cloudflare Tunnel" > "$INGRESS_FILE"
echo "ingress:" >> "$INGRESS_FILE"

echo "# Auto-generated DNS records intent" > "$DNS_FILE"
echo "dns_records:" >> "$DNS_FILE"

get_enabled_plugins | python3 -c "
import sys, json, os

plugins = json.load(sys.stdin)
ingress_file = os.environ.get('INGRESS_FILE')
dns_file = os.environ.get('DNS_FILE')

with open(ingress_file, 'a') as f_in, open(dns_file, 'a') as f_dns:
    for p in plugins:
        cf = p.get('cloudflare', {})
        if not cf.get('enabled', False):
            continue
            
        app_id = p.get('app_id')
        tunnel_target = cf.get('tunnel_target', 'http://localhost:80')
        zone = cf.get('zone', 'zeaz.dev')
        
        f_dns.write(f'  # Plugin: {app_id}\n')
        
        for host in cf.get('hostnames', []):
            f_in.write(f'  - hostname: {host}\n')
            f_in.write(f'    service: {tunnel_target}\n')
            
            f_dns.write(f'  - name: {host}\n')
            f_dns.write(f'    type: CNAME\n')
            f_dns.write(f'    content: tunnel.zeaz.dev\n')
            f_dns.write(f'    proxied: true\n')
            f_dns.write(f'    zone: {zone}\n')

    # Catch-all for ingress
    f_in.write('  - service: http_status:404\n')
"

safe_log INFO "Wrote $INGRESS_FILE"
safe_log INFO "Wrote $DNS_FILE"
