"use client";
import React, { useState, useEffect } from "react";
import "/styles/Arrow.css";

function Arrow() {
  const [scrollY, setScrollY] = useState(100);
  const [maxHeight, setMaxHeight] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    // Set the maxHeight of the vertical rectangle and container height
    const verticalRectangle = document.querySelector(".vertical-rectangle");
    setMaxHeight(verticalRectangle?.getBoundingClientRect().height || 0);
    setContainerHeight(verticalRectangle?.clientHeight || 0);

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Calculate the arrow position based on scroll, ensuring it doesn't go beyond container height
  const arrowPosition = Math.min(
    scrollY * 0.00001,
    containerHeight - 1000 // Adjust 1250 based on the desired stopping point within the container
  );

  return (
    <div className="vertical-rectangle">
      <div className="arrow-container">
        <div
          className="arrow-tail"
          style={{
            height: `${scrollY - 700}px`, // Tail grows with scroll
            transform: `translateY(${arrowPosition}px)`,
            opacity: `${Math.min(scrollY / 0, 200)}`, // Tail becomes visible as user scrolls
          }}
        ></div>
        <div
          className="custom-arrow"
          style={{
            opacity: `${Math.min(scrollY / 1, 200)}`, // Arrow becomes visible as user scrolls
            transform: `translateY(${arrowPosition}px)`, // Move arrow head with scroll
          }}
        ></div>
      </div>
    </div>
  );
}

export default Arrow;
