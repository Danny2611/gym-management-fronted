import React from "react";
import SectionTitle from "../../common/SectionTitle";
import Button from "../../common/Button";

interface ClassCategory {
  id: string;
  name: string;
  classes: ClassType[];
}

interface ClassType {
  id: string;
  name: string;
  description: string;
  benefits: string[];
  duration: number;
  intensity: string;
  image: string;
}

const ClassDetailsSection: React.FC = () => {
  const classCategories: ClassCategory[] = [
    {
      id: "cardio",
      name: "Cardio",
      classes: [
        {
          id: "spin",
          name: "Spin Class",
          description:
            "A high-energy indoor cycling workout that simulates an outdoor cycling experience. Led by an instructor who guides you through a journey of hill climbs, sprints, and flat terrains while energizing music keeps you motivated.",
          benefits: [
            "Improves cardiovascular health",
            "Burns significant calories",
            "Low impact on joints",
            "Builds lower body strength",
          ],
          duration: 45,
          intensity: "Moderate to High",
          image: "/images/classes/spin.jpg",
        },
        {
          id: "zumba",
          name: "Zumba",
          description:
            "A dance fitness program that combines Latin and international music with dance moves. Zumba routines incorporate interval training — alternating fast and slow rhythms — to help improve cardiovascular fitness.",
          benefits: [
            "Fun way to burn calories",
            "Improves coordination",
            "Enhances mood through music",
            "Works multiple muscle groups",
          ],
          duration: 60,
          intensity: "Moderate",
          image: "/images/classes/zumba.jpg",
        },
      ],
    },
    {
      id: "strength",
      name: "Strength",
      classes: [
        {
          id: "bodypump",
          name: "BodyPump",
          description:
            "A barbell workout designed to strengthen your entire body. This 60-minute workout challenges all your major muscle groups by using the best weight-room exercises like squats, presses, lifts, and curls.",
          benefits: [
            "Increases strength and endurance",
            "Tones and shapes muscles",
            "Improves core strength",
            "Burns calories efficiently",
          ],
          duration: 60,
          intensity: "Moderate to High",
          image: "/images/classes/bodypump.jpg",
        },
      ],
    },
    {
      id: "mind-body",
      name: "Mind & Body",
      classes: [
        {
          id: "yoga",
          name: "Yoga",
          description:
            "A practice that combines physical postures, breathing techniques, and meditation to strengthen the body and relax the mind. Our yoga classes cater to all levels, from beginners to advanced practitioners.",
          benefits: [
            "Increases flexibility and balance",
            "Reduces stress and anxiety",
            "Improves posture and body awareness",
            "Enhances mental clarity",
          ],
          duration: 60,
          intensity: "Low to Moderate",
          image: "/images/classes/yoga.jpg",
        },
        {
          id: "pilates",
          name: "Pilates",
          description:
            "A system of exercises designed to improve physical strength, flexibility, and posture, and enhance mental awareness. The method focuses on the core, although the exercises work other areas of your body as well.",
          benefits: [
            "Develops core strength",
            "Improves posture and alignment",
            "Increases flexibility",
            "Prevents injuries",
          ],
          duration: 60,
          intensity: "Low to Moderate",
          image: "/images/classes/pilates.jpg",
        },
      ],
    },
  ];

  return (
    <section className="bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        <SectionTitle
          subtitle="CLASS TYPES"
          title="Explore Our Fitness Classes"
          description="Discover the wide variety of classes we offer at FittLife. From high-energy cardio to mindful yoga, we have something for everyone."
        />

        {classCategories.map((category) => (
          <div key={category.id} className="mt-16">
            <h2 className="bg-primary-600 mb-8 inline-block rounded-r-full px-4 py-2 text-2xl font-bold text-white">
              {category.name} Classes
            </h2>

            <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-2">
              {category.classes.map((classItem) => (
                <div
                  key={classItem.id}
                  className="flex flex-col overflow-hidden rounded-lg bg-white shadow-md md:flex-row"
                >
                  <div className="md:w-2/5">
                    <img
                      src={classItem.image}
                      alt={classItem.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="p-6 md:w-3/5">
                    <h3 className="mb-2 text-xl font-bold">{classItem.name}</h3>
                    <div className="mb-4 flex gap-4 text-sm">
                      <span className="flex items-center text-gray-600">
                        <i className="fas fa-clock mr-1"></i>{" "}
                        {classItem.duration} min
                      </span>
                      <span className="flex items-center text-gray-600">
                        <i className="fas fa-bolt mr-1"></i>{" "}
                        {classItem.intensity}
                      </span>
                    </div>
                    <p className="mb-4 text-gray-600">
                      {classItem.description}
                    </p>
                    <h4 className="mb-2 mt-4 font-bold">Benefits:</h4>
                    <ul className="mb-6 list-disc pl-5 text-gray-600">
                      {classItem.benefits.map((benefit, index) => (
                        <li key={index}>{benefit}</li>
                      ))}
                    </ul>
                    <Button variant="primary" size="small">
                      View Schedule
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ClassDetailsSection;
