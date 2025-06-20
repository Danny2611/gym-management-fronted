// src/components/common/Card.tsx

import React from "react";
import { Link } from "react-router-dom";
import classNames from "classnames";

export interface CardProps {
  image?: string;
  imageAlt?: string;
  title: string;
  description: string;
  link?: {
    text: string;
    url: string;
  };
  className?: string;
  elevation?: "none" | "low" | "medium" | "high";
  hoverEffect?: boolean;
}

const Card: React.FC<CardProps> = ({
  image,
  imageAlt = "",
  title,
  description,
  link,
  className = "",
  elevation = "medium",
  hoverEffect = true,
}) => {
  const cardClasses = classNames(
    "bg-white rounded-lg overflow-hidden",
    {
      "shadow-none": elevation === "none",
      "shadow-sm": elevation === "low",
      "shadow-md": elevation === "medium",
      "shadow-lg": elevation === "high",
      "transition-transform duration-300 hover:-translate-y-2": hoverEffect,
    },
    className,
  );

  return (
    <div className={cardClasses}>
      {image && (
        <div className="relative h-48 overflow-hidden">
          <img
            src={image}
            alt={imageAlt || title}
            className="h-full w-full object-cover"
          />
        </div>
      )}
      <div className="p-5">
        <h3 className="mb-2 text-xl font-bold">{title}</h3>
        <p className="mb-4 text-gray-600">{description}</p>
        {link && (
          <Link
            to={link.url}
            className="text-primary-600 group inline-flex items-center font-medium"
          >
            {link.text}
            <svg
              className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 5l7 7-7 7"
              ></path>
            </svg>
          </Link>
        )}
      </div>
    </div>
  );
};

export default Card;
