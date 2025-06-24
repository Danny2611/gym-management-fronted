import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import SectionTitle from "../../common/SectionTitle";
import { FiCalendar, FiUser, FiArrowRight } from "react-icons/fi";
import { blogService } from "~/services/blogService";
import { BlogPost } from "~/types/blog";

const BlogFeaturedSection: React.FC = () => {
  const [featuredPosts, setFeaturedPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedPosts = async () => {
      setLoading(true);
      const response = await blogService.getFeaturedPosts(3);
      if (response.success && response.data) {
        setFeaturedPosts(response.data);
      } else {
        console.error("Lỗi khi lấy bài viết nổi bật:", response.message);
      }
      setLoading(false);
    };

    fetchFeaturedPosts();
  }, []);

  if (loading) {
    return (
      <section className="bg-white py-16 dark:bg-gray-950">
        <div className="container mx-auto px-4">
          <p className="text-center text-gray-500 dark:text-gray-400">
            Đang tải bài viết nổi bật...
          </p>
        </div>
      </section>
    );
  }

  if (featuredPosts.length === 0) return null;

  const mainPost = featuredPosts[0];
  const secondaryPosts = featuredPosts.slice(1);

  return (
    <section className="bg-white py-16 dark:bg-gray-950">
      <div className="container mx-auto px-4 dark:text-white">
        <SectionTitle
          title="Bài Viết Nổi Bật"
          subtitle="FEATURED ARTICLES"
          description="Những chia sẻ & mẹo thể hình mới nhất từ các chuyên gia"
          centered
        />

        <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Bài viết nổi bật chính */}
          <motion.div
            whileHover={{ y: -10, scale: 1.02 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden rounded-lg bg-white shadow-lg transition-all hover:shadow-xl dark:bg-gray-800 dark:shadow-gray-900/20 lg:col-span-2"
          >
            <div className="relative h-96 overflow-hidden">
              <Link to={`/blog/${mainPost.slug}`}>
                <img
                  src={
                    `${mainPost.coverImage}` ||
                    "/images/blog/default.jpg"
                  }
                  alt={mainPost.title}
                  className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </Link>
              <div className="absolute left-4 top-4 rounded-full bg-[#0CC6F0] px-3 py-1 text-sm font-semibold text-white shadow-lg">
                {mainPost.category.name}
              </div>
            </div>

            <div className="p-6">
              <div className="mb-3 flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center">
                  <FiCalendar className="mr-2" />
                  <span>
                    {new Date(mainPost.publishDate).toLocaleDateString("vi-VN")}
                  </span>
                </div>
                <span>|</span>
                <div className="flex items-center">
                  <FiUser className="mr-2" />
                  <span>{mainPost.author?.name || "Ẩn danh"}</span>
                </div>
              </div>

              <h3 className="mb-3 text-2xl font-bold text-[#0D2E4B] transition-colors duration-300 hover:text-[#0CC6F0] dark:text-white dark:hover:text-[#0CC6F0]">
                <Link to={`/blog/${mainPost.slug}`}>{mainPost.title}</Link>
              </h3>

              <p className="mb-4 text-gray-600 dark:text-gray-300">
                {mainPost.excerpt}
              </p>

              <Link
                to={`/blog/${mainPost.slug}`}
                className="inline-flex items-center font-semibold text-[#0CC6F0] transition-colors hover:underline dark:text-[#0CC6F0] dark:hover:text-[#0CC6F0]"
              >
                Đọc tiếp <FiArrowRight className="ml-2" />
              </Link>
            </div>
          </motion.div>

          {/* Bài viết phụ */}
          <div className="space-y-8 lg:col-span-1">
            {secondaryPosts.map((post) => (
              <motion.div
                key={post._id}
                whileHover={{ y: -5, scale: 1.02 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col overflow-hidden rounded-lg bg-white shadow-lg transition-all hover:shadow-xl dark:bg-gray-800 dark:shadow-gray-900/20 sm:flex-row lg:flex-col"
              >
                <div className="h-48 overflow-hidden sm:w-2/5 lg:w-full">
                  <Link to={`/blog/${post.slug}`}>
                    <img
                      src={
                        `${post.coverImage}` ||
                        "/images/blog/default.jpg"
                      }
                      alt={post.title}
                      className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                  </Link>
                </div>

                <div className="p-4 sm:w-3/5 lg:w-full">
                  <div className="mb-2 flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                    <span className="rounded bg-[#0CC6F0]/10 px-2 py-1 text-xs text-[#0CC6F0] dark:bg-[#0CC6F0]/20 dark:text-[#0CC6F0]">
                      {post.category.name}
                    </span>
                    <span>|</span>
                    <span className="flex items-center">
                      <FiCalendar className="mr-1" size={10} />
                      {new Date(post.publishDate).toLocaleDateString("vi-VN")}
                    </span>
                  </div>

                  <h3 className="mb-2 text-lg font-bold text-[#0D2E4B] transition-colors duration-300 hover:text-[#0CC6F0] dark:text-white dark:hover:text-[#0CC6F0]">
                    <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                  </h3>

                  <Link
                    to={`/blog/${post.slug}`}
                    className="inline-flex items-center text-sm font-semibold text-[#0CC6F0] transition-colors hover:underline dark:text-[#0CC6F0] dark:hover:text-[#0CC6F0]"
                  >
                    Đọc tiếp <FiArrowRight className="ml-1" size={12} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BlogFeaturedSection;