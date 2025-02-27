import React from "react";

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

interface EditWorkoutModalProps {
  isOpen: boolean;
  workout: Workout | null;
  onClose: () => void;
  onSave: (e: React.FormEvent) => Promise<void>;
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
}

const EditWorkoutModal: React.FC<EditWorkoutModalProps> = ({
  isOpen,
  workout,
  onClose,
  onSave,
  onChange,
}) => {
  if (!isOpen || !workout) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Преработи тренировка</h2>
        <div className="editer">
          <form onSubmit={onSave}>
            <label>
              Име на Тренировка:
              <input
                type="text"
                name="name"
                placeholder="Workout Name"
                value={workout.name}
                onChange={onChange}
                required
              />
            </label>
            <label>
              Категория:
              <select
                name="category"
                value={workout.category}
                onChange={onChange}
                required
              >
                <option value="" disabled>
                  Избери Категория
                </option>
                <option value="Сила">Сила</option>
                <option value="Кардио">Кардио</option>
                <option value="Гъвкавост">Гъвкавост</option>
              </select>
            </label>
            <label>
              Трудност:
              <select
                name="difficulty"
                value={workout.difficulty}
                onChange={onChange}
                required
              >
                <option value="" disabled>
                  Избери Трудност
                </option>
                <option value="Лесно">Лесно</option>
                <option value="Средна">Средна</option>
                <option value="Трудно">Трудно</option>
              </select>
            </label>
            <label>
              <div className="range-labels">
                <label>Времетраене: {workout.duration} мимути</label>
              </div>
              <div className="slider-container">
                <input
                  type="range"
                  name="duration"
                  min="0"
                  max="120"
                  step="1"
                  value={workout.duration}
                  onChange={onChange}
                  required
                />
              </div>
            </label>
            <label>
              Инструкции:{" "}
              <textarea
                name="instructions"
                placeholder="Instructions"
                value={workout.instructions}
                onChange={onChange}
                required
              />
            </label>
            <div className="modal-actions">
              <button type="button" onClick={onClose}>
                <span></span>Затвори
              </button>
              <button type="submit">
                <span></span>Запази
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditWorkoutModal;
