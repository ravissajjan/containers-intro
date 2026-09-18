# Unit 3 — Containerization and Cloud-Native DevOps

Welcome. By the end of this unit you will have built a container image, run several containers
that talk to each other, published your image to the internet, and watched Kubernetes repair a
broken application by itself.

**You do not need to install anything.** Everything runs in your browser.

---

## Start here

**1. Before the session** — read [Unit3-Before-We-Start.md](Unit3-Before-We-Start.md) and create
the three free accounts it asks for. Do this at home, not in class: account sign-ups are slow, and
forty people registering on the same Wi-Fi at 09:35 does not work.

**2. On the day** — open [Unit3-Student-Lab-Handout.md](Unit3-Student-Lab-Handout.md) and work
down it. Tick every box. Ask for help at every ✅ CHECKPOINT.

**3. To open your workspace** — on this repository: **Code** → **Codespaces** →
**Create codespace on main**. Wait about two minutes and VS Code opens in your browser with
Docker, `kubectl` and minikube already installed.

> 💡 **Stop your Codespace when you finish.** ☰ menu → *My Codespaces* → **Stop**.
> Free accounts get a monthly allowance, and a Codespace left running quietly spends it.

---

## The files

Read them in this order.

| File | What it is |
|---|---|
| [Unit3-Before-We-Start.md](Unit3-Before-We-Start.md) | **Read first.** What a container is, VM vs container, the four words you need, and the accounts to create at home |
| [Unit3-Student-Lab-Handout.md](Unit3-Student-Lab-Handout.md) | **The labs.** Labs 0–7 step by step, with checkboxes and a troubleshooting table at the end |
| [Unit3-Notes.md](Unit3-Notes.md) | **The subject notes.** Every concept explained properly, with diagrams, a glossary, a command reference and exam questions. Read alongside the labs or after them |
| [Unit3-Takeaway-Sheet.md](Unit3-Takeaway-Sheet.md) | **One page for revision.** Print it. Everything condensed to pictures, tables and commands |
| [Unit3-Homework.md](Unit3-Homework.md) | The assignment, the viva questions, and an optional mini project |
| [Unit3-Local-Install-Guide.md](Unit3-Local-Install-Guide.md) | **Optional.** Installing Docker on your own laptop, for later. Not needed for any lab |
| [lab-starter/](lab-starter/README.md) | The small app you will containerize |

---

## What the labs cover

**Session A — Docker & Compose**

| Lab | You will |
|---|---|
| 0 | Open your workspace and prove Docker works |
| 1 | Run somebody else's image; go inside a running container |
| 2 | Write and build **your own image**; see the layer cache work |
| 3 | Make two containers talk to each other by name |
| 4 | Start everything with one command, and find out what happens to your data |

**Session B — Registry & Kubernetes**

| Lab | You will |
|---|---|
| 5 | Push your image to Docker Hub and run it on a machine that has never seen your code |
| 6 | Deploy to Kubernetes, then delete a running pod and see what Kubernetes does about it |
| 7 | Ship a new version with a rolling update, then roll it back |

---

## Where things run

| Environment | Used for | Cost |
|---|---|---|
| **GitHub Codespaces** | All the Docker labs, and Kubernetes via minikube | Free monthly quota |
| **Killercoda** | A second machine in Lab 5; an alternative Kubernetes cluster | Free |
| **Docker Hub** | Publishing your image | Free |
| Docker on your own laptop | Optional, at home | — |

Your Codespace is configured by `.devcontainer/devcontainer.json` in this repository, which is
why Docker and Kubernetes are already there — you install nothing. If a tool is ever missing,
press **Ctrl+Shift+P** → *Codespaces: Rebuild Container* and wait for it to finish.

---

## Two warnings worth reading now

1. **Run `docker login` before anything else.** It is Lab 1.0. Docker Hub limits anonymous
   downloads *per IP address*, and everyone in the room shares one. Skip it and somebody's
   commands start failing with `toomanyrequests` halfway through the lab.
2. **"Play with Docker" no longer exists.** It went offline in March 2026, but many tutorials and
   blog posts still link to it. If you go looking for extra practice, use your Codespace or
   Killercoda instead.

---

## What you will build

A two-service application, both parts written in Node with **zero libraries to install**:

```
lab-starter/
├── web/                 the page people see
│   ├── app.js           serves the page, calls the api
│   ├── index.html       shows which container answered
│   └── Dockerfile
├── api/                 the private service
│   ├── api.js           returns JSON, counts visits
│   └── Dockerfile
├── docker-compose.yml   runs both with one command
└── k8s/
    ├── deployment.yaml  keeps copies running
    └── service.yaml     one stable address in front of them
```

Two details in that app carry most of the unit:

- **`api` has no published port.** It cannot be reached from the internet — only `web` can talk
  to it, using the name `api`. That is container networking, made visible.
- **`api` writes its visit count to a volume.** You will find out in Lab 4 what that means when
  the container is deleted.

---

## When something breaks

The lab handout and the notes both end with a troubleshooting table. Check them first — most
problems in this unit are one of about eight known messages, and the fix is usually one line.

If you are stuck for more than a few minutes, ask. Being stuck on an environment problem teaches
you nothing, and it is very often not your fault.
