import React, { useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import { FaQuoteLeft } from "react-icons/fa";
import SectionTitle from "~/components/common/SectionTitle";
import { motion } from "framer-motion";

// Import Swiper styles
import "swiper/swiper-bundle.css";
import { useTranslation } from "react-i18next";


interface TestimonialProps {
  id: number;
  name: string;
  role: string;
  image: string;
  quote: string;
  rating: number;
}


const TestimonialsSection: React.FC = () => {
  const navigationPrevRef = useRef<HTMLDivElement>(null);
  const navigationNextRef = useRef<HTMLDivElement>(null);
const { t } = useTranslation();
const testimonials = t("home.TestimonialsSection.testimonials", {
  returnObjects: true,
}) as TestimonialProps[];

  const renderStars = (rating: number) => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <svg
          key={i}
          className={`h-5 w-5 ${i < rating ? "text-yellow-400" : "text-gray-300 dark:text-gray-600"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
        
      ));
  };

  return (
    <section className="bg-[#0D2E4B] py-20 text-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
       <SectionTitle
  title={t("home.TestimonialsSection.title")}
  subtitle={t("home.TestimonialsSection.subtitle")}
  description={t("home.TestimonialsSection.description")}
  centered
/>


        <div className="relative mt-12">
          <Swiper
            modules={[Autoplay, Pagination, Navigation]}
            spaceBetween={30}
            slidesPerView={1}
            breakpoints={{
              640: { slidesPerView: 1 },
              768: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
            }}
            loop
            navigation={{
              prevEl: navigationPrevRef.current,
              nextEl: navigationNextRef.current,
            }}
            onBeforeInit={(swiper) => {
              // @ts-ignore
              swiper.params.navigation.prevEl = navigationPrevRef.current;
              // @ts-ignore
              swiper.params.navigation.nextEl = navigationNextRef.current;
            }}
            className="testimonials-swiper py-10"
          >
            {testimonials.map((testimonial) => (
              <SwiperSlide key={testimonial.id}>
                <motion.div
                  key={testimonial.id}
                  className="overflow-hidden rounded-lg bg-white shadow-lg transition-transform hover:scale-105 dark:bg-gray-800 dark:shadow-gray-900/20"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="flex h-full flex-col rounded-lg bg-white p-8 text-gray-800 shadow-lg dark:bg-gray-800 dark:text-gray-200 dark:shadow-gray-900/20">
                    <div className="mb-6 flex items-center">
                      <div className="mr-4 h-16 w-16 overflow-hidden rounded-full">
                        <img
                          src={testimonial.image}
                          alt={testimonial.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-[#0D2E4B] dark:text-white">
                          {testimonial.name}
                        </h4>
                        <p className="text-gray-600 dark:text-gray-400">{testimonial.role}</p>
                        <div className="mt-1 flex">
                          {renderStars(testimonial.rating)}
                        </div>
                      </div>
                    </div>
                    <div className="relative flex-grow">
                      <FaQuoteLeft className="absolute left-0 top-0 text-4xl text-[#0CC6F0] opacity-20 dark:text-[#0CC6F0]" />
                      <p className="relative z-10 pl-6 pt-4 text-gray-600 dark:text-gray-300">
                        {testimonial.quote}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </SwiperSlide>
            ))}
          </Swiper>

          <div
            ref={navigationPrevRef}
            className="swiper-button-prev absolute -left-4 top-1/2 z-10 flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-white text-[#0CC6F0] shadow-lg dark:bg-gray-800 dark:text-[#0CC6F0] dark:shadow-gray-900/20"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </div>
          <div
            ref={navigationNextRef}
            className="swiper-button-next absolute -right-4 top-1/2 z-10 flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-white text-[#0CC6F0] shadow-lg dark:bg-gray-800 dark:text-[#0CC6F0] dark:shadow-gray-900/20"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;