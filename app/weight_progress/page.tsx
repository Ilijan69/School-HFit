"use client";
import React, { useState, useEffect } from "react";
import "/styles/WeightProgressPage.css";
import withAuth from "../components/AuthenticationCheck";
import Image from "next/image";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { auth } from "../firebase/firebaseConfig";
import dynamic from "next/dynamic";

const PageTransition = dynamic(() => import("../components/PageTransition"));
const WeightGraph = dynamic(() => import("../components/WeightGraph"), {
  ssr: false,
  loading: () => <p>Loading graph...</p>,
});

const MAX_WEIGHTS = 30; // Maximum number of weights to keep
const INITIAL_DISPLAY_COUNT = 10; // Number of weights to display initially

const WeightTracking: React.FC = () => {
  const [weight, setWeight] = useState<number | "">("");
  const [userId, setUserId] = useState<string>("");
  const [username, setUsername] = useState<string | null>(null); // State for user's name
  const [weights, setWeights] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [displayAll, setDisplayAll] = useState(false); // Toggle for showing all weights

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setUserId(user.uid);
      setUsername(user.displayName || "User"); // Fetch and set the user's name
    } else {
      console.log("No user is logged in");
    }
  }, []);

  useEffect(() => {
    const fetchWeights = async () => {
      if (!userId) return;

      const q = query(collection(db, "weights"), where("userId", "==", userId));
      const querySnapshot = await getDocs(q);

      const data: any[] = [];
      querySnapshot.forEach((doc) => {
        const docData = doc.data();
        data.push({
          id: doc.id,
          weight: docData.weight,
          date: docData.date.toDate(),
        });
      });

      const sortedData = data
        .sort((a, b) => b.date - a.date)
        .slice(0, MAX_WEIGHTS);

      setWeights(sortedData);
    };

    fetchWeights();
  }, [userId]); // Only rerun when `userId` changes

  const handleAddWeight = async () => {
    if (weight === "" || weight <= 0 || weight >= 500) {
      setError("Невалидно тегло");
      return;
    }

    if (!userId) {
      setError("User not logged in.");
      return;
    }

    try {
      const newWeightRef = await addDoc(collection(db, "weights"), {
        userId: userId,
        weight: Number(weight),
        date: Timestamp.now(),
      });

      const newWeight = {
        id: newWeightRef.id,
        weight: Number(weight),
        date: new Date(),
      };

      setWeights((prevWeights) => {
        const updatedWeights = [...prevWeights, newWeight].sort(
          (a, b) => b.date - a.date // Sort by date descending
        );

        if (updatedWeights.length > MAX_WEIGHTS) {
          const excessWeights = updatedWeights.slice(MAX_WEIGHTS);

          excessWeights.forEach(async (entry) => {
            await deleteDoc(doc(db, "weights", entry.id));
          });

          return updatedWeights.slice(0, MAX_WEIGHTS); // Keep only the newest weights
        }

        return updatedWeights;
      });

      setWeight("");
      setError(null);
    } catch (error) {
      console.error("Error adding weight:", error);
      setError("There was an error adding your weight.");
    }
  };

  const displayedWeights = displayAll
    ? weights
    : weights.slice(0, INITIAL_DISPLAY_COUNT);

  // Calculate the highest, lowest, and average weight
  const highestWeight = Math.max(...weights.map((w) => w.weight));
  const lowestWeight = Math.min(...weights.map((w) => w.weight));
  const averageWeight =
    weights.reduce((sum, w) => sum + w.weight, 0) / weights.length;

  const generateMessage = () => {
    const messages: JSX.Element[] = [];
    if (weights.length === 0) {
      messages.push(
        <div key="welcome" className="weight-message weight-message-neutral">
          <span className="icon">💡</span>
          <p>
            Добре дошли във вашето приключение! Всяка голяма промяна започва с
            една малка стъпка.
          </p>
          <p>
            Запишете първото си тегло, за да започнете нещата и нека постигнем
            страхотни резултати заедно!
          </p>
        </div>
      );
    } else if (weights.length === 1) {
      messages.push(
        <div
          key="first-entry"
          className="weight-message weight-message-positive"
        >
          <span className="icon">🎉</span>
          <p>
            Страхотно начало! Записахте първото си тегло. Бъдете последователни
            и следете напредъка си.
          </p>
        </div>
      );
    } else {
      const latestWeight = weights[0]?.weight;
      const highestWeight = Math.max(...weights.map((w) => w.weight));
      const lowestWeight = Math.min(...weights.map((w) => w.weight));
      const averageWeight =
        weights.reduce((sum, w) => sum + w.weight, 0) / weights.length;

      // Prioritize significant milestones
      if (latestWeight === highestWeight) {
        messages.push(
          <div key="highest" className="weight-message weight-message-negative">
            <span className="icon">⚠️</span>
            <p>
              Постигнахте най-високото си тегло досега. Мислете за това като за
              свежа отправна точка, за да продължите напред с целите си!
            </p>
          </div>
        );
      }

      if (latestWeight === lowestWeight) {
        messages.push(
          <div key="lowest" className="weight-message weight-message-positive">
            <span className="icon">🎉</span>
            <p>Достигнахте най-ниското си регистрирано тегло!</p>
            <p>Продължавайте напред, вие го смазвате!</p>
          </div>
        );
      }

      // Detect trends: consistent gaining or losing
      if (weights.length >= 3) {
        const [w1, w2, w3] = weights.slice(0, 3).map((w) => w.weight);
        if (w1 > w2 && w2 > w3) {
          messages.push(
            <div
              key="consistent-gain"
              className="weight-message weight-message-negative"
            >
              <span className="icon">📈</span>
              <p>
                Постоянно покачване. Ако това съвпада с целите ви,
                продължавайте така! Ако не, помислете за преразглеждане на навици си.
              </p>
            </div>
          );
        } else if (w1 < w2 && w2 < w3) {
          messages.push(
            <div
              key="consistent-loss"
              className="weight-message weight-message-positive"
            >
              <span className="icon">📉</span>
              <p>
                Продължавате да отслабвате умерено отслабвали. Удивителен
                напредък - останете постоянни!
              </p>
            </div>
          );
        }
      }

      // Rapid changes: gain or loss
      if (weights.length >= 2) {
        const recentWeights = weights.slice(0, 2);
        const weightDifference =
          recentWeights[0].weight - recentWeights[1].weight;
        const percentageChange =
          (weightDifference / recentWeights[1].weight) * 100;

        if (percentageChange > 3) {
          messages.push(
            <div
              key="rapid-gain"
              className="weight-message weight-message-negative"
            >
              <span className="icon">⚠️</span>
              <p>
                Установено е бързо увеличаване на теглото. Рязкото увеличение
                може да бъде обезпокоително - консултирайте се със здравен
                специалист, ако е необходимо.
              </p>
            </div>
          );
        } else if (percentageChange < -3) {
          messages.push(
            <div
              key="rapid-loss"
              className="weight-message weight-message-negative"
            >
              <span className="icon">⚠️</span>
              <p>
                Установена бърза загуба на тегло. Бъдете здрави и се
                консултирайте с професионалист, ако е необходимо.
              </p>
            </div>
          );
        }
      }

      // General progress message
      if (messages.length < 3) {
        messages.push(
          <div key="average" className="weight-message weight-message-neutral">
            <span className="icon">🔢</span>
            <p>
              Като средноаретмитично, твоето тегло е {averageWeight.toFixed(2)}{" "}
              кг. Ти правиш постояннен прогрес, продължавай така!
            </p>
          </div>
        );
      }
    }

    return messages.slice(0, 3); // Limit to 3 messages
  };

  return (
    <div id="page_WeightProgress">
      <PageTransition>
        <div className="content-wrapper">
          <div className="weight-text-container">
            <Image
              src="/Pics/news.png"
              width={100}
              height={100}
              className="news-image"
              alt="NW-image"
            />
            <p className="greetings">
              Здравей, {username}
              <br />
              Тук можеш да следиш
              <br />
              килограмите и прогресa си
            </p>
            <div className="personalized-message">{generateMessage()}</div>
          </div>
          <div className="weight-container">
            <h1>Графа за Тегло</h1>
            <div className="input-container">
              {error && <p className="error-message">{error}</p>}
              <input
                type="number"
                value={weight}
                onChange={(e) => {
                  const value = e.target.value;
                  const regex = /^\d{0,3}(\.\d{0,3})?$/;

                  if (regex.test(value)) {
                    setWeight(value === "" ? "" : Number(value));
                    setError("");
                  }
                }}
                placeholder="Въведи килограмите (кг)"
                className="weight-input"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleAddWeight(); // Trigger the handleAddWeight function when Enter is pressed
                  }
                }}
              />

              <button onClick={handleAddWeight} className="submit-button">
                <span></span>Добави
              </button>
              <button
                onClick={() => setDisplayAll(!displayAll)}
                className="toggle-button"
              >
                <span></span>
                {displayAll ? "Обратно" : "Разшири"}
              </button>
            </div>

            <WeightGraph
              dates={displayedWeights
                .map((entry) => entry.date.toLocaleDateString())
                .reverse()} // Reverse the order of dates
              weights={displayedWeights.map((entry) => entry.weight).reverse()} // Reverse the order of weights
            />
            {displayAll && (
              <div className="stats">
                <p>Най-високо: {highestWeight} кг</p>
                <p>Най-ниско: {lowestWeight} кг</p>
                <p>Средно: {averageWeight?.toFixed(2)} кг</p>
              </div>
            )}
          </div>
        </div>
      </PageTransition>
    </div>
  );
};

export default withAuth(WeightTracking);
