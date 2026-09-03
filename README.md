# MerchantMind — AI Growth & Agentic Commerce
> **Razorpay Buildathon 2026 — Track 01 Submission**  
> *"Grow the merchant's revenue, and make them sellable to AI buyers"*  
> **Architecture**: 100% Full-Stack Next.js 14 + Node.js + TypeScript

---

## 🌟 Executive Summary

**MerchantMind** is an Autonomous Commerce Platform built directly on Razorpay's APIs. In the emerging era of agentic commerce and protocols like NPCI's UAP, ACP, AP2, and x402, MerchantMind enables autonomous AI buyers and human consumers to transact in natural language while maximizing merchant revenue through intelligent upselling and automated marketing campaigns.

Built as a **unified full-stack Next.js and Node.js application**, MerchantMind eliminates multi-server complexity: a single runtime orchestrates the frontend, autonomous agents, and Razorpay API routes.

---

## 🎯 Track 01 Requirements & "The Bar" Checklist

| Requirement | Implementation in MerchantMind | Status |
|---|---|:---:|
| **Conversational In-App Checkout** | Natural language checkout agent that parses buyer intent and automatically creates Razorpay orders | ✅ Met |
| **Agent-Readable Catalog** | Semantic, structured schema representation of inventory with AI-powered search & reasoning | ✅ Met |
| **Upsell & Cross-Sell Agent** | Autonomous recommendation engine suggesting complementary products upon checkout | ✅ Met |
| **Campaign Orchestrator** | Multi-channel (Email, SMS, Social) marketing generator backed by automated Razorpay Payment Links | ✅ Met |
| **The Bar: Explainable** | Every action logs an explicit explainability narrative and agent reasoning to the audit database | ✅ Met |
| **The Bar: Bounded & Gated** | Order amounts are strictly computed server-side; payment links are immutable and gated against tampering | ✅ Met |
| **The Bar: Audit Trail** | Interactive audit timeline (`/audit`) capturing timestamps, agent IDs, actions, I/O payloads, and status | ✅ Met |
| **The Bar: Graceful Failure** | Unresolvable or ambiguous intent is caught gracefully, explained clearly to the buyer, and audited as `FAILED` with diagnostics | ✅ Met |

---

## 🏗️ Architecture (Full-Stack Next.js + Node.js)

```
┌────────────────────────────────────────────────────────────────────────┐
│               MerchantMind Unified Next.js 14 Application              │
│                                                                        │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │                        Frontend Layer                          │   │
│   │  • KPI Analytics Dashboard           • Conversational Checkout │   │
│   │  • Agent-Readable Catalog View       • Campaign Orchestrator   │   │
│   │  • Real-Time Audit Trail Timeline                              │   │
│   └───────────────────────────────┬────────────────────────────────┘   │
│                                   │ Next.js App Router                 │
│   ┌───────────────────────────────▼────────────────────────────────┐   │
│   │                     Server & Agent API Routes                  │   │
│   │  • /api/checkout        → CheckoutAgent (Intent + Razorpay)    │   │
│   │  • /api/checkout/upsell → UpsellAgent (Affinity basket graph)  │   │
│   │  • /api/catalog/search  → CatalogAgent (Semantic query)        │   │
│   │  • /api/campaigns       → CampaignAgent (Copy + Payment Links) │   │
│   │  • /api/audit           → Immutable Ledger Engine              │   │
│   └───────────────┬────────────────┬─────────────────┬─────────────┘   │
└───────────────────┼────────────────┼─────────────────┼─────────────────┘
                    │                │                 │
           ┌────────▼───────┐ ┌──────▼────────┐ ┌──────▼────────┐
           │ Razorpay SDK   │ │  Gemini / AI  │ │ Audit Ledger  │
           │ (Orders &      │ │  (or built-in │ │ (Immutable    │
           │  Payment Links)│ │   heuristics) │ │  JSON store)  │
           └────────────────┘ └───────────────┘ └───────────────┘
```

---

## 🤖 The 4 Autonomous Agents

### 1. 🛒 Conversational Checkout Agent (`checkoutAgent.ts`)
- **What it does**: Parses natural language purchase requests (e.g., *"I want to buy Sony headphones"* or *"Get me 2 startup books"*).
- **How it works**: Identifies product, category, and quantity. Validates item availability against catalog, computes price server-side, and generates a Razorpay Order (`order_...`).
- **Revenue growth**: Automatically feeds into the Upsell Agent to expand basket size.

