import React from 'react';
import { Star } from 'lucide-react';

const StarRating = ({ rating, onRatingChange, readOnly = false, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const handleStarClick = (starRating) => {
    if (!readOnly && onRatingChange) {
      onRatingChange(starRating);
    }
  };

  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${sizeClasses[size]} ${
            !readOnly ? 'cursor-pointer hover:scale-110' : ''
          } transition-all duration-200 ${
            star <= rating ? 'star-filled fill-current' : 'star-empty'
          }`}
          onClick={() => handleStarClick(star)}
        />
      ))}
    </div>
  );
};

export default StarRating;
