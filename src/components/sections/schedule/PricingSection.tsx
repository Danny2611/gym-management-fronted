import React from "react";
import SectionTitle from "../../common/SectionTitle";
import Button from "../../common/Button";

const PricingSection: React.FC = () => {
  const plans = [
    {
      title: "Day Pass",
      price: "$25",
      period: "per day",
      features: [
        "Access to all facilities",
        "Join any group class",
        "Locker & towel service",
        "No commitment required",
      ],
      popular: false,
    },
    {
      title: "Monthly Membership",
      price: "$99",
      period: "per month",
      features: [
        "Unlimited access to facilities",
        "All group classes included",
        "Free fitness assessment",
        "Locker & towel service",
        "Bring a friend 2x per month",
      ],
      popular: true,
    },
    {
      title: "Annual Membership",
      price: "$899",
      period: "per year",
      features: [
        "All monthly benefits",
        "Save over $280 per year",
        "2 free personal training sessions",
        "Exclusive member events",
        "Nutrition consultation",
      ],
      popular: false,
    },
  ];

  return (
    <section className="bg-gray-100 py-16">
      <div className="container mx-auto px-4">
        <SectionTitle
          subtitle="MEMBERSHIP OPTIONS"
          title="Choose Your Plan"
          alignment="center"
        />

        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative overflow-hidden rounded-lg border bg-white shadow-lg ${
                plan.popular
                  ? "border-primary-500 transform md:scale-105"
                  : "border-gray-200"
              }`}
            >
              {plan.popular && (
                <div className="bg-primary-500 absolute right-0 top-0 px-4 py-1 text-sm font-semibold text-white">
                  Most Popular
                </div>
              )}
              <div
                className={`p-6 ${plan.popular ? "bg-primary-500 text-white" : "bg-gray-50"}`}
              >
                <h3 className="mb-2 text-xl font-bold">{plan.title}</h3>
                <div className="flex items-end">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="ml-1 text-sm opacity-75">{plan.period}</span>
                </div>
              </div>
              <div className="p-6">
                <ul className="mb-6 space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <svg
                        className="mr-2 mt-0.5 h-5 w-5 text-green-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        ></path>
                      </svg>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  href="/contact"
                  className={`w-full ${plan.popular ? "bg-primary-500 hover:bg-primary-600" : ""}`}
                >
                  Get Started
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="mb-4 text-gray-600">
            Looking for corporate rates or special packages?
          </p>
          <Button href="/contact" variant="outline">
            Contact Us for Custom Solutions
          </Button>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
