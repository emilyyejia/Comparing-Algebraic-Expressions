
import React from 'react';

interface StarProps {
  filled: boolean;
}

// Single Star component, renders either filled or outlined SVG
const Star: React.FC<StarProps> = ({ filled }) => (
  <svg
    className="w-14 h-14" // Large, visible stars
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27z"
      fill={filled ? '#FACC15' : 'none'} // Tailwind yellow-400
      stroke={filled ? '#FACC15' : '#94A3B8'} // Tailwind slate-400
      strokeWidth="2"
      strokeLinejoin="round"
      strokeLinecap="round"
    />
  </svg>
);

interface StarRatingProps {
  rating: number; // 1, 2, or 3
  maxRating?: number; // Defaults to 3
}

// StarRating component, renders a row of stars
const StarRating: React.FC<StarRatingProps> = ({ rating, maxRating = 3 }) => {
  return (
    <div className="flex justify-center my-4" role="img" aria-label={`Rating: ${rating} out of ${maxRating} stars.`}>
      {/* Renders 'maxRating' stars, filling them based on the 'rating' prop */}
      {Array.from({ length: maxRating }).map((_, index) => (
        <Star key={index} filled={index < rating} />
      ))}
    </div>
  );
};

export default StarRating;
