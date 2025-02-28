import React from "react";
import "@fortawesome/fontawesome-free/css/all.css";

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  onSearchChange,
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value.toLowerCase()); // Emit the query to the parent
  };

  return (
    <div className="search-container">
      <input
        type="text"
        placeholder="Търси тренировки..."
        value={searchQuery}
        onChange={handleInputChange}
        className="search-input"
      />
      <i className="fas fa-search search-icon"></i>{" "}
      {/* Magnifying glass icon */}
    </div>
  );
};

export default SearchBar;
