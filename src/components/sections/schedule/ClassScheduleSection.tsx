import React, { useState } from "react";
import SectionTitle from "../../common/SectionTitle";
import Button from "../../common/Button";
import { format, addDays, startOfWeek } from "date-fns";

interface ClassSession {
  id: number;
  name: string;
  instructor: string;
  time: string;
  duration: number;
  level: "Beginner" | "Intermediate" | "Advanced" | "All Levels";
  color: string;
}

interface DaySchedule {
  date: Date;
  classes: ClassSession[];
}

const ClassScheduleSection: React.FC = () => {
  const [selectedDay, setSelectedDay] = useState<number>(0);

  const generateWeekSchedule = (): DaySchedule[] => {
    const today = new Date();
    const startDay = startOfWeek(today, { weekStartsOn: 1 }); // Start from Monday

    return Array.from({ length: 7 }).map((_, index) => {
      const date = addDays(startDay, index);
      return {
        date,
        classes: getClassesForDay(index),
      };
    });
  };

  const getClassesForDay = (dayIndex: number): ClassSession[] => {
    // This would typically come from an API
    const allClasses: Record<number, ClassSession[]> = {
      0: [
        // Monday
        {
          id: 1,
          name: "Morning Yoga",
          instructor: "Sarah J.",
          time: "06:00 AM",
          duration: 60,
          level: "All Levels",
          color: "bg-green-100 border-green-500",
        },
        {
          id: 2,
          name: "HIIT Circuit",
          instructor: "Mike R.",
          time: "12:00 PM",
          duration: 45,
          level: "Intermediate",
          color: "bg-red-100 border-red-500",
        },
        {
          id: 3,
          name: "Spin Class",
          instructor: "Lisa M.",
          time: "06:00 PM",
          duration: 45,
          level: "All Levels",
          color: "bg-blue-100 border-blue-500",
        },
      ],
      1: [
        // Tuesday
        {
          id: 4,
          name: "CrossFit",
          instructor: "David W.",
          time: "07:00 AM",
          duration: 60,
          level: "Advanced",
          color: "bg-red-100 border-red-500",
        },
        {
          id: 5,
          name: "Pilates",
          instructor: "Emma T.",
          time: "11:00 AM",
          duration: 60,
          level: "Beginner",
          color: "bg-purple-100 border-purple-500",
        },
        {
          id: 6,
          name: "Zumba",
          instructor: "Carlos R.",
          time: "05:30 PM",
          duration: 60,
          level: "All Levels",
          color: "bg-yellow-100 border-yellow-500",
        },
      ],
      // Add more days as needed
    };

    // Return classes for the day or empty array if none exists
    return allClasses[dayIndex] || [];
  };

  const weekSchedule = generateWeekSchedule();

  return (
    <section className="bg-white py-16">
      <div className="container mx-auto px-4">
        <SectionTitle
          subtitle="CLASS SCHEDULE"
          title="Weekly Fitness Classes"
          description="Join our diverse range of group fitness classes led by expert instructors. Find the perfect class to match your fitness level and goals."
        />

        <div className="mt-12">
          {/* Day selection tabs */}
          <div className="mb-6 flex overflow-x-auto border-b pb-4">
            {weekSchedule.map((day, index) => (
              <button
                key={index}
                className={`mr-4 flex-none rounded-lg px-6 py-3 text-center transition ${
                  selectedDay === index
                    ? "bg-primary-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                onClick={() => setSelectedDay(index)}
              >
                <div className="font-bold">{format(day.date, "EEE")}</div>
                <div>{format(day.date, "MMM d")}</div>
              </button>
            ))}
          </div>

          {/* Class schedule for selected day */}
          <div className="rounded-lg bg-white">
            {weekSchedule[selectedDay].classes.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {weekSchedule[selectedDay].classes.map((session) => (
                  <div
                    key={session.id}
                    className={`rounded-lg border-l-4 p-6 ${session.color} shadow-sm`}
                  >
                    <div className="flex flex-wrap justify-between">
                      <div>
                        <h3 className="text-xl font-bold">{session.name}</h3>
                        <p className="text-gray-600">
                          Instructor: {session.instructor}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">{session.time}</div>
                        <div className="text-gray-600">
                          {session.duration} min
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-800">
                        {session.level}
                      </span>
                      <Button variant="primary" size="small">
                        Book Class
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center">
                <p className="mb-4 text-gray-500">
                  No classes scheduled for this day.
                </p>
                <Button variant="outline" size="medium">
                  View All Classes
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="mb-6 text-gray-600">
            Looking for a specific class? Check out our complete class schedule
            or filter by instructor, class type, or time.
          </p>
          <div className="flex justify-center gap-4">
            <Button variant="primary" size="large">
              <i className="fas fa-calendar-alt mr-2"></i>
              Full Schedule
            </Button>
            <Button variant="outline" size="large">
              <i className="fas fa-filter mr-2"></i>
              Filter Classes
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ClassScheduleSection;
