---
title: 如何将 docker 单节点部署应用改成集群部署？
date: '2024/9/22'
lastmod: '2024/9/22'
tags: [docker, k8s]
draft: false
summary: '我在学习Kubernetes中的实践'
images: [https://img.maqib.cn/img/202409301034245.png]
layout: PostLayout
slug: how-to-change-docker-single-node-deployment-to-cluster
---

在项目开发中，Docker Compose 是一种常见的工具，能够帮助开发者在本地轻松启动多容器应用。然而，当应用扩展到生产环境，单节点的 Docker Compose 可能无法满足高可用性、容错和扩展需求。这时候，我们可以考虑将 Docker Compose 部署迁移到 Kubernetes 这样的集群环境中，实现应用的集群化管理。

本文将以我之前开发的一个 Node.js 应用(一个在线流程图系统)为例，使用 `PostgreSQL`、`Adminer` 管理数据库，介绍如何将单节点的 Docker Compose 部署转化为 Kubernetes 集群部署。

![](https://img.maqib.cn/img/202409222106617.png)

## Docker Compose 配置

这是一个典型的 `docker-compose.yml` 文件，它定义了一个使用 PostgreSQL 作为数据库，Adminer 作为数据库管理界面，Node.js 应用作为服务的环境。

```yaml
version: '3.8'

services:
  db:
    image: postgres
    volumes:
      - pg_data:/var/lib/postgresql/data
    restart: always
    ports:
      - 5432:5432
    environment:
      POSTGRES_DB: pro
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: example

  adminer:
    image: adminer
    restart: always
    ports:
      - 8080:8080

  app:
    image: maqi1520/cloneprocesson
    ports:
      - '3000:3000'
    environment:
      DATABASE_URL: 'postgresql://admin:example@db:5432/pro?schema=public'
      JWT_SECRET: 'xxxx'
      GITHUB_CLIENT_ID: 'xxxx'
      GITHUB_CLIENT_SECRET: 'xxxx'
      DOMAIN: 'http://localhost:3000'
      EMAIL_USER: 'xxxx@163.com'
      EMAIL_USER_NAME: 'xxxxx'
      EMAIL_HOST: 'smtp.163.com'
      EMAIL_PASS: 'xxxx'
    depends_on:
      - db

volumes:
  pg_data:
```

此配置可以在本地使用 `docker-compose up -d` 命令启动，但如果要将其部署在生产环境中并确保高可用性，则需要迁移到 Kubernetes。接下来，我们将介绍如何完成这一转化。

## Kubernetes 集群化部署概述

在 Kubernetes 中，使用多个资源来管理应用的不同组件。与 Docker Compose 的单一文件不同，Kubernetes 使用 `Deployment`、`StatefulSet`、`Service`、`ConfigMap`、`Secret` 等多个配置文件来描述和管理容器化应用。

为了将上述 Docker Compose 配置转移到 Kubernetes，我们需要以下几种关键组件：

1. **PostgreSQL StatefulSet**：用于管理数据库容器，保证数据持久性。
2. **Deployment**：用于部署 Node.js 应用和 Adminer，确保应用的可扩展性。
3. **Service**：为应用提供集群内外的访问接口。
4. **Secret**：用于存储敏感信息（如数据库凭证、API 密钥等）。

## Step 1: 将 PostgreSQL 部署为 StatefulSet

在 Kubernetes 中，`StatefulSet` 用于管理有状态应用（例如数据库），它确保数据库实例的持久性和稳定性。我们首先需要创建一个用于存储数据库凭证的 `Secret`，然后再创建 `StatefulSet`。

### PostgreSQL Secret

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: postgres-secret
type: Opaque
data:
  DATABASE_URL: cG9zdGdyZXNxbDovL2FkbWluOmV4YW1wbGVAcG9zdGdyZXM6NTQzMi9wcm8/c2NoZW1hPXB1YmxpYw== # base64编码的 "postgresql://admin:example@postgres:5432/pro?schema=public"
  POSTGRES_DB: 'cHJv' # "pro" encoded in base64
  POSTGRES_USER: 'YWRtaW4=' # "admin" encoded in base64
  POSTGRES_PASSWORD: 'ZXhhbXBsZQ==' # "example" encoded in base64
```

在 Kubernetes 中，Secret 中的数据可以使用 base64 编码是一种常见的做法，但不是必须的。

在 Linux 和 macOS 系统中，可以使用 base64 命令。例如，要对字符串 “postgresql://admin:example@postgres:5432/pro?schema=public” 进行编码，可以在终端中执行以下命令：

```bash
     echo -n "postgresql://admin:example@postgres:5432/pro?schema=public" | base64
```

在 Windows 系统中，可以使用 PowerShell 中的`[Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes("postgresql://admin:example@postgres:5432/pro?schema=public"))`命令。

Kubernetes 的 Secret 对象可以存储任意数据，但为了确保数据的安全性和可读性，通常会进行某种形式的编码或加密。

### PostgreSQL StatefulSet

```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres
spec:
  serviceName: 'postgres'
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
        - name: postgres
          image: postgres:latest
          ports:
            - containerPort: 5432
          env:
            - name: POSTGRES_DB
              valueFrom:
                secretKeyRef:
                  name: postgres-secret
                  key: POSTGRES_DB
            - name: POSTGRES_USER
              valueFrom:
                secretKeyRef:
                  name: postgres-secret
                  key: POSTGRES_USER
            - name: POSTGRES_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: postgres-secret
                  key: POSTGRES_PASSWORD
          volumeMounts:
            - name: pg-data
              mountPath: /var/lib/postgresql/data
  volumeClaimTemplates:
    - metadata:
        name: pg-data
      spec:
        accessModes: ['ReadWriteOnce']
        resources:
          requests:
            storage: 1Gi
```

通过 `StatefulSet`，我们确保了数据库数据的持久化存储和稳定的网络标识。每个副本都可以访问持久存储卷。

### PostgreSQL Service

```yaml
apiVersion: v1
kind: Service
metadata:
  name: postgres
spec:
  ports:
    - port: 5432
  selector:
    app: postgres
```

`Service` 用于暴露 PostgreSQL 服务，使得应用可以通过集群内部的 DNS 名称 `postgres` 访问数据库。

## Step 2: Node 应用程序的 Deployment 和 Secret

接下来，我们为 Node.js 应用创建一个 `Deployment`，并通过 `Secret` 管理敏感数据，例如数据库 URL、JWT 密钥和 GitHub API 凭证。

### 应用程序的 Secret

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: app-secret
type: Opaque
data:
  jwt-secret: 'YOUR_ENCODED_JWT_SECRET'
  github-client-id: 'YOUR_ENCODED_GITHUB_CLIENT_ID'
  github-client-secret: 'YOUR_ENCODED_GITHUB_CLIENT_SECRET'
```

### 应用程序 Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: app
spec:
  replicas: 1
  selector:
    matchLabels:
      app: app
  template:
    metadata:
      labels:
        app: app
    spec:
      containers:
        - name: app
          image: maqi1520/cloneprocesson:latest
          ports:
            - containerPort: 3000
          env:
             - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: app-secret
                  key: DATABASE_URL
            - name: JWT_SECRET
              valueFrom:
                secretKeyRef:
                  name: app-secret
                  key: jwt-secret
            - name: GITHUB_CLIENT_ID
              valueFrom:
                secretKeyRef:
                  name: app-secret
                  key: github-client-id
            - name: GITHUB_CLIENT_SECRET
              valueFrom:
                secretKeyRef:
                  name: app-secret
                  key: github-client-secret
```

### 应用程序 Service

```yaml
apiVersion: v1
kind: Service
metadata:
  name: app
spec:
  type: LoadBalancer
  ports:
    - port: 3000
  selector:
    app: app
```

## Step 3: Adminer Deployment 和 Service

最后，Adminer 作为数据库管理界面，也需要用 `Deployment` 和 `Service` 部署。

![](https://img.maqib.cn/img/202409222106050.png)

### Adminer Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: adminer
spec:
  replicas: 1
  selector:
    matchLabels:
      app: adminer
  template:
    metadata:
      labels:
        app: adminer
    spec:
      containers:
        - name: adminer
          image: adminer:latest
          ports:
            - containerPort: 8080
```

### Adminer Service

```yaml
apiVersion: v1
kind: Service
metadata:
  name: adminer
spec:
  type: LoadBalancer
  ports:
    - port: 8080
  selector:
    app: adminer
```

## Step 4: 部署步骤

1. 将 `Secret` 和 `Deployment` 等资源应用到 Kubernetes 集群：

   ```bash
   kubectl apply -f postgres-secret.yml
   kubectl apply -f postgres-statefulset.yml
   kubectl apply -f postgres-service.yml
   kubectl apply -f app-secret.yml
   kubectl apply -f app-deployment.yml
   kubectl apply -f app-service.yml
   kubectl apply -f adminer-deployment.yml
   kubectl apply -f adminer-service.yml
   ```

   这将会启动 PostgreSQL 数据库实例，并为数据库提供持久存储，应用程序将通过 `Secret` 获取敏感信息，并连接到 PostgreSQL 数据库。`Service` 将会为外部客户端提供访问 Node.js 应用的入口。
   Adminer 将作为数据库管理界面通过集群的 `LoadBalancer` 公开出来，允许你直接管理 PostgreSQL 数据。

## Step 5: 验证和监控

完成部署后，你可以通过以下方式验证集群的运行情况：

1. 查看所有资源是否成功创建：

   ```bash
   kubectl get pods
   kubectl get services
   kubectl get statefulsets
   ```

2. 验证 PostgreSQL 连接：

   可以通过访问 Adminer 服务，验证 PostgreSQL 数据库是否正常工作。你可以使用浏览器访问 `http://<LoadBalancer_IP>:8080`，然后使用 Secret 中的数据库凭证登录。

3. 验证应用程序连接：

   访问 Node.js 应用的 `Service` 地址，查看应用是否能正常连接 PostgreSQL 数据库，并成功启动。

如果使用本地部署可以使用`minikube service app`看到应用地址，他会自动打开部署 url 端口。

## Kubernetes 部署的优势

相比于 Docker Compose 单节点部署，Kubernetes 的集群化部署具备以下几个显著优势：

1. **高可用性和容错**：Kubernetes 提供了原生的自动重启、容器健康检查、横向扩展等机制，使得应用能够在出现问题时自动恢复。
2. **自动扩展**：你可以根据负载的变化，通过 Kubernetes 自动或手动扩展应用的副本数，保证应用能够处理更多请求。
3. **滚动更新**：通过 Kubernetes，你可以实现应用的滚动更新，逐步替换旧版本的容器，而不会导致服务中断。
4. **资源分配和优化**：Kubernetes 允许更精细地控制资源的使用，如 CPU 和内存，确保集群资源的合理利用。
5. **Secret 和 ConfigMap**：通过 Secret 和 ConfigMap，Kubernetes 提供了更安全和动态的方式来管理应用的配置和敏感信息，避免将敏感数据硬编码在镜像或代码中。

## 总结

将 Docker Compose 的单节点部署迁移到 Kubernetes，不仅能够使应用从本地开发阶段顺利过渡到生产环境，还可以通过 Kubernetes 提供的集群管理能力来提高系统的高可用性、弹性扩展和安全性。

在本文中，我们通过将 Docker Compose 配置中的 PostgreSQL、Adminer 和自定义 Node.js 应用迁移到 Kubernetes，学习了如何利用 `StatefulSet`、`Deployment`、`Secret` 和 `Service` 等 Kubernetes 资源来管理和部署复杂的集群化应用。这种方式可以帮助你在生产环境中实现更加灵活、安全和可扩展的容器管理。
