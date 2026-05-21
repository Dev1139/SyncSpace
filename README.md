# SyncSpace

<p align="center">
  <img src="./apps/frontend/public/SyncSpace.png" width="90" alt="SyncSpace Logo" />
</p>

<p align="center">
  <b>Realtime collaborative workspace platform built with CRDTs, WebSockets, and modern full-stack architecture.</b>
</p>

<p align="center">
  Create collaborative workspaces, edit documents in realtime, and synchronize changes across multiple users with low latency.
</p>

---

# Table of Contents

- [Overview](#overview)
- [Demo](#demo)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Realtime Collaboration](#realtime-collaboration)
- [Authentication System](#authentication-system)
- [Workspace System](#workspace-system)
- [Document System](#document-system)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Local Development](#local-development)
- [Prisma Commands](#prisma-commands)
- [Deployment](#deployment)
- [API Overview](#api-overview)
- [WebSocket Events](#websocket-events)
- [Current Status](#current-status)
- [Roadmap](#roadmap)
- [Performance Goals](#performance-goals)
- [Known Limitations](#known-limitations)
- [Contributing](#contributing)
- [License](#license)

---

# Overview

SyncSpace is a realtime collaborative workspace platform inspired by collaborative editing systems like Google Docs and Notion.

The project focuses on:
- scalable realtime synchronization
- modular backend architecture
- collaborative document editing
- persistent synchronization
- multi-user workspace systems
- production-oriented deployment

SyncSpace uses:
- WebSockets for realtime communication
- Yjs CRDTs for conflict-free collaboration
- PostgreSQL for persistence
- NestJS for backend architecture
- React + TipTap for the editor experience

The goal of the project is to build a modern collaboration platform with scalable realtime infrastructure and extensible workspace architecture.

---

# Demo

## Frontend
```text
https://your-frontend.vercel.app
```

## Backend
```text
https://your-backend.onrender.com
```

---

# Features

# Authentication
- JWT-based authentication
- User registration
- User login
- Protected routes
- Persistent session handling

---

# Workspace Management
- Create workspaces
- Workspace membership system
- Role-based access control
- Shared workspace collaboration

---

# Document Management
- Create documents
- Delete documents
- Rename documents
- Search documents
- Persistent document storage

---

# Realtime Collaboration
- Multi-user collaborative editing
- Realtime title synchronization
- Shared Yjs collaborative state
- WebSocket synchronization
- Conflict-free updates
- Automatic persistence
- Multi-client synchronization
- Realtime collaboration awareness

---

# Deployment
- Frontend deployment on Vercel
- Backend deployment on Render
- PostgreSQL hosted on Neon

---

# Architecture

SyncSpace follows a modular realtime collaboration architecture.

```text
┌──────────────────────┐
│      Frontend        │
│ React + TipTap + Yjs │
└──────────┬───────────┘
           │
           │ HTTP + WebSocket
           ▼
┌──────────────────────┐
│      Backend         │
│       NestJS         │
├──────────────────────┤
│ Authentication       │
│ Workspace Module     │
│ Document Module      │
│ Realtime Module      │
│ Prisma ORM           │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│     PostgreSQL       │
│        Neon          │
└──────────────────────┘
```

---

# Tech Stack

# Frontend
- React
- TypeScript
- Vite
- TipTap Editor
- Context API

---

# Backend
- NestJS
- Prisma ORM
- PostgreSQL
- JWT Authentication
- Class Validator
- WebSockets

---

# Realtime Layer
- Yjs
- CRDT synchronization
- Shared collaborative state
- WebSocket broadcasting

---

# Infrastructure
- Neon PostgreSQL
- Render
- Vercel

---

# Realtime Collaboration

The realtime system is built using:
- Yjs CRDTs
- WebSocket synchronization
- Shared collaborative document state

---

# Realtime Flow

```text
User Input
    │
    ▼
TipTap Editor
    │
    ▼
Yjs Shared State
    │
    ▼
WebSocket Broadcast
    │
    ▼
Connected Clients
    │
    ▼
Database Persistence
```

---

# Why Yjs?

Yjs provides:
- conflict-free collaboration
- efficient synchronization
- shared distributed state
- offline-friendly architecture
- low-latency updates

This allows multiple users to edit the same document simultaneously without overwriting each other’s changes.

---

# Authentication System

SyncSpace uses JWT-based authentication.

---

# Authentication Flow

```text
User Login/Register
        │
        ▼
Credential Validation
        │
        ▼
JWT Token Generated
        │
        ▼
Frontend Stores Token
        │
        ▼
Authenticated API Requests
        │
        ▼
Authenticated WebSocket Access
```

---

# Protected Routes

Authenticated endpoints require:

```http
Authorization: Bearer <token>
```

---

# Workspace System

Workspaces are collaborative containers that organize:
- users
- documents
- permissions
- realtime collaboration

Each workspace supports:
- multiple members
- collaborative editing
- role-based access
- shared synchronization

---

# Document System

Each document supports:
- collaborative editing
- realtime updates
- persistence
- synchronization recovery

---

# Persistence Strategy

Document state is:
1. synchronized using Yjs
2. broadcast using WebSockets
3. persisted to PostgreSQL
4. restored after reconnect or refresh

This ensures document recovery after:
- page refreshes
- reconnects
- temporary disconnects
- server restarts

---

# Project Structure

```text
apps/
├── backend/
│   ├── src/
│   │   ├── common/
│   │   │   ├── filters/
│   │   │   ├── interceptors/
│   │   │   └── guards/
│   │   │
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── workspace/
│   │   │   ├── document/
│   │   │   └── realtime/
│   │   │
│   │   ├── prisma/
│   │   │   ├── prisma.module.ts
│   │   │   └── prisma.service.ts
│   │   │
│   │   ├── realtime/
│   │   │   └── ws.server.ts
│   │   │
│   │   ├── app.module.ts
│   │   └── main.ts
│   │
│   └── prisma/
│       └── schema.prisma
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── editor/
│   │   └── constants/
│   │
│   └── public/
```

---

# Environment Variables

# Backend

Create:
```text
apps/backend/.env
```

Add:

```env
DATABASE_URL=
FRONTEND_URL=
JWT_SECRET=
PORT=
```

---

# Frontend

Create:
```text
apps/frontend/.env
```

Add:

```env
VITE_API_URL=
VITE_WS_URL=
```

---

# Local Development

# Clone Repository

```bash
git clone <repository-url>
cd syncspace
```

---

# Install Dependencies

```bash
pnpm install
```

---

# Backend Setup

```bash
cd apps/backend
pnpm run start:dev
```

Backend runs on:
```text
http://localhost:3000
```

---

# Frontend Setup

```bash
cd apps/frontend
pnpm run dev
```

Frontend runs on:
```text
http://localhost:5173
```

---

# Prisma Commands

# Generate Prisma Client

```bash
npx prisma generate --schema=src/prisma/schema.prisma
```

---

# Push Schema

```bash
npx prisma db push --schema=src/prisma/schema.prisma
```

---

# Open Prisma Studio

```bash
npx prisma studio --schema=src/prisma/schema.prisma
```

---

# Deployment

# Frontend Deployment

Frontend is deployed on Vercel.

Required frontend environment variables:

```env
VITE_API_URL=
VITE_WS_URL=
```

---

# Backend Deployment

Backend is deployed on Render.

Required backend environment variables:

```env
DATABASE_URL=
FRONTEND_URL=
JWT_SECRET=
PORT=
```

---

# Database

Database is hosted on Neon PostgreSQL.

---

# API Overview

# Authentication

## Register
```http
POST /auth/register
```

## Login
```http
POST /auth/login
```

---

# Workspace

## Create Workspace
```http
POST /workspace
```

## Get Workspaces
```http
GET /workspace
```

---

# Documents

## Create Document
```http
POST /workspace/:workspaceId/documents
```

## Get Documents
```http
GET /workspace/:workspaceId/documents
```

## Update Title
```http
PATCH /documents/:documentId/title
```

---

# WebSocket Events

# Client → Server

```text
join-document
document-update
title-update
```

---

# Server → Client

```text
document-updated
title-updated
document-created
document-deleted
```

---

# Current Status

# Completed
- Authentication system
- Workspace management
- Membership system
- Realtime collaboration
- Yjs synchronization
- Persistent collaborative editing
- Deployment pipeline
- Multi-client synchronization

---

# In Progress
- Reconnect improvements
- Better error handling
- Collaborative awareness improvements
- Editor optimizations

---

# Roadmap

# Collaboration
- Live cursors
- Typing indicators
- User avatars
- Rich collaborative presence

---

# Documents
- Version history
- Comments and mentions
- File attachments
- Export system

---

# Infrastructure
- Redis pub/sub
- Horizontal scaling
- Background jobs
- Monitoring and analytics

---

# Performance Goals

The project is designed with focus on:
- low-latency synchronization
- efficient collaborative updates
- scalable modular architecture
- realtime consistency
- production-oriented deployment

---

# Known Limitations

Current limitations include:
- single-server realtime architecture
- no Redis scaling layer yet
- no offline persistence layer
- limited reconnect recovery
- advanced presence system still in progress

---

# Contributing

This project is currently under active development.

Future contribution guidelines and issue tracking will be added later.

---

# License

This project is currently private and under active development.
