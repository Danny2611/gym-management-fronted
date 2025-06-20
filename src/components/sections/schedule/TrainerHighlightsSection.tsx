import React from "react";
import SectionTitle from "../../common/SectionTitle";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation } from "swiper/modules";
import "swiper/swiper-bundle.css"; // Import tất cả các style cần thiết
import Button from "../../common/Button";
interface Trainer {
  id: number;
  name: string;
  role: string;
  image: string;
  bio: string;
  specialties: string[];
  certifications: string[];
  classes: string[];
}

const TrainerHighlightsSection: React.FC = () => {
  const trainers: Trainer[] = [
    {
      id: 1,
      name: "Sarah Johnson",
      role: "Yoga & Pilates Instructor",
      image: "/images/team/trainer-1.jpg",
      bio: "Sarah has been practicing yoga for over 10 years and teaching for 7. Her classes focus on alignment, breath awareness, and mindful movement to help you connect with your body and find inner peace.",
      specialties: ["Vinyasa Flow", "Restorative Yoga", "Mat Pilates"],
      certifications: [
        "RYT-500",
        "Pilates Mat Certification",
        "Meditation Coach",
      ],
      classes: ["Morning Yoga", "Power Vinyasa", "Gentle Flow", "Core Pilates"],
    },
    {
      id: 2,
      name: "Michael Rodriguez",
      role: "CrossFit & HIIT Coach",
      image: "/images/team/trainer-2.jpg",
      bio: "Michael is passionate about helping clients push their limits and achieve new personal bests. His high-energy classes combine functional movements with intense cardio for maximum results.",
      specialties: [
        "CrossFit",
        "HIIT",
        "Strength Training",
        "Athletic Conditioning",
      ],
      certifications: ["CrossFit Level 2", "NASM-CPT", "First Aid/CPR"],
      classes: [
        "CrossFit Basics",
        "HIIT Circuit",
        "Functional Fitness",
        "Power Hour",
      ],
    },
    {
      id: 3,
      name: "Lisa Chen",
      role: "Nutrition & Wellness Coach",
      image: "/images/team/trainer-3.jpg",
      bio: "Lisa takes a holistic approach to fitness, focusing on nutrition, movement, and mindset. She helps clients create sustainable healthy habits that lead to long-term success.",
      specialties: [
        "Nutrition Planning",
        "Weight Management",
        "Lifestyle Coaching",
      ],
      certifications: [
        "Precision Nutrition Level 2",
        "NASM-CNC",
        "Wellness Coach Certification",
      ],
      classes: [
        "Nutrition Workshops",
        "Wellness Seminars",
        "Healthy Cooking Classes",
      ],
    },
  ];

  return (
    <section className="bg-white py-16">
      <div className="container mx-auto px-4">
        <SectionTitle
          subtitle="OUR INSTRUCTORS"
          title="Meet Our Expert Class Leaders"
          description="Our certified instructors bring passion, expertise, and motivation to every class. Get to know the talented individuals who will guide your fitness journey."
        />

        <div className="relative mt-12">
          <Swiper
            modules={[Pagination, Navigation]}
            spaceBetween={30}
            slidesPerView={1}
            pagination={{ clickable: true }}
            navigation
            breakpoints={{
              768: {
                slidesPerView: 1,
              },
            }}
            className="instructor-swiper"
          >
            {trainers.map((trainer) => (
              <SwiperSlide key={trainer.id}>
                <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2">
                  <div>
                    <img
                      src={trainer.image}
                      alt={trainer.name}
                      className="h-auto max-h-96 w-full rounded-lg object-cover shadow-lg"
                    />
                  </div>
                  <div>
                    <h3 className="mb-2 text-2xl font-bold">{trainer.name}</h3>
                    <p className="text-primary-600 mb-4 font-medium">
                      {trainer.role}
                    </p>
                    <p className="mb-6 text-gray-600">{trainer.bio}</p>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <div>
                        <h4 className="mb-2 font-bold">Specialties</h4>
                        <ul className="list-disc pl-5 text-gray-600">
                          {trainer.specialties.map((specialty, index) => (
                            <li key={index}>{specialty}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="mb-2 font-bold">Certifications</h4>
                        <ul className="list-disc pl-5 text-gray-600">
                          {trainer.certifications.map((cert, index) => (
                            <li key={index}>{cert}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="mt-6">
                      <h4 className="mb-2 font-bold">Classes</h4>
                      <div className="flex flex-wrap gap-2">
                        {trainer.classes.map((className, index) => (
                          <span
                            key={index}
                            className="bg-primary-100 text-primary-800 rounded-full px-3 py-1 text-sm"
                          >
                            {className}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mt-8">
                      <Button variant="primary" size="large">
                        View Schedule
                      </Button>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
};

export default TrainerHighlightsSection;
