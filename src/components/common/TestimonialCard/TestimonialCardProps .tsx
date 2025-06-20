// src/components/common/TestimonialCard.tsx

import React from "react";
import { FaStar, FaStarHalfAlt, FaQuoteLeft } from "react-icons/fa";

export interface TestimonialCardProps {
  name: string;
  role?: string;
  avatar?: string;
  rating?: number;
  quote: string;
  className?: string;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({
  name,
  role,
  avatar,
  rating,
  quote,
  className = "",
}) => {
  // Function to render stars based on rating
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={`star-${i}`} className="text-yellow-400" />);
    }

    // Add half star if needed
    if (hasHalfStar) {
      stars.push(<FaStarHalfAlt key="half-star" className="text-yellow-400" />);
    }

    // Add empty stars to make it 5 stars total
    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<FaStar key={`empty-star-${i}`} className="text-gray-300" />);
    }

    return stars;
  };

  return (
    <div className={`rounded-lg bg-white p-6 shadow-md ${className}`}>
      <div className="text-primary-500 mb-4 text-2xl">
        <FaQuoteLeft />
      </div>

      <p className="mb-6 italic text-gray-700">{quote}</p>

      <div className="flex items-center">
        {avatar && (
          <div className="mr-4">
            <img
              src={avatar}
              alt={name}
              className="h-12 w-12 rounded-full object-cover"
            />
          </div>
        )}

        <div>
          <h4 className="font-bold text-gray-900">{name}</h4>
          {role && <p className="text-sm text-gray-600">{role}</p>}

          {rating && <div className="mt-1 flex">{renderStars(rating)}</div>}
        </div>
      </div>
    </div>
  );
};

export default TestimonialCard;
