import React, { useState, useRef } from "react";
import { FiCamera } from "react-icons/fi";

// Định nghĩa interface cho props
export interface ProfileImageProps {
  avatar?: string;
  name?: string;
  editable?: boolean;
  onChange?: (file: File) => void;
}

const ProfileImage: React.FC<ProfileImageProps> = ({
  avatar,
  name = "User",
  editable = false,
  onChange,
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result as string);
      if (onChange) onChange(file);
    };
    reader.readAsDataURL(file);
  };

  const handleClick = () => {
    if (editable && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="mb-5.5 relative flex flex-col items-center">
      <div
        className={`relative h-32 w-32 rounded-full ${editable ? "cursor-pointer" : ""}`}
        onClick={handleClick}
      >
        <img
          src={
            previewUrl ||
            (avatar
              ? `http://localhost:5000/${avatar}`
              : "/images/user/avatar-placeholder.png")
          }
          alt={name}
          className="h-full w-full rounded-full object-cover"
        />

        {editable && (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black bg-opacity-50 opacity-0 transition-opacity hover:opacity-100">
            <FiCamera className="h-8 w-8 text-white" />
          </div>
        )}
      </div>

      {editable && (
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
        />
      )}
    </div>
  );
};

export default ProfileImage;
