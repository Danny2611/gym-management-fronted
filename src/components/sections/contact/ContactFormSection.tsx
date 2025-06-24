import React, { useState } from "react";
import ContactForm from "../../common/ContactForm";
import Map from "../../common/Map";
import { useTranslation } from "react-i18next";

interface ContactFormSectionProps {
  location?: string;
}

const ContactFormSection: React.FC<ContactFormSectionProps> = ({
  location = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d387190.2798897555!2d-74.25987155604412!3d40.69767006316378!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDDCsDQxJzUyLjAiTiA3NMKwMTUnMjguNyJX!5e0!3m2!1sen!2us!4v1614588395925!5m2!1sen!2sus",
}) => {
  const { t } = useTranslation();
  const title = t("contact.ContactFormSection.title");
  const subtitle = t("contact.ContactFormSection.subtitle");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: any) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setSuccess(true);
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 py-16 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          <div>
            <div className="mb-8">
              <h2 className="mb-3 text-3xl font-bold text-[#0D2E4B] dark:text-white">
                {title}
              </h2>
              <p className="text-gray-600 dark:text-gray-300">{subtitle}</p>
            </div>
            <ContactForm
              onSubmit={handleSubmit}
              loading={loading}
              success={success}
            />
          </div>
          <div className="h-full min-h-[400px]">
            <Map location={location} height="100%" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactFormSection;
