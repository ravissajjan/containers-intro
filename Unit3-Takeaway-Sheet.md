# Unit 3 — Takeaway Sheet
### Containers & Kubernetes on one page. Print it. Revise from it.

---

## 1. Every idea as a picture

| Concept | Picture |
|---|---|
| **VM vs container** | A separate **house** vs a **flat** — the flat shares the building's foundation |
| **Dockerfile** | The **recipe card** |
| **Image** | The **sealed lunchbox**. Never changes |
| **Container** | Someone **eating** from it. One recipe → many meals |
| **Image → container** | **Class → object**, if you've done any OOP |
| **Registry** | The **shop** where lunchboxes are sold |
| **Tag** | The **date label**. `:latest` = "newest", tells you nothing |
| **Layer cache** | Prepping ingredients once and reusing them |
| **Container network** | Calling a classmate **by name**, not by phone number |
| **Volume** | Container = **kettle**, volume = **water jug**. Swap the kettle, water stays |
| **Compose** | One **switch** for the whole room |
| **Pod** | One **worker** |
| **Deployment** | A **supervisor**: "always keep 3 at the counter" |
| **Service** | The **shop's phone number** — staff change, number doesn't |

---

## 2. The order never changes

```
Dockerfile  --build-->  Image  --run-->  Container
                          |
                          +--push--> Registry --pull--> any machine on earth
```

**Image = immutable.** **Container = disposable.** Anything you care about → **volume**.

---

## 3. Dockerfile

```dockerfile
FROM node:20-alpine        # base image to start from
WORKDIR /app               # folder inside the image
COPY package*.json ./      # dependencies FIRST - they change least
RUN npm ci                 # BUILD time - baked into the image
COPY app.js index.html ./  # source last
EXPOSE 3000                # documentation only!
CMD ["node", "app.js"]     # RUN time - what starts the container
```

| Remember | |
|---|---|
| `EXPOSE` vs `-p` | `EXPOSE` is a **note**. `-p 3000:3000` actually connects the port |
| `RUN` vs `CMD` | `RUN` = build time, lands in the **image**. `CMD` = start time, becomes the **process** |
| Layers | Each line = one layer, cached. Put **least-changing lines at the top** |
| Build context | The `./web` in `docker build -t app ./web` — the only folder `COPY` can read |
| Many `RUN`, one `CMD` | Only the **last** `CMD` counts |

---

## 4. Commands

```bash
# images & containers
docker build -t myapp ./web        docker images
docker run -d -p 3000:3000 myapp   docker ps          # -a for stopped too
docker logs <name>                 docker exec -it <name> sh
docker stop <name>                 docker rm <name>    # rm -f = stop + remove

# compose
docker compose up --build          docker compose ps
docker compose down                # keeps volumes
docker compose down -v             # DELETES volumes

# volumes
docker volume ls                   docker volume inspect <name>

# registry
docker login
docker build -t user/app:v1 ./web
docker push user/app:v1

# kubernetes
kubectl get pods / nodes / svc     kubectl apply -f file.yaml
kubectl describe pod <name>        kubectl logs <pod>
kubectl scale deployment web --replicas=5
kubectl set image deployment/web web=user/app:v2
kubectl rollout status deployment/web
kubectl rollout undo deployment/web
```

---

## 5. Compose file, annotated

```yaml
services:
  web:
    build: ./web
    ports:
      - "3000:3000"          # reachable from outside
    environment:
      API_URL: http://api:4000/info   # 'api' = the service name, not an IP
    depends_on:
      - api

  api:
    build: ./api
    volumes:
      - api-data:/data       # survives container deletion
                             # no 'ports' = private, internal only
volumes:
  api-data:
```

**Two exam-worthy details:** containers find each other **by service name**, and a service
with **no `ports`** is unreachable from outside. That's how databases are hidden.

---

## 6. Storage — read the left side of the colon

```yaml
- api-data:/data     # a NAME  → named volume, Docker picks the location
- ./data:/data       # a PATH  → bind mount, you pick the exact folder
```

| Type | Managed by | Survives container deletion? | Use for |
|---|---|---|---|
| **Named volume** | Docker | Yes | Databases, uploads — data you keep but never touch |
| **Bind mount** | You | Yes, files just sit on the host | Development — container sees your edits live |
| **tmpfs** | The OS (RAM) | **No** | Scratch files, secrets you don't want on disk |

Neither of the first two creates a new disk — both use ordinary host storage. The difference is
**who decides where it lives**.

**In Kubernetes the idea is identical, the backing store is bigger:**
`Pod → PersistentVolumeClaim → PersistentVolume → AWS EBS / EFS`.

---

## 7. Registry vs repository vs tag

```
Docker Hub                 ← Registry    (the whole storage system)
  └── ravi/myapp           ← Repository  (all versions of ONE app)
        ├── :v1             ← Image/tag  (one specific build)
        └── :v2
```

