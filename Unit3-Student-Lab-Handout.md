# Unit 3 — Student Lab Handout
### Containerization and Cloud-Native DevOps

> Tick each box. Raise your hand at every ✅ CHECKPOINT.
> **Session A** = Labs 0–4 (Docker & Compose). **Session B** = Labs 5–7 (Registry & Kubernetes).

---

## ⚠️ BEFORE THE SESSION

Read `Unit3-Before-We-Start.md` and finish its checklist. You need:

- [ ] GitHub login (same as Unit 2)
- [ ] A free **Killercoda** account
- [ ] A free **Docker Hub** account — username: `________________`
- [ ] You have opened a Codespace once as a practice run

**Nothing to install.** Everything runs in your browser.

---

# SESSION A — Docker & Compose

## LAB 0 — Open your workspace (15 min)

1. Go to the lab repository on GitHub.
2. **Code** → **Codespaces** → **Create codespace on main**.
3. Wait for VS Code to open in your browser, then in its terminal:

```bash
docker --version
docker run hello-world
```

- [ ] `docker --version` prints a version
- [ ] `hello-world` prints *"Hello from Docker!"*

Now one more:

```bash
docker version        # no dashes this time
```

- [ ] I see **two** sections: **Client** and **Server**

> 📖 The `docker` command you type is only a **client**. It sends every request to the **daemon**
> (the Server section, `dockerd`), which does the actual work. When you later see
> *"Cannot connect to the Docker daemon"*, it means the client is fine but the server is not running.

> If `docker` is not found,
> Fallback: `https://killercoda.com` → Playgrounds → **Ubuntu**.

**✅ CHECKPOINT 0**

---

## LAB 1 — Images and containers (45 min)

### 1.0 Log in first

```bash
docker login        # your Docker Hub username + password
```

- [ ] It says **Login Succeeded**

> ⚠️ **Do this before anything else pulls an image.** Docker Hub limits *anonymous* downloads
> per IP address, and this whole room shares one. Without logging in, somebody's `docker run`
> will fail with `toomanyrequests` halfway through the lab. Logged in, the limit is counted
> per account instead.

### 1.1 Run somebody else's image (10 min)

```bash
docker run -d -p 8080:80 --name site nginx
```

Open port 8080 (in Codespaces: the **Ports** tab → click the 🌐 next to 8080).

- [ ] I see the nginx welcome page

No nginx is installed on this machine. It came inside the image.

> 📖 **DEFINITION — Image**: a sealed, read-only package containing an app and everything it needs.
> 📖 **DEFINITION — Container**: a running copy of an image.

### 1.2 Look around (15 min)

```bash
docker ps                 # what is running
docker ps -a              # including stopped ones
docker images             # what images do I have
docker logs site          # what did it print
docker exec -it site sh   # go INSIDE the container
```

Inside the container, try:
```bash
ls /usr/share/nginx/html
cat /etc/os-release        # a whole mini Linux in here!
exit
```

- [ ] I went inside a container and came back out

> 🎯 **Predict first:** you are inside the container. Will `ls` show your Codespace files? ______
> Try it. Why not?

### 1.3 One image, many containers (10 min)

```bash
docker run -d -p 8081:80 --name site2 nginx
docker run -d -p 8082:80 --name site3 nginx
docker ps
```

- [ ] Three containers running from **one** image

> 🎭 One recipe → three lunchboxes. The image is never changed by running it.

### 1.4 Clean up (10 min)

```bash
docker stop site site2 site3
docker rm site site2 site3
docker ps -a
```

- [ ] All gone

**Question to write down:** what is the difference between `docker stop` and `docker rm`?

**✅ CHECKPOINT 1**

---

## LAB 2 — Build your own image (45 min)

### 2.1 Read the recipe (10 min)

Open `lab-starter/web/Dockerfile`:

