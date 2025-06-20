import React from "react";

const DropdownMenu: React.FC = () => {
  return (
    <div className="absolute mt-2 w-48 bg-white py-2 shadow-lg">
      <a href="#" className="block px-4 py-2 text-gray-800 hover:bg-gray-200">
        About Us
      </a>
      <a href="#" className="block px-4 py-2 text-gray-800 hover:bg-gray-200">
        Our Trainers
      </a>
      <a href="#" className="block px-4 py-2 text-gray-800 hover:bg-gray-200">
        Our Price
      </a>
      <a href="#" className="block px-4 py-2 text-gray-800 hover:bg-gray-200">
        Success Story
      </a>
      <a href="#" className="block px-4 py-2 text-gray-800 hover:bg-gray-200">
        Testimonial
      </a>
      <a href="#" className="block px-4 py-2 text-gray-800 hover:bg-gray-200">
        FAQ
      </a>
    </div>
  );
};

export default DropdownMenu;
