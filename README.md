# 🧬 DISCIPLINE MATRIX | Habit Tracker

A production-grade, deterministic habit tracking application designed for high-performance individuals. Built on the MERN stack with a focus on behavioral psychology and data-driven discipline scoring.

![Banner](https://images.unsplash.com/photo-1506784911325-180766981440?q=80&w=2670&auto=format&fit=crop)

## 🎯 The Core Philosophy
Unlike standard habit trackers that focus on simple binary streaks, **Discipline Matrix** treats discipline as a multi-layer behavioral metric. The system distinguishes between raw engagement (Activity) and quantitative achievement (Success), providing a realistic view of your growth.

---

## 🔥 Key Features

### 1. The Discipline Matrix Engine
A deterministic scoring algorithm that calculates your overall discipline level (0–100) based on three strict weighted pillars:
- **Consistency (50%)**: Long-term monthly hit-rate.
- **Streak (30%)**: Continuous momentum normalized against time.
- **Momentum (20%)**: Behavioral trend velocity.

### 2. Multi-Layer Behavioral Analytics
The system breaks down your performance into three distinct layers:
- **Activity Status**: Distinguishes between "No Activity" (0 tasks), "In Progress" (1–69%), and "Active/Success" (≥70%).
- **Blended Projections**: A predictive logic that estimates your final weekly score by blending current performance with a neutral expectation for remaining days.
- **Momentum Scaling**: A stable trend-detection engine that uses ±10% pre-clamped thresholds to avoid "flickering" status changes early in the week.

### 3. Precision Visualizations
- **Month Timeline**: A high-fidelity, 4-shade green heatmap reflecting intensity levels for every day of the month.
- **Weekly Performance**: Real-time efficiency bars showing success hit-rates.
- **Progress Rings**: High-contrast SVG progress trackers with neon aesthetics and glassmorphism.

### 4. Smart Insight Engine
Automated behavioral analysis that provides context-aware feedback:
- Detects elite rhythms.
- Identifies declining trends before they break streaks.
- Provides motivational prompts based on current "Active" status.

---

## 🛠️ Tech Stack

**Frontend:**
- **Core**: React 19 (Vite)
- **Styling**: Tailwind CSS 4.0
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Icons**: Lucide React / React Icons

**Backend:**
- **Runtime**: Node.js
- **Framework**: Express (v5)
- **Database**: MongoDB (Mongoose)
- **Auth**: JWT & Bcrypt

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas or local instance

### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   # Root
   npm install
   # Client
   cd client && npm install
   # Server
   cd ../server && npm install
   ```

3. Setup Environment Variables:
   Create a `.env` in the `server` directory:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   ```

4. Run the application:
   ```bash
   # Server (from server folder)
   npm run dev
   # Client (from client folder)
   npm run dev
   ```

---

## 🧮 How is the Score Calculated?

The system uses a strict deterministic formula:
```javascript
DisciplineScore = (monthConsistency * 0.5) + (streakScore * 0.3) + (momentumScore * 0.2)
```

**Status Legend:**
- **Improving**: Momentum score > 55
- **Stable**: Momentum score between 45–55
- **Declining**: Momentum score < 45

---

## 🛡️ License
Distributed under the ISC License. See `LICENSE` for more information.
