# 💰 AI-Driven Finance Platform

> A full-stack AI-powered personal finance management platform that helps users track expenses, manage budgets, scan receipts using OCR, receive AI-powered financial insights, predict future spending, and improve financial health through intelligent analytics.

---

# 🚀 Overview

The **AI-Driven Finance Platform** is an intelligent personal finance management system built using **Spring Boot**, **React**, **Python FastAPI**, and modern AI technologies.

It enables users to manage income and expenses, monitor budgets, analyze spending behavior, receive AI-generated financial recommendations, scan receipts using OCR, predict future expenses, and visualize financial health through an interactive dashboard.

The platform integrates multiple AI services including OCR, anomaly detection, predictive analytics, and an intelligent financial chatbot to provide a smarter financial management experience.

---

# ✨ Core Features

## 📊 Interactive Financial Dashboard

Monitor your financial health through a modern dashboard.

Features include:

* Net Worth
* Monthly Income
* Monthly Expenses
* Savings Rate
* Cash Flow Analysis
* Financial Health Score
* Budget Utilization
* Spending Trends
* Interactive Charts
* Category-wise Expense Breakdown

---

## 💳 Transaction Management

Easily manage daily finances.

Features:

* Add Income
* Add Expenses
* Edit Transactions
* Delete Transactions
* Filter by Date
* Search Transactions
* Category Management
* Transaction History
* Monthly Reports

---

## 🧾 AI Receipt Scanner (OCR)

Automatically extract transaction details from receipts.

Supported formats:

* JPG
* PNG
* PDF

Extracts:

* Merchant Name
* Amount
* Date
* Category
* Payment Information

Powered by:

* EasyOCR
* PaddleOCR
* Tesseract
* OpenCV

---

## 🤖 AI Financial Assistant

An intelligent chatbot capable of answering finance-related questions using multiple LLM providers.

Capabilities:

* Spending analysis
* Budget recommendations
* Financial summaries
* Investment suggestions
* Transaction explanations
* Savings advice
* Expense categorization

Supports real-time streaming responses.

---

## 🧠 Multi-Provider AI Pipeline

Automatic provider fallback ensures high availability.

```text id="h31xy7"
Ollama (Local)
        │
Unavailable
        ▼
OpenRouter
        │
Unavailable
        ▼
Statistical Prediction Engine
```

Supported Models:

* qwen2.5:3b (Ollama)
* OpenRouter Models

---

## 📈 AI Expense Prediction

Predict future financial behavior using historical spending patterns.

Features:

* Monthly expense forecasting
* Budget forecasting
* Spending trend analysis
* Future cash flow estimation
* Category-wise prediction

---

## 🚨 Smart Anomaly Detection

Automatically detect unusual spending behavior.

Severity Levels:

* 🟢 Low
* 🟡 Medium
* 🟠 High
* 🔴 Critical

Examples:

* Abnormally large purchases
* Unexpected spending spikes
* Budget overrun detection
* Irregular transaction patterns

---

## 💵 Budget Planner

Manage budgets intelligently.

Features:

* Category-wise budgets
* Budget progress tracking
* Remaining budget calculation
* Budget utilization charts
* Overspending alerts
* Monthly planning

---

## 📈 Investment Portfolio

Track investments and monitor portfolio growth.

Features:

* Portfolio overview
* Holdings management
* Investment allocation
* Performance tracking
* AI-generated investment insights

---

## 🔔 Smart Bill Reminder System

Never miss recurring payments.

Features:

* Due-date reminders
* Recurring bill tracking
* WebSocket notifications
* Email reminders
* Payment history

---

## ❤️ Financial Health Score

Generate an overall financial wellness score (0–100).

Calculated using:

* Savings Rate
* Budget Adherence
* Income Stability
* Expense Ratio
* Net Worth
* Spending Behavior

Provides personalized recommendations to improve financial health.

---

# 🛠 Tech Stack

## Frontend

* React 19
* Vite
* Tailwind CSS
* Framer Motion
* Recharts
* Axios

---

## Backend

* Java 17
* Spring Boot 3
* Spring Security
* JWT Authentication
* Spring Data JPA
* Hibernate
* MySQL

---

## AI & Machine Learning

* Ollama
* OpenRouter
* Predictive Analytics
* Financial Insights Engine

---

## OCR Microservice

* Python FastAPI
* EasyOCR
* PaddleOCR
* Tesseract OCR
* OpenCV

---

## Real-Time Communication

* WebSockets
* Server-Sent Events (SSE)

---

# 🏗 High-Level Architecture

```text id="gdzxjj"
               React Frontend
                      │
                      ▼
            Spring Boot Backend
                      │
      ┌───────────────┼────────────────┐
      ▼               ▼                ▼
 MySQL Database   AI Services     WebSocket/SSE
                      │
      ┌───────────────┼────────────────┐
      ▼               ▼                ▼
 OCR Service     LLM Manager   Prediction Engine
      │               │                │
      ▼               ▼                ▼
EasyOCR       Ollama/OpenRouter   Financial Analytics
PaddleOCR
Tesseract
```

---

# 📂 Project Structure

```text id="vwkwyn"
finance-platform/
│
├── backend/
│   ├── controller/
│   ├── service/
│   ├── repository/
│   ├── models/
│   ├── security/
│   ├── config/
│   ├── websocket/
│   └── prediction/
│
├── frontend/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── hooks/
│   └── assets/
│
├── ocr-service/
│   ├── ocr_service.py
│   ├── models/
│   └── utils/
│
├── screenshots/
│
└── README.md
```

---

# 📸 Key Modules

* 📊 Financial Dashboard
* 💳 Transaction Manager
* 🧾 OCR Receipt Scanner
* 🤖 AI Financial Chatbot
* 📈 Expense Prediction
* 🚨 Anomaly Detection
* 💵 Budget Planner
* 📈 Investment Portfolio
* 🔔 Bill Reminder System
* ❤️ Financial Health Score

---

# 🚀 Future Enhancements

* 📱 Mobile Application
* 🏦 Bank Account Integration
* 💳 Automatic Transaction Sync
* 📄 AI Tax Report Generation
* 📊 Personalized Financial Goals
* 🤝 Family Expense Sharing
* 🌍 Multi-Currency Support
* 📈 Stock Market Integration
* 🪙 Cryptocurrency Portfolio Tracking
* 🎤 Voice-Based Financial Assistant
* 🔐 Biometric Authentication
* ☁️ Cloud Deployment with Docker & Kubernetes

---

# 👨‍💻 Author

**Soham Kadam**

* GitHub: https://github.com/sohamkadam01
* LinkedIn: https://linkedin.com/in/kadamsoham0015

---

# ⭐ Support

If you found this project useful, consider giving it a **⭐ Star** on GitHub. Your support helps improve the project and motivates future development.
