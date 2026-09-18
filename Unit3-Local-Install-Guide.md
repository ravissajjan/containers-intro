# Install Docker + Kubernetes Locally

**Optional.** Not needed for any lab. The browser labs (Codespaces + Killercoda) do everything.
Do this at home. Allow 30–60 min and one restart.

We install **Docker Engine**, not Docker Desktop.

---

## Before you start

Check all four. If any fails, stop and use Codespaces.

| Check | Where (Windows) | Need |
|---|---|---|
| RAM | Ctrl+Shift+Esc → Performance → Memory | 8 GB+ |
| Free disk | This PC | 10 GB+ |
| Admin rights | Can you install software? | Yes |
| Virtualization | Ctrl+Shift+Esc → Performance → CPU | **Enabled** |

Confirm in PowerShell:

```powershell
systeminfo | Select-String "Hyper-V"
```

| Output | Meaning |
|---|---|
| `Virtualization Enabled In Firmware: Yes` | Good, continue |
| `A hypervisor has been detected` | Good, continue |
| `Virtualization Enabled In Firmware: No` | Do Step 1 |

---

## Step 1 — Enable virtualization in BIOS

Skip if already enabled.

### Dell (setting is hidden)

1. Restart. Press **F2** repeatedly at the Dell logo. (Or **F12** → *BIOS Setup*.)
2. Type `virtual` in the BIOS **search box**, top right. Fastest route.
3. No search box? Left menu → **Virtualization Support**.
4. Set:
   - **Virtualization / Intel VT-x** → ON
   - **VT for Direct I/O (VT-d)** → ON
   - **Enable Trusted Execution** → OFF (blocks VT-d)
5. **Apply** → **Exit**. Machine reboots.

| Problem | Cause | Action |
|---|---|---|
| Option greyed out | BIOS password set by IT | Cannot change. Use Codespaces |
| Asks for a password | Device is IT-managed | Cannot change. Use Codespaces |
| Menu missing | Old firmware | Update BIOS from Dell Support |

### Other brands
Same idea. Key is F2, F10, or Del. Look for **VT-x**, **AMD-V**, or **SVM Mode**.

### macOS
Nothing to do.

### Linux
```bash
grep -Eoc '(vmx|svm)' /proc/cpuinfo     # any number > 0 = supported
```

---

## Step 2 — Windows only: security features that block WSL

Skip this if not on Windows.

Symptom: Task Manager says *Virtualization: Enabled*, but WSL still fails.

| Cause | Fix |
|---|---|
| **Memory Integrity** | Windows Security → Device security → Core isolation → turn **off** → restart |
| **Credential Guard** | Usually company policy. If locked, use Codespaces |
| VirtualBox / VMware installed | Close or uninstall. Two hypervisors conflict |

---

## Step 3 — Install Docker Engine

### Windows

**3.1** In **admin PowerShell**:

```powershell
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart
```

**Restart the computer.**

**3.2** In **admin PowerShell**:

```powershell
wsl --install -d Ubuntu
wsl --set-default-version 2
```

Create a Linux username and password when prompted. Write them down — `sudo` needs the password.
Nothing appears on screen while typing a Linux password. This is normal.

**3.3** Verify:

```powershell
wsl --list --verbose
```

Ubuntu must show `VERSION 2`. If it shows `1`:

```powershell
wsl --set-version Ubuntu 2
```

**3.4** Open **Ubuntu** from the Start menu:

```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

**3.5** Enable systemd so Docker starts automatically:

```bash
sudo nano /etc/wsl.conf
```

Add, then `Ctrl+O`, `Enter`, `Ctrl+X`:

```ini
[boot]
systemd=true
```

**3.6** In **PowerShell**:

```powershell
wsl --shutdown
```

**3.7** Reopen Ubuntu:

```bash
sudo systemctl enable --now docker
```

If `systemctl` says systemd is not running: run `wsl --update` in PowerShell, redo 3.5–3.6.
Or start Docker manually each session with `sudo service docker start`.

**Keep project files in `~/` inside Ubuntu.** Files under `/mnt/c/...` make Docker very slow.

### macOS

```bash
brew install docker docker-compose colima
colima start
```

Enable the `docker compose` subcommand:

```bash
mkdir -p ~/.docker/cli-plugins
ln -sfn $(brew --prefix)/opt/docker-compose/bin/docker-compose ~/.docker/cli-plugins/docker-compose
```

Colima must be running for Docker to work. Use `colima start` / `colima stop` / `colima status`.

### Linux (Ubuntu / Debian)

```bash
sudo apt-get remove docker docker-engine docker.io containerd runc
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

