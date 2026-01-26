# How to Run the Project

1.  Open the project(ffa-admin) root directory in **Command Prompt** (cmd).

2.  Run the following command:

```{=html}
<!-- -->
```
    npm run dev -- --host 127.0.0.1 --strictPort --port 5173

3.  After the development server starts, open your browser and go to:

http://localhost:5173/

4.  Log in using the following credentials:

-   Username: adminZDS
-   Password: Zds123456

5.  Or just visit https://ffa-full-stack-back-office.vercel.app

## 🐳 Deployment with Docker

You can deploy this project using Docker. Ensure Docker and Docker Compose are installed on your machine.

### 1. Build and Run (Recommended)

Run the following command in the project root directory:

```bash
docker-compose up -d --build

The application will be accessible at: http://localhost:8080
