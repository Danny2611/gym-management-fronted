import React from "react";
import SectionTitle from "../../common/SectionTitle";
import TestimonialCard from "../../common/TestimonialCard";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/swiper-bundle.css"; // Import tất cả các style cần thiết
interface Testimonial {
  id: number;
  name: string;
  role: string;
  image: string;
  text: string;
  rating: number;
}

const TestimonialsFullSection: React.FC = () => {
  const testimonials: Testimonial[] = [
    {
      id: 1,
      name: "Jennifer Parker",
      role: "Member since 2020",
      image: "/images/testimonials/testimonial-1.jpg",
      text: "Joining FittLife was the best decision I've made for my health. The trainers are incredibly knowledgeable and the community is so supportive. I've lost 30 pounds and gained confidence I never thought possible.",
      rating: 5,
    },
    {
      id: 2,
      name: "Robert Chen",
      role: "Member since 2018",
      image: "/images/testimonials/testimonial-2.jpg",
      text: "As someone who was intimidated by gyms, FittLife changed my perspective completely. The staff is friendly, the facilities are always clean, and the programs are designed for all fitness levels.",
      rating: 5,
    },
    {
      id: 3,
      name: "Amanda Davis",
      role: "Member since 2021",
      image: "/images/testimonials/testimonial-3.jpg",
      text: "The personal training at FittLife has been transformative. My trainer understood my goals and created a plan that worked for my busy schedule. I'm stronger than I've ever been!",
      rating: 4,
    },
    {
      id: 4,
      name: "Mark Thompson",
      role: "Member since 2019",
      image: "/images/testimonials/testimonial-4.jpg",
      text: "The variety of classes keeps me motivated and excited to work out. From HIIT to yoga, there's always something new to try. The instructors are passionate and make every session enjoyable.",
      rating: 5,
    },
  ];

  return (
    <section className="bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        <SectionTitle
          subtitle="TESTIMONIALS"
          title="What Our Members Say"
          description="Don't just take our word for it. Hear from our members who have transformed their lives through our fitness programs and community."
        />

        <div className="mt-12">
          <Swiper
            modules={[Pagination, Autoplay]}
            spaceBetween={30}
            slidesPerView={1}
            pagination={{ clickable: true }}
            autoplay={{ delay: 5000 }}
            breakpoints={{
              640: {
                slidesPerView: 1,
              },
              768: {
                slidesPerView: 2,
              },
              1024: {
                slidesPerView: 3,
              },
            }}
          >
            {testimonials.map((testimonial) => (
              <SwiperSlide key={testimonial.id}>
                <TestimonialCard
                  name={testimonial.name}
                  role={testimonial.role}
                  avatar={testimonial.image}
                  quote={testimonial.text}
                  rating={testimonial.rating}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsFullSection;