### 2. 🛍️ Upsell & Cross-Sell Agent (`upsellAgent.ts`)
- **What it does**: Boosts Average Order Value (AOV) by identifying high-affinity complementary products.
- **How it works**: Analyzes direct accessory affinities (e.g., headphones → USB-C charger) and category pairings.

### 3. 📢 Campaign Orchestrator Agent (`campaignAgent.ts`)
- **What it does**: Selects merchandise, targets specific personas (Students, Professionals, Fitness), and creates copy for Email, SMS, or Social Media.
- **Autonomous payment gating**: Generates and embeds unique Razorpay Payment Links (`plink_...`) directly inside the generated copy.

### 4. 📦 Agent-Readable Catalog Agent (`catalogAgent.ts`)
- **What it does**: Exposes merchant inventory in a machine-transactable schema.
- **Natural language discovery**: Interprets loose queries (e.g., *"gadgets for deep work"*) and explains match reasoning.

---

## 🛡️ Security & Financial Safeguards ("The Bar")

1. **Gated Execution**: Payment parameters (amount, currency, merchant receipt) are computed strictly server-side. No buyer or LLM can manipulate transaction totals.
2. **Explainability by Design**: Every single agent decision writes a clear human-readable justification into the audit ledger:
   ```json
   {
     "agent": "checkout_agent",
     "action": "checkout_order_created",
     "explainability": "Parsed 'I want to buy Sony headphones' with 90% confidence. Created bounded Razorpay order order_mock_abc123 for ₹24,999 (Quantity: 1). Price verified against catalog to prevent tampering."
   }
   ```
3. **Graceful Failure Handling**: When an intent cannot be resolved (e.g., *"I want to buy a spaceship"*), the agent does not crash. It creates a structured `FAILED` audit record with diagnostic reasoning, informs the user with clarifying suggestions, and bounds the failure safely.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js 18+ and npm installed

### Option A: One-Click Launch (Windows)
Double-click `start.bat` in the project root folder.

### Option B: Terminal Command
```bash
npm install
npm run dev
```

Open [**http://localhost:3000**](http://localhost:3000) in your browser.

---

## ⚙️ Configuration (`.env.example`)

Copy `.env.example` to `.env.local` if you wish to use your real Razorpay test keys or Gemini API key:

```env
# Optional: Razorpay Test Mode Keys (runs in Mock Mode if not provided)
RAZORPAY_KEY_ID=rzp_test_your_key_here
RAZORPAY_KEY_SECRET=your_secret_here

# Optional: Gemini API Key (runs in Heuristic AI Mode if not provided)
GEMINI_API_KEY=your_gemini_key_here
```

> **Zero Friction Guarantee**: If no API keys are provided, the project automatically runs in built-in **Smart Mock Mode**! Both Razorpay orders and AI reasoning operate seamlessly without requiring paid keys.

---

## 🧪 Demo Script for Judges / Interviewers

1. **Dashboard (`/`)**: View live agent activity metrics, active agents, and overview of system integrity.
2. **Checkout Agent (`/checkout`)**:
   - Type: `"I want to buy Sony headphones"`
   - Observe real-time order generation with Razorpay order ID and amount in INR.
   - See the Upsell Agent recommend complementary items (e.g., AirPods or Anker Charger).
   - Test graceful failure: Type `"Buy me a flying rocket"` → Observe clean fallback guidance and error handling.
3. **Agent-Readable Catalog (`/catalog`)**:
   - Search: `"something for healthy cooking"` → See AI match the Air Fryer with natural language explanation.
4. **Campaign Orchestrator (`/campaigns`)**:
   - Select 2 products → Pick "Email" or "Social" → Click "Create Campaign".
   - View generated marketing copy and corresponding Razorpay Payment Links.
5. **Audit Trail (`/audit`)**:
   - Inspect the immutable audit log displaying every step, explainability narrative, input, output, and execution status.

---

## 🏆 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript & Node.js
- **Payment Gateway**: Official `razorpay` Node SDK
- **Styling**: Tailwind CSS with Razorpay obsidian/blue brand palette
- **Icons & UI**: Lucide Icons, Recharts
