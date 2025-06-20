import React from "react";
import OurStorySection from "~/components/sections/about/OurStorySection";
import MissionValuesSection from "~/components/sections/about/MissionValuesSection";
import TeamSection from "~/components/sections/about/TeamSection";
import { Helmet } from "react-helmet-async";
import Slider, { SlideProps } from "~/components/common/Slider";
import ContactFAQs from "~/components/sections/contact/ContactFAQs";
import { useTranslation } from "react-i18next";
import { FAQ } from "~/types/contact";

const AboutPage: React.FC = () => {
  const { t } = useTranslation();
  const aboutSlider = t("about.slider", { returnObjects: true }) as any;
    const aboutSlides = aboutSlider.slides as SlideProps[];
    const faqItems = (t("about.FAQ.items", { returnObjects: true }) as {
    question: string;
    answer: string;
  }[]);

  return (
    <>
      <Helmet>
        <title>Về Chúng Tôi</title>
      </Helmet>
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <Slider slides={aboutSlides} />

        {/* Our Story Section - Zigzag Item 1 */}
        <OurStorySection />

        {/* Mission & Values Section - Zigzag Item 2 */}
        <MissionValuesSection />

        {/* Team Section - Zigzag Item 3 */}
        <TeamSection />

      {/* CTA Section */}
      <section className="bg-[#0D2E4B] py-16 dark:bg-gray-800">
      <div className="container mx-auto px-4 text-center">
        <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
          {t("about.CTA.title")}
        </h2>
        <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-200 dark:text-gray-300">
          {t("about.CTA.description")}
        </p>
        <div className="flex flex-col items-center justify-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
          <button className="rounded-lg bg-white px-8 py-3 font-semibold text-[#0D2E4B] transition-all hover:bg-gray-100 dark:bg-gray-200 dark:text-gray-800 dark:hover:bg-white">
            {t("about.CTA.primary")}
          </button>
          <button className="rounded-lg border-2 border-white px-8 py-3 font-semibold text-white transition-all hover:bg-white hover:text-[#0D2E4B] dark:border-gray-300 dark:text-gray-300 dark:hover:bg-gray-300 dark:hover:text-gray-800">
            {t("about.CTA.secondary")}
          </button>
        </div>
      </div>
    </section>
        {/* FAQ Section */}
     
         <ContactFAQs
          title={t("about.FAQ.title")}
          subtitle={t("about.FAQ.subtitle")}
          faqs={faqItems}
      />
      </div>
    </>
  );
};



export default AboutPage;