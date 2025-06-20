import React from "react";

interface ProfileItem {
  label: string;
  value: string;
  status?: "active" | "expired" | "pending" | "default";
}

interface ProfileInfoCardProps {
  title: string;
  items: ProfileItem[];
}

const ProfileInfoCard: React.FC<ProfileInfoCardProps> = ({ title, items }) => {
  return (
    <div className="border-stroke shadow-default dark:border-strokedark dark:bg-boxdark rounded-sm border bg-white p-6">
      <h5 className="mb-4 text-xl font-semibold text-black dark:text-white">
        {title}
      </h5>

      <div className="flex flex-col gap-4">
        {items.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <span className="text-sm font-medium text-black dark:text-white">
              {item.label}:
            </span>

            <span
              className={`text-sm font-medium ${getStatusColor(item.status)}`}
            >
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const getStatusColor = (status?: string): string => {
  switch (status) {
    case "active":
      return "text-success";
    case "expired":
      return "text-danger";
    case "pending":
      return "text-warning";
    default:
      return "text-black dark:text-white";
  }
};

export default ProfileInfoCard;
