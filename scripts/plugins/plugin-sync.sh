#!/usr/bin/env bash

source "$(dirname "$0")/plugin-lib.sh"

safe_log INFO "Running plugin sync..."

get_enabled_plugins | python3 -c "
import sys, json, os, subprocess

plugins = json.load(sys.stdin)
apply_mode = os.environ.get('APPLY') == 'true'
confirm = os.environ.get('CONFIRM_PLUGIN_SYNC') == 'yes'

for p in plugins:
    app_id = p.get('app_id')
    mode = p.get('mode')
    repo = p.get('repo')
    path = p.get('path', '')
    
    target_dir = os.path.join(os.environ.get('REPO_ROOT', ''), path)
    
    if mode == 'embedded':
        print(f'[INFO]  Syncing embedded plugin: {app_id} at {path}')
        if not os.path.exists(target_dir):
            print(f'[WARN]  Embedded path {path} does not exist. Cannot sync.')
            continue
            
        # check dirty tree
        status = subprocess.run(['git', 'status', '--porcelain', target_dir], capture_output=True, text=True)
        if status.stdout.strip() != '':
            print(f'[WARN]  Dirty working tree in {path}. Refusing to sync.')
            continue
            
        if apply_mode and confirm:
            print(f'[INFO]  APPLY=true: Syncing {app_id} (No-op for embedded in phase 53)')
        else:
            print(f'[INFO]  [DRY RUN] Would sync {app_id} embedded subtree from {repo}')
            
    elif mode == 'external':
        print(f'[INFO]  Syncing external plugin: {app_id} at {path}')
        if apply_mode and confirm:
            if not os.path.exists(target_dir):
                print(f'[INFO]  Cloning {repo} into {path}')
                subprocess.run(['git', 'clone', f'https://github.com/{repo}.git', target_dir])
            else:
                print(f'[INFO]  Fetching updates for {repo} in {path}')
                subprocess.run(['git', '-C', target_dir, 'fetch', '--all'])
        else:
            if not os.path.exists(target_dir):
                print(f'[INFO]  [DRY RUN] Would clone {repo} into {path}')
            else:
                print(f'[INFO]  [DRY RUN] Would fetch updates for {repo} in {path}')
"
