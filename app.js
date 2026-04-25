const CMD = "/usr/local/sbin/immich-backup-manager";

let selectedMountpoint = null;
let selectedDiskLabel = null;
let latestState = null;
let disksRefreshInProgress = false;

const diskList = document.getElementById("diskList");
const refreshBtn = document.getElementById("refreshBtn");
const startBtn = document.getElementById("startBtn");
const resumeBtn = document.getElementById("resumeBtn");
const stopBtn = document.getElementById("stopBtn");

const sourcePathInput = document.getElementById("sourcePath");
const backupDirNameInput = document.getElementById("backupDirName");

const selectedDiskText = document.getElementById("selectedDiskText");
const statusBadge = document.getElementById("statusBadge");
const statusMessage = document.getElementById("statusMessage");
const progressBar = document.getElementById("progressBar");
const progressText = document.getElementById("progressText");
const speedText = document.getElementById("speedText");
const etaText = document.getElementById("etaText");
const logBox = document.getElementById("logBox");

function escapeText(value) {
    if (value === null || value === undefined) return "";
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;");
}

function runJson(args) {
    return cockpit.spawn(args, { superuser: "try" })
        .then(out => {
            if (!out.trim()) return {};
            return JSON.parse(out);
        });
}

function runText(args) {
    return cockpit.spawn(args, { superuser: "try" });
}

function diskName(disk) {
    if (disk.label) return disk.label;
    if (disk.model) return disk.model;
    if (disk.name) return disk.name;
    return disk.mountpoint;
}

function updateLog(text) {
    if (!text) return;
    logBox.textContent = text;
    logBox.scrollTop = logBox.scrollHeight;
}

function setBadge(status) {
    let text = "Bezczynny";
    let cls = "idle";

    if (status === "running" || status === "starting") {
        text = "Backup trwa";
        cls = "running";
    } else if (status === "completed") {
        text = "Zakończono";
        cls = "done";
    } else if (status === "paused") {
        text = "Wstrzymano";
        cls = "paused";
    } else if (status === "failed") {
        text = "Błąd";
        cls = "error";
    } else if (status === "stopped") {
        text = "Zatrzymano";
        cls = "paused";
    }

    statusBadge.textContent = text;
    statusBadge.className = "badge " + cls;
}

function setProgress(percent) {
    const value = Math.max(0, Math.min(100, Number(percent || 0)));
    progressBar.style.width = value + "%";
    progressText.textContent = value + "%";
}

function updateButtons(state) {
    const running = state && (state.status === "running" || state.status === "starting");
    const paused = state && state.status === "paused";

    startBtn.disabled = running || !selectedMountpoint;
    stopBtn.disabled = !running;
    resumeBtn.disabled = !paused;
}

function renderDisks(data) {
    diskList.innerHTML = "";

    if (!data.disks || data.disks.length === 0) {
        diskList.innerHTML = `<div class="empty">Nie znaleziono zamontowanych dysków backupowych. Jeżeli dysk jest podłączony, prawdopodobnie trzeba go zamontować.</div>`;
        return;
    }

    data.disks.forEach(disk => {
        const item = document.createElement("div");

        let classes = "disk";
        if (disk.mountpoint === selectedMountpoint) classes += " selected";
        if (disk.has_metadata) classes += " known";
        item.className = classes;

        const name = diskName(disk);

        const left = document.createElement("div");
        left.innerHTML = `
            <div class="disk-title">
                ${escapeText(name)}
                ${disk.has_metadata ? `<span class="tag">backup Immich</span>` : ""}
            </div>
            <div class="disk-meta">
                <span><strong>Montowanie:</strong> ${escapeText(disk.mountpoint)}</span>
                <span><strong>Urządzenie:</strong> ${escapeText(disk.path || disk.name || "—")}</span>
                <span><strong>Rozmiar:</strong> ${escapeText(disk.size || "—")}</span>
                <span><strong>UUID:</strong> ${escapeText(disk.uuid || "—")}</span>
                <span><strong>System plików:</strong> ${escapeText(disk.fstype || "—")}</span>
                <span><strong>Model:</strong> ${escapeText(disk.model || "—")}</span>
            </div>
        `;

        const actions = document.createElement("div");
        actions.className = "disk-actions";

        const selectButton = document.createElement("button");
        selectButton.className = "button secondary";
        selectButton.textContent = "Wybierz";
        selectButton.addEventListener("click", () => {
            selectedMountpoint = disk.mountpoint;
            selectedDiskLabel = name;
            selectedDiskText.textContent = `${name} (${disk.mountpoint})`;
            refreshDisks(false);
            pollState();
        });

        const unmountButton = document.createElement("button");
        unmountButton.className = "button danger";
        unmountButton.textContent = "Odmontuj";
        unmountButton.addEventListener("click", () => {
            unmountDisk(disk.mountpoint);
        });

        actions.appendChild(selectButton);
        actions.appendChild(unmountButton);

        item.appendChild(left);
        item.appendChild(actions);
        diskList.appendChild(item);
    });
}

