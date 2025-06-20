import React from "react";

interface MapProps {
  location?: string; // Accepts a Google Maps embed location URL
  height?: string;
  width?: string;
}

const Map: React.FC<MapProps> = ({
  location = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d387190.2798897555!2d-74.25987155604412!3d40.69767006316378!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDDCsDQxJzUyLjAiTiA3NMKwMTUnMjguNyJX!5e0!3m2!1sen!2sus!4v1614588395925!5m2!1sen!2sus",
  height = "400px",
  width = "100%",
}) => {
  return (
    <div className="overflow-hidden rounded-lg shadow-md">
      <iframe
        src={location}
        width={width}
        height={height}
        allowFullScreen
        loading="lazy"
        className="h-full w-full border-none"
      ></iframe>
    </div>
  );
};

export default Map;
