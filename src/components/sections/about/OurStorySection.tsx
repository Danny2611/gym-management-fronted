import React from "react";
import SectionTitle from "../../common/SectionTitle";
import { useTranslation } from "react-i18next";

const OurStorySection: React.FC = () => {
  const { t } = useTranslation();

  return (
    <section className="bg-white py-16 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2">
          <div className="relative">
            <img
              src="/images/about/story-main.jpg"
              alt={t("about.OurStorySection.imageMainAlt")}
              className="h-auto w-full rounded-lg object-cover shadow-lg"
            />
            <div className="absolute -bottom-8 -right-8 hidden md:block">
              <img
                src="/images/about/story-accent.jpg"
                alt={t("about.OurStorySection.imageAccentAlt")}
                className="h-48 w-48 rounded-lg border-4 border-white object-cover shadow-lg"
              />
            </div>
          </div>
          <div>
            <SectionTitle
              subtitle={t("about.OurStorySection.subtitle")}
              title={t("about.OurStorySection.title")}
              alignment="left"
            />
            <p className="mb-6 text-gray-600 dark:text-gray-300">
              {t("about.OurStorySection.paragraph1")}
            </p>
            <p className="mb-6 text-gray-600 dark:text-gray-300">
              {t("about.OurStorySection.paragraph2")}
            </p>
            <div className="mt-8 flex flex-wrap gap-6">
              <div className="flex items-center">
                <div className="bg-primary-600 mr-4 flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold text-white">
                  {t("about.OurStorySection.years")}
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-800 dark:text-white">
                    {t("about.OurStorySection.experienceTitle")}
                  </h4>
                  <p className="text-gray-500 dark:text-gray-400">
                    {t("about.OurStorySection.experienceDesc")}
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="bg-primary-600 mr-4 flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold text-white">
                  {t("about.OurStorySection.coaches")}
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-800 dark:text-white">
                    {t("about.OurStorySection.coachTitle")}
                  </h4>
                  <p className="text-gray-500 dark:text-gray-400">
                    {t("about.OurStorySection.coachDesc")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OurStorySection;
