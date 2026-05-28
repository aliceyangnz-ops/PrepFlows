# PrepFlows — System Design Documentation

## Overview

* Product vision
* Hospitality workflow platform
* AI operational automation

---

# System Architecture

## Monorepo Structure

```text
artifacts/
lib/
.github/
docs/
```

## Application Flow

```text
Mobile App
    ↓
API Server
    ↓
Supabase
    ↓
Realtime Sync
```

---

# Technology Stack

## Frontend

* Expo SDK 54
* React Native 0.81
* React 19
* Vite
* Tailwind CSS v4

## Backend

* Node.js
* Express 5
* Drizzle ORM
* Zod
* Pino

## Infrastructure

* Supabase
* Stripe
* GitHub Actions
* EAS Build
* Replit
* Vercel

---

# Database Design

## Core Tables

* users
* functions
* prep_lists
* schedules
* subscriptions
* teams

## ORM

* Drizzle ORM
* PostgreSQL via Supabase

---

# API Architecture

## Main Endpoints

### Authentication

```http
POST /auth/login
POST /auth/register
```

### Billing

```http
POST /billing/create-checkout
POST /billing/webhook
GET /billing/subscription
```

### AI

```http
POST /ai/parse
POST /prep/generate
```

---

# Stripe Subscription System

## Plans

| Plan     | Price |
| -------- | ----- |
| Starter  | $9    |
| Pro      | $29   |
| Business | $79   |

## Billing Flow

```text
User
 ↓
Stripe Checkout
 ↓
Webhook
 ↓
Supabase Sync
 ↓
Feature Access
```

## Required Webhooks

* checkout.session.completed
* customer.subscription.updated
* customer.subscription.deleted
* invoice.paid
* invoice.payment_failed

---

# CI/CD Architecture

## Workflows

| Workflow       | Purpose            |
| -------------- | ------------------ |
| lint.yml       | Code quality       |
| deploy-api.yml | Backend validation |
| eas-build.yml  | Mobile builds      |

## Deployment Flow

```text
GitHub Push
     ↓
GitHub Actions
     ↓
Validation
     ↓
Deploy
```

---

# Deployment

## API

* Replit

## Web

* Vercel

## Mobile

* Expo EAS

---

# AI System

## Smart Import

Supports:

* OCR
* Text parsing
* Menu extraction
* Workflow generation

## AI Layer

* GPT-4o parsing
* Rule-based fallback engine

---

# Environment Variables

```env
SUPABASE_URL=
SUPABASE_ANON_KEY=
STRIPE_SECRET_KEY=
OPENAI_API_KEY=
EXPO_TOKEN=
```

---

# Branding

* Product: PrepFlows
* URL Scheme: prepflows://
* Primary Color: #EAB308

---

# License

Private — all rights reserved
