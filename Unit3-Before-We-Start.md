# Before We Start — Unit 3
### Read before the session. 10 minutes.

Unit 2 was the pipeline that tests and ships your code.
Unit 3 is the box your code travels in.

---

## 1. What a container is

Your code runs on your machine because your machine has the right Node version, the right files
and the right settings. Another machine does not.

A **container** ships your code **plus everything it needs to run** — the runtime, the libraries,
and a small operating system underneath.

## 2. VM vs container

| | Virtual Machine | Container |
|---|---|---|
| Carries | A whole operating system | Your app + its dependencies |
| Size | Gigabytes | Megabytes |
| Starts in | Minutes | Seconds |
| Per laptop | A few | Dozens |

A VM is a separate house. A container is a flat in an apartment block — your own lockable space,
shared foundation. Sharing the foundation is what makes containers small and fast.

## 3. Four words

| Word | Meaning |
|---|---|
| **Dockerfile** | The instructions. A text file |
| **Image** | The sealed package built from it. Cannot be changed |
| **Container** | A running copy of an image. One image → many containers |
| **Registry** | Where images are stored. e.g. Docker Hub |

```
Dockerfile --build--> Image --run--> Container
```

### And two more, for the second session

| Word | Meaning |
|---|---|
| **Kubernetes** | Runs containers across many machines and **keeps them running** — if one dies, it starts a replacement without being asked |
| **minikube** | A tool that gives you a small, complete Kubernetes cluster on **one** machine, so you can learn it without a data centre |

Don't worry about these two yet. You will not need them until Session B.

---

## 4. Where you will run Docker

Nothing to install. Docker runs in your browser.

### A — GitHub Codespaces (used in class)

1. Open the lab repository on GitHub.
2. **Code** → **Codespaces** → **Create codespace on main**.
3. Wait ~2 minutes. VS Code opens in your browser with Docker ready.

The repository carries a `.devcontainer` file, so your Codespace arrives with **Docker,
kubectl and minikube** already installed. You do not install anything yourself.

Free GitHub accounts include a monthly hour allowance, far more than this course needs.
**Stop your codespace when you finish:** ☰ menu → *My Codespaces* → **Stop**.

### B — Killercoda (a second machine, and a backup cluster)

`https://killercoda.com` → free account → **Playgrounds** → **Ubuntu** or **Kubernetes**.
Used in Lab 5 to prove your image runs on a machine that has never seen your code, and as an
alternative to minikube for the Kubernetes labs.
Sessions are time-limited. Do not save anything important there.

### C — Your own laptop (optional, at home)

Docker Engine: WSL 2 on Windows, Colima on macOS, direct install on Linux.

Requires admin rights and virtualization enabled in the BIOS. On many **Dell** laptops that
setting is hidden. On college- or company-managed laptops the BIOS is password-locked and cannot
be changed — use Option A instead.

Steps: `Unit3-Local-Install-Guide.md`. Optional, 30–60 minutes, at home only.

---

## Pre-work checklist

- [ ] GitHub login works (same account as Unit 2)
- [ ] Free account at `https://killercoda.com`
- [ ] Free account at `https://hub.docker.com`
      <br/>Docker Hub username: `________________`
- [ ] **Bring your Docker Hub password to class.** The very first lab command is `docker login`,
      and "I forgot my password" costs you the first half hour
- [ ] Opened a Codespace once as a practice run
- [ ] Read sections 1–3

**Sign up for Docker Hub at home.** Email verification is slow, and 40 people signing up on the
same college Wi-Fi at 09:35 will not work.

---

## 5. Commands you will meet

| Command | What it does |
|---|---|
| `docker login` | Sign in to Docker Hub. **The first command of the day** |
| `docker build -t myapp .` | Build an image from the Dockerfile here, name it `myapp` |
| `docker run myapp` | Start a container from that image |
| `docker ps` | List running containers |
| `docker logs <name>` | Show what a container printed |
| `docker stop <name>` | Stop a container |
| `docker exec -it <name> sh` | Open a shell inside a running container |
| `docker compose up` | Start all containers in a compose file |
| `minikube start` | Start a small Kubernetes cluster inside your Codespace |
| `kubectl get pods` | List what Kubernetes is running |

`-it` = interactive terminal.
`-p 3000:3000` = connect your port 3000 to the container's port 3000.

---

## 6. Bring this from Unit 2

Open your `cicd-lab` repository and find `Dockerfile`:

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY . .
EXPOSE 3000
CMD ["node", "app.js"]
```

In Unit 2 this file was just something the pipeline needed. By the end of the first hour you will
be able to explain all five lines, and write your own.
