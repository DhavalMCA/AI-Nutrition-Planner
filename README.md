# 🥗 AI Diet Planner

An AI-powered personalized Indian diet planner that generates **7-day meal plans** with full recipes, tailored to your body metrics, fitness goals, and dietary preferences.

![Python](https://img.shields.io/badge/Python-3.10+-blue?logo=python&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-Web_Framework-black?logo=flask)
![scikit-learn](https://img.shields.io/badge/scikit--learn-ML_Model-orange?logo=scikit-learn)
![Groq](https://img.shields.io/badge/Groq-LLaMA_3.3_70B-green)

---

## ✨ Features

- **ML-Powered Nutrition Prediction** — Random Forest Regressor predicts daily calorie, protein, carbs, and fat requirements based on your body profile.
- **AI-Generated Meal Plans** — Groq API (LLaMA 3.3 70B) creates personalized 7-day Indian meal plans with full recipes (ingredients + cooking steps).
- **Diet Type Support** — Vegetarian, Eggetarian, and Non-Vegetarian options.
- **Health Condition Awareness** — Optionally specify conditions (Diabetes, PCOS, etc.) to get disease-friendly meal recommendations.
- **BMI Calculation** — Automatically calculates BMI and adjusts the plan accordingly.
- **📄 PDF Export** — Download your complete 7-day meal plan as a professional PDF document.
- **🛒 Shopping List** — Auto-generated weekly shopping list with deduplicated ingredients.
- **Modern Glassmorphism UI** — Dark theme with neon accents, animated backgrounds, and responsive design.

---

## 🛠️ Tech Stack

| Layer        | Technology                                      |
| ------------ | ----------------------------------------------- |
| **Backend**  | Python, Flask                                   |
| **ML Model** | scikit-learn (Random Forest Regressor)           |
| **AI/LLM**   | Groq API — LLaMA 3.3 70B Versatile              |
| **Frontend** | HTML5, CSS3, JavaScript, Bootstrap 5             |
| **PDF**      | jsPDF (client-side PDF generation)               |
| **Design**   | Google Fonts (Outfit), Glassmorphism, Neon Glow  |

---

## 📂 Project Structure

```
Diet Planner/
├── app.py                  # Flask backend — routes, prediction, Groq API integration
├── model_training.py       # Synthetic data generation + Random Forest model training
├── nutrition_model.pkl     # Trained ML model (auto-generated if missing)
├── requirements.txt        # Python dependencies
├── .gitignore              # Hides API keys, venv, cache from version control
├── Api-2.txt               # Groq API key (not committed to version control)
├── templates/
│   ├── index.html          # Input form — user enters body metrics & preferences
│   └── result.html         # Result page — 7-day meal plan with recipes
└── static/
    ├── css/
    │   └── style.css       # Custom styles — dark theme, glassmorphism, neon effects
    └── js/
        └── script.js       # Form handling, API calls, PDF export, shopping list
```

---

## 🚀 Getting Started

### Prerequisites

- **Python 3.10+** installed
- A **Groq API key** (get one at [console.groq.com](https://console.groq.com))

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/your-username/diet-planner.git
   cd diet-planner
   ```

2. **Create a virtual environment (recommended):**

   ```bash
   python -m venv venv
   venv\Scripts\activate        # Windows
   # source venv/bin/activate   # macOS/Linux
   ```

3. **Install dependencies:**

   ```bash
   pip install -r requirements.txt
   ```

4. **Add your Groq API key:**

   Create a file named `Api-2.txt` in the project root and paste your Groq API key:

   ```
   gsk_your_api_key_here
   ```

5. **Run the application:**

   ```bash
   python app.py
   ```

6. **Open in browser:**

   ```
   http://localhost:5000
   ```

---

## ⚙️ How It Works

### 1. User Input (Frontend)

The user fills out a form with:

| Field              | Description                                     |
| ------------------ | ----------------------------------------------- |
| Age                | 15–100 years                                    |
| Gender             | Male / Female                                   |
| Height             | In centimeters                                  |
| Weight             | In kilograms                                    |
| Activity Level     | Sedentary → Very Active (5 levels)              |
| Fitness Goal       | Weight Loss / Maintenance / Weight Gain         |
| Diet Preference    | Vegetarian / Eggetarian / Non-Vegetarian        |
| Health Conditions  | Optional (e.g., Diabetes, PCOS, Thyroid)        |

### 2. ML Prediction Engine (Backend)

The prediction engine follows a scientifically-backed pipeline:

```
User Input → BMI → BMR (Mifflin-St Jeor) → TDEE → Goal Calories → Macros → Meal Plan
```

#### BMR — Mifflin-St Jeor Equation

| Gender | Formula |
|--------|---------|
| **Male** | `BMR = (10 × W) + (6.25 × H) − (5 × A) + 5` |
| **Female** | `BMR = (10 × W) + (6.25 × H) − (5 × A) − 161` |

#### TDEE — Activity Multipliers

| Activity Level | Multiplier |
|----------------|------------|
| Sedentary      | 1.2        |
| Light          | 1.375      |
| Moderate       | 1.55       |
| Very Active    | 1.725      |
| Athlete        | 1.9        |

#### Goal-Based Calorie & Macro Targets

| Goal | Calories | Protein | Fat | Carbs |
|------|----------|---------|-----|-------|
| 🔴 **Weight Loss** | TDEE − 500 | 2.0–2.2 g/kg | 20–25% of cal | Remaining |
| 🟢 **Maintenance** | TDEE | 1.2–1.6 g/kg | 25–30% of cal | Remaining |
| 🔵 **Weight Gain** | TDEE + 300–500 | 1.6–2.0 g/kg | 30–35% of cal | Remaining |

#### BMI-Based Overrides

| Condition | Override |
|-----------|----------|
| BMI < 18.5 + Weight Gain | Fat = 35%, Protein = 2.0 g/kg |
| BMI > 25 + Weight Loss | Fat = 20%, Protein = 2.2 g/kg |

#### Age-Based Adjustments (Age > 40)

- Protein increased by **+5%**
- Carbs reduced by **−10%**

#### Macro Conversion Formulas

```
Protein (cal) = Protein (g) × 4
Fat (cal)     = Total Calories × Fat%
Fat (g)       = Fat (cal) ÷ 9
Carbs (cal)   = Total Calories − (Protein cal + Fat cal)
Carbs (g)     = Carbs (cal) ÷ 4
```

### 3. AI Meal Plan Generation (Groq API)

The predicted nutritional values are sent to **Groq's LLaMA 3.3 70B** model with a detailed prompt that:

- Requests a **7-day meal plan** (5 meals/day: Breakfast, Mid-Morning Snack, Lunch, Evening Snack, Dinner)
- Enforces dietary constraints (Veg/Egg/Non-Veg)
- Accounts for health conditions
- Returns structured **JSON** with full recipes (ingredients + cooking steps)
- All meals are **authentic Indian dishes**

### 4. Result Display

The result page renders:
- **⚠️ Medical Disclaimer** — AI-generated plan legal notice
- **BMI & daily macro targets** (calories, protein, carbs, fat)
- **7-day tabbed meal plan** with day-by-day navigation
- **Recipe cards** for each meal showing:
  - Dish name
  - Diet type badge (🟢 Veg / 🟡 Egg / 🔴 Non-Veg)
  - Disease-friendly status (✅ Safe / ⚠️ Caution)
  - Ingredients list with quantities
  - Step-by-step cooking instructions
- **📄 Download PDF** — Export full plan as a professional PDF
- **🛒 Shopping List** — Combined weekly ingredients with deduplication

---

## 🤖 Model Details

| Parameter            | Value                          |
| -------------------- | ------------------------------ |
| Algorithm            | Random Forest Regressor        |
| Estimators           | 200 trees                      |
| Max Depth            | 10                             |
| Training Samples     | 6,000 (synthetic)              |
| Features             | Age, Gender, Height, Weight, BMI, Activity Level, Goal |
| Targets              | Calories, Protein, Carbs, Fat  |
| BMR Formula          | Mifflin-St Jeor Equation       |
| Activity Multipliers | 1.2 (Sedentary) → 1.9 (Athlete) |

---

## 📡 API Endpoints

| Method | Endpoint    | Description                                  |
| ------ | ----------- | -------------------------------------------- |
| GET    | `/`         | Serves the input form page                   |
| GET    | `/result`   | Serves the result/meal plan page             |
| POST   | `/predict`  | Accepts user data (JSON), returns diet plan  |

### POST `/predict` — Request Body

```json
{
  "age": 25,
  "gender": 1,
  "height": 170,
  "weight": 70,
  "activity_level": 2,
  "fitness_goal": 1,
  "diet_type": "Vegetarian",
  "health_condition": "None"
}
```

### POST `/predict` — Response

```json
{
  "success": true,
  "metrics": {
    "bmi": 24.2,
    "calories": 2200,
    "protein": 98,
    "carbs": 275,
    "fat": 70
  },
  "diet_plan": {
    "Day1": {
      "Breakfast": {
        "name": "Poha with Peanuts",
        "diet_type": "Veg",
        "disease_friendly": true,
        "ingredients": ["1 cup flattened rice", "2 tbsp peanuts", "..."],
        "steps": ["Wash poha and drain", "Heat oil and add mustard seeds", "..."]
      },
      "MidMorningSnack": { "..." },
      "Lunch": { "..." },
      "EveningSnack": { "..." },
      "Dinner": { "..." }
    },
    "Day2": { "..." },
    "...": "..."
  },
  "diet_type": "Vegetarian",
  "disease": "None"
}
```

---

## 🎨 UI Design

- **Theme:** Dark mode (`#0f172a` base) with animated gradient background
- **Style:** Glassmorphism with `backdrop-filter: blur(16px)`
- **Font:** [Outfit](https://fonts.google.com/specimen/Outfit) from Google Fonts
- **Effects:** Neon text glow, hover animations, smooth transitions
- **Responsive:** Full Bootstrap 5 grid with mobile-optimized layouts

---

## 📋 Dependencies

```
Flask
scikit-learn
pandas
numpy
groq
```

Install all with:

```bash
pip install -r requirements.txt
```

---

## ⚠️ Disclaimer

This application generates diet plans using AI and machine learning. It is developed as part of an **academic (MTech) project** and is intended for **educational use only**. The meal plans are AI-generated and should **not** be considered medical or nutritional advice. Please consult a qualified dietician or healthcare professional before making dietary changes.

---

## ⚠️ Important Notes

- The `Api-2.txt` file containing your Groq API key should **never** be committed to version control — it's in `.gitignore`.
- The ML model (`nutrition_model.pkl`) is auto-trained on first run if not found.
- The synthetic training data uses scientifically-backed formulas (Mifflin-St Jeor, BMI-based overrides, age adjustments).
- AI-generated meal plans are for **informational purposes only** — consult a medical professional for clinical dietary needs.

---

## 👤 Author

**Dhaval Prajapati**

---

## 📄 License

This project is for educational and personal use.
#   A I - N u t r i t i o n - P l a n n e r  
 