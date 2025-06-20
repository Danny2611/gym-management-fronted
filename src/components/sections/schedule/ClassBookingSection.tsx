import React, { useState } from "react";
import SectionTitle from "../../common/SectionTitle";
import Button from "../../common/Button";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const ClassBookingSection: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");

  const classes = [
    { id: "morning-hiit", name: "Morning HIIT (06:00 AM)" },
    { id: "power-yoga", name: "Power Yoga (08:00 AM)" },
    { id: "strength", name: "Strength & Conditioning (10:00 AM)" },
    { id: "cardio-kickboxing", name: "Cardio Kickboxing (12:00 PM)" },
    { id: "spin-class", name: "Spin Class (05:30 PM)" },
    { id: "evening-hiit", name: "Evening HIIT (07:00 PM)" },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission logic here
    alert("Booking submitted successfully!");
  };

  return (
    <section className="bg-white py-16">
      <div className="container mx-auto px-4">
        <SectionTitle
          subtitle="BOOK A CLASS"
          title="Reserve Your Spot"
          alignment="center"
        />

        <div className="mx-auto mt-12 max-w-2xl rounded-lg bg-gray-50 p-8 shadow-md">
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="mb-2 block font-medium text-gray-700">
                Select Date
              </label>
              <DatePicker
                selected={selectedDate}
                onChange={(date) => setSelectedDate(date)}
                minDate={new Date()}
                className="focus:ring-primary-500 w-full rounded-md border border-gray-300 p-3 focus:outline-none focus:ring-2"
              />
            </div>

            <div className="mb-6">
              <label className="mb-2 block font-medium text-gray-700">
                Select Class
              </label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="focus:ring-primary-500 w-full rounded-md border border-gray-300 p-3 focus:outline-none focus:ring-2"
                required
              >
                <option value="">Select a class</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-6">
              <label className="mb-2 block font-medium text-gray-700">
                Your Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="focus:ring-primary-500 w-full rounded-md border border-gray-300 p-3 focus:outline-none focus:ring-2"
                required
              />
            </div>

            <div className="mb-6">
              <label className="mb-2 block font-medium text-gray-700">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="focus:ring-primary-500 w-full rounded-md border border-gray-300 p-3 focus:outline-none focus:ring-2"
                required
              />
            </div>

            <div className="mb-6">
              <label className="mb-2 block font-medium text-gray-700">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="focus:ring-primary-500 w-full rounded-md border border-gray-300 p-3 focus:outline-none focus:ring-2"
                required
              />
            </div>

            <Button type="submit" className="w-full">
              Book Class
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
};
export default ClassBookingSection;
