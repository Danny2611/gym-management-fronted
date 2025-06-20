import React from "react";
import ClassScheduleSection from "~/components/sections/schedule/ClassScheduleSection";
import ClassDetailsSection from "~/components/sections/schedule/ClassDetailsSection";
import TrainerHighlightsSection from "~/components/sections/schedule/TrainerHighlightsSection";
import PricingSection from "~/components/sections/schedule/PricingSection";
import HomeSlider from "~/components/sections/home/HomeSlider";
import WeeklyScheduleSection from "~/components/sections/schedule/WeeklyScheduleSection";
import ClassCategoriesSection from "~/components/sections/schedule/ClassCategoriesSection";

const Schedule: React.FC = () => {
  return (
    <div>
      <HomeSlider />
      <ClassCategoriesSection />
      <WeeklyScheduleSection />
      <ClassScheduleSection />
      <ClassDetailsSection />
      <TrainerHighlightsSection />
      <PricingSection />
    </div>
  );
};

export default Schedule;
