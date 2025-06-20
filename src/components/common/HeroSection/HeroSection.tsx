// src/components/common/HeroSection.tsx

import React from "react";
import { Link } from "react-router-dom";
import Button from "../Button";

export interface HeroSectionProps {
  title: string;
  subtitle?: string;
  backgroundImage: string;
  buttons?: Array<{
    text: string;
    url: string;
    variant: "primary" | "secondary" | "outline";
  }>;
  overlay?: boolean;
  overlayOpacity?: "light" | "medium" | "dark";
  contentPosition?: "left" | "center" | "right";
  minHeight?: string;
}

const HeroSection: React.FC<HeroSectionProps> = ({
  title,
  subtitle,
  backgroundImage,
  buttons = [],
  overlay = true,
  overlayOpacity = "medium",
  contentPosition = "center",
  minHeight = "min-h-[500px]",
}) => {
  // Determine overlay opacity class
  const overlayClass = overlay
    ? {
        "bg-black/30": overlayOpacity === "light",
        "bg-black/50": overlayOpacity === "medium",
        "bg-black/70": overlayOpacity === "dark",
      }[
        `bg-black/${overlayOpacity === "light" ? "30" : overlayOpacity === "medium" ? "50" : "70"}`
      ]
    : "";

  // Determine content position
  const contentPositionClass = {
    left: "items-start text-left",
    center: "items-center text-center",
    right: "items-end text-right",
  }[contentPosition];

  return (
    <div
      className={`relative ${minHeight} flex w-full items-center justify-center bg-cover bg-center`}
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      {overlay && <div className={`absolute inset-0 ${overlayClass}`}></div>}

      <div className="container relative z-10 px-4 md:px-8">
        <div
          className={`flex flex-col ${contentPositionClass} mx-auto max-w-3xl`}
        >
          <h1
            className="font-heading mb-4 text-3xl font-bold text-white md:text-4xl lg:text-5xl"
            dangerouslySetInnerHTML={{ __html: title }}
          ></h1>

          {subtitle && (
            <p className="mb-8 text-lg text-white/90 md:text-xl">{subtitle}</p>
          )}

          {buttons.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-4">
              {buttons.map((button, index) => (
                <Link to={button.url} key={index}>
                  <Button
                    variant={button.variant}
                    size="large"
                    text={button.text}
                  />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
