---
title: "How to Containerize a Legacy Web Application | School of Freelancing"
author: "Karim (Masum)"
date: 2026-09-01
description: "Step-by-step guide to containerizing legacy web applications with Docker and Docker Compose: Dockerfile creation, multi-stage builds, and production deployment."
---

## Overview

This guide teaches containerizing existing web applications with Docker. You'll create a Dockerfile, build optimized images, and deploy with Docker Compose — enabling reliable, scalable deployments.

## Prerequisites

- Docker installed on your development machine
- Your web application source code (Node.js, Python, PHP, etc.)
- Basic familiarity with your application's dependencies

## Step 1: Create a Dockerfile

Create a `Dockerfile` in your application's root directory:

```
# How to Containerize a Legacy Web Application | School of Freelancing
FROM node:20-alpine

## Set working directory
WORKDIR /app

## Copy package files
COPY package*.json ./

## Install dependencies
RUN npm install --only=production

## Copy application code
COPY . .

## Expose port
EXPOSE 3000

## Health check
HEALTHCHECK --interval=30s CMD curl -f http://localhost:3000/health || exit 1

## Start application
CMD ["npm", "start"]
```

## Step 2: Build the Docker Image

```
docker build -t myapp:1.0 .
```

Test locally:

```
docker run -p 3000:3000 myapp:1.0
```

## Step 3: Create Docker Compose

Create `docker-compose.yml` for multi-container orchestration:

```
version: '3.8'
services:
 web:
 build: .
 ports:
 - "3000:3000"
 environment:
 - NODE_ENV=production
 - DATABASE_URL=postgresql://user:password@db:5432/app
 depends_on:
 - db
 restart: always
 volumes:
 - ./logs:/app/logs

 db:
 image: postgres:15-alpine
 environment:
 - POSTGRES_USER=user
 - POSTGRES_PASSWORD=password
 - POSTGRES_DB=app
 volumes:
 - db_data:/var/lib/postgresql/data
 restart: always

 nginx:
 image: nginx:alpine
 ports:
 - "80:80"
 - "443:443"
 volumes:
 - ./nginx.conf:/etc/nginx/nginx.conf
 - /etc/letsencrypt:/etc/letsencrypt
 depends_on:
 - web
 restart: always

volumes:
 db_data:
```

## Step 4: Deploy to Production

```
docker-compose up -d
```

Verify all services running:

```
docker-compose ps
```

## Step 5: SSL/HTTPS Configuration

Install Certbot on the host and mount certificates into the nginx container:

```
sudo certbot certonly --standalone -d yourdomain.com
```

## Next Steps

- Implement health checks and monitoring
- Set up automated backups for database containers
- Deploy to production servers with Compose
- Implement container logging and monitoring

Learn more in our [Docker Training](/freelancing-training/docker-training/) program.