function refreshDisks(showLoading = false) {
    if (disksRefreshInProgress) {
        return Promise.resolve();
    }

    disksRefreshInProgress = true;

    if (showLoading) {
        diskList.innerHTML = `<div class="empty">Ładowanie dysków...</div>`;
    }

    return runJson([CMD, "disks"])
        .then(renderDisks)
        .catch(err => {
            if (showLoading) {
                diskList.innerHTML = `<div class="empty">Nie udało się odczytać dysków.</div>`;
            }
            updateLog("Błąd odczytu dysków:\n" + err);
        })
        .finally(() => {
            disksRefreshInProgress = false;
        });
}

function pollState() {
    runJson([CMD, "state"])
        .then(state => {
            latestState = state || {};
            const status = latestState.status || "idle";

            setBadge(status);
            setProgress(latestState.progress || 0);

            speedText.textContent = latestState.speed || "—";
            etaText.textContent = latestState.eta || "—";

            if (latestState.message) {
                statusMessage.textContent = latestState.message;
            } else {
                statusMessage.textContent = "Brak aktywnego backupu.";
            }

            if (latestState.target && !selectedMountpoint) {
                selectedMountpoint = latestState.target;
                selectedDiskText.textContent = latestState.target;
            }

            updateLog(latestState.last_log || "");

            updateButtons(latestState);
        })
        .catch(err => {
            setBadge("failed");
            statusMessage.textContent = "Nie udało się pobrać statusu.";
            updateLog("Błąd statusu:\n" + err);
        });
}

function startBackup() {
    const source = sourcePathInput.value.trim();
    const backupDirName = backupDirNameInput.value.trim();

    if (!source) {
        alert("Podaj folder źródłowy.");
        return;
    }

    if (!backupDirName) {
        alert("Podaj nazwę folderu backupu.");
        return;
    }

    if (!selectedMountpoint) {
        alert("Wybierz dysk backupowy.");
        return;
    }

    runText([
        CMD,
        "start",
        "--source", source,
        "--target", selectedMountpoint,
        "--backup-dir-name", backupDirName
    ])
        .then(() => {
            pollState();
        })
        .catch(err => {
            alert("Nie udało się uruchomić backupu: " + err);
            pollState();
        });
}

function resumeBackup() {
    runText([CMD, "resume"])
        .then(() => {
            pollState();
        })
        .catch(err => {
            alert("Nie udało się wznowić backupu: " + err);
            pollState();
        });
}

function stopBackup() {
    runText([CMD, "stop"])
        .then(() => {
            pollState();
        })
        .catch(err => {
            alert("Nie udało się zatrzymać backupu: " + err);
            pollState();
        });
}

function unmountDisk(mountpoint) {
    if (!mountpoint) {
        alert("Brak punktu montowania dysku.");
        return;
    }

    const confirmUnmount = confirm(
        "Czy na pewno odmontować dysk?\n\n" +
        mountpoint + "\n\n" +
        "Po odmontowaniu możesz bezpiecznie odłączyć kabel USB."
    );

    if (!confirmUnmount) {
        return;
    }

    runText([CMD, "unmount", "--target", mountpoint])
        .then(() => {
            if (selectedMountpoint === mountpoint) {
                selectedMountpoint = null;
                selectedDiskLabel = null;
                selectedDiskText.textContent = "Nie wybrano";
            }

            refreshDisks(true);
            pollState();
        })
        .catch(err => {
            alert("Nie udało się odmontować dysku: " + err);
            pollState();
        });
}

refreshBtn.addEventListener("click", () => refreshDisks(true));
startBtn.addEventListener("click", startBackup);
resumeBtn.addEventListener("click", resumeBackup);
stopBtn.addEventListener("click", stopBackup);

refreshDisks(true);
pollState();

setInterval(pollState, 2000);
setInterval(() => refreshDisks(false), 20000);
