import React, { useEffect } from "react";

interface InstructionModalProps {
  workoutName: string;
  instructions: string;
  onClose: () => void;
}

const InstructionModal: React.FC<InstructionModalProps> = ({
  workoutName,
  instructions,
  onClose,
}) => {
  useEffect(() => {
    // Add modal-open class to body when component mounts
    document.body.classList.add('modal-open');
    
    // Remove modal-open class from body when component unmounts
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, []);

  // Convert newlines into <br /> for displaying
  const formattedInstructions = instructions.split("\n").map((line, index) => (
    <React.Fragment key={index}>
      {line}
      <br />
    </React.Fragment>
  ));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          &times;
        </button>
        <h2>{workoutName}</h2>
        <div className="instructions">{formattedInstructions}</div>
      </div>
    </div>
  );
};

export default InstructionModal;
