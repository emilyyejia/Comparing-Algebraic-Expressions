
import React from 'react';

interface StarRatingProps {
  rating: number;
  maxStars?: number;
}

const StarRating: React.FC<StarRatingProps> = ({ rating, maxStars = 3 }) => {
  const filledStars = '★'.repeat(Math.max(0, Math.min(rating, maxStars)));
  const emptyStars = '☆'.repeat(Math.max(0, maxStars - rating));
  
  return (
    <span role="img" aria-label={`${rating} out of ${maxStars} stars`}>
      {filledStars}{emptyStars}
    </span>
  );
};

export default StarRating;
