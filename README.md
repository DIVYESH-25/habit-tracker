# Elite Habit Tracker

A production-grade, deterministic MERN stack application designed to track discipline and habits with senior-level analytics and premium aesthetics.

## 🚀 Key Features

### 📊 Senior Analytics Engine
- **Discipline Score (0-100)**: A proprietary weighted metric based on **Consistency (50%)**, **Streak (30%)**, and **Momentum (20%)**.
- **Fixed Weekly Analytics**: Precise data-driven tracking using a 7-day fixed denominator for accurate performance mapping.
- **Interactive Heatmap**: Visual representation of long-term consistency and habit density.
- **Smart Insights**: AI-driven analysis of habit improvements and stability trends.

### 🛡️ Core Functionality
- **Automated Reset System**: Intelligent monthly and yearly summary generation with automated record pruning.
- **Idempotent Data Integrity**: Built-in protection against duplicate records and UTC date drift.
- **Elite Seeding**: Environment-aware data seeding for rapid development and testing (removable for production).

### 🎨 Premium UI/UX
- **Modern Glassmorphism**: High-end aesthetic using dark mode, vibrant neon accents, and subtle glass effects.
- **Micro-Animations**: Fluid transitions and interactive feedback powered by **Framer Motion**.
- **Responsive Architecture**: Fully optimized for mobile, tablet, and desktop viewports.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 (Vite)
- **Styling**: TailwindCSS 4
- **Animations**: Framer Motion
- **Icons**: Lucide React & React Icons
- **Charts**: Recharts
- **State Management**: React Context API

### Backend
- **Runtime**: Node.js (CommonJS)
- **Framework**: Express 5
- **Database**: MongoDB Atlas (Mongoose 9)
- **Security**: JWT & Bcrypt
- **Environment**: Dotenvx / Dotenv

---

## 📂 Project Structure

```text
habit-tracker/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI molecules
│   │   ├── services/       # API integration (Axios)
│   │   ├── context/        # Auth & Global state
│   │   └── pages/          # Full page views
├── server/                 # Node.js backend
│   ├── models/             # Mongoose schemas
│   ├── routes/             # Express API endpoints
│   ├── services/           # Business logic (Analytics/Automation)
│   └── config/             # Database connection
└── README.md
```

---

## ⚡ Quick Start

### 1. Prerequisites
- Node.js (v18+)
- MongoDB Atlas Account

### 2. Environment Setup
Create a `.env` file in the `server/` directory:
```env
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_secure_jwt_key
NODE_ENV=development
```

### 4. Installation & Execution

#### Backend
```bash
cd server
npm install
npm run dev
```

#### Frontend
```bash
cd client
npm install
npm run dev
```

Access the application at [http://localhost:5173/](http://localhost:5173/)

---

## ⚖️ Analytics Logic

### Discipline Score Calculation
The engine calculates your score using the following weights:
- **Consistency**: Successful days (>=70% completion) / Total days tracked.
- **Streak Score**: Current continuous streak / Max possible streak (capped at 30 days).
- **Momentum**: Week-over-week improvement trend across the last 4 weeks.

### Weekly Logic
Unlike standard trackers, this system uses a **fixed 7-day denominator** for in-progress weeks. This prevents "fake" 100% scores when a week has just started, providing a realistic progress-to-goal metric.

---

## 📝 License
Distributed under the ISC License. See `LICENSE` for more information.
