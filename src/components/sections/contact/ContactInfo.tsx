import React from "react";
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock } from "react-icons/fa";
import { useTranslation } from "react-i18next";

interface ContactInfoItemProps {
  icon: React.ReactNode;
  title: string;
  text: string | React.ReactNode;
}

const ContactInfoItem: React.FC<ContactInfoItemProps> = ({
  icon,
  title,
  text,
}) => (
  <div className="flex items-start rounded-lg bg-white p-6 shadow-md dark:bg-gray-800 dark:shadow-gray-700/20">
    <div className="mr-4 flex-shrink-0 text-2xl text-[#0D2E4B] dark:text-blue-400">
      {icon}
    </div>
    <div>
      <h3 className="mb-2 text-lg font-bold text-[#0D2E4B] dark:text-white">
        {title}
      </h3>
      {typeof text === "string" ? (
        <p className="text-gray-600 dark:text-gray-300">{text}</p>
      ) : (
        text
      )}
    </div>
  </div>
);

const ContactInfo: React.FC = () => {
  const { t } = useTranslation();

  const ct = t("contact.ContactInfo", { returnObjects: true }) as Record<string, string>;

  return (
    <div className="bg-gray-50 py-12 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <ContactInfoItem
            icon={<FaMapMarkerAlt />}
            title={t("contact.ContactInfo.locationTitle", "Our Location")}
            text={ct.location}
          />
          <ContactInfoItem
            icon={<FaPhone />}
            title={ct.phoneTitle}
            text={
              <>
                <p>{ct.phoneMain}</p>
                <p>{ct.phoneSupport}</p>
              </>
            }
          />
          <ContactInfoItem
            icon={<FaEnvelope />}
            title={ct.emailTitle}
            text={
              <>
                <p>{ct.emailInfo}</p>
                <p>{ct.emailSupport}</p>
              </>
            }
          />
          <ContactInfoItem
            icon={<FaClock />}
            title={ct.hoursTitle}
            text={
              <>
                <p>{ct.hoursWeekday}</p>
                <p>{ct.hoursWeekend}</p>
              </>
            }
          />
        </div>
      </div>
    </div>
  );
};

export default ContactInfo;
