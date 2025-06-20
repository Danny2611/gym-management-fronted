import React from "react";
import { motion } from "framer-motion";
import { GiWeightLiftingUp, GiMuscleUp, GiHeartBeats } from "react-icons/gi";
import {
  MdSportsGymnastics,
  MdSportsMartialArts,
  MdFoodBank,
} from "react-icons/md";
import { useTranslation } from "react-i18next";
import SectionTitle from "~/components/common/SectionTitle";

interface FeatureProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const iconList: React.ReactNode[] = [
  <GiWeightLiftingUp size={48} />,
  <GiMuscleUp size={48} />,
  <MdFoodBank size={48} />,
  <MdSportsGymnastics size={48} />,
  <GiHeartBeats size={48} />,
  <MdSportsMartialArts size={48} />,
];

const FeaturesSection: React.FC = () => {
  const { t } = useTranslation();

  const rawFeatures = t("home.FeaturesSection.features", {
    returnObjects: true,
  }) as { title: string; description: string }[];

  // Ghép icon vào từng feature
  const features: FeatureProps[] = rawFeatures.map((item, index) => ({
    icon: iconList[index],
    title: item.title,
    description: item.description,
  }));

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
      },
    },
  };

  return (
    <section className="bg-gray-50 py-20 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <SectionTitle
          title={t("home.FeaturesSection.title")}
          subtitle={t("home.FeaturesSection.subtitle")}
          description={t("home.FeaturesSection.description")}
          centered
        />

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="rounded-lg bg-white p-8 shadow-lg transition-transform hover:scale-105 hover:shadow-xl dark:bg-gray-800 dark:shadow-gray-900/20 dark:hover:shadow-gray-900/40"
            >
              <div className="mb-4 text-[#0CC6F0] dark:text-[#0CC6F0]">
                {feature.icon}
              </div>
              <h3 className="mb-3 text-xl font-bold text-[#0D2E4B] dark:text-white">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;
