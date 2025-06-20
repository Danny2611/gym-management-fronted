import React from "react";
import OurStorySection from "~/components/sections/about/OurStorySection";
import FacilitiesSection from "~/components/sections/about/FacilitiesSection";
import TrainersSection from "~/components/sections/about/TrainersSection";
import TestimonialsFullSection from "~/components/sections/about/TestimonialsFullSection";
import MembershipCTASection from "~/components/sections/about/MembershipCTASection";
import HomeSlider from "~/components/sections/home/HomeSlider";

const About: React.FC = () => {
  return (
    <div>
      <HomeSlider />
      <OurStorySection />
      <FacilitiesSection />
      <TrainersSection />
      <TestimonialsFullSection />
      <MembershipCTASection />
    </div>
  );
};

export default About;
