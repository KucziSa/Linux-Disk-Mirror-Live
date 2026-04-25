# Linux-Disk-Mirror-Live

1. Instalacja Cockpita i pakietów
Na serwerze Ubuntu wpisz:

``sudo apt update
sudo apt install cockpit rsync python3 util-linux coreutils procps exfatprogs -y 
sudo systemctl enable --now cockpit.socket``
