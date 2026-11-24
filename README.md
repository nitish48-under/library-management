# Library Management System

A simple full-stack MERN-style library project (React + Vite, Express, MongoDB).

## Features
- Add, view, search, edit and delete books
- Track total and available copies
- Issue and return books
- Dashboard counts

## Requirements
Node.js 18+ and MongoDB (local MongoDB or MongoDB Atlas).

## Run
1. Open this folder in VS Code.
2. In `server`, copy `.env.example` to `.env` and set `MONGODB_URI`.
3. Open a terminal in the project root and run:
   ```bash
   npm install
   npm run install:all
   npm run dev
   ```
4. Open the Vite URL shown in the terminal (usually http://localhost:5173).

Backend runs at http://localhost:5000.

## API
- `GET /api/books?q=search`
- `POST /api/books`
- `PUT /api/books/:id`
- `DELETE /api/books/:id`
- `PATCH /api/books/:id/issue`
- `PATCH /api/books/:id/return`

This is an academic starter project. Add authentication, member records and due-date/fine tracking before using it in a real library.
