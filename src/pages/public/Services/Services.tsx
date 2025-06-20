import React from "react";
import { Helmet } from "react-helmet-async";
import ServicesOverviewSection from "~/components/sections/services/ServicesOverviewSection";
import PricingSection from "~/components/sections/services/PricingSection";
import FAQSection from "~/components/sections/services/FAQSection";
import HomeSlider from "~/components/sections/home/HomeSlider";

const Services: React.FC = () => {
  return (
    <div>
      <Helmet>
        <title>Dịch Vụ</title>
      </Helmet>
      <HomeSlider />
      <ServicesOverviewSection />
      <PricingSection />
      <FAQSection />
    </div>
  );
};

export default Services;
