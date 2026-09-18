# containers-lab — starter files

Two tiny Node services. **No libraries to install.** You only need Docker, and your
Codespace already has it — see [Unit3-Before-We-Start.md](../Unit3-Before-We-Start.md).

```
lab-starter/
├── web/                 the page people see
│   ├── app.js           serves the page, calls the api
│   ├── index.html       shows which container answered
│   └── Dockerfile       6 lines
├── api/                 the private service
│   ├── api.js           returns JSON, counts visits
│   └── Dockerfile       6 lines
├── docker-compose.yml   runs both with one command
└── k8s/
    ├── deployment.yaml  keeps 2 copies running
    └── service.yaml     one stable address in front of them
```

## Quick commands

```bash
# one container at a time
docker build -t web ./web
docker run -p 3000:3000 web

# both together
docker compose up --build        # open http://localhost:3000
docker compose down              # stop (volume survives)
docker compose down -v           # stop AND delete the volume

# kubernetes
kubectl apply -f k8s/
kubectl get pods
kubectl scale deployment web --replicas=5
```

## Two things to notice

1. **`api` has no `ports:` in docker-compose.yml.** It is not reachable from
   outside — only `web` can talk to it, using the name `api`. That is container
   networking.
2. **`api` writes its visit count to a named volume.** Delete the container and
   the count is still there. That is a volume.
