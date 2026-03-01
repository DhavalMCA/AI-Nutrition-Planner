🥗 AI Diet Planner

AI Diet Planner is an AI-powered web application that generates personalized 7-day Indian meal plans based on user body metrics, fitness goals, dietary preferences, and health conditions.

🚀 Features

ML-based daily calorie & macro prediction

AI-generated 7-day Indian meal plans

Veg / Eggetarian / Non-Veg support

Health condition-aware diet planning

Automatic BMI calculation

Weekly shopping list generation

PDF export of full meal plan

Responsive Glassmorphism UI

🛠️ Tech Stack
Layer	Technology
Backend	Python, Flask
ML Model	Random Forest Regressor
AI Model	Groq LLaMA 3.3 70B
Frontend	HTML, CSS, JavaScript, Bootstrap
PDF	jsPDF
📂 Project Structure
Diet Planner/
│
├── app.py
├── model_training.py
├── nutrition_model.pkl
├── requirements.txt
├── Api-2.txt
│
├── templates/
│   ├── index.html
│   └── result.html
│
└── static/
    ├── css/style.css
    └── js/script.js
⚙️ How It Works
Step 1: User Input

User enters:

Age

Gender

Height

Weight

Activity Level

Fitness Goal

Diet Preference

Health Condition

Step 2: Nutrition Prediction Pipeline
User Input
↓
BMI Calculation
↓
BMR (Mifflin-St Jeor Equation)
↓
TDEE Calculation
↓
Goal-based Calories
↓
Macro Distribution
↓
Meal Plan Generation
BMR Formula

Male

BMR = (10 × W) + (6.25 × H) − (5 × A) + 5

Female

BMR = (10 × W) + (6.25 × H) − (5 × A) − 161
TDEE Activity Multipliers
Activity Level	Multiplier
Sedentary	1.2
Light	1.375
Moderate	1.55
Very Active	1.725
Athlete	1.9
Goal-Based Targets
Goal	Calories	Protein	Fat
Weight Loss	TDEE − 500	2.0–2.2 g/kg	20–25%
Maintenance	TDEE	1.2–1.6 g/kg	25–30%
Weight Gain	TDEE + 300–500	1.6–2.0 g/kg	30–35%
Macro Conversion
Protein Cal = Protein(g) × 4
Fat Cal     = Total Calories × Fat%
Fat(g)      = Fat Cal ÷ 9
Carbs Cal   = Total − (Protein Cal + Fat Cal)
Carbs(g)    = Carbs Cal ÷ 4
🤖 AI Meal Plan Generation

Predicted nutritional targets are sent to:

Groq LLaMA 3.3 70B Model

Which generates:

7-Day Meal Plan

5 Meals per Day

Full Ingredients List

Cooking Instructions

Disease-Friendly Meals

📡 API Endpoint
POST /predict
Request
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
📋 Installation
1. Clone Repository
git clone https://github.com/your-username/diet-planner.git
cd diet-planner
2. Create Virtual Environment
python -m venv venv
venv\Scripts\activate
3. Install Dependencies
pip install -r requirements.txt
4. Add Groq API Key

Create:

Api-2.txt

Paste your Groq API key inside it.

5. Run Application
python app.py

Open:

http://localhost:5000
⚠️ Disclaimer

This project is developed for academic purposes.
The generated diet plans are AI-based and should not be considered professional medical advice.

👤 Author

Dhaval Prajapati
