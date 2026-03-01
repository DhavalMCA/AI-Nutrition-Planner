import os
import json
import pickle
from flask import Flask, render_template, request, jsonify
from groq import Groq
import pandas as pd
from model_training import train_model

app = Flask(__name__)

# ================================
# LOAD GROQ API KEY FROM Api.txt
# ================================
def load_api_key():
    try:
        with open("Api-2.txt", "r") as f:
            key = f.read().strip()

            if not key.startswith("gsk_"):
                raise Exception("Invalid Groq API Key Format!")

            return key

    except FileNotFoundError:
        raise Exception("Api.txt not found in project root!")

    except Exception as e:
        raise Exception(f"API Key Error: {str(e)}")

api_key = load_api_key()
client = Groq(api_key=api_key)

# ================================
# LOAD OR TRAIN MODEL
# ================================
try:
    with open('nutrition_model.pkl', 'rb') as f:
        model = pickle.load(f)
except FileNotFoundError:
    print("Model not found. Training model now...")
    train_model()
    with open('nutrition_model.pkl', 'rb') as f:
        model = pickle.load(f)

# ================================
# ROUTES
# ================================
@app.route('/')
def home():
    return render_template('index.html')

@app.route('/result')
def result():
    return render_template('result.html')

# ================================
# PREDICTION ROUTE
# ================================
@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        
        age = int(data.get('age', 25))
        gender = int(data.get('gender', 0))
        height = float(data.get('height', 165))
        weight = float(data.get('weight', 65))
        activity_level = int(data.get('activity_level', 1))
        goal = int(data.get('fitness_goal', 1))

        # BMI
        bmi = weight / ((height / 100) ** 2)

        # Feature dataframe with correct column names matching model training
        feature_df = pd.DataFrame(
            [[age, gender, height, weight, bmi, activity_level, goal]],
            columns=['Age', 'Gender', 'Height', 'Weight', 'BMI', 'ActivityLevel', 'Goal']
        )
        
        predictions = model.predict(feature_df)[0]
        cals, protein, carbs, fat = predictions

        diet_type = data.get('diet_type', 'Vegetarian')
        disease = data.get('health_condition', 'None')

        # ================================
        # PROMPT
        # ================================
        diet_type_label = diet_type
        if diet_type == "NonVeg":
            diet_type_label = "Non-Veg"
        elif diet_type == "Eggetarian":
            diet_type_label = "Egg"

        constraints = ""
        if diet_type == "Vegetarian":
            constraints += "Strictly Vegetarian. No eggs, no chicken, no fish, no meat. "
        elif diet_type == "Eggetarian":
            constraints += "Eggetarian. Eggs allowed. No chicken, no fish, no meat. "
        elif diet_type == "NonVeg":
            constraints += "Non-Vegetarian. Chicken, fish, eggs allowed. "

        disease_note = ""
        if disease and disease.lower() != "none":
            constraints += f"User has {disease}. Avoid harmful foods. "
            disease_note = f'Set "disease_friendly" to true for safe meals and false for potentially risky ones for a person with {disease}.'
        else:
            disease_note = 'Set "disease_friendly" to true for all meals.'

        system_prompt = f"""
You are an expert AI Dietician specialized in Indian cuisine.

Generate a personalized 7-DAY Indian meal plan with FULL RECIPES for each meal.

Return STRICTLY in this JSON format (no markdown, no explanation, only valid JSON):
{{
  "Day1": {{
    "Breakfast": {{
      "name": "Dish Name",
      "diet_type": "{diet_type_label}",
      "disease_friendly": true,
      "ingredients": ["ingredient 1 with quantity", "ingredient 2 with quantity"],
      "steps": ["Step 1 description", "Step 2 description"]
    }},
    "MidMorningSnack": {{ ... same structure ... }},
    "Lunch": {{ ... same structure ... }},
    "EveningSnack": {{ ... same structure ... }},
    "Dinner": {{ ... same structure ... }}
  }},
  "Day2": {{ ... }},
  "Day3": {{ ... }},
  "Day4": {{ ... }},
  "Day5": {{ ... }},
  "Day6": {{ ... }},
  "Day7": {{ ... }}
}}

Rules:
- Each day MUST have exactly 5 meals: Breakfast, MidMorningSnack, Lunch, EveningSnack, Dinner
- Each meal must have: name (string), diet_type (string), disease_friendly (boolean), ingredients (array of strings with quantities), steps (array of strings)
- "diet_type" must be one of: "Veg", "Egg", "Non-Veg"
- {disease_note}
- Make each day varied — do not repeat the same meals across days
- All meals should be authentic Indian dishes
- No markdown, no explanation. Only valid JSON.
"""

        user_prompt = f"""
Create a 7-day meal plan with:

Daily Target:
- Calories: {cals:.0f} kcal
- Protein: {protein:.0f} g
- Carbs: {carbs:.0f} g
- Fat: {fat:.0f} g

Dietary Constraints: {constraints}
"""

        # ================================
        # GROQ API CALL
        # ================================
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.7,
            max_tokens=8192,
            top_p=1,
            stream=False
        )

        diet_plan_raw = response.choices[0].message.content.strip()

        # CLEAN JSON
        if diet_plan_raw.startswith("```json"):
            diet_plan_raw = diet_plan_raw[7:]
        if diet_plan_raw.startswith("```"):
            diet_plan_raw = diet_plan_raw[3:]
        if diet_plan_raw.endswith("```"):
            diet_plan_raw = diet_plan_raw[:-3]
        diet_plan_raw = diet_plan_raw.strip()

        diet_plan = json.loads(diet_plan_raw)

        return jsonify({
            'success': True,
            'metrics': {
                'bmi': round(bmi, 1),
                'calories': round(cals),
                'protein': round(protein),
                'carbs': round(carbs),
                'fat': round(fat)
            },
            'diet_plan': diet_plan,
            'diet_type': diet_type_label,
            'disease': disease
        })

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# ================================
# MAIN
# ================================
if __name__ == '__main__':
    os.makedirs('templates', exist_ok=True)
    os.makedirs('static/css', exist_ok=True)
    os.makedirs('static/js', exist_ok=True)
    
    app.run(debug=True, port=5000)