import React from "react";
import SectionTitle from "../../common/SectionTitle";
import { useTranslation } from "react-i18next";

const MissionValuesSection: React.FC = () => {
  const { t } = useTranslation();

  return (
    <section className="bg-gray-50 py-16 dark:bg-gray-800">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2">
          <div className="order-2 md:order-1">
            <SectionTitle
              subtitle={t("about.MissionValuesSection.subtitle")}
              title={t("about.MissionValuesSection.title")}
              alignment="left"
            />
            <p className="mb-6 text-gray-600 dark:text-gray-300">
              {t("about.MissionValuesSection.paragraph1")}
            </p>
            <p className="mb-6 text-gray-600 dark:text-gray-300">
              {t("about.MissionValuesSection.paragraph2")}
            </p>
            <div className="mt-8 grid grid-cols-2 gap-6">
              <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-700">
                <h4 className="mb-2 text-lg font-bold text-gray-800 dark:text-white">
                  {t("about.MissionValuesSection.value1Title")}
                </h4>
                <p className="text-gray-500 dark:text-gray-400">
                  {t("about.MissionValuesSection.value1Desc")}
                </p>
              </div>
              <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-700">
                <h4 className="mb-2 text-lg font-bold text-gray-800 dark:text-white">
                  {t("about.MissionValuesSection.value2Title")}
                </h4>
                <p className="text-gray-500 dark:text-gray-400">
                  {t("about.MissionValuesSection.value2Desc")}
                </p>
              </div>
            </div>
          </div>
          <div className="relative order-1 md:order-2">
            <img
              src="/images/about/mission-main.JPG"
              alt={t("about.MissionValuesSection.imageMainAlt")}
              className="h-auto w-full rounded-lg object-cover shadow-lg"
            />
            <div className="absolute -bottom-8 -left-8 hidden md:block">
              <img
                src="/images/about/mission-accent.JPG"
                alt={t("about.MissionValuesSection.imageAccentAlt")}
                className="h-48 w-48 rounded-lg border-4 border-white object-cover shadow-lg"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MissionValuesSection;