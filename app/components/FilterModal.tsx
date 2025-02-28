import React, { useState, useEffect } from "react";

interface FilterModalProps {
  isOpen: boolean; // Add isOpen prop to control visibility
  onApplyFilters: (filters: {
    category: string;
    difficulty: string;
    durationRange: [number, number];
  }) => void;
  onClose: () => void;
}

const FilterModal: React.FC<FilterModalProps> = ({
  isOpen, // Destructure isOpen prop
  onApplyFilters,
  onClose,
}) => {
  // Load stored filters from localStorage (if available)
  const loadStoredFilters = () => {
    const storedFilters = localStorage.getItem("filters");
    if (storedFilters) {
      return JSON.parse(storedFilters);
    }
    return {
      category: "",
      difficulty: "",
      durationRange: [0, 120], // Default range updated to 120 minutes
    };
  };

  // Initialize state for category, difficulty, and duration range
  const [category, setCategory] = useState(loadStoredFilters().category);
  const [difficulty, setDifficulty] = useState(loadStoredFilters().difficulty);
  const [durationRange, setDurationRange] = useState<[number, number]>(
    loadStoredFilters().durationRange
  );

  // If the modal is not open, return null
  if (!isOpen) return null;

  // Store filters to localStorage when they are applied
  const handleApplyFilters = () => {
    const filters = { category, difficulty, durationRange };
    localStorage.setItem("filters", JSON.stringify(filters));
    onApplyFilters(filters);
    onClose();
  };

  // Handle duration slider
  const handleDurationChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    isMin: boolean
  ) => {
    const newValue = +e.target.value;
    if (isMin) {
      // Update the minimum value
      setDurationRange([newValue, durationRange[1]]);
    } else {
      // Update the maximum value
      setDurationRange([durationRange[0], newValue]);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Филтър</h2>
        <div className="filter">
          <label>
            Категория:
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">Всички Категории</option>
              <option value="Кардио">Кардио</option>
              <option value="Сила">Сила</option>
              <option value="Гъвкавост">Гъвкавост</option>
            </select>
          </label>

          <label>
            Трудност:
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
            >
              <option value="">Всички Трудности</option>
              <option value="Лесно">Лесно</option>
              <option value="Средна">Средна</option>
              <option value="Трудно">Трудно</option>
            </select>
          </label>

          <label>
            Времетраене:
            <div className="range-labels">
              <label>{durationRange[0]} минути минимум</label>
              <label>{durationRange[1]} минути максимум</label>
            </div>
            <div className="range-slider">
              <input
                type="range"
                min={0}
                max={120} // Updated max to 120
                value={durationRange[0]}
                onChange={(e) => handleDurationChange(e, true)}
              />
              <input
                type="range"
                min={0}
                max={120} // Updated max to 120
                value={durationRange[1]}
                onChange={(e) => handleDurationChange(e, false)}
              />
            </div>
          </label>
        </div>

        <div className="modal-actions">
          <button className="btn-cancel" onClick={onClose}>
            <span></span>Затвори
          </button>
          <button className="btn-apply" onClick={handleApplyFilters}>
            <span></span>Приложи
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterModal;
