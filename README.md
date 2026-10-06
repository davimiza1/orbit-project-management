# Orbit

A production-oriented MERN project management workspace.

**Live app:** https://orbit-project-management.pages.dev

## Deployment

The React workspace is deployed from `client/dist` to Cloudflare Pages. The Express API remains a separately deployable Node.js service.

## Run locally

1. Copy `server/.env.example` to `server/.env`.
2. Start MongoDB locally or update `MONGODB_URI`.
3. Run `npm install` and then `npm run dev`.

The React app runs on `http://localhost:5173`; the API runs on `http://localhost:5000`.

## Included

- Responsive project board and task detail workflow
- Create, search, filter, and move tasks
- Express REST API with validation and centralized errors
- JWT authentication endpoints and protected task routes
- MongoDB models for users, workspaces, projects, and tasks
- Seed/demo fallback so the interface remains usable before MongoDB is configured
