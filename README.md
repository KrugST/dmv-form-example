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

## Quick Start

From the repo root:

```bash
npm start
```

This starts both apps:

- Backend API: `http://localhost:3000`
- Frontend UI: `http://localhost:5173`

## Run

Run everything together:

```bash
npm start
```

Run only backend:

```bash
npm run start:backend
```

Run only frontend:

```bash
npm run start:frontend
```

Build both apps:

```bash
npm run build
```

## Environment Variables

Optional variables you can set:

- Backend:
  - `PORT` (default: `3000`)
  - `FRONTEND_ORIGIN` (default: `http://localhost:5173`)
- Frontend:
  - `VITE_API_BASE_URL` (default: `http://localhost:3000`)

## API

### `POST /reg-156/pdf`

- Accepts JSON payload for REG-156 fields
- Validates request body using `class-validator`
- Returns a generated `application/pdf` file as attachment
- You need to click "Save Response" and save as PDF if you want to view that file

Minimal `curl` smoke test:

```bash
curl -X POST "http://localhost:3000/reg-156/pdf" \
  -H "Content-Type: application/json" \
  --output reg-156-filled.pdf \
  -d '{
    "vehicle": { "licensePlate": "8ABC123", "vin": "1HGCM82633A123456" },
    "owner": { "trueFullName": "Jane Doe", "dlNumber": "D1234567" },
    "address": {
      "physicalAddress": "123 Main St",
      "city": "Sacramento",
      "state": "CA",
      "zipCode": "95814"
    },
    "contact": { "email": "jane@example.com", "areaCode": "916", "phoneNumber": "555-1234" },
    "requestedItems": { "licensePlates": true },
    "reason": { "lost": true },
    "replacementCount": {},
    "additionalRequest": {},
    "certification": { "signature": "Jane Doe" }
  }'
```

Windows PowerShell (`curl.exe`) equivalent:

```powershell
curl.exe -X POST "http://localhost:3000/reg-156/pdf" `
  -H "Content-Type: application/json" `
  --output reg-156-filled.pdf `
  -d "{\"vehicle\":{\"licensePlate\":\"8ABC123\",\"vin\":\"1HGCM82633A123456\"},\"owner\":{\"trueFullName\":\"Jane Doe\",\"dlNumber\":\"D1234567\"},\"address\":{\"physicalAddress\":\"123 Main St\",\"city\":\"Sacramento\",\"state\":\"CA\",\"zipCode\":\"95814\"},\"contact\":{\"email\":\"jane@example.com\",\"areaCode\":\"916\",\"phoneNumber\":\"555-1234\"},\"requestedItems\":{\"licensePlates\":true},\"reason\":{\"lost\":true},\"replacementCount\":{},\"additionalRequest\":{},\"certification\":{\"signature\":\"Jane Doe\"}}"
```

## Troubleshooting

- If PDF generation fails with a Python error, verify:
  - `python --version` works
  - `pip install -r backend/scripts/requirements.txt` completed successfully
- If frontend cannot reach backend, verify:
  - Backend is running on `http://localhost:3000`
  - `VITE_API_BASE_URL` points to the correct API URL

## Design Notes

- The source DMV PDF is encrypted and uses form fields that are not reliably writable with common Node-only PDF libraries.
- To preserve use of the actual template field names, the NestJS service calls a small Python script (`backend/scripts/fill_reg156.py`) that writes directly into the template's form fields.
- Backend DTOs are nested by domain areas (`vehicle`, `owner`, `address`, etc.) to keep the payload maintainable and explicit.
- Frontend does lightweight client validation before submission, while backend validation remains the source of truth.
