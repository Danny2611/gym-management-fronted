import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { FiCalendar, FiClock, FiArrowRight, FiUser } from "react-icons/fi";
import Layout from "~/components/layout/Layout";
import BlogHeader from "~/components/sections/blog/BlogHeader";
import BlogSidebar from "~/components/sections/blog/BlogSidebar";

import { BlogPost, BlogCategory } from "~/types/blog";
import HomeSlider from "~/components/sections/home/HomeSlider";
import BlogFeaturedSection from "~/components/sections/blog/BlogFeaturedSection";
import { blogService } from "~/services/blogService";
import { categoryService } from "~/services/categoryService";

import { PaginationControls } from "~/components/common/PaginationControls";

// Keep mock tags as requested
const MOCK_TAGS = [
  "fitness",
  "nutrition",
  "strength",
  "cardio",
  "wellness",
  "yoga",
  "crossfit",
  "weight-loss",
];

const Blog: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [recentPosts, setRecentPosts] = useState<BlogPost[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const [tags, setTags] = useState<string[]>(MOCK_TAGS);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const pageSize = 10; // Number of posts per page

  useEffect(() => {
    fetchData();
  }, [currentPage]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch posts with pagination
      const postsResponse = await blogService.getAllPosts(
        currentPage,
        pageSize,
      );
      if (!postsResponse.success) {
        throw new Error(postsResponse.message || "Failed to fetch blog posts");
      }

      if (postsResponse.data) {
        setPosts(postsResponse.data.posts);
        setTotalPages(postsResponse.data.totalPages);
        setTotalPosts(postsResponse.data.total);
      }

      // Fetch categories
      const categoriesResponse = await categoryService.getAllCategories();
      if (categoriesResponse.success && categoriesResponse.data) {
        setCategories(categoriesResponse.data);
      }

      // Fetch recent posts for sidebar
      const recentPostsResponse = await blogService.getLatestPosts(5);
      if (recentPostsResponse.success && recentPostsResponse.data) {
        setRecentPosts(recentPostsResponse.data);
      }
    } catch (err) {
      console.error("Error fetching blog data:", err);
      setError("Could not load blog posts. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Layout>
      <Helmet>
        <title>Tin Tức</title>
      </Helmet>
      <HomeSlider />
      <BlogHeader title="Blog của chúng tôi " />
      <BlogFeaturedSection />

      <div className="bg-gray-50 py-12 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="flex flex-col gap-12 lg:flex-row">
            {/* Main content */}
            <div className="lg:w-2/3">
              {loading ? (
                <div className="flex h-64 items-center justify-center">
                  <div className="text-xl font-semibold text-gray-700 dark:text-gray-300">
                    Đang tải bài viết...
                  </div>
                </div>
              ) : error ? (
                <div className="rounded-lg bg-red-100 p-4 text-red-700 dark:bg-red-900/20 dark:text-red-400">
                  <h3 className="font-bold">Lỗi</h3>
                  <p>{error}</p>
                </div>
              ) : posts.length === 0 ? (
                <div className="rounded-lg bg-white p-8 text-center shadow-md dark:bg-gray-800">
                  <h3 className="mb-2 text-xl font-bold text-gray-800 dark:text-white">
                    Không tìm thấy bài viết
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Hiện tại chưa có bài viết nào được đăng tải.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                  {posts.map((post) => (
                    <div
                      key={post._id}
                      className="group overflow-hidden rounded-lg bg-white shadow-md transition-all duration-300 hover:shadow-xl dark:bg-gray-800 dark:shadow-gray-900/20"
                    >
                      <div className="relative overflow-hidden">
                        <Link to={`/blog/${post.slug}`}>
                          <img
                            src={
                              `${post.coverImage}` ||
                              "/images/blog/default.jpg"
                            }
                            alt={post.title}
                            className="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        </Link>
                        <div className="absolute left-4 top-4">
                          <span className="rounded-full bg-[#0CC6F0]/90 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                            {post.category.name}
                          </span>
                        </div>
                      </div>

                      <div className="p-6">
                        <div className="mb-3 flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center">
                            <FiCalendar className="mr-1" size={14} />
                            <span>
                              {new Date(post.publishDate).toLocaleDateString("vi-VN")}
                            </span>
                          </div>
                          {post.author && (
                            <>
                              <span>|</span>
                              <div className="flex items-center">
                                <FiUser className="mr-1" size={14} />
                                <span>{post.author.name}</span>
                              </div>
                            </>
                          )}
                          {post.readTime && (
                            <>
                              <span>|</span>
                              <div className="flex items-center">
                                <FiClock className="mr-1" size={14} />
                                <span>{post.readTime} phút đọc</span>
                              </div>
                            </>
                          )}
                        </div>

                        <h3 className="mb-3 text-xl font-bold text-[#0D2E4B] transition-colors duration-300 hover:text-[#0CC6F0] dark:text-white dark:hover:text-[#0CC6F0]">
                          <Link to={`/blog/${post.slug}`}>
                            {post.title}
                          </Link>
                        </h3>

                        <p className="mb-4 line-clamp-2 text-gray-600 dark:text-gray-300">
                          {post.excerpt}
                        </p>

                        <div className="flex items-center justify-between">
                          <Link
                            to={`/blog/${post.slug}`}
                            className="inline-flex items-center font-medium text-[#0CC6F0] transition-colors hover:underline dark:text-[#0CC6F0] dark:hover:text-[#0CC6F0]"
                          >
                            Đọc tiếp <FiArrowRight className="ml-2" size={16} />
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!loading && !error && totalPages > 1 && (
                <div className="mt-12">
                  <PaginationControls
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:w-1/3">
              <BlogSidebar
                categories={categories}
                recentPosts={recentPosts}
                tags={tags}
              />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Blog;