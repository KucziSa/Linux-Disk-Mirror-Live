# Linux Disk Mirror Live

**Linux Disk Mirror Live** to rozszerzenie do [Cockpit](https://cockpit-project.org/) dla Ubuntu/Linux, które pozwala wygodnie wykonać mirror folderu ze zdjęciami lub danymi na zewnętrzny dysk backupowy.

Projekt powstał z myślą o prostym backupie biblioteki zdjęć, np. folderu używanego przez [Immich](https://immich.app/), na osobny dysk USB/HDD/SSD.

Repozytorium:

```text
https://github.com/KucziSa/Linux-Disk-Mirror-Live
```

---

## Spis treści

- [Funkcje](#funkcje)
- [Ważne ostrzeżenie](#ważne-ostrzeżenie)
- [Wymagania](#wymagania)
- [Instalacja Cockpita](#instalacja-cockpita)
- [Pobranie projektu](#pobranie-projektu)
- [Instalacja rozszerzenia](#instalacja-rozszerzenia)
- [Montowanie dysku backupowego](#montowanie-dysku-backupowego)
- [Automatyczne montowanie dysku po restarcie](#automatyczne-montowanie-dysku-po-restarcie)
- [Użycie w Cockpicie](#użycie-w-cockpicie)
- [Wznawianie po odłączeniu dysku](#wznawianie-po-odłączeniu-dysku)
- [Bezpieczne odłączanie dysku](#bezpieczne-odłączanie-dysku)
- [Komendy diagnostyczne](#komendy-diagnostyczne)
- [Pliki stanu](#pliki-stanu)
- [Aktualizacja projektu](#aktualizacja-projektu)
- [Odinstalowanie](#odinstalowanie)
- [Typowe problemy](#typowe-problemy)
- [Roadmap](#roadmap)
- [Licencja](#licencja)

---

## Funkcje

- webowy panel dostępny przez Cockpit,
- wykrywanie zamontowanych dysków backupowych,
- pokazywanie ludzkich nazw dysków, labeli, UUID, modelu i punktu montowania,
- backup typu mirror z użyciem `rsync`,
- kopiowanie tylko zmian, bez kopiowania wszystkiego od nowa,
- progress bar i log kopiowania,
- globalny status backupu widoczny z wielu komputerów,
- backup działa w tle i nie zależy od jednej otwartej przeglądarki,
- wykrywanie nagłego odłączenia dysku,
- możliwość wznowienia backupu po ponownym podłączeniu dysku,
- przycisk bezpiecznego odmontowania dysku,
- jeden plik metadanych na dysku backupowym:

```text
.immich-backup.json
```

---

## Ważne ostrzeżenie

To narzędzie wykonuje **mirror**.

Oznacza to, że plik usunięty ze źródła zostanie usunięty także z kopii przy następnym backupie.

Przykład:

```text
Źródło:        /home/kuczis/Pulpit/photos
Backup:        /mnt/dysk-backup/ImmichBackup/data
```

Jeżeli usuniesz zdjęcie ze źródła, to po kolejnym backupie zostanie ono usunięte również z dysku backupowego.

Jeżeli chcesz mieć historię wersji lub możliwość odzyskania przypadkowo usuniętych plików, rozważ dodatkowy backup snapshotowy, np.:

- [BorgBackup](https://www.borgbackup.org/)
- [Restic](https://restic.net/)
- [Kopia](https://kopia.io/)

---

## Wymagania

- Ubuntu/Linux,
- Cockpit,
- Python 3,
- rsync,
- util-linux,
- coreutils,
- procps,
- exfatprogs, jeżeli dysk backupowy używa exFAT.

---

## Instalacja Cockpita

Na serwerze Ubuntu uruchom:

```bash
sudo apt update
sudo apt install cockpit rsync python3 util-linux coreutils procps exfatprogs git -y
sudo systemctl enable --now cockpit.socket
```

Cockpit będzie dostępny pod adresem:

```text
https://IP_SERWERA:9090
```

Przykład:

```text
https://192.168.1.120:9090
```

Jeżeli nie znasz IP serwera, sprawdź je komendą:

```bash
ip a
```

Szukaj adresu w stylu:

```text
192.168.1.120
```

---

## Pobranie projektu

Przejdź np. na Pulpit:

```bash
mkdir -p ~/Pulpit/extension
cd ~/Pulpit/extension
```

Sklonuj repozytorium:

```bash
git clone https://github.com/KucziSa/Linux-Disk-Mirror-Live.git
```

Wejdź do katalogu projektu:

```bash
cd Linux-Disk-Mirror-Live
```

Jeżeli w repozytorium folder wtyczki nazywa się `immich_backup`, przejdź do niego:

```bash
cd immich_backup
```

Jeżeli pliki `manifest.json`, `index.html`, `app.js`, `style.css` i `install.sh` są od razu w głównym katalogu repozytorium, zostań w głównym katalogu.

---

## Oczekiwana struktura projektu

Projekt powinien zawierać pliki podobne do:

```text
Linux-Disk-Mirror-Live/
├── README.md
├── manifest.json
├── index.html
├── style.css
├── app.js
├── install.sh
└── backend/
    └── immich-backup-manager
```

albo:

```text
Linux-Disk-Mirror-Live/
├── README.md
└── immich_backup/
    ├── manifest.json
    ├── index.html
    ├── style.css
    ├── app.js
    ├── install.sh
    └── backend/
        └── immich-backup-manager
```

Najważniejsze, aby w folderze instalowanej wtyczki znajdowały się:

```text
manifest.json
index.html
style.css
app.js
install.sh
backend/immich-backup-manager
```

---

## Instalacja rozszerzenia

Przejdź do katalogu, w którym znajduje się `install.sh`.

Przykład, jeżeli pliki są w głównym katalogu repo:

```bash
cd ~/Pulpit/extension/Linux-Disk-Mirror-Live
```

Przykład, jeżeli pliki są w podfolderze `immich_backup`:

```bash
cd ~/Pulpit/extension/Linux-Disk-Mirror-Live/immich_backup
```

Nadaj uprawnienia instalatorowi:

```bash
chmod +x install.sh
```

Uruchom instalację:

```bash
./install.sh
```

Instalator wykonuje między innymi:

- kopiuje backend do:

```text
/usr/local/sbin/immich-backup-manager
```

- tworzy katalog stanu:

```text
/var/lib/immich-backup
```

- ustawia uprawnienia do logów i statusu,
- podpina rozszerzenie do Cockpita przez:

```text
~/.local/share/cockpit/immich_backup
```

Po instalacji zrestartuj Cockpita:

```bash
sudo systemctl restart cockpit.socket
```

Następnie odśwież stronę Cockpita przez:

```text
CTRL + F5
```

albo wyloguj się i zaloguj ponownie.

---

## Sprawdzenie instalacji

Sprawdź, czy Cockpit widzi plugin:

```bash
cockpit-bridge --packages | grep immich_backup
```

Jeżeli wszystko jest dobrze, powinieneś zobaczyć wpis podobny do:

```text
immich_backup: /home/kuczis/Pulpit/extension/Linux-Disk-Mirror-Live
```

albo:

```text
immich_backup: /home/kuczis/Pulpit/extension/Linux-Disk-Mirror-Live/immich_backup
```

Sprawdź backend:

```bash
/usr/local/sbin/immich-backup-manager --help
```

albo:

```bash
sudo /usr/local/sbin/immich-backup-manager disks
```

---

## Montowanie dysku backupowego

Wtyczka pokazuje dyski, które są już **zamontowane**.

Najpierw sprawdź dyski:

```bash
lsblk -o NAME,PATH,SIZE,FSTYPE,LABEL,UUID,MOUNTPOINT,MODEL
```

Przykład wykrytego dysku zewnętrznego:

```text
sda      /dev/sda    931,5G                         TOSHIBA MQ04ABF100
└─sda2   /dev/sda2   931,3G exfat DYSK BACKUP 69EB-E547
```

W tym przykładzie właściwa partycja backupowa to:

```text
/dev/sda2
```

Utwórz punkt montowania:

```bash
sudo mkdir -p /mnt/dysk-backup
```

Zamontuj dysk exFAT:

```bash
sudo mount -t exfat /dev/sda2 /mnt/dysk-backup
```

Sprawdź, czy dysk jest zamontowany:

```bash
lsblk -o NAME,PATH,SIZE,FSTYPE,LABEL,UUID,MOUNTPOINT,MODEL
```

Powinno być widać coś podobnego:

```text
sda2 /dev/sda2 931,3G exfat DYSK BACKUP 69EB-E547 /mnt/dysk-backup
```

Możesz też sprawdzić:

```bash
df -h /mnt/dysk-backup
```

Test zapisu:

```bash
touch /mnt/dysk-backup/test.txt
ls /mnt/dysk-backup
rm /mnt/dysk-backup/test.txt
```

---

## Automatyczne montowanie dysku po restarcie

Jeżeli chcesz, żeby dysk montował się automatycznie po restarcie, dodaj go do `/etc/fstab`.

Najpierw sprawdź UUID dysku:

```bash
lsblk -o NAME,PATH,SIZE,FSTYPE,LABEL,UUID,MOUNTPOINT,MODEL
```

Przykład UUID:

```text
69EB-E547
```

Otwórz plik:

```bash
sudo nano /etc/fstab
```

Dodaj linię, zmieniając UUID na UUID swojego dysku:

```text
UUID=69EB-E547 /mnt/dysk-backup exfat defaults,nofail,uid=1000,gid=1000,umask=0002 0 0
```

Zapisz plik.

Przetestuj:

```bash
sudo umount /mnt/dysk-backup
sudo mount -a
lsblk -o NAME,SIZE,FSTYPE,LABEL,UUID,MOUNTPOINT
```

Jeżeli `/dev/sda2` ma mountpoint `/mnt/dysk-backup`, konfiguracja działa.

---

## Użycie w Cockpicie

1. Otwórz Cockpit:

```text
https://IP_SERWERA:9090
```

2. Zaloguj się swoim użytkownikiem Ubuntu.

3. Wejdź w zakładkę:

```text
Immich Backup
```

4. Wpisz folder źródłowy, np.:

```text
/home/kuczis/Pulpit/photos
```

5. Wpisz nazwę folderu backupu na dysku, np.:

```text
ImmichBackup
```

6. Kliknij:

```text
Odśwież dyski
```

7. Wybierz zamontowany dysk backupowy, np.:

```text
/mnt/dysk-backup
```

8. Kliknij:

```text
Start backup
```

Na dysku powstanie katalog:

```text
/mnt/dysk-backup/ImmichBackup/data
```

oraz plik metadanych:

```text
/mnt/dysk-backup/.immich-backup.json
```

---

## Wznawianie po odłączeniu dysku

Jeżeli dysk zostanie przypadkowo odłączony podczas backupu:

1. plugin oznaczy backup jako wstrzymany,
2. podłącz dysk ponownie,
3. zamontuj go ponownie:

```bash
sudo mount /mnt/dysk-backup
```

albo:

```bash
sudo mount -t exfat /dev/sda2 /mnt/dysk-backup
```

4. wróć do Cockpita,
5. kliknij:

```text
Wznów backup
```

`rsync` przeskanuje różnice i dokończy kopiowanie. Nie powinien kopiować wszystkiego od zera.

---

## Bezpieczne odłączanie dysku

Po zakończeniu backupu kliknij w panelu przycisk:

```text
Odmontuj
```

Dopiero po odmontowaniu fizycznie odłącz kabel USB.

Możesz też odmontować dysk ręcznie:

```bash
sudo umount /mnt/dysk-backup
```

Sprawdź, czy dysk został odmontowany:

```bash
lsblk -o NAME,PATH,SIZE,FSTYPE,LABEL,UUID,MOUNTPOINT,MODEL
```

Jeżeli przy partycji nie ma już `/mnt/dysk-backup`, możesz bezpiecznie odłączyć dysk.

---

## Komendy diagnostyczne

Lista dysków widzianych przez backend:

```bash
sudo /usr/local/sbin/immich-backup-manager disks
```

Aktualny status backupu:

```bash
sudo /usr/local/sbin/immich-backup-manager state
```

Start backupu z terminala:

```bash
sudo /usr/local/sbin/immich-backup-manager start \
  --source /home/kuczis/Pulpit/photos \
  --target /mnt/dysk-backup \
  --backup-dir-name ImmichBackup
```

Zatrzymanie backupu:

```bash
sudo /usr/local/sbin/immich-backup-manager stop
```

Wznowienie backupu:

```bash
sudo /usr/local/sbin/immich-backup-manager resume
```

Odmontowanie dysku:

```bash
sudo /usr/local/sbin/immich-backup-manager unmount --target /mnt/dysk-backup
```

Sprawdzenie szybkości wykrywania dysków:

```bash
time /usr/local/sbin/immich-backup-manager disks
```

Sprawdzenie surowego `lsblk`:

```bash
time lsblk -J -o NAME,PATH,SIZE,TYPE,FSTYPE,LABEL,UUID,MOUNTPOINT,MODEL,TRAN
```

---

## Pliki stanu

Backend zapisuje globalny stan w:

```text
/var/lib/immich-backup/state.json
```

Log backupu znajduje się tutaj:

```text
/var/lib/immich-backup/backup.log
```

PID procesu backupu znajduje się tutaj:

```text
/var/lib/immich-backup/backup.pid
```

Dzięki temu status backupu może być widoczny z różnych komputerów i różnych sesji Cockpita.

---

## Aktualizacja projektu

Jeżeli projekt został pobrany przez `git clone`, przejdź do katalogu repozytorium:

```bash
cd ~/Pulpit/extension/Linux-Disk-Mirror-Live
```

Pobierz aktualizacje:

```bash
git pull
```

Jeżeli pliki wtyczki są w głównym katalogu repozytorium:

```bash
chmod +x install.sh
./install.sh
```

Jeżeli pliki wtyczki są w podfolderze `immich_backup`:

```bash
cd immich_backup
chmod +x install.sh
./install.sh
```

Zrestartuj Cockpita:

```bash
sudo systemctl restart cockpit.socket
```

Odśwież stronę przez:

```text
CTRL + F5
```

---

## Odinstalowanie

### Szybkie odinstalowanie

Usuń link do pluginu z Cockpita:

```bash
rm -f ~/.local/share/cockpit/immich_backup
```

Usuń backend:

```bash
sudo rm -f /usr/local/sbin/immich-backup-manager
```

Usuń pliki stanu:

```bash
sudo rm -rf /var/lib/immich-backup
```

Zrestartuj Cockpita:

```bash
sudo systemctl restart cockpit.socket
```

### Usunięcie plików projektu

Jeżeli projekt znajduje się tutaj:

```text
~/Pulpit/extension/Linux-Disk-Mirror-Live
```

usuń go:

```bash
rm -rf ~/Pulpit/extension/Linux-Disk-Mirror-Live
```

### Usunięcie wpisu z `/etc/fstab`

Jeżeli dodawałeś automatyczne montowanie dysku, otwórz:

```bash
sudo nano /etc/fstab
```

Usuń linię podobną do:

```text
UUID=69EB-E547 /mnt/dysk-backup exfat defaults,nofail,uid=1000,gid=1000,umask=0002 0 0
```

Zapisz plik.

---

## Typowe problemy

### Dysk nie pojawia się w panelu

Sprawdź, czy jest zamontowany:

```bash
lsblk -o NAME,PATH,SIZE,FSTYPE,LABEL,UUID,MOUNTPOINT,MODEL
```

Jeżeli `MOUNTPOINT` jest pusty, dysk jest wykryty, ale niezamontowany.

Zamontuj go ręcznie:

```bash
sudo mkdir -p /mnt/dysk-backup
sudo mount -t exfat /dev/sda2 /mnt/dysk-backup
```

Zmień `/dev/sda2` na swoją partycję.

---

### Plugin nie pojawia się w Cockpicie

Sprawdź, czy Cockpit widzi plugin:

```bash
cockpit-bridge --packages | grep immich_backup
```

Zrestartuj Cockpita:

```bash
sudo systemctl restart cockpit.socket
```

Odśwież stronę przez:

```text
CTRL + F5
```

Sprawdź, czy link istnieje:

```bash
ls -la ~/.local/share/cockpit
```

---

### Błąd uprawnień do `/var/lib/immich-backup`

Przykład błędu:

```text
Permission denied: '/var/lib/immich-backup/backup.log'
```

Napraw uprawnienia:

```bash
sudo mkdir -p /var/lib/immich-backup
sudo touch /var/lib/immich-backup/backup.log
sudo touch /var/lib/immich-backup/state.json
sudo chown -R "$USER:$USER" /var/lib/immich-backup
sudo chmod 775 /var/lib/immich-backup
sudo chmod 664 /var/lib/immich-backup/backup.log
sudo chmod 664 /var/lib/immich-backup/state.json
```

---

### exFAT i uprawnienia

Jeżeli dysk backupowy jest w exFAT, montuj go z opcjami `uid`, `gid` i `umask`.

Przykład `/etc/fstab`:

```text
UUID=69EB-E547 /mnt/dysk-backup exfat defaults,nofail,uid=1000,gid=1000,umask=0002 0 0
```

Dzięki temu użytkownik będzie mógł zapisywać pliki na dysku.

---

### Backup trwa, ale drugi komputer nie widzi statusu

Sprawdź plik stanu:

```bash
cat /var/lib/immich-backup/state.json
```

Sprawdź backend:

```bash
sudo /usr/local/sbin/immich-backup-manager state
```

Jeżeli status się aktualizuje w terminalu, ale nie w przeglądarce, odśwież Cockpita:

```text
CTRL + F5
```

---

### Lista dysków miga lub odświeża się zbyt często

Wtyczka ma ciche odświeżanie listy dysków. Jeżeli nadal widać miganie, sprawdź w `app.js`, czy na dole pliku jest:

```javascript
setInterval(() => refreshDisks(false), 20000);
```

a nie:

```javascript
setInterval(refreshDisks, 8000);
```

---

### Dysk jest widoczny w `lsblk`, ale nie w pluginie

Plugin pokazuje tylko dyski, które mają `MOUNTPOINT`.

Sprawdź:

```bash
lsblk -o NAME,PATH,SIZE,FSTYPE,LABEL,UUID,MOUNTPOINT,MODEL
```

Jeżeli widzisz np.:

```text
sda2 /dev/sda2 931,3G exfat DYSK BACKUP 69EB-E547
```

ale kolumna `MOUNTPOINT` jest pusta, zamontuj dysk:

```bash
sudo mount -t exfat /dev/sda2 /mnt/dysk-backup
```

---

### Zatrzymanie zablokowanego backupu

Najpierw użyj panelu Cockpita: **Stop**.

Jeżeli to nie pomaga:

```bash
sudo /usr/local/sbin/immich-backup-manager stop
```

Możesz też sprawdzić procesy:

```bash
ps aux | grep rsync
```

---

## Przydatne linki

- Cockpit:  
  https://cockpit-project.org/

- Dokumentacja Cockpita:  
  https://cockpit-project.org/guide/latest/

- Immich:  
  https://immich.app/

- rsync:  
  https://rsync.samba.org/

- Ubuntu Server:  
  https://ubuntu.com/server

- exFAT tools:  
  https://github.com/exfatprogs/exfatprogs

- Repozytorium projektu:  
  https://github.com/KucziSa/Linux-Disk-Mirror-Live

---

## Bezpieczeństwo

Nie wystawiaj Cockpita bezpośrednio do internetu bez dodatkowych zabezpieczeń.

Do dostępu spoza domu lepiej użyć:

- VPN,
- [Tailscale](https://tailscale.com/),
- WireGuard,
- Cloudflare Tunnel.

Jeżeli używasz Cockpita tylko w sieci lokalnej, zwykle wystarczy wejście przez:

```text
https://IP_SERWERA:9090
```

---
