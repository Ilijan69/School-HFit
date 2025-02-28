"use client";
import { useState, useEffect } from "react";
import type React from "react";

import Image from "next/image";
import withAuth from "../components/AuthenticationCheck";
import "/styles/TrainingSessionPage.css";
import { getUserRole } from "../firebase/authService";
import { db } from "../firebase/firebaseConfig";
import dynamic from "next/dynamic";
import {
  doc,
  deleteDoc,
  addDoc,
  getDocs,
  updateDoc,
  collection,
  setDoc,
} from "firebase/firestore";
import { auth } from "../firebase/firebaseConfig";
import { s3 } from "../Amazon S3/awsConfig";
import { Star } from "lucide-react";

const PageTransition = dynamic(() => import("../components/PageTransition"));
const SearchBar = dynamic(() => import("../components/SearchBar"));
const InstructionModal = dynamic(
  () => import("../components/InstructionModal")
);
const EditWorkoutModal = dynamic(
  () => import("../components/EditWorkoutModal")
);
const FilterModal = dynamic(() => import("../components/FilterModal"));

interface Workout {
  id: string;
  name: string;
  category: string;
  difficulty: string;
  duration: number;
  instructions: string;
  mediaUrl?: string; // URL of the uploaded image
  imageFile?: File; // Add imageFile as a possible property (optional)
}

