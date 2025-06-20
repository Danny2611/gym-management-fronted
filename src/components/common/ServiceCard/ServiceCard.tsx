import React from "react";
import { motion } from "framer-motion";

interface ServiceCardProps {
  id: string;
  image: string;
  title: string;
  description: string;
  link: string;
  variants?: any; // Optional cho animation
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  id,
  image,
  title,
  description,

  variants,
}) => {
  return (
    <motion.div
      key={id}
      variants={variants}
      className="group overflow-hidden rounded-lg bg-white shadow-lg transition-all duration-300 hover:shadow-xl"
    >
      <div className="relative h-56 overflow-hidden">
        <img
          src={image}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </div>
      <div className="p-6">
        <h3 className="mb-3 text-xl font-bold text-[#0D2E4B]">{title}</h3>
        <p className="mb-4 text-gray-600">{description}</p>
      </div>
    </motion.div>
  );
};

export default ServiceCard;