```dockerfile
FROM node:20-alpine        # start from a small Linux that already has Node
WORKDIR /app               # work in this folder inside the image
COPY app.js index.html ./  # copy my files in
EXPOSE 3000                # this app listens on 3000
CMD ["node", "app.js"]     # run this when the container starts
```

Write in your own words what each line does. This is the same kind of file Unit 2's pipeline
relied on — now you get to understand it rather than just use it.

> 🎭 `FROM` = "give me a small Linux that already has Node installed." You never install Node
> yourself — it arrives inside the base image.

### 2.2 Build and run it (15 min)

```bash
cd lab-starter
docker build -t mywebapp ./web
docker images                      # see your new image
docker run -d -p 3000:3000 --name web mywebapp
```

> 📖 **DEFINITION — Build context**: the `./web` at the end is not just "where the Dockerfile is."
> It is the **only** folder `COPY` is allowed to read from. `COPY ../something .` always fails.
>
> 📖 `-t mywebapp` **t**ags the image with a name. Without it you get an unnamed image and have to
> use its ID.

Open port 3000.

- [ ] My own app is running in a container
- [ ] The page shows a container ID

> 🎯 **Predict first:** click **Call the api**. Will it work? ______
> It won't — there is no api container yet. That's Lab 3.

### 2.3 Layers and caching (10 min)

Change one word in `web/index.html`, then rebuild:

```bash
docker build -t mywebapp ./web
```

Watch the output. Some steps say **CACHED**.

- [ ] I saw `CACHED` on the early steps

> 📖 **DEFINITION — Layer**: each Dockerfile instruction creates one layer. Docker reuses
> unchanged layers, which is why the second build is much faster.
>
> **Rule:** put the things that change *least* at the **top** of your Dockerfile.

**Where this bites in real projects.** A Node or Python app installs dependencies during the build:

```dockerfile
COPY package*.json ./
RUN npm ci          # ← runs at BUILD time, result is baked into the image
COPY . .
CMD ["node", "app.js"]   # ← runs at CONTAINER START time
```

Dependencies are copied **before** the source on purpose. Swap those two lines and every one-line
code edit throws away the cache and reinstalls everything.

> 📖 **`RUN` vs `CMD`** — the distinction behind most Dockerfile confusion:
>
> | | `RUN` | `CMD` |
> |---|---|---|
> | Happens during | `docker build` | `docker run` |
> | Result lands in | The **image** | The running **process** |
> | Used for | Installing, compiling | Starting the app |
>
> Many `RUN` lines are allowed. Only the **last `CMD`** is used.

### 2.4 Prove the point (10 min)

```bash
docker stop web && docker rm web
docker run -d -p 3000:3000 --name web mywebapp
```

- [ ] It came straight back

> 📌 **WHAT YOU JUST LEARNED**
> 1. `Dockerfile` → `docker build` → **image** → `docker run` → **container**.
> 2. The image is immutable; containers are disposable.
> 3. Layers are cached, so order matters.

**✅ CHECKPOINT 2**

---

## LAB 3 — Two containers talking (30 min)

### 3.1 The problem (5 min)

Your `web` container needs to call an `api` container. But containers are isolated —
`localhost` inside `web` means *web itself*, not the api.

Docker's answer: put them on the **same network**, then they can find each other **by name**.
You do not have to build that network yourself — **Docker Compose creates one for you**.

### 3.2 Start both containers together (15 min)

First clear away the container from Lab 2 — it is still holding the name `web` and port 3000:

```bash
docker rm -f web
```

> 📖 `rm -f` = stop **and** delete in one go. Without this you get
> *"The container name /web is already in use"* — container names must be unique.

Open `lab-starter/docker-compose.yml` and find these two lines:

```yaml
    environment:
      API_URL: http://api:4000/info
```

`api` there is the **service name** from the same file — that is the address. Now start both:

```bash
cd lab-starter
docker compose up --build -d
docker compose ps
```

Open port 3000 and click **Call the api**.

- [ ] I get JSON back from the api container