const TrainingSessionsPage = () => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
  const [deletedWorkoutId, setDeletedWorkoutId] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [instructionsModal, setInstructionsModal] = useState<Workout | null>(
    null
  );
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [newWorkout, setNewWorkout] = useState<Workout>({
    id: "",
    name: "",
    category: "",
    difficulty: "",
    duration: 0,
    instructions: "",
    mediaUrl: undefined,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState(() => ({
    category: "",
    difficulty: "",
    durationRange: [0, 120],
  }));
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        const workoutsRef = collection(db, "workouts");
        const querySnapshot = await getDocs(workoutsRef);

        const workoutsData: Workout[] = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Workout[];

        setWorkouts(workoutsData);

        const userRole = await getUserRole(auth.currentUser?.uid || "");
        setIsAdmin(userRole === "admin");
      } catch (error) {
        console.error("Error fetching workouts:", error);
      } finally {
      }
    };

    if (auth.currentUser) {
      fetchWorkouts();
    } else {
    }
  }, []);
  useEffect(() => {
    const loadFavorites = async () => {
      if (!auth.currentUser) return;
      try {
        const userDoc = doc(db, "users", auth.currentUser.uid);
        const userSnap = await getDocs(collection(userDoc, "favorites"));
        const favoritesIds = userSnap.docs.map((doc) => doc.id);
        setFavorites(favoritesIds);
      } catch (error) {
        console.error("Error loading favorites:", error);
      }
    };

    loadFavorites();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setNewWorkout((prevWorkout) => ({
      ...prevWorkout,
      [name]: value,
    }));
  };
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setNewWorkout((prevWorkout) => ({
      ...prevWorkout,
      imageFile: file, // Set the selected file
    }));
  };

  {
    /**Uplode the image to the S3 bucket */
  }
  const uploadImageToS3 = async (file: File) => {
    const params = {
      Bucket: process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME!,
      Key: `workout-images/${file.name}`,
      Body: file,
      ContentType: file.type,
    };
    try {
      const uploadResult = await s3.upload(params).promise();
      return uploadResult.Location; // This returns the URL of the uploaded image
    } catch (error) {
      console.error("Error uploading to S3:", error);
      throw error;
    }
  };

  {
    /**Submit the workout to the database */
  }
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !newWorkout.name.trim() ||
      !newWorkout.category.trim() ||
      !newWorkout.difficulty.trim() ||
      !newWorkout.duration ||
      !newWorkout.instructions.trim() ||
      !newWorkout.imageFile
    ) {
      setError("All fields are required.");
      return;
    }

    try {
      // Upload the image to S3
      const mediaUrl = await uploadImageToS3(newWorkout.imageFile);

      // Prepare the workout data to save in Firestore or other storage
      const workoutToSave = {
        name: newWorkout.name,
        category: newWorkout.category,
        difficulty: newWorkout.difficulty,
        duration: newWorkout.duration,
        instructions: newWorkout.instructions,
        mediaUrl, // Save the image URL
      };
      // Add workout to Firestore
      const docRef = await addDoc(collection(db, "workouts"), workoutToSave);
      setWorkouts([...workouts, { ...workoutToSave, id: docRef.id }]);
      setShowForm(false);
      setNewWorkout({
        id: "",
        name: "",
        category: "",
        difficulty: "",
        duration: 0,
        instructions: "",
        mediaUrl: undefined,
      });
    } catch (error) {
      console.error("Error adding workout:", error);
    }
  };

  {
    /**Aplying the filters and favourites */
  }
  const handleApplyFilters = (filters: {
    category: string;
    difficulty: string;
    durationRange: [number, number];
  }) => {
    setFilters(filters);
    setIsFilterModalOpen(false);
  };

  const filteredWorkouts = workouts.filter((workout) => {
    const matchesSearch = workout.name.toLowerCase().includes(searchQuery);
    const matchesCategory = filters.category
      ? workout.category === filters.category
      : true;
    const matchesDifficulty = filters.difficulty
      ? workout.difficulty === filters.difficulty
      : true;
    const matchesDuration =
      workout.duration >= filters.durationRange[0] &&
      workout.duration <= filters.durationRange[1];
    const matchesFavorites = showOnlyFavorites
      ? favorites.includes(workout.id)
      : true;

    return (
      matchesSearch &&
      matchesCategory &&
      matchesDifficulty &&
      matchesDuration &&
      matchesFavorites
    );
  });

  const toggleFavorite = async (workoutId: string) => {
    if (!auth.currentUser) return;
    try {
      const userDoc = doc(db, "users", auth.currentUser.uid);
      const favoriteRef = doc(collection(userDoc, "favorites"), workoutId);

      if (favorites.includes(workoutId)) {
        await deleteDoc(favoriteRef);
        setFavorites(favorites.filter((id) => id !== workoutId));
      } else {
        await setDoc(favoriteRef, { timestamp: new Date() });
        setFavorites([...favorites, workoutId]);
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  {
    /**Instruction toogling */
  }
  const handleToggleInstructions = (workout: Workout) => {
    setInstructionsModal(workout);
  };
  const closeInstructionsModal = () => {
    setInstructionsModal(null);
  };

  {
    /**Edit modal logic */
  }
  const handleEditWorkout = (workout: Workout) => {
    setEditingWorkout(workout);
    setIsEditModalOpen(true);
  };
  const handleCloseEditModal = () => {
    setEditingWorkout(null);
    setIsEditModalOpen(false);
  };
  const handleEditChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    if (!editingWorkout) return;

    const { name, value } = e.target;
    setEditingWorkout((prevWorkout) => ({
      ...prevWorkout!,
      [name]: value,
    }));
  };
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWorkout) return;

    try {
      const workoutDocRef = doc(db, "workouts", editingWorkout.id);
      await updateDoc(workoutDocRef, {
        name: editingWorkout.name,
        category: editingWorkout.category,
        difficulty: editingWorkout.difficulty,
        duration: editingWorkout.duration,
        instructions: editingWorkout.instructions,
      });

      setWorkouts((prevWorkouts) =>
        prevWorkouts.map((workout) =>
          workout.id === editingWorkout.id ? editingWorkout : workout
        )
      );
      handleCloseEditModal();
    } catch (error) {
      console.error("Error updating workout:", error);
    }
  };

  {
    /**deleting the workout along with the image in S3 */
  }
  const handleDeleteWorkout = async (workoutId: string) => {
    const workoutToDelete = workouts.find(
      (workout) => workout.id === workoutId
    );

    if (!workoutToDelete) {
      alert("Workout not found.");
      return;
    }

    try {
      setDeletedWorkoutId(workoutId); // Trigger animation

      setTimeout(async () => {
        if (workoutToDelete.mediaUrl) {
          const s3Key = new URL(workoutToDelete.mediaUrl).pathname.substring(1);
          const deleteImageParams = {
            Bucket: process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME!,
            Key: s3Key,
          };
          await s3.deleteObject(deleteImageParams).promise();
        }

        const workoutDocRef = doc(db, "workouts", workoutId);
        await deleteDoc(workoutDocRef);

        setWorkouts((prevWorkouts) =>
          prevWorkouts.filter((workout) => workout.id !== workoutId)
        );
      }, 500); // Match the CSS animation duration (0.5s)
    } catch (error) {
      console.error("Error during deletion process:", error);
      alert(
        "Failed to delete the workout or its associated image. Please try again."
      );
    }
  };

  return (
    <div id="page_TrainingSessions">
      <PageTransition>
        <h1>ТРЕНИРОВКИ</h1>
        <div className="top-part-elements">
          {/*if user is Admin he can add workouts*/}
          {isAdmin && (
            <div>
              <button
                className="btn-add"
                onClick={() => setShowForm((prev) => !prev)}
              >
                <span></span>
                {showForm ? "Затвори" : "Добави"}
              </button>
            </div>
          )}

          {/*Filter button and conponent */}
          <button
            className="btn-filter"
            onClick={() => setIsFilterModalOpen(true)}
          >
            <span></span>
            Филтри
          </button>
          <button
            className={`btn-filter-favoutite ${
              showOnlyFavorites ? "active" : ""
            }`}
            onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
          >
            <span></span>
            {showOnlyFavorites ? "Всички" : "Любими"}
          </button>
          <FilterModal
            isOpen={isFilterModalOpen}
            onClose={() => setIsFilterModalOpen(false)}
            onApplyFilters={handleApplyFilters}
          />
        </div>

        {/*Seacrch bar component */}
        <SearchBar searchQuery={searchQuery} onSearchChange={setSearchQuery} />

        {/*Instruction appearens*/}
        {instructionsModal && (
          <InstructionModal
            workoutName={instructionsModal.name}
            instructions={instructionsModal.instructions}
            onClose={closeInstructionsModal}
          />
        )}

        {/*If user is Admin fill this form to create a workout */}
        {showForm && (
          <form onSubmit={handleSubmit} className="workout-form">
            {error && <p className="error-message">{error}</p>}
            <input
              type="text"
              name="name"
              placeholder="Име на тренировката"
              value={newWorkout.name}
              onChange={(e) => {
                handleInputChange(e);
                setError("");
              }}
            />
            <select
              name="category"
              value={newWorkout.category}
              onChange={(e) => {
                handleInputChange(e);
                setError("");
              }}
            >
              <option value="" disabled>
                Избери Категория
              </option>
              <option value="Сила">Сила</option>
              <option value="Кардио">Кардио</option>
              <option value="Гъвкавост">Гъвкавост</option>
            </select>
            <select
              name="difficulty"
              value={newWorkout.difficulty}
              onChange={(e) => {
                handleInputChange(e);
                setError("");
              }}
            >
              <option value="" disabled>
                Избери Трудност
              </option>
              <option value="Лесно">Лесно</option>
              <option value="Средна">Средна</option>
              <option value="Тръдно">Тръдно</option>
            </select>
            <label htmlFor="duration">
              Времетраене (минути): {newWorkout.duration}
            </label>
            <input
              type="range"
              id="duration"
              name="duration"
              min="0"
              max="120"
              value={newWorkout.duration}
              onChange={handleInputChange}
              step="1"
            />
            <textarea
              name="instructions"
              placeholder="Интрукции"
              value={newWorkout.instructions}
              onChange={(e) => {
                handleInputChange(e);
                setError("");
              }}
            />
            <input type="file" accept="image/*" onChange={handleImageChange} />
            <button type="submit" className="btn-submit">
              <span></span> Добави Тренировка
            </button>
          </form>
        )}

        {/*The information for the workout */}
        <div className="workouts-container">
          {filteredWorkouts.map((workout) => (
            <div
              key={workout.id}
              className={`workout-card ${
                deletedWorkoutId === workout.id ? "deleting" : ""
              }`}
            >
              <button
                className={`favorite-btn ${
                  favorites.includes(workout.id) ? "favorited" : ""
                }`}
                onClick={() => toggleFavorite(workout.id)}
                aria-label={
                  favorites.includes(workout.id)
                    ? "Remove from favorites"
                    : "Add to favorites"
                }
              >
                <Star className="star-icon" />
              </button>
              <Image
                src={workout.mediaUrl || "/placeholder.jpg"}
                alt={workout.name}
                width={400}
                height={400}
                className="workout-image"
                priority
              />
              <h2>{workout.name}</h2>
              <p>Категория: {workout.category}</p>
              <p>Трудност: {workout.difficulty}</p>
              <p>Времетраене: {workout.duration} минути</p>
              <div className="card-btn-seccion">
                <button
                  className="instruction-btn"
                  onClick={() => handleToggleInstructions(workout)}
                >
                  <span></span>Покажи Инструкции
                </button>
              </div>

              {/*if user is Admin he can  delete and edit workouts*/}
              {isAdmin && (
                <div>
                  <button
                    className="btn-delete"
                    onClick={() => handleDeleteWorkout(workout.id)}
                  >
                    <span></span>Премахни
                  </button>
                  <button
                    className="btn-edit"
                    onClick={() => handleEditWorkout(workout)}
                  >
                    <span></span>Преработи
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/*Part for editing the workout*/}
        {editingWorkout && isAdmin && (
          <div className="edit-workout-modal">
            <EditWorkoutModal
              isOpen={isEditModalOpen}
              workout={editingWorkout}
              onClose={handleCloseEditModal}
              onSave={handleSaveEdit}
              onChange={handleEditChange}
            />
          </div>
        )}
      </PageTransition>
    </div>
  );
};

export default withAuth(TrainingSessionsPage);
