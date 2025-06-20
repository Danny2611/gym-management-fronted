import React from "react";
// import ScheduleHero from './ScheduleHero';
// import ClassCategoriesSection from './ClassCategoriesSection';
import WeeklyScheduleSection from "./WeeklyScheduleSection";
import ClassBookingSection from "./ClassBookingSection";
import PricingSection from "./PricingSection";
import CallToActionSection from "../home/CallToActionSection";

const ScheduleSections: React.FC = () => {
  return (
    <>
      {/* <ScheduleHero />
      <ClassCategoriesSection /> */}
      <WeeklyScheduleSection />
      <ClassBookingSection />
      <PricingSection />
      <CallToActionSection />
    </>
  );
};

export default ScheduleSections;
