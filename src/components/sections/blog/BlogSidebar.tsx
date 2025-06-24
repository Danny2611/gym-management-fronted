import React from "react";
import { Link } from "react-router-dom";
import { FiFolder, FiClock, FiTag } from "react-icons/fi";
import { BlogPost, BlogCategory } from "~/types/blog";
import { formatDate } from "~/utils/formatters";

interface BlogSidebarProps {
  categories: BlogCategory[];
  recentPosts: BlogPost[];
  tags?: string[];
}

const BlogSidebar: React.FC<BlogSidebarProps> = ({
  categories,
  recentPosts,
  tags = [],
}) => {
  return (
    <div className="space-y-8">
      {/* Categories */}
      <div className="rounded-lg bg-white p-6 shadow-md transition-shadow hover:shadow-lg dark:bg-gray-800 dark:shadow-gray-900/20">
        <div className="mb-4 flex items-center">
          <FiFolder className="mr-2 text-[#0CC6F0]" size={20} />
          <h3 className="text-xl font-bold text-[#0D2E4B] dark:text-white">
            Danh Mục
          </h3>
        </div>
        <ul className="space-y-3">
          {categories.map((category) => (
            <li key={category._id}>
              <Link
                to={`/blog/category/${category.slug}`}
                className="flex items-center justify-between transition-colors hover:text-[#0CC6F0] dark:text-gray-300 dark:hover:text-[#0CC6F0]"
              >
                <span className="font-medium">{category.name}</span>
                <span className="rounded-full bg-[#0CC6F0]/10 px-2 py-1 text-xs font-semibold text-[#0CC6F0] dark:bg-[#0CC6F0]/20">
                  {category.postCount}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Recent Posts */}
      <div className="rounded-lg bg-white p-6 shadow-md transition-shadow hover:shadow-lg dark:bg-gray-800 dark:shadow-gray-900/20">
        <div className="mb-4 flex items-center">
          <FiClock className="mr-2 text-[#0CC6F0]" size={20} />
          <h3 className="text-xl font-bold text-[#0D2E4B] dark:text-white">
            Bài Viết Gần Đây
          </h3>
        </div>
        <ul className="space-y-4">
          {recentPosts.map((post) => (
            <li key={post._id} className="group flex space-x-3">
              <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg">
                <img
                  src={
                    `${post.coverImage}` ||
                    "/images/blog/default.jpg"
                  }
                  alt={post.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
              </div>
              <div className="flex-1 min-w-0">
                <Link
                  to={`/blog/${post.slug}`}
                  className="line-clamp-2 font-medium text-gray-800 transition-colors hover:text-[#0CC6F0] dark:text-gray-200 dark:hover:text-[#0CC6F0]"
                >
                  {post.title}
                </Link>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {formatDate(post.publishDate)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="rounded-lg bg-white p-6 shadow-md transition-shadow hover:shadow-lg dark:bg-gray-800 dark:shadow-gray-900/20">
          <div className="mb-4 flex items-center">
            <FiTag className="mr-2 text-[#0CC6F0]" size={20} />
            <h3 className="text-xl font-bold text-[#0D2E4B] dark:text-white">
              Thẻ
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Link
                key={tag}
                to={`/blog/tag/${tag}`}
                className="rounded-full bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 transition-all duration-200 hover:bg-[#0CC6F0] hover:text-white dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-[#0CC6F0] dark:hover:text-white"
              >
                #{tag}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogSidebar;