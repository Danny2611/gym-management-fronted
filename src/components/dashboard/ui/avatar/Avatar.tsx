import React from "react";

interface AvatarProps {
  src: string;
  alt?: string;
  name?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = "",
  name,
  size = "md",
  className = "",
}) => {
  // Kích thước avatar
  const sizeClasses = {
    xs: "w-6 h-6 text-xs",
    sm: "w-8 h-8 text-sm",
    md: "w-10 h-10 text-base",
    lg: "w-12 h-12 text-lg",
    xl: "w-16 h-16 text-xl",
  };

  // Kiểm tra src có phải là URL hợp lệ hay không
  const isValidSrc = src && !src.includes("undefined") && !src.includes("null");

  // Tạo chữ cái đầu từ name hoặc alt nếu không có hình ảnh
  const initials = () => {
    const nameToUse = name || alt || "";
    return nameToUse
      .split(" ")
      .map((part) => part.charAt(0).toUpperCase())
      .slice(0, 2)
      .join("");
  };

  return (
    <div
      className={`flex items-center justify-center overflow-hidden rounded-full bg-gray-200 ${sizeClasses[size]} ${className}`}
    >
      {isValidSrc ? (
        <img
          src={src}
          alt={alt || name || "Avatar"}
          className="h-full w-full object-cover"
          onError={(e) => {
            // Nếu hình ảnh lỗi, hiển thị chữ cái đầu
            e.currentTarget.style.display = "none";
            e.currentTarget.parentElement!.classList.add(
              "bg-blue-100",
              "text-blue-600",
            );
            e.currentTarget.parentElement!.innerHTML = initials();
          }}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-blue-100 font-medium text-blue-600">
          {initials()}
        </div>
      )}
    </div>
  );
};

export default Avatar;
