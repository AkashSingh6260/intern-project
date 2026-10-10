import React, { useState } from 'react';
import { Star } from 'lucide-react';

const StarRating = ({ rating = 0, interactive = false, onChange, size = 18, showValue = false }) => {
  const [hover, setHover] = useState(0);
  const display = interactive && hover > 0 ? hover : rating;

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(n => {
        const filled = n <= Math.round(display);
        return (
          <span
            key={n}
            className={`star ${interactive ? 'interactive' : ''}`}
            onMouseEnter={() => interactive && setHover(n)}
            onMouseLeave={() => interactive && setHover(0)}
            onClick={() => interactive && onChange && onChange(n)}
          >
            <Star
              size={size}
              color={filled ? '#f59e0b' : '#d1d5db'}
              fill={filled ? '#f59e0b' : 'transparent'}
            />
          </span>
        );
      })}
      {showValue && (
        <span style={{ marginLeft: 6, fontSize: '0.85rem', fontWeight: 700, color: rating > 0 ? '#d97706' : '#9ca3af' }}>
          {rating > 0 ? rating.toFixed(1) : 'No ratings yet'}
        </span>
      )}
    </div>
  );
};

export default StarRating;