> 📖 **DEFINITION — Container network**: a private network where containers reach each
> other by **service name** instead of IP address. Compose creates one per project and
> joins every service to it automatically.
>
> 🎭 Like calling a classmate by name instead of memorising their phone number.

### 3.3 See the isolation (10 min)

```bash
docker compose ps          # notice: api has NO published port
docker network ls          # notice: Compose made a network named after this folder
```

The api is **not** reachable from the internet. Only `web` can reach it, over that private
network — this is how real systems hide their databases.

```bash
docker compose down
```

**✅ CHECKPOINT 3**

---

## LAB 4 — Docker Compose and volumes (40 min)

### 4.1 One file instead of a dozen commands (10 min)

Read `lab-starter/docker-compose.yml` properly this time. Every line replaces something you
would otherwise type on `docker run`:

| In the file | The `docker run` flag it replaces |
|---|---|
| `build: ./web` | `docker build -t ... ./web` |
| `ports: - "3000:3000"` | `-p 3000:3000` |
| `environment: API_URL: ...` | `-e API_URL=...` |
| `volumes: - api-data:/data` | `-v api-data:/data` |
| the service name `api` | `--name api` **and** the whole network setup |

```bash
cd lab-starter
docker compose up -d
docker compose ps
docker compose logs api
```

- [ ] Both containers started with **one command**

> 📖 **DEFINITION — Docker Compose**: a tool that starts several containers together
> from one YAML file, on a shared network it creates for you.

### 4.2 The volume experiment (20 min)

Click **Call the api** several times. Watch `visits` go up.

> 🎯 **Predict first:** if I **delete** the api container, will the count reset to 0? ______

```bash
docker compose down          # deletes the containers
docker compose up -d         # start again
```

Click **Call the api**.

- [ ] The count **continued** — it did not reset

Why? Because of this in the compose file:
```yaml
volumes:
  - api-data:/data
```

> 📖 **DEFINITION — Volume**: storage that lives **outside** the container, so data
> survives when the container is deleted.
>
> 🎭 The container is the kettle. The volume is the water jug. Replace the kettle,
> the water is still there.

See it for yourself — the volume is a real object with its own lifecycle:

```bash
docker volume ls
docker volume inspect lab-starter_api-data     # name may differ; copy it from the list above
```

- [ ] `Mountpoint` shows a path on the host, **outside** any container

> 📖 **Named volume vs bind mount** — the left side of the colon tells you which one you have:
>
> | Written as | Type | Who picks the location |
> |---|---|---|
> | `api-data:/data` | **Named volume** | Docker |
> | `./data:/data` | **Bind mount** | You — an exact folder on this machine |
>
> Named volumes are for data you keep but never touch by hand (databases). Bind mounts are for
> development — mount your source in and the container sees your edits with no rebuild.
> Neither creates a new disk; both use ordinary space on the host.

Now really delete it:
```bash
docker compose down -v       # -v also deletes the volume
docker compose up -d
```

- [ ] Now the count reset to 1

### 4.3 Try to scale — and watch it fail (10 min)

Our compose file publishes `"3000:3000"` for `web`.

> 🎯 **Predict first:** what happens if I ask Docker for **3 copies** of `web`? ______

```bash
docker compose up -d --scale web=3
```

- [ ] It **failed**, with an error about the port already being allocated

**Good — that error is the point of this step.**

One host port maps to **one** container. Running 3 copies needs a **load balancer** in front of them.
Docker Compose has none. Kubernetes does, and calls it a **Service** — you build one in Session B.

> 🎭 Three shops, one phone number. Somebody has to answer the phone and decide which shop
> gets the customer.

```bash
docker compose down -v
```

> 📌 **WHAT YOU JUST LEARNED**
> 1. Compose = many containers, one file, one command.
> 2. Containers find each other **by service name**.
> 3. Containers are disposable; **volumes** keep data.
> 4. One host port maps to **one** container — scaling needs an orchestrator.

**✅ CHECKPOINT 4 — end of Session A 🎉**

---

# SESSION B — Registry & Kubernetes

