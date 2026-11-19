# Node.js Docker CI/CD Deploy Starter

A ready-to-copy setup for shipping a Node.js API to your own VPS. Every push to `main` runs the tests, builds a Docker image, pushes it to GitHub Container Registry and restarts the app on your server, with a health check at each step. Nginx sits in front with free SSL from Let's Encrypt.

Works on any Ubuntu VPS: DigitalOcean, AWS EC2 or Lightsail, Hetzner or Linode.

## How it works

```
push to main ──► CI: npm test ──► Docker build + smoke test
                                        │
                                        ▼
                     Deploy: push image to ghcr.io/<owner>/<repo>
                                        │
                                        ▼
                     SSH to server ──► docker compose pull && up -d ──► health check
                                        │
                        Nginx (80/443, SSL) ──► app on 127.0.0.1:3000
```

## What's inside

| Path | Purpose |
|---|---|
| `src/app.js`, `src/server.js` | Fastify API with `/health` and `/api/hello`, request validation and graceful shutdown |
| `test/app.test.js` | Tests using Node's built-in test runner and `fastify.inject` (no extra test dependencies) |
| `Dockerfile` | Small production image that runs as a non-root user with a built-in `HEALTHCHECK` |
| `.github/workflows/ci.yml` | Runs tests, builds the image and smoke-tests the container on every PR and push |
| `.github/workflows/deploy.yml` | After CI passes on `main`: pushes to GHCR, deploys over SSH, then verifies health |
| `deploy/docker-compose.yml` | Compose file used on the server; the app only listens on localhost |
| `deploy/nginx.conf` | Reverse proxy with gzip, WebSocket support and forwarded headers |

## Run locally

```bash
npm install
npm test
npm run dev           # http://localhost:3000/health
```

With Docker:

```bash
docker build -t my-api .
docker run -p 3000:3000 my-api
```

## One-time server setup

On a fresh Ubuntu server:

```bash
# Docker and Nginx
curl -fsSL https://get.docker.com | sh
sudo apt-get install -y nginx certbot python3-certbot-nginx

# Deploy user that can run Docker
sudo adduser --disabled-password deploy
sudo usermod -aG docker deploy
sudo mkdir -p /opt/app && sudo chown deploy:deploy /opt/app
# Add your CI public key to /home/deploy/.ssh/authorized_keys

# Nginx and SSL
sudo cp deploy/nginx.conf /etc/nginx/sites-available/app   # edit server_name first
sudo ln -s /etc/nginx/sites-available/app /etc/nginx/sites-enabled/app
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d api.example.com
```

## GitHub secrets

Add these under **Settings → Secrets and variables → Actions**:

| Secret | Value |
|---|---|
| `SSH_HOST` | Server IP or hostname |
| `SSH_USER` | `deploy` |
| `SSH_PRIVATE_KEY` | Private key matching the public key on the server |
| `GHCR_READ_TOKEN` | A GitHub token with `read:packages`, so the server can pull the image |

Push to `main` and watch the **Actions** tab. Each image is tagged with both `latest` and the commit SHA, so you can roll back by pointing `IMAGE` at an older SHA.

## Using it for your own app

1. Replace `src/` with your API (Express, NestJS or anything that listens on `PORT`).
2. Keep a `/health` endpoint, because CI and the deploy step both depend on it.
3. Add runtime environment variables to `deploy/docker-compose.yml`, or use an `env_file` on the server for secrets.

## Author

Built by [Ravi Roshan](https://github.com/raviroshanmehta), Lead Backend Engineer. [Get in touch on LinkedIn](https://www.linkedin.com/in/raviroshanmehta) if you need help with deployment or a backend project.