The registry is just the **first part of the image name**, which is why other registries need no
special setup: `123456789.dkr.ecr.ap-south-1.amazonaws.com/my-app:1.0` (ECR), `ghcr.io/...` (GitHub).

**Why it exists:** after `docker build` the image is on **one machine only**. Push → pull is how it
reaches anywhere else — and `build → tag → push → deploy` is exactly what a CI/CD pipeline automates.

---

## 8. Kubernetes

**Kubernetes** = runs containers across many machines and keeps them in the state you asked for.

| Object | Job |
|---|---|
| **Pod** | Smallest unit. One running container (usually) |
| **Deployment** | Keeps N pods alive; handles rolling updates |
| **Service** | One stable address in front of pods; load-balances; finds pods by **label** |
| **Node** | A machine in the cluster |
| **Cluster** | All the nodes, managed as one system |
| **Control plane** | The brain — takes your instructions, repairs reality to match |
| **kubectl** | The tool *you* type commands into |

**Where a cluster comes from:**

| | Learning | Production |
|---|---|---|
| | **minikube**, kind, k3s, Killercoda | **EKS** (AWS), **GKE** (Google), **AKS** (Azure) |
| Nodes | One | Many, managed for you |

**minikube** = a complete Kubernetes cluster on **one machine**. Real Kubernetes, same commands,
same YAML — just a single node, so you can't demo a machine dying. Everything else is identical.

```bash
minikube start    # create the cluster      minikube stop   # shut it down
```

**The core idea — desired state:**
> You declare *what* you want ("3 copies"). Kubernetes constantly compares that to reality and
> **fixes the difference itself**. You never write the *how*.

Delete a pod → a new one appears in seconds. That is **self-healing**.

```bash
kubectl scale deployment web --replicas=5    # scaling
kubectl set image deployment/web web=user/app:v2   # rolling update
kubectl rollout undo deployment/web          # instant rollback
```

Those last two are the **rolling deployment** and **rollback** from Unit 2 — now real commands.

---

## 9. Rules that will save you

1. **Never deploy `:latest`.** Tag with a version or commit ID, or you can't tell what's running.
2. **Run `docker login` first.** Anonymous Docker Hub pulls are rate-limited per IP — a whole
   classroom shares one.
3. **Anything you care about goes in a volume.** Containers are meant to be thrown away.
4. **A private Docker Hub repo → `ImagePullBackOff`** in Kubernetes. Make it public for labs.
5. **`docker compose down -v` deletes your data.** The `-v` is the dangerous part.

---

## 10. When something breaks

| Message | Meaning |
|---|---|
| `Cannot connect to the Docker daemon` | Docker isn't running |
| `toomanyrequests` | Docker Hub rate limit → `docker login` |
| `port is already allocated` | Something else uses that port → `docker rm -f <name>` |
| `denied: requested access to the resource is denied` | Not logged in, or image isn't named `yourusername/...` |
| `ImagePullBackOff` | K8s can't fetch the image — wrong name or private repo |
| `CrashLoopBackOff` | The container starts then dies → `kubectl logs <pod>` |

---

## 11. Seven answers worth memorising

1. **VM vs container?** A VM carries a whole OS (GB, boots in minutes). A container shares the
   host OS and carries only the app + dependencies (MB, starts in seconds).
2. **Image vs container?** An image is the sealed, immutable package; a container is a running
   copy of it. One image → many containers. Class → object.
3. **`RUN` vs `CMD`?** `RUN` executes during `docker build` and its result is baked into the
   image. `CMD` executes when the container starts and becomes the running process.
4. **Why did my data disappear?** It was in the container's own filesystem. Containers are
   disposable — use a **volume**.
5. **Named volume vs bind mount?** Both live on host storage. With a named volume **Docker**
   picks the location; with a bind mount **you** name the exact folder.
6. **What does Kubernetes add over Docker?** Docker runs containers on *one* machine.
   Kubernetes runs them across *many*, and keeps them alive automatically.
7. **What is desired state?** You declare what you want; K8s continuously repairs reality to
   match — that's what makes it self-healing.

---

## 12. If someone asks you to go deeper (optional)

Not examinable. Useful if an interviewer pushes past the basics.

```
docker CLI  →  dockerd  →  containerd  →  runc  →  Linux kernel
  what you    images,      start/stop     creates    namespaces = isolation
  type        networks,    containers     the        cgroups    = CPU/memory limits
              volumes                     process
```

- **Docker Engine** = CLI + daemon. `docker version` shows both, as **Client** and **Server**.
- **A container is just a Linux process** with namespaces (its own view of files, network,
  processes) and cgroups (resource limits) applied.
- **Kubernetes does not use Docker Engine.** It goes `kubelet → containerd → runc`. The old
  `dockershim` bridge was removed in **v1.24** — which is why there is no `docker` command on the
  Killercoda Kubernetes playground, yet your image still runs. Image formats are an open standard.

---

> **The one sentence:**
> **A container packages your app with everything it needs so it runs identically everywhere —
> and an orchestrator keeps those containers alive without anyone watching.**