## LAB 5 — Push to Docker Hub (40 min)

**Why this lab exists:** after `docker build`, your image lives **only in this Codespace**. No
server, no teammate and no Kubernetes cluster can see it. The registry is the missing step:

```
build  →  image  →  push  →  registry  →  pull  →  any machine on earth
```

### 5.1 Log in (5 min)

```bash
docker login        # your Docker Hub username + password/token
```

> You did this in Lab 1.0 — but if this is a **new Codespace** (likely, on a different day),
> you are logged out again and must repeat it.

### 5.2 Tag and push (20 min)

An image name **is** its address. Replace `YOURNAME` with your Docker Hub username:

```bash
docker build -t YOURNAME/containers-lab-web:v1 ./web
docker push YOURNAME/containers-lab-web:v1
```

- [ ] I can see my image on `https://hub.docker.com`
- [ ] My repository is **Public** (Settings → make public if not)

> 📖 **DEFINITION — Registry**: the shop where images live. Docker Hub, GHCR, ECR.
> 📖 **DEFINITION — Tag**: the version label after the colon — `:v1`, `:2.3.0`.

> 📖 **Registry vs repository vs tag** — three words people use interchangeably and shouldn't.
> Docker Hub is laid out like GitHub:
>
> ```
> Docker Hub                  ← Registry    (the whole storage system)
>   └── YOURNAME/containers-lab-web    ← Repository  (all versions of ONE app)
>         ├── :v1                       ← Image/tag  (one specific build)
>         └── :v2
> ```
>
> Docker Hub is only one registry. Amazon **ECR**, **GHCR**, Azure **ACR** and Google Artifact
> Registry all work identically — the registry is just the first part of the image name:
> `123456789.dkr.ecr.ap-south-1.amazonaws.com/my-app:1.0`

### 5.3 Pull it somewhere else (15 min)

Open `https://killercoda.com` → Playgrounds → **Ubuntu**. A different machine entirely.

```bash
docker run -d -p 3000:3000 YOURNAME/containers-lab-web:v1
curl localhost:3000/health
```

- [ ] My app ran on a machine that has never seen my code

> **That is the whole point of this unit.** Write down how long it took.

**⚠️ Never use `:latest` for a real deployment.** `latest` just means "whatever was pushed
last" — you can never tell what is actually running.

**✅ CHECKPOINT 5**

---

## LAB 6 — Kubernetes: Pods, Deployments, Services (60 min)

### Pick your cluster

You need a Kubernetes cluster. Either works — **use whichever your instructor says.**

> 📖 **DEFINITION — Kubernetes**: a system that runs containers across many machines and keeps
> them in the state you asked for. You declare *what* you want; it works out *how*.
>
> 📖 **DEFINITION — Cluster**: one running installation of Kubernetes. You have to get one from
> somewhere before you can use `kubectl`.
>
> 📖 **DEFINITION — minikube**: a tool that runs a complete Kubernetes cluster **on a single
> machine** — here, inside your Codespace. It is real Kubernetes, not a simulation: same
> commands, same YAML, same behaviour. The only limit is that it has **one node**, so you cannot
> watch a whole machine fail. Everything else in Labs 6–7 behaves exactly as it would on a
> thousand-node cluster.
>
> At work you would use a **managed** cluster instead — Amazon EKS, Google GKE, Azure AKS.
> The commands are identical, which is the entire point of learning on minikube.

| | **A — Codespaces + minikube** | **B — Killercoda** |
|---|---|---|
| Where | The same Codespace you've used all along | `https://killercoda.com` → Playgrounds → **Kubernetes** |
| Start it | `minikube start` (~2 min, once) | Nothing — it's ready |
| Times out? | No | Yes, sessions expire — don't leave it idle |
| Your files | Already there | Not there; you'd retype the YAML |

**Option A — start your cluster:**

```bash
minikube start
kubectl get nodes
```

- [ ] One node, STATUS **Ready**

