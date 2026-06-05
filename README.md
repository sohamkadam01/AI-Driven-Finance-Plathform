# AI-Driven Finance Platform

A full-stack personal finance management system powered by AI — built with React 19, Spring Boot 3, Python FastAPI (OCR), and a multi-tier LLM chatbot.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite + Tailwind CSS + Framer Motion + Recharts |
| Backend | Spring Boot 3 + Spring Security + JWT + JPA/Hibernate + MySQL 8 |
| OCR Microservice | Python FastAPI + EasyOCR + PaddleOCR + Tesseract + OpenCV |
| AI / LLM | Ollama (local, qwen2.5:3b) → OpenRouter API (cloud fallback) |
| Real-Time | WebSocket + SSE streaming |

---

## Features

- **Dashboard** — Net Worth, Savings Rate, Financial Health Score, Budget Progress, Cash Flow charts
- **Transactions** — Add, filter, categorize income and expenses
- **OCR Receipt Scanner** — Upload JPEG/PNG/PDF receipts; AI auto-extracts merchant, amount, date, category
- **SmartBot Chatbot** — Natural-language financial queries with 3-tier LLM fallback and SSE streaming
- **Anomaly Detection** — Flags unusual spending with LOW → CRITICAL severity grading
- **Budget Planner** — Set limits per category, track utilisation, get real-time alerts
- **Investment Portfolio** — Track holdings, view AI-generated investment advice
- **Predictions** — Hybrid pipeline (Ollama → OpenRouter → Statistical math) for expense forecasting
- **Bill Reminders** — Recurring payment tracking with WebSocket due-date alerts
- **Financial Health Scoring** — 0–100 score computed from savings rate, budget adherence, and net worth

---

## Project Structure

```
finance-project/
├── project/                  # Spring Boot 3 backend (port 8080)
│   └── src/main/java/com/College_project/project/
│       ├── controller/       # REST controllers
│       ├── service/          # 35+ business logic services
│       ├── models/           # 16 JPA entities
│       ├── repository/       # Spring Data JPA repositories
│       ├── security/         # JWT filter + SecurityConfig
│       ├── config/           # WebSocket, CORS config
│       └── enums/            # AlertType, TransactionType, etc.
├── my-react-app/             # React 19 + Vite frontend (port 5173)
│   └── src/
│       ├── components/       # Dashboard, Transactions, Budgets, etc.
│       ├── services/         # Axios API client
│       └── assets/           # Images and icons
└── python_ORC_SYSTEM/        # Python FastAPI OCR microservice (port 8000)
    └── ocr_service.py        # EasyOCR + PaddleOCR + Tesseract pipeline
```

---

## Getting Started

### Prerequisites

- Java 17+
- Node.js 18+
- Python 3.9+
- MySQL 8
- [Ollama](https://ollama.com) installed locally

### 1. Database

```sql
CREATE DATABASE finance_db;
```

### 2. Backend (Spring Boot)

```bash
cd project
cp src/main/resources/application.properties.example src/main/resources/application.properties
# Fill in your DB credentials, API keys, etc.
mvn spring-boot:run
```

### 3. Frontend (React)

```bash
cd my-react-app
npm install
npm run dev
```

### 4. OCR Microservice (Python)

```bash
cd python_ORC_SYSTEM
python -m venv venv
venv\Scripts\activate      # Windows
pip install -r requirements.txt
uvicorn ocr_service:app --host 0.0.0.0 --port 8000
```

### 5. Ollama (Local LLM)

```bash
ollama pull qwen2.5:3b
ollama serve
```

---

## Environment Setup

Copy `project/src/main/resources/application.properties.example` to `application.properties` and set:

| Key | Description |
|---|---|
| `spring.datasource.username` | MySQL username |
| `spring.datasource.password` | MySQL password |
| `app.jwtSecret` | Strong random string (min 64 chars) |
| `spring.ai.openai.api-key` | Your OpenRouter API key |
| `spring.mail.username` | Gmail address for email alerts |
| `spring.mail.password` | Gmail app password |

---

## License

MIT
