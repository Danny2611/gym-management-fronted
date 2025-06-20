import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

import SectionTitle from "~/components/common/SectionTitle";
import { useTranslation } from "react-i18next";

interface ServiceProps {
  id: string;
  image: string;
  title: string;
  description: string;
  link: string;
}



const ServicesSection: React.FC = () => {
  const { t } = useTranslation();
  const services = t("home.ServicesSection.services", {
  returnObjects: true,
}) as ServiceProps[];
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
    hidden: { opacity: 0, y: 30 },
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
  title={t("home.ServicesSection.title")}
  subtitle={t("home.ServicesSection.subtitle")}
  description={t("home.ServicesSection.description")}
  centered
/>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4"
        >
          {services.map((service) => (
            <motion.div
              key={service.id}
              variants={itemVariants}
              className="group overflow-hidden rounded-lg bg-white shadow-lg transition-all duration-300 hover:shadow-xl dark:bg-gray-800 dark:shadow-gray-900/20 dark:hover:shadow-gray-900/40"
            >
              <div className="relative h-56 overflow-hidden">
                <img
                  src={service.image}
                  alt={service.title}
                  className="h-full w-full transform object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div className="p-6">
                <h3 className="mb-3 text-xl font-bold text-[#0D2E4B] dark:text-white">
                  {service.title}
                </h3>
                <p className="mb-4 text-gray-600 dark:text-gray-300">{service.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <div className="mt-12 text-center">
          <Link to="/services">
            <button className="rounded-md bg-[#0D2E4B] px-8 py-3 font-medium text-white transition-colors hover:bg-[#0CC6F0] dark:bg-[#0CC6F0] dark:hover:bg-[#0D2E4B]">
               {t("home.ServicesSection.cta")}
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;