> If `minikube` is not found, your Codespace was created before the Kubernetes tools were added.
> **Ctrl+Shift+P** → *Codespaces: Rebuild Container*, wait, then try again.

**Option B —** open the Killercoda Kubernetes playground and wait for it to be ready.

Every command below works the same on both. Where they differ, it is called out.

### 6.1 Your first pod (10 min)

```bash
kubectl get nodes
kubectl run test --image=nginx
kubectl get pods
kubectl describe pod test
kubectl delete pod test
```

> 📖 **DEFINITION — Pod**: the smallest thing Kubernetes runs. Usually one container.
> Pods are **disposable** — they are cattle, not pets.

> 🧠 **Kubernetes is not running your containers through Docker.** It goes
> `kubelet → containerd → runc`, skipping the Docker daemon entirely — the old bridge,
> `dockershim`, was removed in Kubernetes v1.24. Your image still runs because the image format
> is an open standard, not a Docker-only one.
>
> On **Killercoda** you can prove it: type `docker ps` and there is no such command.
> In **Codespaces** `docker` does still exist, but it is *your* Docker — run `docker ps` and you
> will not see your Kubernetes pods in the list. Different engine, same images.

### 6.2 A Deployment (20 min)

Create `deployment.yaml` (a copy is provided in `lab-starter/k8s/deployment.yaml` —
replace `YOURNAME` with your Docker Hub username either way):

> ⚠️ **Your image must be on Docker Hub and Public.** Kubernetes pulls it from there — it cannot
> see images you built locally, even in Codespaces. If you skipped Lab 5, go back and do it.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web
spec:
  replicas: 2
  selector:
    matchLabels:
      app: web
  template:
    metadata:
      labels:
        app: web
    spec:
      containers:
        - name: web
          image: YOURNAME/containers-lab-web:v1
          ports:
            - containerPort: 3000
```

```bash
kubectl apply -f deployment.yaml
kubectl get pods
```

- [ ] Two pods are running

### 6.3 🔥 The self-healing moment (10 min)

> 🎯 **Predict first:** I am about to delete a running pod. What happens? ______

```bash
kubectl get pods
kubectl delete pod <paste-one-pod-name>
kubectl get pods
```

- [ ] A **new pod appeared by itself**, within seconds

> 📖 **DEFINITION — Deployment**: an object that says *"always keep N copies running."*
> Kubernetes constantly compares **desired state** to **actual state** and fixes the difference.
> Nobody paged anybody. Nobody woke up at 3 AM.

### 6.4 A Service (10 min)

```bash
kubectl expose deployment web --type=NodePort --port=80 --target-port=3000
kubectl get service web
```

Now reach it. **This is the one step that differs between the two environments:**

**Option A — Codespaces + minikube**

```bash
kubectl port-forward service/web 8080:80
```

Leave that running, open a **second terminal** (the `+` in the terminal panel), and:

```bash
curl localhost:8080
```

> Why not `curl localhost:<nodeport>`? minikube runs the cluster inside its own Docker network
> (you'll see an address like `192.168.49.2`), which your terminal cannot reach directly.
> `port-forward` builds the tunnel. You can also open port **8080** from the **Ports** tab to see
> it in a browser.

**Option B — Killercoda**

```bash
curl localhost:<the-nodeport-shown>
```

Run your `curl` **five times** and watch the container ID in the HTML change.

- [ ] Different pods answered

> 📖 **DEFINITION — Service**: one stable address in front of pods that keep coming and
> going. It finds pods by **label**, and load-balances between them.

### 6.5 Scale (10 min)

```bash
kubectl scale deployment web --replicas=5
kubectl get pods
kubectl scale deployment web --replicas=1
kubectl get pods
```

- [ ] Five pods, then one — in seconds

> 📌 **WHAT YOU JUST LEARNED**
> 1. **Pod** = a running container. **Deployment** = keeps N pods alive. **Service** = stable address.
> 2. Kubernetes fixes problems **by itself** to match your desired state.
> 3. You describe *what you want*, not *how to do it*.

**✅ CHECKPOINT 6**

---

## LAB 7 — Rolling update (15 min, if time)

Now you build a **new version**, push it, and let Kubernetes swap it in without downtime.

> On **Option A (Codespaces)** everything below happens in one place.
> On **Option B (Killercoda)** you need **both tabs**: build and push in Codespaces, run the
> `kubectl` commands on Killercoda.

**Build and push v2** — change the heading in `web/index.html`, then:

```bash
docker build -t YOURNAME/containers-lab-web:v2 ./web
docker push YOURNAME/containers-lab-web:v2
```

**Roll it out:**
```bash
kubectl scale deployment web --replicas=4
kubectl set image deployment/web web=YOURNAME/containers-lab-web:v2
kubectl rollout status deployment/web
```

- [ ] Pods were replaced **a few at a time**, never all at once

That is the **rolling deployment** from Unit 2 — now you have actually done one.

```bash
kubectl rollout undo deployment/web     # instant rollback
```

**✅ CHECKPOINT 7 — done 🎉**

---

## Command cheat sheet

```bash
# images & containers
docker build -t name .          docker images
docker run -d -p 3000:3000 name docker ps / ps -a
docker logs <name>              docker exec -it <name> sh
docker stop <name>              docker rm <name>
docker version                  # Client + Server (daemon)

