import React from "react";
import SectionTitle from "~/components/common/SectionTitle";
import ContactFAQs from "~/components/sections/contact/ContactFAQs";
import Button from "~/components/common/Button";
import { useTranslation } from "react-i18next";

const FAQSection: React.FC = () => {
  const { t } = useTranslation();

  const faqs = t("services.FAQSection.items", {
    returnObjects: true,
  }) as Array<{
    question: string;
    answer: string;
  }>;

  return (
    <section className="bg-gray-50 py-16 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <SectionTitle title={t("services.FAQSection.title")} />

        <ContactFAQs
          title={t("services.FAQSection.subtitle")}
          subtitle={t("services.FAQSection.description")}
          faqs={faqs}
        />

        <div className="mt-12 text-center">
          <p className="mb-4 text-gray-600 dark:text-gray-300">
            {t("services.FAQSection.cta")}
          </p>
          <Button variant="primary" size="large">
            {t("services.FAQSection.button")}
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
