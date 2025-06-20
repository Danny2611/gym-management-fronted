// src/components/common/TeamMemberCard.tsx

import React from "react";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";

export interface TeamMemberCardProps {
  name: string;
  role: string;
  image: string;
  bio?: string;
  socialLinks?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
  className?: string;
}

const TeamMemberCard: React.FC<TeamMemberCardProps> = ({
  name,
  role,
  image,
  bio,
  socialLinks,
  className = "",
}) => {
  return (
    <div
      className={`overflow-hidden rounded-lg bg-white shadow-md ${className}`}
    >
      <div className="group relative overflow-hidden">
        <img
          src={image}
          alt={name}
          className="h-72 w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />

        {/* Social icons overlay */}
        {socialLinks && (
          <div className="absolute inset-0 flex items-center justify-center gap-4 bg-black/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            {socialLinks.facebook && (
              <a
                href={socialLinks.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 hover:bg-primary-600 flex h-10 w-10 items-center justify-center rounded-full bg-white transition-colors hover:text-white"
              >
                <FaFacebook />
              </a>
            )}

            {socialLinks.twitter && (
              <a
                href={socialLinks.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 hover:bg-primary-600 flex h-10 w-10 items-center justify-center rounded-full bg-white transition-colors hover:text-white"
              >
                <FaTwitter />
              </a>
            )}

            {socialLinks.instagram && (
              <a
                href={socialLinks.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 hover:bg-primary-600 flex h-10 w-10 items-center justify-center rounded-full bg-white transition-colors hover:text-white"
              >
                <FaInstagram />
              </a>
            )}

            {socialLinks.linkedin && (
              <a
                href={socialLinks.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 hover:bg-primary-600 flex h-10 w-10 items-center justify-center rounded-full bg-white transition-colors hover:text-white"
              >
                <FaLinkedin />
              </a>
            )}
          </div>
        )}
      </div>

      <div className="p-5">
        <h3 className="text-xl font-bold text-gray-900">{name}</h3>
        <p className="text-primary-600 mb-2 font-medium">{role}</p>

        {bio && <p className="text-gray-600">{bio}</p>}
      </div>
    </div>
  );
};

export default TeamMemberCard;
