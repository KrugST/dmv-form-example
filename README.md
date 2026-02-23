# DMV REG-156 Filler (NestJS + React)

This project is a full-stack app for filling California DMV form **REG-156** ("Application for Replacement Plates, Stickers, Documents") and downloading a generated PDF.

## Tech Stack

- Backend: TypeScript + NestJS (`backend`)
- Frontend: TypeScript + React + Vite (`frontend`)
- PDF fill engine: Python `pypdf` (called by the NestJS backend)

## Prerequisites

- Node.js 20+
- npm 10+
- Python 3.10+ available as `python`

## Install

From the repo root:

```bash
npm install
```

Install Python dependencies:

```bash
pip install -r backend/scripts/requirements.txt
```

## Run

From the repo root:

```bash
npm start
```

This starts:

- Backend API on `http://localhost:3000`
- Frontend UI on `http://localhost:5173`

## API

### `POST /reg-156/pdf`

- Accepts JSON payload for REG-156 fields
- Validates request body using `class-validator`
- Returns a generated `application/pdf` file as attachment

## Design Notes

- The source DMV PDF is encrypted and uses form fields that are not reliably writable with common Node-only PDF libraries.
- To preserve use of the actual template field names, the NestJS service calls a small Python script (`backend/scripts/fill_reg156.py`) that writes directly into the template's form fields.
- Backend DTOs are nested by domain areas (`vehicle`, `owner`, `address`, etc.) to keep the payload maintainable and explicit.
- Frontend does lightweight client validation before submission, while backend validation remains the source of truth.
