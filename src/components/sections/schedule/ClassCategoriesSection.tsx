import React from "react";
import { motion } from "framer-motion";
import SectionTitle from "../../common/SectionTitle";
import { Link } from "react-router-dom";

// Define interface for class category
interface ClassCategory {
  id: number;
  title: string;
  description: string;
  image: string;
  slug: string;
  classCount: number;
}

const ClassCategoriesSection: React.FC = () => {
  // Mock data for class categories
  const classCategories: ClassCategory[] = [
    {
      id: 1,
      title: "Cardio",
      description:
        "High-intensity workouts to improve cardiovascular health and burn calories.",
      image: "/images/schedule/cardio.jpg",
      slug: "cardio",
      classCount: 8,
    },
    {
      id: 2,
      title: "Strength",
      description:
        "Build muscle and increase strength with focused weight training sessions.",
      image: "/images/schedule/strength.jpg",
      slug: "strength",
      classCount: 6,
    },
    {
      id: 3,
      title: "Yoga",
      description:
        "Improve flexibility, balance and mental well-being through guided yoga practices.",
      image: "/images/schedule/yoga.jpg",
      slug: "yoga",
      classCount: 5,
    },
    {
      id: 4,
      title: "HIIT",
      description:
        "High Intensity Interval Training for maximum results in minimal time.",
      image: "/images/schedule/hiit.jpg",
      slug: "hiit",
      classCount: 4,
    },
    {
      id: 5,
      title: "Boxing",
      description: "Learn boxing techniques while getting a full-body workout.",
      image: "/images/schedule/boxing.jpg",
      slug: "boxing",
      classCount: 3,
    },
    {
      id: 6,
      title: "Pilates",
      description:
        "Core-strengthening exercises that improve posture and overall body strength.",
      image: "/images/schedule/pilates.jpg",
      slug: "pilates",
      classCount: 4,
    },
  ];

  return (
    <section className="bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        <SectionTitle
          title="Class Categories"
          subtitle="Find Your Perfect Workout"
          alignment="center"
        />

        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {classCategories.map((category) => (
            <motion.div
              key={category.id}
              whileHover={{ y: -10 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden rounded-lg bg-white shadow-lg"
            >
              <div className="relative h-64 overflow-hidden">
                <img
                  src={category.image}
                  alt={category.title}
                  className="h-full w-full object-cover transition-transform duration-500 hover:scale-110"
                />
                <div className="absolute right-4 top-4 rounded-full bg-red-600 px-3 py-1 text-sm font-semibold text-white">
                  {category.classCount} classes
                </div>
              </div>

              <div className="p-6">
                <h3 className="mb-2 text-2xl font-bold text-gray-800">
                  {category.title}
                </h3>
                <p className="mb-4 text-gray-600">{category.description}</p>
                <Link
                  to={`/schedule/${category.slug}`}
                  className="inline-block rounded-full bg-red-600 px-6 py-2 font-semibold text-white transition duration-300 hover:bg-red-700"
                >
                  Explore Classes
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            to="/schedule"
            className="inline-block rounded-full border-2 border-red-600 px-8 py-3 font-semibold text-red-600 transition duration-300 hover:bg-red-600 hover:text-white"
          >
            View All Classes
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ClassCategoriesSection;
