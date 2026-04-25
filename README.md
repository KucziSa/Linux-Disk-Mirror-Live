# Linux-Disk-Mirror-Live

1. Instalacja Cockpita i pakietów
Na serwerze Ubuntu wpisz:

```sudo apt update \n
sudo apt install cockpit rsync python3 util-linux coreutils procps exfatprogs -y \n
sudo systemctl enable --now cockpit.socket```
