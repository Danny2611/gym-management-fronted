// src/components/common/BlogPostCard.tsx

import React from "react";
import { Link } from "react-router-dom";

export interface BlogPostCardProps {
  title: string;
  excerpt: string;
  image: string;
  author: {
    name: string;
    avatar?: string;
  };
  date: string;
  category?: string;
  url: string;
  className?: string;
  layout?: "horizontal" | "vertical";
}

const BlogPostCard: React.FC<BlogPostCardProps> = ({
  title,
  excerpt,
  image,
  author,
  date,
  category,
  url,
  className = "",
  layout = "vertical",
}) => {
  const isHorizontal = layout === "horizontal";

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  return (
    <div
      className={`overflow-hidden rounded-lg bg-white shadow-md ${isHorizontal ? "flex flex-col md:flex-row" : "flex flex-col"} ${className} `}
    >
      {/* Image */}
      <div
        className={`overflow-hidden ${isHorizontal ? "md:w-2/5" : "w-full"} `}
      >
        <Link to={url}>
          <img
            src={image}
            alt={title}
            className="h-48 w-full object-cover transition-transform duration-500 hover:scale-110"
          />
        </Link>
      </div>

      {/* Content */}
      <div className={`p-5 ${isHorizontal ? "md:w-3/5" : "w-full"} `}>
        {/* Category */}
        {category && (
          <Link
            to={`/blog/category/${category.toLowerCase().replace(/ /g, "-")}`}
            className="bg-primary-100 text-primary-600 mb-2 inline-block rounded px-2 py-1 text-xs font-bold uppercase tracking-wide"
          >
            {category}
          </Link>
        )}

        {/* Title */}
        <Link to={url}>
          <h3 className="hover:text-primary-600 mb-2 text-xl font-bold text-gray-900 transition-colors">
            {title}
          </h3>
        </Link>

        {/* Excerpt */}
        <p className="mb-4 text-gray-600">{excerpt}</p>

        {/* Author and Date */}
        <div className="flex items-center">
          {author.avatar && (
            <img
              src={author.avatar}
              alt={author.name}
              className="mr-3 h-8 w-8 rounded-full object-cover"
            />
          )}

          <div>
            <span className="font-medium text-gray-700">{author.name}</span>
            <span className="mx-2 text-gray-500">•</span>
            <span className="text-gray-500">{formatDate(date)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPostCard;
