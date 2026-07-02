# sales-dm-hub

Production-ready sales automation webhook hub for Iranian e-commerce, built with Node.js and PostgreSQL.

## Features

- Webhook endpoint for inbound sales messages
- PostgreSQL-backed lead and message storage
- Persian intent classification
- Lead scoring and status assignment
- Modular production-ready project structure
- Input validation with Zod
- Structured logging with Pino

## Tech Stack

- Node.js
- Express.js
- PostgreSQL
- Zod
- Pino

## Project Structure
```text
src/
  config/
  constants/
  controllers/
  middlewares/
  repositories/
  routes/
  services/
  utils/
  validators/

## Prerequisites

- Node.js
- PostgreSQL
- npm

## Installation

bash
npm install

## Environment Variables

Create a `.env` file in the project root and set your environment variables.

Example:

env
PORT=3000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:password@localhost:5432/sales_dm_hub

## Run the Project

bash
npm start

Server runs on:

text
http://localhost:3000

## Webhook Endpoint

http
POST /webhook

## Sample Request

json
{
  "tenantId": 1,
  "lead": {
"externalId": "lead-1001",
"name": "Ali",
"phone": "09123456789"
  },
  "message": {
"direction": "inbound",
"content": "قیمت این محصول چنده؟"
  }
}

## Sample Response

json
{
  "success": true,
  "lead": {
"id": 1,
"score": 70,
"status": "hot"
  },
  "message": {
"intent": "price_inquiry",
"intent_confidence": 0.9
  }
}

## Lead Scoring

Lead score and status are calculated based on detected intent and message content.

Example:
- `price_inquiry` -> higher score
- hot lead -> high purchase intent
- cold lead -> low engagement

## Notes

- Make sure PostgreSQL is running before starting the server.
- Do not commit your real `.env` file.
- Use `.env.example` for sharing config structure.

## License

Private/internal use unless otherwise specified.


## بعد از ساخت
در ترمینال داخل همان پوشه این‌ها را بزن:
```powershell
& "C:\Program Files\Git\cmd\git.exe" add README.md
& "C:\Program Files\Git\cmd\git.exe" commit -m "docs: add project README"
& "C:\Program Files\Git\cmd\git.exe" push
