import React from "react";
import SectionTitle from "../../common/SectionTitle";

interface BlogHeaderProps {
  title: string;
  subtitle?: string;
  alignment?: string;
}

const BlogHeader: React.FC<BlogHeaderProps> = ({ title, subtitle }) => {
  return (
    <div className="mt-36 bg-gray-100 py-16 dark:bg-gray-800">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <h1 className="mb-4 text-4xl font-bold text-[#0D2E4B] dark:text-white">
            {title}
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-300">
            {subtitle ||
              "Cập nhật những mẹo thể hình, tin tức và câu chuyện mới nhất từ chúng tôi"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default BlogHeader;