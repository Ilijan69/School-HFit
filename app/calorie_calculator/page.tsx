"use client";
import { useState, useRef } from "react";
import "/styles/CalorieCalPage.css";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const PageTransition = dynamic(() => import("../components/PageTransition"));

const CalorieCalculator = () => {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement | null>(null);
  const [age, setAge] = useState<number | "">("");
  const [gender, setGender] = useState<string>("male");
  const [height, setHeight] = useState<number | "">("");
  const [weight, setWeight] = useState<number | "">("");
  const [activity, setActivity] = useState<string>("moderate");
  const [error, setError] = useState<string>("");

  const calculateCalories = () => {
    // Input validation
    if (!age || age <= 1 || age >= 100) {
      setError("Моля въведете валидна възраст");
      return;
    }
    if (!height || height <= 50 || height >= 300) {
      setError("Моля ваведете валидна височина");
      return;
    }
    if (!weight || weight <= 25 || weight >= 500) {
      setError("Моля въведете валидно тегло");
      return;
    }

    // BMR calculation
    const bmr =
      gender === "male"
        ? 10 * Number(weight) + 6.25 * Number(height) - 5 * Number(age) + 5
        : 10 * Number(weight) + 6.25 * Number(height) - 5 * Number(age) - 161;

    // Determine activity factor
    const activityFactor =
      activity === "sedentary"
        ? 1.2
        : activity === "light"
        ? 1.375
        : activity === "moderate"
        ? 1.55
        : activity === "active"
        ? 1.725
        : 1.9;

    // TDEE calculation
    const tdee = bmr * activityFactor;

    // Calculate calories for maintenance, deficit, and surplus
    const maintenance = Math.round(tdee);
    const deficit = Math.round(tdee - 300);
    const surplus = Math.round(tdee + 300);

    // Navigate to the results page with query parameters
    router.push(
      `/calorie_calculator_results?maintenance=${maintenance}&deficit=${deficit}&surplus=${surplus}`
    );
  };

  const clearForm = () => {
    if (formRef.current) {
      formRef.current.reset(); // Reset the form
    }
    // Optionally, reset the state variables as well
    setAge("");
    setGender("male");
    setHeight("");
    setWeight("");
    setActivity("sedentary");
    setError(""); // Reset error state on form reset
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    field: string
  ) => {
    setError(""); // Reset the error when the user starts typing
    const value = e.target.value;

    // Ensure the value is a valid number and limit to 3 digits
    if (value.length <= 3 && !isNaN(Number(value))) {
      if (field === "age") {
        setAge(Number(value) || "");
      } else if (field === "height") {
        setHeight(Number(value) || "");
      } else if (field === "weight") {
        setWeight(Number(value) || "");
      }
    }
  };

  return (
    <div id="page_CalorieCalculator">
      <PageTransition>
        <div className="calculator-container">
          <h1>Калориен Калкулатор</h1>
          {error && <p className="error-message">{error}</p>}
          <form className="calculator-form" ref={formRef}>
            <div className="form-group">
              <input
                type="number"
                placeholder="Вашите години"
                value={age}
                onChange={(e) => handleInputChange(e, "age")}
                maxLength={3}
                required
              />
            </div>
            <div className="form-group">
              <div className="gender-container">
                <input
                  type="radio"
                  value="male"
                  id="male"
                  checked={gender === "male"}
                  onChange={() => setGender("male")}
                  required
                />
                <label
                  className={`gender-label ${
                    gender === "male" ? "selected" : ""
                  }`}
                  htmlFor="male"
                >
                  Мъж
                </label>

                <input
                  type="radio"
                  value="female"
                  id="female"
                  checked={gender === "female"}
                  onChange={() => setGender("female")}
                  required
                />
                <label
                  className={`gender-label ${
                    gender === "female" ? "selected" : ""
                  }`}
                  htmlFor="female"
                >
                  Жена
                </label>
              </div>
            </div>
            <div className="form-group">
              <input
                type="number"
                id="height"
                placeholder="Вашата височина (см)"
                value={height}
                onChange={(e) => handleInputChange(e, "height")}
                required
              />
            </div>
            <div className="form-group">
              <input
                type="number"
                id="weight"
                placeholder="Вашето тегло (кг)"
                value={weight}
                onChange={(e) => handleInputChange(e, "weight")}
                required
              />
            </div>
            <div className="form-group">
              <div className="form-group-selector">
                <select
                  value={activity}
                  onChange={(e) => {
                    setActivity(e.target.value);
                    setError("");
                  }}
                  required
                >
                  <option value="" disabled>
                    Изберете Ниво на активност
                  </option>
                  <option value="sedentary">
                    Заседнал живот: малко или никакво упражнение
                  </option>
                  <option value="light">
                    Леко: упражнявайте 1-3 пъти седмично
                  </option>
                  <option value="moderate">
                    Умерено: упражнения 3-4 пъти седмично
                  </option>
                  <option value="active">
                    Активни: интензивни упражнения 4-5 пъти седмично
                  </option>
                  <option value="very-active">
                    Много активен: интензивни упражнения 6-7 пъти седмично
                  </option>
                </select>
              </div>
            </div>
            <div className="form-actions">
              <button
                type="button"
                id="calculate_button"
                onClick={calculateCalories}
              >
                <span />
                <div className="calculate_button_text">Изчисли</div>
              </button>
              <button type="button" id="clear_button" onClick={clearForm}>
                <span className="clear_button_span" />
                <div className="reset_button_text">Изчисти</div>
              </button>
            </div>
          </form>
        </div>
      </PageTransition>
    </div>
  );
};

export default CalorieCalculator;