Log out and back in.

---

## Step 4 — Verify Docker

```bash
docker --version
docker compose version
docker run hello-world
```

Expected: `Hello from Docker!`

Bigger test:

```bash
docker run -d -p 8080:80 --name test nginx
# open http://localhost:8080
docker rm -f test
```

---

## Step 5 — Install kubectl

```bash
# Linux, and Windows inside Ubuntu
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl && rm kubectl
```

```bash
# macOS
brew install kubectl
```

---

## Step 6 — Install minikube

```bash
# Linux, and Windows inside Ubuntu
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube && rm minikube-linux-amd64
```

```bash
# macOS
brew install minikube
```

---

## Step 7 — Start and verify Kubernetes

Docker must be running first.

```bash
minikube start --driver=docker
minikube status
kubectl get nodes
```

Expected: one node, `STATUS = Ready`. First start takes a few minutes.

Test it:

```bash
kubectl create deployment hello --image=nginx
kubectl get pods              # wait for STATUS = Running
kubectl delete deployment hello
```

---

## Step 8 — Run the Unit 3 lab locally

### Docker Compose (Labs 2–4)

```bash
cd lab-starter
docker compose up --build     # open http://localhost:3000
docker compose down -v
```

### Kubernetes (Lab 6)

**minikube cannot see images built on your laptop.** It has a separate image store.
A local image gives `ImagePullBackOff`. Use one of these:

```bash
# Option 1 - load the image into minikube
docker build -t containers-lab-web:v1 ./web
minikube image load containers-lab-web:v1
```

```bash
# Option 2 - build inside minikube's Docker
eval $(minikube docker-env)
docker build -t containers-lab-web:v1 ./web
```

Edit `k8s/deployment.yaml`:

```yaml
          image: containers-lab-web:v1
          imagePullPolicy: IfNotPresent
```

Apply:

```bash
kubectl apply -f k8s/
kubectl get pods
minikube service web --url
```

If that URL will not open in a Windows browser:

```bash
kubectl port-forward deployment/web 3000:3000
# open http://localhost:3000
```

Pushing to Docker Hub first (Lab 5) avoids all of this.

---

## Daily use

```bash
minikube stop             # saves battery
minikube start            # resume, keeps your work
minikube delete           # wipe cluster, start clean

docker system df          # disk used
docker system prune -a    # delete unused images - check first
```

macOS: `colima stop` when finished.
Windows: `wsl --shutdown` in PowerShell frees the memory WSL holds.

---

## Troubleshooting

### Virtualization / WSL

| Message | Fix |
|---|---|
| Task Manager: Virtualization Disabled | Step 1 |
| BIOS option greyed out | IT-locked. Use Codespaces |
| Enabled in BIOS, Windows disagrees | Step 2 — turn off Memory Integrity |
| `WslRegisterDistribution failed (0x80370102)` | Step 1, then Step 3.1 |
| `Please enable the Virtual Machine Platform` | Step 3.1, then restart |
| Ubuntu shows VERSION 1 | `wsl --set-version Ubuntu 2` |
| WSL download fails on college Wi-Fi | Use a phone hotspot |

### Docker

| Message | Fix |
|---|---|
| `Cannot connect to the Docker daemon` | `sudo systemctl start docker` or `sudo service docker start` |
| `permission denied ... docker.sock` | `sudo usermod -aG docker $USER`, log out and back in |
| `docker: command not found` after install | Close and reopen the terminal |
| `port is already allocated` | `docker rm -f <name>` or use another port |
| `repository name must be lowercase` | Use lower case in the image name |
| Builds very slow on Windows | Move the project to `~/` inside Ubuntu |

### Kubernetes

| Message | Fix |
|---|---|
| `minikube start` hangs or fails | Start Docker. Then `minikube delete` and start again |
| `ImagePullBackOff` with a local image | `minikube image load <image>` + `imagePullPolicy: IfNotPresent` |
| `CrashLoopBackOff` | `kubectl logs <pod>` — the app is failing, not Kubernetes |
| Pod stuck `Pending` | `kubectl describe pod <name>`, read *Events* |

---

## Uninstall

```bash
minikube delete --all
```

| OS | Command |
|---|---|
| Windows | `wsl --unregister Ubuntu` |
| macOS | `colima delete` then `brew uninstall colima docker docker-compose` |
| Linux | `sudo apt-get purge docker-ce docker-ce-cli containerd.io` |

---

**If this takes more than an hour, stop and use Codespaces.** A locked BIOS cannot be worked around.
