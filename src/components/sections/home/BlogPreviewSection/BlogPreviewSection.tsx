import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  FiArrowRight,
  FiCalendar,
  FiUser,
  FiMessageSquare,
} from "react-icons/fi";
import SectionTitle from "~/components/common/SectionTitle";
import { blogService } from "~/services/blogService";
import { BlogPost } from "~/types/blog";

const BlogPreviewSection: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatestPosts = async () => {
      setLoading(true);
      const response = await blogService.getLatestPosts(3);

      if (response.success && response.data) {
        setPosts(response.data);
      }
      setLoading(false);
    };
    fetchLatestPosts();
  }, []);

  return (
    <section className="bg-gray-100 py-20 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <SectionTitle
          title="Latest Articles"
          subtitle="OUR BLOG"
          description="Stay updated with the latest health, fitness, and nutrition tips from our expert trainers and coaches."
          centered
        />

        {loading ? (
          <p className="mt-10 text-center text-gray-500 dark:text-gray-400">
            Đang tải bài viết...
          </p>
        ) : (
          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <motion.div
                key={post._id}
                className="overflow-hidden rounded-lg bg-white shadow-lg transition-transform hover:scale-105 dark:bg-gray-800 dark:shadow-gray-900/20"
                whileHover={{ scale: 1.05 }}
              >
                <Link to={`/blog/${post.slug}`}>
                  <img
                    src={
                      `http://localhost:5000/public/${post.coverImage}` ||
                      "/images/blog/default.jpg"
                    }
                    //   src={`http://localhost:5000/${user.avatar}`}
                    alt={post.title}
                    className="h-60 w-full object-cover"
                  />
                </Link>
                <div className="p-6">
                  <div className="mb-3 flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <FiCalendar className="mr-2" />
                    {new Date(post.publishDate).toLocaleDateString("vi-VN")}
                    <span className="mx-2">|</span>
                    <FiUser className="mr-2" />
                    {post.author?.name || "Ẩn danh"}
                    <span className="mx-2">|</span>
                  </div>
                  <h3 className="mb-3 text-xl font-semibold text-[#0D2E4B] dark:text-white">
                    <Link
                      to={`/blog/${post.slug}`}
                      className="transition-colors hover:text-[#0CC6F0] dark:hover:text-[#0CC6F0]"
                    >
                      {post.title}
                    </Link>
                  </h3>
                  <p className="mb-4 text-gray-600 dark:text-gray-300">{post.excerpt}</p>
                  <Link
                    to={`/blog/${post.slug}`}
                    className="inline-flex items-center font-medium text-[#0CC6F0] hover:underline dark:text-[#0CC6F0] dark:hover:text-[#0CC6F0]"
                  >
                    Read More <FiArrowRight className="ml-2" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default BlogPreviewSection;