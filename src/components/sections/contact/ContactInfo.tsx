import React from "react";
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock } from "react-icons/fa";

interface ContactInfoItemProps {
  icon: React.ReactNode;
  title: string;
  text: string | React.ReactNode;
}

const ContactInfoItem: React.FC<ContactInfoItemProps> = ({
  icon,
  title,
  text,
}) => {
  return (
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
};

const ContactInfo: React.FC = () => {
  return (
    <div className="bg-gray-50 py-12 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <ContactInfoItem
            icon={<FaMapMarkerAlt />}
            title="Our Location"
            text="123 Linh Xuân, thành phố Thủ Đức, Hồ Chí Minh."
          />
          <ContactInfoItem
            icon={<FaPhone />}
            title="Phone Number"
            text={
              <>
                <p className="text-gray-600 dark:text-gray-300">Main: (123) 456-7890</p>
                <p className="text-gray-600 dark:text-gray-300">Support: (123) 456-7891</p>
              </>
            }
          />
          <ContactInfoItem
            icon={<FaEnvelope />}
            title="Email Address"
            text={
              <>
                <p className="text-gray-600 dark:text-gray-300">info@fittlife.com</p>
                <p className="text-gray-600 dark:text-gray-300">support@fittlife.com</p>
              </>
            }
          />
          <ContactInfoItem
            icon={<FaClock />}
            title="Working Hours"
            text={
              <>
                <p className="text-gray-600 dark:text-gray-300">
                  Thứ 2- Thứ 6: 6:00 AM - 10:00 PM
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                  Thứ 7- Chủ nhật: 8:00 AM - 8:00 PM
                </p>
              </>
            }
          />
        </div>
      </div>
    </div>
  );
};

export default ContactInfo;