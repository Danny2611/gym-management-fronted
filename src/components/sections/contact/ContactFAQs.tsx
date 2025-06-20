import React from "react";
import { Disclosure, Transition } from "@headlessui/react";
import { FaChevronDown } from "react-icons/fa";

interface FAQ {
  question: string;
  answer: string;
}

interface ContactFAQsProps {
  title?: string;
  subtitle?: string;
  faqs: FAQ[];
}

const ContactFAQs: React.FC<ContactFAQsProps> = ({
  title = "Câu Hỏi Thường Gặp",
  subtitle = "Tìm câu trả lời cho những thắc mắc thường gặp về phòng gym và dịch vụ của chúng tôi",
  faqs,
}) => {
  return (
    <div className="bg-white py-16 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl">
          {title && (
            <div className="mb-12 text-center">
              <h2 className="mb-3 text-3xl font-bold text-[#0D2E4B] dark:text-white">
                {title}
              </h2>
              {subtitle && (
                <p className="text-gray-600 dark:text-gray-300">{subtitle}</p>
              )}
            </div>
          )}

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Disclosure
                key={index}
                as="div"
                className="rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
              >
                {({ open }) => (
                  <>
                    <Disclosure.Button className="flex w-full justify-between px-6 py-4 text-left focus:outline-none focus:ring-2 focus:ring-[#0D2E4B] focus:ring-opacity-50 dark:focus:ring-blue-400 dark:focus:ring-opacity-50">
                      <span className="text-lg font-medium text-[#0D2E4B] dark:text-white">
                        {faq.question}
                      </span>
                      <FaChevronDown
                        className={`${
                          open 
                            ? "rotate-180 transform text-[#0D2E4B] dark:text-blue-400" 
                            : "text-gray-500 dark:text-gray-400"
                        } h-5 w-5 transition-transform duration-200`}
                      />
                    </Disclosure.Button>
                    <Transition
                      enter="transition duration-100 ease-out"
                      enterFrom="transform scale-95 opacity-0"
                      enterTo="transform scale-100 opacity-100"
                      leave="transition duration-75 ease-out"
                      leaveFrom="transform scale-100 opacity-100"
                      leaveTo="transform scale-95 opacity-0"
                    >
                      <Disclosure.Panel className="px-6 py-4 pt-0 text-gray-600 dark:text-gray-300">
                        {faq.answer}
                      </Disclosure.Panel>
                    </Transition>
                  </>
                )}
              </Disclosure>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactFAQs;