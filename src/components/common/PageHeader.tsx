import React from "react";

interface PageHeaderProps {
  title: string;
  subtitle: string;
  backgroundImage: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  backgroundImage,
}) => {
  return (
    <div
      className="relative flex h-80 items-center justify-center bg-cover bg-center bg-no-repeat md:h-96"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-60"></div>

      {/* Content */}
      <div className="container relative z-10 px-4 text-center text-white">
        <h1 className="mb-4 text-4xl font-bold md:text-5xl lg:text-6xl">
          {title}
        </h1>
        <p className="mx-auto max-w-2xl text-lg md:text-xl">{subtitle}</p>
      </div>
    </div>
  );
};

export default PageHeader;
