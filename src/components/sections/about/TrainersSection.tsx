import React from "react";
import SectionTitle from "../../common/SectionTitle";
import TeamMemberCard from "../../common/TeamMemberCard";
import { motion } from "framer-motion";

interface Trainer {
  id: number;
  name: string;
  role: string;
  image: string;
  socialMedia: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
}

const TrainersSection: React.FC = () => {
  const trainers: Trainer[] = [
    {
      id: 1,
      name: "Sarah Johnson",
      role: "Yoga Instructor",
      image: "/images/team/trainer-1.jpg",
      socialMedia: {
        facebook: "#",
        twitter: "#",
        instagram: "#",
      },
    },
    {
      id: 2,
      name: "Michael Rodriguez",
      role: "CrossFit Coach",
      image: "/images/team/trainer-2.jpg",
      socialMedia: {
        facebook: "#",
        twitter: "#",
        instagram: "#",
      },
    },
    {
      id: 3,
      name: "Lisa Chen",
      role: "Nutrition Specialist",
      image: "/images/team/trainer-3.jpg",
      socialMedia: {
        facebook: "#",
        twitter: "#",
        instagram: "#",
      },
    },
    {
      id: 4,
      name: "David Wilson",
      role: "Personal Trainer",
      image: "/images/team/trainer-4.jpg",
      socialMedia: {
        facebook: "#",
        twitter: "#",
        instagram: "#",
      },
    },
  ];

  return (
    <section className="bg-white py-16">
      <div className="container mx-auto px-4">
        <SectionTitle
          subtitle="OUR TRAINERS"
          title="Expert Coaches To Guide Your Fitness Journey"
          description="Our certified trainers are passionate about helping you reach your fitness goals. With specialized expertise and personalized approaches, they'll support you every step of the way."
        />

        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {trainers.map((trainer) => (
            <motion.div key={trainer.id} whileHover={{ y: -10 }}>
              <TeamMemberCard
                name={trainer.name}
                role={trainer.role}
                image={trainer.image}
                socialLinks={trainer.socialMedia}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrainersSection;
