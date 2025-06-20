import React from "react";
import classNames from "classnames";

export interface SectionTitleProps {
  title: string;
  subtitle?: string;
  description?: string; // Thêm description
  alignment?: "left" | "center" | "right";
  titleSize?: "small" | "medium" | "large";
  className?: string;
  decorative?: boolean;
  centered?: boolean; // Thêm centered
}

const SectionTitle: React.FC<SectionTitleProps> = ({
  title,
  subtitle,
  description,
  alignment = "center",
  titleSize = "medium",
  className = "",
  decorative = true,
  centered = false, // Mặc định là false
}) => {
  const containerClasses = classNames(
    "mb-12",
    {
      "text-left": alignment === "left",
      "text-center": alignment === "center" || centered,
      "text-right": alignment === "right",
    },
    className,
  );

  const titleClasses = classNames(
    "font-bold text-gray-900 dark:text-white mb-2 font-heading",
    {
      "text-2xl": titleSize === "small",
      "text-3xl md:text-4xl": titleSize === "medium",
      "text-4xl md:text-5xl": titleSize === "large",
    }
  );

  const subtitleClasses = classNames(
    "text-lg text-gray-600 dark:text-gray-300 mb-4"
  );

  const descriptionClasses = classNames(
    "text-base text-gray-500 dark:text-gray-400"
  );

  return (
    <div className={containerClasses}>
      <h2 className={titleClasses}>{title}</h2>
      {decorative && (
        <div className="mb-6 flex justify-center">
          <div className="h-1 w-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"></div>
        </div>
      )}
      {subtitle && (
        <p className={subtitleClasses}>{subtitle}</p>
      )}
      {description && ( // Thêm mô tả nếu có
        <p className={descriptionClasses}>{description}</p>
      )}
    </div>
  );
};

export default SectionTitle;