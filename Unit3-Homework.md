# Unit 3 — Homework
### Containerization and Cloud-Native DevOps

Work in a **public** GitHub repo called `containers-lab`.
Everything can be done in a browser (Codespaces / Killercoda).

---

## Part 1 — Practical (60 marks)

| # | Task | Marks |
|---|---|---|
| **T1** | Write a **Dockerfile from scratch** for the `api` service — do not copy the provided one. Build it and show `docker images` listing your image. | 10 |
| **T2** | Run **two containers from the same image** at the same time on different ports. Screenshot `docker ps` showing both. | 5 |
| **T3** | Prove the **layer cache** works: build once, change one line in the app, build again. Screenshot the second build showing `CACHED` steps. In 2 lines, explain why some steps were cached and others weren't. | 10 |
| **T4** | Using **Docker Compose**, run `web` + `api` together — then **rename the `api` service** to something else (`backend`, say) and make *Call the api* work again. Screenshot your compose file and the successful response, and explain in 1 line what else you had to change. | 10 |
| **T5** | **Volume proof.** Raise the visit count above 5, run `docker compose down`, then `up` again, and screenshot the count **continuing**. Then run `down -v`, start again, and screenshot the count **reset**. Explain the difference in one sentence. | 10 |
| **T6** | Push your image to **Docker Hub** as `yourname/containers-lab-web:v1` and submit the public URL. | 5 |
| **T7** | On **Killercoda Kubernetes**: create a Deployment with **3 replicas** of your image, expose it with a Service, and screenshot `kubectl get pods` and `kubectl get svc`. | 10 |

---

## Part 2 — The self-healing experiment (15 marks)

On your Kubernetes deployment:

1. Run `kubectl get pods` and note the names.
2. Delete **one** pod: `kubectl delete pod <name>`.
3. Run `kubectl get pods` again **immediately**.

Submit both screenshots, then answer in **100–150 words**:
- What happened, and roughly how long did it take?
- **Which Kubernetes object** made it happen — the Pod, the Deployment, or the Service? Why?
- What would have happened if you had created the pod with `kubectl run` instead of a Deployment?

---

## Part 3 — Written (15 marks)

Answer in **250–350 words total**.

1. A teammate says: *"Containers are just lightweight virtual machines."* They are **partly**
   wrong. Explain what is actually different, and give one situation where you would still
   choose a **VM** over a container.

2. Your app stores uploaded photos inside the container at `/app/uploads`. After a deploy, all
   photos are gone. Explain **why**, and describe the fix.

3. Your company deploys `myapp:latest` to production. Give **two** concrete problems this
   causes, and say what you would do instead.

---

## Part 4 — Reflection (10 marks)

1. In Lab 5 you ran your image on a machine that had never seen your code, with no installation.
   Compare that to how you shared code before this course. What specifically got easier?

2. Name **one thing containers do NOT solve.** (Hint: think about the database, the data inside
   it, or a bug in your own code.)

---

## Practice questions for the viva

**Recall**
1. What is the difference between an image and a container?
2. What does `docker ps -a` show that `docker ps` does not?
3. What is a registry? Name two.
4. What does the `-p` flag do?
5. What is a Pod?
6. What is minikube, and why would you use it instead of a real cluster?

**Understanding**
7. Why is the second `docker build` usually much faster than the first?
8. `EXPOSE 3000` is in the Dockerfile but the app isn't reachable. Why?
9. How do two containers in a Compose file find each other?
10. Why does a service with no `ports:` entry still work?
11. What is the difference between `docker compose down` and `down -v`?
12. What is the difference between a **node** and a **pod**?

**Judgement**
13. Why should a database's data never live inside the container's own filesystem?
14. What does Kubernetes give you that Docker Compose does not?
15. Your pod shows `CrashLoopBackOff`. What are your first two commands?
16. You need to update 10 running copies with zero downtime. Which Kubernetes command, and
    which Unit 2 deployment strategy is it?
17. Explain "desired state" to someone who has never used Kubernetes.
18. You learned Kubernetes on a single-node minikube cluster. Name one thing that would behave
    differently on a real 10-node cluster, and one thing that would behave exactly the same.

---

## Optional bonus — Mini project (teams of 3, 1 week)

Containerize any small app of your own with:

- [ ] A Dockerfile you wrote yourself, using layer caching sensibly
- [ ] At least **two** services in a Compose file that talk to each other
- [ ] A named **volume** for anything that must survive
- [ ] The image published **publicly** to Docker Hub with a real version tag (not `latest`)
- [ ] A Kubernetes Deployment (2+ replicas) and a Service
- [ ] A `README.md` with the commands to run it and a short "how to roll back" section

**Demo day (10 min):** start it with one command, then delete a pod live and let the class watch
Kubernetes replace it.