# compose
docker compose up --build       docker compose ps
docker compose down             docker compose down -v

# volumes
docker volume ls                docker volume inspect <name>

# registry
docker login                    docker push user/name:v1
docker pull user/name:v1

# kubernetes
kubectl get pods / nodes / svc  kubectl apply -f file.yaml
kubectl describe pod <name>     kubectl logs <pod>
kubectl scale deployment web --replicas=5
kubectl delete pod <name>       kubectl rollout undo deployment/web

# minikube (Codespaces only)
minikube start                  minikube status
kubectl port-forward service/web 8080:80
minikube stop
```

## When something breaks

| Problem | Fix |
|---|---|
| `docker: command not found` | Wrong environment — use Codespaces or Killercoda Ubuntu |
| `port is already allocated` | `docker rm -f <name>`, or use a different host port |
| `Cannot connect to the Docker daemon` | Docker isn't running — restart the playground |
| Page won't open in Codespaces | **Ports** tab → make sure the port is forwarded |
| **Call the api** says *"fetch failed"* | The api container is down or unreachable — see the box below |
| `denied: requested access to the resource is denied` | `docker login`, and the image name must start with **your** username |
| `repository name must be lowercase` | Docker image names are lowercase only — type your username in lower case |
| `ImagePullBackOff` in Kubernetes | Image name is wrong, or the Docker Hub repo is **private** |
| `minikube: command not found` | Codespace built before the K8s tools were added — **Ctrl+Shift+P** → *Rebuild Container* |
| `curl localhost:<nodeport>` refuses on minikube | Expected — use `kubectl port-forward service/web 8080:80` instead |
| minikube won't start / runs out of memory | `minikube delete` then `minikube start`. Stop stray containers first with `docker rm -f $(docker ps -aq)` |
| `toomanyrequests` pulling an image | Docker Hub rate limit — run `docker login` first |

### If **Call the api** fails

Work down this list — stop as soon as one of them fixes it:

```bash
docker compose ps                    # 1. is the api container actually Up?
docker compose logs api              # 2. does it say "api listening on port 4000"?
docker compose exec web wget -T 5 -O- http://api:4000/info   # 3. can web reach api?
```

If step 3 **hangs** rather than failing fast, the container network itself is blocked — a known
quirk of running Docker inside some Codespaces. Ask your instructor, or try:

```bash
sudo iptables -P FORWARD ACCEPT      # allow container-to-container traffic
docker compose up -d
```

Still stuck? Do Labs 3–4 on the **Killercoda Ubuntu** playground instead. Nothing about the lab
changes — it is the environment, not your work.

