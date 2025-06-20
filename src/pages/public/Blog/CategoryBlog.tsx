import React, { useState, useEffect } from "react";

import Layout from "~/components/layout/Layout";
import BlogHeader from "~/components/sections/blog/BlogHeader";
import BlogSidebar from "~/components/sections/blog/BlogSidebar";
import BlogPagination from "~/components/sections/blog/BlogPagination";
import { BlogPost, BlogCategory } from "~/types/blog";
import { blogService } from "~/services/blogService";
import { categoryService } from "~/services/categoryService";
import { useParams } from "react-router-dom";
import { ZodStringCheck } from "zod";

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

const CategoryBlog: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [currentCategory, setCurrentCategory] = useState<BlogCategory | null>(
    null,
  );
  const [recentPosts, setRecentPosts] = useState<BlogPost[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const [tags, setTags] = useState<string[]>(MOCK_TAGS);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const pageSize = 10; // Number of posts per page

  useEffect(() => {
    if (slug) {
      fetchData();
    }
  }, [slug, currentPage]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch category details first
      const categoryResponse = await categoryService.getCategoryBySlug(
        slug as string,
      );
      if (!categoryResponse.success || !categoryResponse.data) {
        throw new Error(categoryResponse.message || "Category not found");
      }
      if (categoryResponse.data) {
        setCurrentCategory(categoryResponse.data);
      }

      // Fetch posts by category with pagination
      const postsResponse = await blogService.getPostsByCategory(
        slug as string,
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

      // Fetch all categories for sidebar
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
      console.error("Error fetching category blog data:", err);
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
      <BlogHeader
        title={currentCategory ? `${currentCategory.name}` : "Category"}
        // subtitle={currentCategory?.name || "Browse posts in this category"}
      />

      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col gap-12 lg:flex-row">
          {/* Main content */}
          <div className="lg:w-2/3">
            {loading ? (
              <div className="flex h-64 items-center justify-center">
                <div className="text-xl font-semibold">Loading posts...</div>
              </div>
            ) : error ? (
              <div className="rounded-lg bg-red-100 p-4 text-red-700">
                <h3 className="font-bold">Error</h3>
                <p>{error}</p>
              </div>
            ) : posts.length === 0 ? (
              <div className="rounded-lg bg-gray-100 p-8 text-center">
                <h3 className="mb-2 text-xl font-bold">No Posts Found</h3>
                <p>
                  There are currently no blog posts available in this category.
                </p>
              </div>
            ) : (
              <>
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-800">
                    {totalPosts} {totalPosts === 1 ? "Post" : "Posts"} in "
                    {currentCategory?.name}"
                  </h2>
                </div>

                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                  {posts.map((post) => (
                    <div
                      key={post._id}
                      className="overflow-hidden rounded-lg bg-white shadow-md"
                    >
                      <img
                        src={
                          `http://localhost:5000/public/${post.coverImage}` ||
                          "/images/blog/default.jpg"
                        }
                        alt={post.title}
                        className="h-48 w-full object-cover"
                      />
                      <div className="p-6">
                        <span className="text-primary-600 bg-primary-100 mb-2 inline-block rounded-full px-3 py-1 text-xs font-semibold">
                          {currentCategory?.name}
                        </span>
                        <h3 className="mb-2 text-xl font-bold">
                          <a
                            href={`/blog/${post.slug}`}
                            className="hover:text-primary-600 transition"
                          >
                            {post.title}
                          </a>
                        </h3>
                        <p className="mb-4 line-clamp-2 text-gray-600">
                          {post.excerpt}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">
                            {new Date(post.publishDate).toLocaleDateString()} •{" "}
                            {post.readTime} min read
                          </span>
                          <a
                            href={`/blog/${post.slug}`}
                            className="text-primary-600 font-medium hover:underline"
                          >
                            Read More →
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {!loading && !error && totalPages > 1 && (
              <BlogPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:w-1/3">
            <BlogSidebar
              categories={categories}
              recentPosts={recentPosts}
              tags={tags}
              //   currentCategorySlug={slug as string}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CategoryBlog;
