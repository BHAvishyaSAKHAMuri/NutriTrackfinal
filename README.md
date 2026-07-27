# NutriTrack 🥗🏋️‍♂️

NutriTrack is a full-stack nutrition and fitness tracking web application that helps users monitor daily calorie intake, log workouts, plan meals, and get personalized AI-powered health advice — all in one place.

---

## ✨ Features

### 🥗 Nutrition & Meal Tracking
- **Daily Logging:** Log daily food intake with calorie and macronutrient details.
- **AI Meal Scanner:** Take or upload a photo of your meal and instantly get calorie estimates, protein, carbs, and fat breakdowns powered by AI vision.
- **Quick-Log Widget:** Fast meal entry right from the dashboard.

### 🤖 AI Health Assistant
- **Context-Aware Chat:** Built-in widget powered by Groq LLM that understands your health profile (goals, dietary restrictions, allergies, and fitness level).
- **Natural Language Logging:** Ask for meal suggestions, workout plans, or log activities through natural language.

### 🏋️ Workout Tracker
- **MET-Based Calculation:** Log exercises with duration and automatically calculate calories burned.
- **Multi-Sport Support:** Supports walking, running, cycling, swimming, HIIT, yoga, weight training, and more.
- **Daily Summary:** Track today's workouts on your main dashboard.

### 📊 BMI Calculator
- **Instant Breakdown:** Calculate Body Mass Index from height and weight.
- **Visual Scale:** *Underweight → Normal → Overweight → Obese → Severely Obese*.

### 📈 Progress Dashboard
- **Daily Summary:** Total calories consumed, calories burned, net calories, and workout minutes.
- **Weight Tracking:** Progress toward your goal weight.
- **Activity Logs:** Today's nutrition and workout activity logs.

### 🗓️ Meal Planner
- Personalized meal plans based on your calorie target and dietary preferences.

### 👤 User Profile
- Comprehensive health profile: weight, height, age, gender, activity level, diet type.
- Set health goals (*weight loss, muscle gain, maintenance*).
- Record allergies, medical conditions, food restrictions, and equipment available.

### 🔒 Authentication
- Google Sign-In with protected routes for all app features.

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite |
| **Routing** | Wouter |
| **Data Fetching** | TanStack React Query v5 |
| **UI Components** | Radix UI primitives + Tailwind CSS |
| **Animations** | Framer Motion |
| **Backend** | Express 5, TypeScript |
| **Database** | PostgreSQL + Drizzle ORM |
| **AI / LLM** | Groq SDK |
| **Image Processing** | Sharp |
| **Session Management** | express-session + connect-pg-simple |
| **Monorepo** | pnpm workspaces |

---

## 📁 Project Structure

```text
NutriTrack-main/
├── artifacts/
│   ├── figma-design/          # Main React + Vite frontend + Express backend
│   │   ├── client/src/
│   │   │   ├── pages/         # Route-level screens
│   │   │   ├── components/    # Reusable UI components (AiChatWidget, MealScanner, etc.)
│   │   │   ├── hooks/         # Custom React hooks (useAuth, etc.)
│   │   │   └── context/       # ChatContext for AI widget state
│   │   └── server/            # Express routes and API handlers
│   └── api-server/            # Shared API server (health check, base routes)
├── lib/
│   ├── api-spec/              # OpenAPI spec + Orval codegen config
│   ├── api-client-react/      # Generated React Query hooks
│   ├── api-zod/               # Generated Zod validation schemas
│   └── db/                    # Drizzle ORM schema and config
└── scripts/                   # Utility scripts
---

## 🌐 Pages & Routes

| Route | Page | Access |
| :--- | :--- | :--- |
| `/` | Landing / Frame screen | Public |
| `/login` | Sign in | Public |
| `/create-account` | Register | Public |
| `/forgot-password` | Password reset request | Public |
| `/reset-password` | Password reset | Public |
| `/signup` | Onboarding / profile setup | Protected |
| `/dashboard` | Daily summary, AI chat, meal scanner | Protected |
| `/meal-plan` | Personalized meal plan | Protected |
| `/workouts` | Workout logging | Protected |
| `/bmi` | BMI calculator | Protected |
| `/progress` | Health & fitness progress | Protected |

---

## 🚀 Getting Started

### Prerequisites
- Node.js v20+
- pnpm v9+
- A PostgreSQL database
- A Groq API key (for AI features)
- Google OAuth credentials (for authentication)

### Installation

```bash
# Clone the repository
git clone [https://github.com/BHAvishyaSAKHAMuri/NutriTrackfinal.git](https://github.com/BHAvishyaSAKHAMuri/NutriTrackfinal.git)
cd NutriTrackfinal/NutriTrack-main

# Install dependencies
pnpm install
