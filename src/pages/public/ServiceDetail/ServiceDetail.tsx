import React from "react";
import { Helmet } from "react-helmet-async";
import ServiceDetailSection from "~/components/sections/services/ServiceDetailSection";

const ServiceDetail: React.FC = () => {
  return (
    <div>
      <Helmet>
        <title>Dịch vụ</title>
      </Helmet>
      <ServiceDetailSection />
    </div>
  );
};

export default ServiceDetail;
