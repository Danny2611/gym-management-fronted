import React from "react";
import SectionTitle from "../../common/SectionTitle";
import { motion } from "framer-motion";
import {
  FaCloudShowersHeavy,
  FaCoffee,
  FaDumbbell,
  FaHeartbeat,
  FaSwimmer,
  FaUserCircle,
} from "react-icons/fa";

interface Facility {
  id: number;
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FacilitiesSection: React.FC = () => {
  const facilities: Facility[] = [
    {
      id: 1,
      icon: <FaDumbbell />,
      title: "Modern Equipment",
      description:
        "State-of-the-art fitness machines and free weights for every type of workout.",
    },
    {
      id: 2,
      icon: <FaCloudShowersHeavy />,
      title: "Locker Rooms",
      description:
        "Clean and spacious locker rooms with showers, saunas, and amenities.",
    },
    {
      id: 3,
      icon: <FaHeartbeat />,
      title: "Cardio Area",
      description:
        "Dedicated space with treadmills, ellipticals, and bikes with entertainment options.",
    },
    {
      id: 4,
      icon: <FaUserCircle />,
      title: "Group Classes",
      description:
        "Versatile studios for yoga, HIIT, cycling, and many other group activities.",
    },
    {
      id: 5,
      icon: <FaSwimmer />,
      title: "Swimming Pool",
      description:
        "Indoor heated pool for swimming laps, aqua aerobics, and relaxation.",
    },
    {
      id: 6,
      icon: <FaCoffee />,
      title: "Juice Bar",
      description:
        "Healthy refreshments, protein shakes, and nutritious snacks to fuel your workout.",
    },
  ];

  return (
    <section className="bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        <SectionTitle
          subtitle="OUR FACILITIES"
          title="Premium Amenities For Your Fitness Journey"
          description="Experience a fitness environment designed for comfort, functionality, and motivation. Our facilities are equipped with everything you need to achieve your health and fitness goals."
        />

        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {facilities.map((facility) => (
            <motion.div
              key={facility.id}
              whileHover={{ y: -10 }}
              className="rounded-lg bg-white p-8 shadow-md"
            >
              <div className="bg-primary-100 text-primary-600 mb-6 flex h-16 w-16 items-center justify-center rounded-full">
                {/* <i className={`fas fa-${facility.icon} text-2xl`}></i> */}
                {facility.icon}
              </div>
              <h3 className="mb-3 text-xl font-bold">{facility.title}</h3>
              <p className="text-gray-600">{facility.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FacilitiesSection;
