---
description: Run install script and verify all symlinks are correct
argument-hint: [--macos | --linux]
---
Run the install script for the specified platform and verify everything is linked correctly.

!`./install.sh $ARGUMENTS`

Now verify all symlinks point to the dotfiles repo:

!`for f in ~/.config/{tmux,ghostty,nvim,atuin,wezterm,sketchybar,karabiner}; do [ -L "$f" ] && echo "OK: $f -> $(readlink "$f")" || echo "MISSING: $f"; done`

!`for f in ~/.config/{git/config,npm/npmrc,btop/btop.conf,gh/config.yml,lazygit/config.yml,thefuck/settings.py,starship.toml}; do [ -L "$f" ] && echo "OK: $f -> $(readlink "$f")" || echo "MISSING: $f"; done`

!`for f in ~/.claude/{settings.json,agents,skills,docs}; do [ -L "$f" ] && echo "OK: $f -> $(readlink "$f")" || echo "MISSING: $f"; done`

Now check for dead rules (rules with path globs that match no files):

!`command -v rules-doctor >/dev/null 2>&1 && rules-doctor check --root . --verbose || echo "rules-doctor not installed — run: npm install -g claude-rules-doctor"`

Report any missing or broken symlinks and any dead rules. If everything is clean, confirm success.
