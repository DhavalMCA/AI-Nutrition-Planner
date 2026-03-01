document.addEventListener('DOMContentLoaded', () => {

    const dietForm = document.getElementById('dietForm');
    if (dietForm) {
        dietForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            // UI State
            document.getElementById('errorMessage').classList.add('d-none');
            dietForm.classList.add('d-none');
            document.getElementById('loader').classList.remove('d-none');

            // Data
            const data = {
                age: document.getElementById('age').value,
                gender: document.getElementById('gender').value,
                height: document.getElementById('height').value,
                weight: document.getElementById('weight').value,
                activity_level: document.getElementById('activity_level').value,
                fitness_goal: document.getElementById('fitness_goal').value,
                diet_type: document.getElementById('diet_type').value,
                health_condition: document.getElementById('health_condition').value || 'None'
            };

            try {
                const response = await fetch('/predict', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });

                const result = await response.json();

                if (result.success) {
                    sessionStorage.setItem('dietResult', JSON.stringify(result));
                    window.location.href = '/result';
                } else {
                    throw new Error(result.error || 'Failed to generate diet plan.');
                }

            } catch (err) {
                document.getElementById('loader').classList.add('d-none');
                dietForm.classList.remove('d-none');
                const errorEl = document.getElementById('errorMessage');
                errorEl.textContent = "Error: " + err.message;
                errorEl.classList.remove('d-none');
            }
        });
    }

    // =========================================
    // RESULT PAGE LOGIC
    // =========================================
    const resultContainer = document.getElementById('resultContainer');
    if (resultContainer) {
        const resultString = sessionStorage.getItem('dietResult');
        if (!resultString) {
            window.location.href = '/';
            return;
        }

        const resultData = JSON.parse(resultString);

        // Populate metrics
        document.getElementById('val-bmi').innerText = resultData.metrics.bmi;
        document.getElementById('val-cals').innerText = resultData.metrics.calories + ' kcal';
        document.getElementById('val-pro').innerText = resultData.metrics.protein + ' g';
        document.getElementById('val-car').innerText = resultData.metrics.carbs + ' g';
        document.getElementById('val-fat').innerText = resultData.metrics.fat + ' g';

        // User Info Badges
        const badgesEl = document.getElementById('userInfoBadges');
        if (badgesEl) {
            const dietType = resultData.diet_type || '';
            const disease = resultData.disease || 'None';

            const dietIcon = dietType === 'Veg' ? '🟢' : dietType === 'Egg' ? '🟡' : '🔴';
            badgesEl.innerHTML = `
                <span class="info-badge">${dietIcon} ${dietType} Diet</span>
                ${disease && disease.toLowerCase() !== 'none'
                    ? `<span class="info-badge disease-badge">🏥 ${disease} Friendly Plan</span>`
                    : `<span class="info-badge safe-badge">✅ No Health Restrictions</span>`
                }
            `;
        }

        // =========================================
        // 7-DAY PLAN RENDERING
        // =========================================
        const dietPlan = resultData.diet_plan;
        const dayTabs = document.getElementById('dayTabs');
        const dayContents = document.getElementById('dayContents');

        const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

        const mealMeta = {
            'Breakfast': { title: '🌅 Breakfast', icon: '☕' },
            'MidMorningSnack': { title: '🥤 Mid-Morning Snack', icon: '🍎' },
            'Lunch': { title: '🍛 Lunch', icon: '🍽️' },
            'EveningSnack': { title: '🫖 Evening Snack', icon: '🍪' },
            'Dinner': { title: '🌙 Dinner', icon: '🥘' }
        };

        const mealOrder = ['Breakfast', 'MidMorningSnack', 'Lunch', 'EveningSnack', 'Dinner'];

        // Build tabs and content
        let dayIndex = 0;
        for (const [dayKey, meals] of Object.entries(dietPlan)) {
            // Tab
            const tab = document.createElement('button');
            tab.className = 'day-tab' + (dayIndex === 0 ? ' active' : '');
            tab.setAttribute('data-day', dayKey);
            tab.innerHTML = `<span class="day-num">Day ${dayIndex + 1}</span><span class="day-name">${dayNames[dayIndex] || ''}</span>`;
            tab.addEventListener('click', () => switchDay(dayKey));
            dayTabs.appendChild(tab);

            // Content
            const dayDiv = document.createElement('div');
            dayDiv.className = 'day-content' + (dayIndex === 0 ? ' active' : '');
            dayDiv.id = `content-${dayKey}`;

            for (const mealKey of mealOrder) {
                const meal = meals[mealKey];
                if (!meal) continue;

                const meta = mealMeta[mealKey] || { title: mealKey, icon: '🍽️' };
                dayDiv.innerHTML += buildMealCard(meal, meta);
            }

            dayContents.appendChild(dayDiv);
            dayIndex++;
        }

        // Show container
        resultContainer.classList.remove('d-none');

        // =========================================
        // SHOPPING LIST GENERATOR
        // =========================================
        buildShoppingList(dietPlan);

        // =========================================
        // PDF EXPORT
        // =========================================
        const pdfBtn = document.getElementById('downloadPdfBtn');
        if (pdfBtn) {
            pdfBtn.addEventListener('click', () => generatePDF(resultData));
        }
    }

    // =========================================
    // HELPER: Build Meal Card HTML
    // =========================================
    function buildMealCard(meal, meta) {
        const dietBadge = getDietBadge(meal.diet_type);
        const safeBadge = meal.disease_friendly
            ? '<span class="recipe-badge safe">✅ Safe</span>'
            : '<span class="recipe-badge caution">⚠️ Caution</span>';

        const ingredientsList = (meal.ingredients || [])
            .map(ing => `<li>${ing}</li>`)
            .join('');

        const stepsList = (meal.steps || [])
            .map((step, i) => `<li><span class="step-number">${i + 1}</span>${step}</li>`)
            .join('');

        return `
            <div class="recipe-card">
                <div class="recipe-header">
                    <div class="recipe-title-section">
                        <div class="recipe-meal-type">${meta.title}</div>
                        <div class="recipe-name">${meal.name || 'Unnamed Dish'}</div>
                    </div>
                    <div class="recipe-badges">
                        ${dietBadge}
                        ${safeBadge}
                    </div>
                </div>

                <div class="recipe-body">
                    <div class="recipe-section">
                        <div class="recipe-section-title">🧾 Ingredients</div>
                        <ul class="ingredient-list">${ingredientsList || '<li>No ingredients listed</li>'}</ul>
                    </div>
                    <div class="recipe-section">
                        <div class="recipe-section-title">👨‍🍳 How to Cook</div>
                        <ol class="step-list">${stepsList || '<li>No steps listed</li>'}</ol>
                    </div>
                </div>
            </div>
        `;
    }

    // =========================================
    // HELPER: Diet Type Badge
    // =========================================
    function getDietBadge(type) {
        if (type === 'Veg') return '<span class="recipe-badge veg">🟢 Veg</span>';
        if (type === 'Egg') return '<span class="recipe-badge egg">🟡 Egg</span>';
        if (type === 'Non-Veg') return '<span class="recipe-badge nonveg">🔴 Non-Veg</span>';
        return '<span class="recipe-badge">' + (type || 'Unknown') + '</span>';
    }

    // =========================================
    // DAY TAB SWITCHING
    // =========================================
    function switchDay(dayKey) {
        // Update tabs
        document.querySelectorAll('.day-tab').forEach(t => t.classList.remove('active'));
        document.querySelector(`.day-tab[data-day="${dayKey}"]`).classList.add('active');

        // Update content
        document.querySelectorAll('.day-content').forEach(c => c.classList.remove('active'));
        document.getElementById(`content-${dayKey}`).classList.add('active');
    }

    // =========================================
    // SHOPPING LIST BUILDER
    // =========================================
    function buildShoppingList(dietPlan) {
        const section = document.getElementById('shoppingListSection');
        const content = document.getElementById('shoppingListContent');
        const toggleBtn = document.getElementById('toggleShoppingList');

        if (!section || !content) return;

        // Parse all ingredients
        const allIngredients = [];
        for (const [dayKey, meals] of Object.entries(dietPlan)) {
            for (const [mealKey, meal] of Object.entries(meals)) {
                if (meal && meal.ingredients) {
                    meal.ingredients.forEach(ing => {
                        const cleaned = ing.trim().toLowerCase();
                        if (cleaned) allIngredients.push(cleaned);
                    });
                }
            }
        }

        // Deduplicate (simple approach: group similar ingredients)
        const ingredientMap = {};
        allIngredients.forEach(ing => {
            // Extract the core ingredient name (remove quantities for grouping)
            const key = ing.replace(/^[\d\s\/½¼¾⅓⅔]+\s*(cup|cups|tbsp|tsp|g|gm|grams|kg|ml|litre|liter|piece|pieces|nos|no|bunch|pinch|small|medium|large|as needed|to taste)\s*/gi, '').trim();
            const groupKey = key || ing;

            if (!ingredientMap[groupKey]) {
                ingredientMap[groupKey] = [];
            }
            ingredientMap[groupKey].push(ing);
        });

        // Build the shopping list HTML
        const sortedKeys = Object.keys(ingredientMap).sort();
        let html = '<div class="shopping-grid">';

        // Split into columns
        const perColumn = Math.ceil(sortedKeys.length / 3);
        for (let col = 0; col < 3; col++) {
            html += '<div class="shopping-card">';
            const start = col * perColumn;
            const end = Math.min(start + perColumn, sortedKeys.length);

            for (let i = start; i < end; i++) {
                const key = sortedKeys[i];
                const items = ingredientMap[key];
                // Show the first (most descriptive) version
                const display = items[0].charAt(0).toUpperCase() + items[0].slice(1);
                const countNote = items.length > 1 ? ` <small style="color: rgba(56,189,248,0.6);">(×${items.length})</small>` : '';
                html += `<div class="shopping-item">${display}${countNote}</div>`;
            }
            html += '</div>';
        }
        html += '</div>';
        html += `<div class="shopping-count">${sortedKeys.length} unique ingredients across 7 days</div>`;

        content.innerHTML = html;
        section.style.display = 'block';

        // Toggle
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                const isHidden = content.style.display === 'none';
                content.style.display = isHidden ? 'block' : 'none';
                toggleBtn.textContent = isHidden ? 'Hide List' : 'Show List';
            });
        }
    }

    // =========================================
    // PDF GENERATOR (jsPDF)
    // =========================================
    function generatePDF(resultData) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'mm', 'a4');
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 15;
        const maxWidth = pageWidth - margin * 2;
        let y = 20;

        const mealLabels = {
            'Breakfast': '☀ Breakfast',
            'MidMorningSnack': '🥤 Mid-Morning Snack',
            'Lunch': '🍛 Lunch',
            'EveningSnack': '🫖 Evening Snack',
            'Dinner': '🌙 Dinner'
        };
        const mealOrder = ['Breakfast', 'MidMorningSnack', 'Lunch', 'EveningSnack', 'Dinner'];

        function checkPage(needed) {
            if (y + needed > 275) {
                doc.addPage();
                y = 20;
            }
        }

        // Title
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(56, 189, 248);
        doc.text('AI Diet Planner — 7 Day Meal Plan', pageWidth / 2, y, { align: 'center' });
        y += 10;

        // Disclaimer
        doc.setFontSize(8);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(180, 150, 50);
        const disclaimer = 'IMPORTANT NOTICE: This meal plan was generated by artificial intelligence and machine learning algorithms. It is NOT a substitute for advice from a certified nutritionist, registered dietitian, or physician. The nutritional values are estimates based on general formulas and may not be accurate for your body. Do not use this plan if you have serious health conditions without first consulting your doctor.';
        const disclaimerLines = doc.splitTextToSize(disclaimer, maxWidth);
        doc.text(disclaimerLines, margin, y);
        y += disclaimerLines.length * 4 + 5;

        // Separator
        doc.setDrawColor(56, 189, 248);
        doc.setLineWidth(0.5);
        doc.line(margin, y, pageWidth - margin, y);
        y += 8;

        // Metrics
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255, 255, 255);
        doc.setTextColor(56, 189, 248);
        doc.text('Daily Nutritional Targets', margin, y);
        y += 8;

        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(60, 60, 60);
        const m = resultData.metrics;
        doc.text(`BMI: ${m.bmi}`, margin, y);
        doc.text(`Calories: ${m.calories} kcal`, margin + 45, y);
        doc.text(`Protein: ${m.protein}g`, margin + 100, y);
        y += 6;
        doc.text(`Carbs: ${m.carbs}g`, margin, y);
        doc.text(`Fat: ${m.fat}g`, margin + 45, y);
        doc.text(`Diet: ${resultData.diet_type}`, margin + 100, y);
        y += 10;

        // Separator
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.3);
        doc.line(margin, y, pageWidth - margin, y);
        y += 8;

        // Days
        let dayIndex = 0;
        for (const [dayKey, meals] of Object.entries(resultData.diet_plan)) {
            checkPage(20);

            // Day header
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(168, 85, 247);
            doc.text(`Day ${dayIndex + 1}`, margin, y);
            y += 8;

            for (const mealKey of mealOrder) {
                const meal = meals[mealKey];
                if (!meal) continue;

                checkPage(30);

                // Meal title
                doc.setFontSize(11);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(236, 72, 153);
                doc.text(mealLabels[mealKey] || mealKey, margin + 2, y);
                y += 5;

                // Dish name
                doc.setFontSize(12);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(40, 40, 40);
                doc.text(meal.name || 'Unnamed', margin + 4, y);
                y += 6;

                // Ingredients
                doc.setFontSize(9);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(56, 189, 248);
                doc.text('Ingredients:', margin + 4, y);
                y += 4;

                doc.setFont('helvetica', 'normal');
                doc.setTextColor(80, 80, 80);
                (meal.ingredients || []).forEach(ing => {
                    checkPage(5);
                    const lines = doc.splitTextToSize(`• ${ing}`, maxWidth - 10);
                    doc.text(lines, margin + 8, y);
                    y += lines.length * 4;
                });
                y += 2;

                // Steps
                doc.setFontSize(9);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(56, 189, 248);
                doc.text('Steps:', margin + 4, y);
                y += 4;

                doc.setFont('helvetica', 'normal');
                doc.setTextColor(80, 80, 80);
                (meal.steps || []).forEach((step, idx) => {
                    checkPage(5);
                    const lines = doc.splitTextToSize(`${idx + 1}. ${step}`, maxWidth - 10);
                    doc.text(lines, margin + 8, y);
                    y += lines.length * 4;
                });
                y += 4;
            }

            // Day separator
            checkPage(5);
            doc.setDrawColor(220, 220, 220);
            doc.setLineWidth(0.2);
            doc.line(margin, y, pageWidth - margin, y);
            y += 8;
            dayIndex++;
        }

        // Footer on last page
        checkPage(10);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(150, 150, 150);
        doc.text('Generated by AI Diet Planner | Educational Purpose Only', pageWidth / 2, 285, { align: 'center' });

        doc.save('AI_Diet_Plan_7Day.pdf');
    }
});
