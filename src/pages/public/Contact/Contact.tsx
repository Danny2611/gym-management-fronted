import React from "react";
import { Helmet } from "react-helmet-async";
import Layout from "~/components/layout/Layout";
import ContactInfo from "~/components/sections/contact/ContactInfo";
import ContactFormSection from "~/components/sections/contact/ContactFormSection";
import ContactFAQs from "~/components/sections/contact/ContactFAQs";

import HomeSlider from "~/components/sections/home/HomeSlider";
import { useTranslation } from "react-i18next";
import { FAQ } from "~/types/contact";

const Contact: React.FC = () => {
  const { t } = useTranslation();

  const faqs = t("contact.ContactFAQs.items", {
    returnObjects: true,
  }) as FAQ[];

  return (
    <Layout>
      <Helmet>
        <title>{t("contact.ContactFAQs.pageTitle")}</title>
      </Helmet>
      <HomeSlider />
      <ContactInfo />
      <ContactFormSection />
      <ContactFAQs
        title={t("contact.ContactFAQs.title")}
        subtitle={t("contact.ContactFAQs.subtitle")}
        faqs={faqs}
      />
       <section className="bg-[#4c4c4c] py-16 dark:bg-gray-800">
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
    </Layout>
  );
};

export default Contact;
