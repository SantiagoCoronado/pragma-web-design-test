#!/bin/bash

# Switch between local SQLite and Turso databases

if [ "$1" = "local" ]; then
    echo "Switching to local SQLite..."
    {
        printf '%s\n' '# Local development database'
        printf 'DATABASE_URL=%s\n' "$(printf '%q' 'file:local.db')"
        printf 'DATABASE_AUTH_TOKEN=%s\n' "$(printf '%q' '')"
    } > .env.local.tmp
    # Preserve other env vars
    grep -v "^DATABASE_URL\|^DATABASE_AUTH_TOKEN" .env.local >> .env.local.tmp 2>/dev/null || true
    mv .env.local.tmp .env.local
    echo "✓ Switched to local SQLite (local.db)"

elif [ "$1" = "turso" ]; then
    if [ -z "$2" ]; then
        echo "Usage: npm run switch-db turso <url> <token>"
        echo ""
        echo "Example:"
        echo "  npm run switch-db turso libsql://db-user.turso.io abc123..."
        exit 1
    fi

    echo "Switching to Turso..."
    {
        printf '%s\n' '# Turso development database'
        printf 'DATABASE_URL=%s\n' "$(printf '%q' "$2")"
        printf 'DATABASE_AUTH_TOKEN=%s\n' "$(printf '%q' "$3")"
    } > .env.local.tmp
    # Preserve other env vars
    grep -v "^DATABASE_URL\|^DATABASE_AUTH_TOKEN" .env.local >> .env.local.tmp 2>/dev/null || true
    mv .env.local.tmp .env.local
    echo "✓ Switched to Turso"

elif [ "$1" = "status" ]; then
    echo "Current database configuration:"
    grep "^DATABASE_URL" .env.local || echo "  DATABASE_URL: not set"
    if grep -q "^DATABASE_AUTH_TOKEN=" .env.local && [ -n "$(grep '^DATABASE_AUTH_TOKEN=' .env.local | cut -d= -f2)" ]; then
        echo "  DATABASE_AUTH_TOKEN: [set]"
    else
        echo "  DATABASE_AUTH_TOKEN: [not set]"
    fi

else
    echo "Usage: npm run switch-db [local|turso|status]"
    echo ""
    echo "Commands:"
    echo "  local              Switch to local SQLite (local.db)"
    echo "  turso <url> <token> Switch to Turso database"
    echo "  status             Show current database configuration"
    exit 1
fi
