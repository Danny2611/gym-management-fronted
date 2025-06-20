import React, { useState } from "react";
import SectionTitle from "../../common/SectionTitle";
import classNames from "classnames";

interface ClassType {
  name: string;
  trainer: string;
  time: string;
  duration: string;
  level: "Beginner" | "Intermediate" | "Advanced" | "All Levels";
  category: string;
}

interface DailySchedule {
  [key: string]: ClassType[];
}

const WeeklyScheduleSection: React.FC = () => {
  const [activeDay, setActiveDay] = useState<string>("monday");
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const days = [
    { id: "monday", label: "Monday" },
    { id: "tuesday", label: "Tuesday" },
    { id: "wednesday", label: "Wednesday" },
    { id: "thursday", label: "Thursday" },
    { id: "friday", label: "Friday" },
    { id: "saturday", label: "Saturday" },
    { id: "sunday", label: "Sunday" },
  ];

  const categories = [
    { id: "all", label: "All Classes" },
    { id: "hiit", label: "HIIT" },
    { id: "yoga", label: "Yoga & Pilates" },
    { id: "strength", label: "Strength" },
    { id: "cardio", label: "Cardio" },
    { id: "combat", label: "Combat" },
  ];

  const schedule: DailySchedule = {
    monday: [
      {
        name: "Morning HIIT",
        trainer: "John Smith",
        time: "06:00 AM",
        duration: "45 min",
        level: "All Levels",
        category: "hiit",
      },
      {
        name: "Power Yoga",
        trainer: "Sarah Johnson",
        time: "08:00 AM",
        duration: "60 min",
        level: "Intermediate",
        category: "yoga",
      },
      {
        name: "Strength & Conditioning",
        trainer: "Mike Williams",
        time: "10:00 AM",
        duration: "60 min",
        level: "Intermediate",
        category: "strength",
      },
      {
        name: "Cardio Kickboxing",
        trainer: "Alex Chen",
        time: "12:00 PM",
        duration: "45 min",
        level: "All Levels",
        category: "combat",
      },
      {
        name: "Spin Class",
        trainer: "Jessica Adams",
        time: "05:30 PM",
        duration: "45 min",
        level: "All Levels",
        category: "cardio",
      },
      {
        name: "Evening HIIT",
        trainer: "John Smith",
        time: "07:00 PM",
        duration: "45 min",
        level: "All Levels",
        category: "hiit",
      },
    ],
    tuesday: [
      {
        name: "Morning Flow Yoga",
        trainer: "Sarah Johnson",
        time: "06:00 AM",
        duration: "60 min",
        level: "All Levels",
        category: "yoga",
      },
      {
        name: "CrossFit",
        trainer: "Mike Williams",
        time: "08:00 AM",
        duration: "60 min",
        level: "Intermediate",
        category: "strength",
      },
      {
        name: "Pilates",
        trainer: "Lisa Chen",
        time: "10:00 AM",
        duration: "45 min",
        level: "Beginner",
        category: "yoga",
      },
      {
        name: "Boxing",
        trainer: "Alex Chen",
        time: "12:00 PM",
        duration: "60 min",
        level: "Intermediate",
        category: "combat",
      },
      {
        name: "Zumba",
        trainer: "Jessica Adams",
        time: "05:30 PM",
        duration: "45 min",
        level: "All Levels",
        category: "cardio",
      },
      {
        name: "Strength Circuit",
        trainer: "John Smith",
        time: "07:00 PM",
        duration: "60 min",
        level: "Advanced",
        category: "strength",
      },
    ],
    wednesday: [
      {
        name: "Tabata",
        trainer: "John Smith",
        time: "06:00 AM",
        duration: "30 min",
        level: "All Levels",
        category: "hiit",
      },
      {
        name: "Yin Yoga",
        trainer: "Sarah Johnson",
        time: "08:00 AM",
        duration: "75 min",
        level: "All Levels",
        category: "yoga",
      },
      {
        name: "Bodyweight Strength",
        trainer: "Mike Williams",
        time: "10:00 AM",
        duration: "45 min",
        level: "Beginner",
        category: "strength",
      },
      {
        name: "Kickboxing",
        trainer: "Alex Chen",
        time: "12:00 PM",
        duration: "60 min",
        level: "Intermediate",
        category: "combat",
      },
      {
        name: "Treadmill HIIT",
        trainer: "Jessica Adams",
        time: "05:30 PM",
        duration: "30 min",
        level: "Advanced",
        category: "hiit",
      },
      {
        name: "Restorative Yoga",
        trainer: "Sarah Johnson",
        time: "07:00 PM",
        duration: "60 min",
        level: "All Levels",
        category: "yoga",
      },
    ],
    thursday: [
      {
        name: "Bootcamp",
        trainer: "John Smith",
        time: "06:00 AM",
        duration: "45 min",
        level: "Intermediate",
        category: "hiit",
      },
      {
        name: "Power Pilates",
        trainer: "Lisa Chen",
        time: "08:00 AM",
        duration: "45 min",
        level: "Intermediate",
        category: "yoga",
      },
      {
        name: "Olympic Lifting",
        trainer: "Mike Williams",
        time: "10:00 AM",
        duration: "60 min",
        level: "Advanced",
        category: "strength",
      },
      {
        name: "MMA Conditioning",
        trainer: "Alex Chen",
        time: "12:00 PM",
        duration: "60 min",
        level: "Intermediate",
        category: "combat",
      },
      {
        name: "Running Club",
        trainer: "Jessica Adams",
        time: "05:30 PM",
        duration: "45 min",
        level: "All Levels",
        category: "cardio",
      },
      {
        name: "High Volume Training",
        trainer: "Mike Williams",
        time: "07:00 PM",
        duration: "60 min",
        level: "Advanced",
        category: "strength",
      },
    ],
    friday: [
      {
        name: "HIIT & Core",
        trainer: "John Smith",
        time: "06:00 AM",
        duration: "45 min",
        level: "All Levels",
        category: "hiit",
      },
      {
        name: "Vinyasa Flow",
        trainer: "Sarah Johnson",
        time: "08:00 AM",
        duration: "60 min",
        level: "Intermediate",
        category: "yoga",
      },
      {
        name: "Functional Training",
        trainer: "Mike Williams",
        time: "10:00 AM",
        duration: "60 min",
        level: "Intermediate",
        category: "strength",
      },
      {
        name: "Boxing Fundamentals",
        trainer: "Alex Chen",
        time: "12:00 PM",
        duration: "45 min",
        level: "Beginner",
        category: "combat",
      },
      {
        name: "Dance Fitness",
        trainer: "Jessica Adams",
        time: "05:30 PM",
        duration: "45 min",
        level: "All Levels",
        category: "cardio",
      },
      {
        name: "Community Workout",
        trainer: "All Trainers",
        time: "07:00 PM",
        duration: "60 min",
        level: "All Levels",
        category: "strength",
      },
    ],
    saturday: [
      {
        name: "Weekend Warrior HIIT",
        trainer: "John Smith",
        time: "08:00 AM",
        duration: "60 min",
        level: "All Levels",
        category: "hiit",
      },
      {
        name: "Yoga Sculpt",
        trainer: "Sarah Johnson",
        time: "10:00 AM",
        duration: "75 min",
        level: "Intermediate",
        category: "yoga",
      },
      {
        name: "Full Body Strength",
        trainer: "Mike Williams",
        time: "12:00 PM",
        duration: "60 min",
        level: "All Levels",
        category: "strength",
      },
      {
        name: "Kickboxing",
        trainer: "Alex Chen",
        time: "02:00 PM",
        duration: "60 min",
        level: "All Levels",
        category: "combat",
      },
    ],
    sunday: [
      {
        name: "Recovery Yoga",
        trainer: "Sarah Johnson",
        time: "09:00 AM",
        duration: "75 min",
        level: "All Levels",
        category: "yoga",
      },
      {
        name: "Mobility & Stretching",
        trainer: "Lisa Chen",
        time: "11:00 AM",
        duration: "45 min",
        level: "All Levels",
        category: "yoga",
      },
      {
        name: "Outdoor Bootcamp",
        trainer: "John Smith",
        time: "01:00 PM",
        duration: "60 min",
        level: "Intermediate",
        category: "hiit",
      },
    ],
  };

  const filteredClasses = schedule[activeDay].filter(
    (cls) => activeCategory === "all" || cls.category === activeCategory,
  );

  return (
    <section className="bg-gray-100 py-16">
      <div className="container mx-auto px-4">
        <SectionTitle
          subtitle="WEEKLY SCHEDULE"
          title="Plan Your Week"
          alignment="center"
        />

        <div className="mt-12">
          <div className="mb-8 flex flex-wrap justify-center">
            {days.map((day) => (
              <button
                key={day.id}
                onClick={() => setActiveDay(day.id)}
                className={classNames(
                  "m-1 rounded-md px-4 py-2 font-medium transition-colors",
                  {
                    "bg-primary-500 text-white": activeDay === day.id,
                    "bg-gray-200 text-gray-700 hover:bg-gray-300":
                      activeDay !== day.id,
                  },
                )}
              >
                {day.label}
              </button>
            ))}
          </div>

          <div className="mb-8 flex flex-wrap justify-center">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={classNames(
                  "m-1 rounded-md px-4 py-2 font-medium transition-colors",
                  {
                    "bg-secondary-500 text-white":
                      activeCategory === category.id,
                    "bg-gray-200 text-gray-700 hover:bg-gray-300":
                      activeCategory !== category.id,
                  },
                )}
              >
                {category.label}
              </button>
            ))}
          </div>

          <div className="overflow-hidden rounded-lg bg-white shadow-md">
            <div className="grid grid-cols-6 border-b bg-gray-50 p-4">
              <div className="col-span-2 font-semibold">Class</div>
              <div className="col-span-1 font-semibold">Time</div>
              <div className="col-span-1 font-semibold">Duration</div>
              <div className="col-span-1 font-semibold">Trainer</div>
              <div className="col-span-1 font-semibold">Level</div>
            </div>

            {filteredClasses.length > 0 ? (
              filteredClasses.map((cls, index) => (
                <div
                  key={index}
                  className={classNames("grid grid-cols-6 items-center p-4", {
                    "bg-gray-50": index % 2 === 0,
                  })}
                >
                  <div className="col-span-2">
                    <h3 className="font-semibold">{cls.name}</h3>
                  </div>
                  <div className="col-span-1">{cls.time}</div>
                  <div className="col-span-1">{cls.duration}</div>
                  <div className="col-span-1">{cls.trainer}</div>
                  <div className="col-span-1">
                    <span
                      className={classNames(
                        "rounded px-2 py-1 text-xs font-semibold",
                        {
                          "bg-green-100 text-green-800":
                            cls.level === "Beginner",
                          "bg-yellow-100 text-yellow-800":
                            cls.level === "Intermediate",
                          "bg-red-100 text-red-800": cls.level === "Advanced",
                          "bg-blue-100 text-blue-800":
                            cls.level === "All Levels",
                        },
                      )}
                    >
                      {cls.level}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                No classes found for this category on{" "}
                {days.find((d) => d.id === activeDay)?.label}.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WeeklyScheduleSection;
