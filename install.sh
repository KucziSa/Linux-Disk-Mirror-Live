#!/usr/bin/env bash
set -euo pipefail

PLUGIN_NAME="immich_backup"
SOURCE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Instaluję backend..."
sudo install -m 755 "$SOURCE_DIR/backend/immich-backup-manager" /usr/local/sbin/immich-backup-manager

echo "Tworzę katalog stanu..."
sudo mkdir -p /var/lib/immich-backup
sudo touch /var/lib/immich-backup/backup.log
sudo touch /var/lib/immich-backup/state.json

echo "Ustawiam uprawnienia katalogu stanu..."
sudo chown -R "$USER:$USER" /var/lib/immich-backup
sudo chmod 775 /var/lib/immich-backup
sudo chmod 664 /var/lib/immich-backup/backup.log
sudo chmod 664 /var/lib/immich-backup/state.json

echo "Tworzę katalog Cockpit użytkownika..."
mkdir -p "$HOME/.local/share/cockpit"

echo "Podpinam plugin Cockpit..."
ln -sfn "$SOURCE_DIR" "$HOME/.local/share/cockpit/$PLUGIN_NAME"

echo "Sprawdzam, czy Cockpit widzi plugin..."
cockpit-bridge --packages | grep "$PLUGIN_NAME" || true

echo ""
echo "Gotowe."
echo "Otwórz Cockpit: https://IP_SERWERA:9090"
echo "Jeżeli plugin nie pojawi się od razu, odśwież stronę przez CTRL+F5 albo wyloguj się i zaloguj ponownie."
