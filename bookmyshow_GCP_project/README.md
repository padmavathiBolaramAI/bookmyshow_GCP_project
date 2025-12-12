# BookMyShow — Scalable Prototype

This repository contains a simplified BookMyShow prototype and infra artifacts for a scalability project.

## Structure
- user_code/frontend: static frontend (index.html, styles.css, script.js, config.js)
- docker-compose.usercode.yml: local compose to serve frontend + proxy
- infra/: nginx config, terraform snippets
- tests/: locust load test scripts

## Quick start (local)
1. Start your backend API (assumed to be available at http://localhost:3000 and named 'backend' in Docker network)
2. Run: `docker compose -f docker-compose.yml -f docker-compose.usercode.yml up --build`
3. Open http://localhost:8080

## Notes
- Configure API_HOST in `user_code/frontend/config.js` for direct backend calls when not using the proxy.
- The frontend falls back to static sample events if backend is unavailable.
