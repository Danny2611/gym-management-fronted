import React from "react";
import SectionTitle from "../../common/SectionTitle";

interface ContactHeaderProps {
  title?: string;
  subtitle?: string;
  backgroundImage?: string;
}

const ContactHeader: React.FC<ContactHeaderProps> = ({
  title = "Get In Touch",
  subtitle = "We're here to help you achieve your fitness goals",
  backgroundImage,
}) => {
  return (
    <div
      className="bg-cover bg-center py-24"
      style={{
        backgroundImage: backgroundImage
          ? `url(${backgroundImage})`
          : 'linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url("/images/contact/contact-header.jpg")',
        backgroundBlendMode: "overlay",
      }}
    >
      <div className="container mx-auto px-4">
        <SectionTitle title={title} subtitle={subtitle} alignment="center" />
      </div>
    </div>
  );
};

export default ContactHeader;
