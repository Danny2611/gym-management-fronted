import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useParams } from "react-router-dom";
import Layout from "~/components/layout/Layout";
import BlogDetailSection from "~/components/sections/blog/BlogDetail";
import BlogSidebar from "~/components/sections/blog/BlogSidebar";
import { BlogPost, BlogCategory } from "~/types/blog";
import { blogService } from "~/services/blogService";
import { categoryService } from "~/services/categoryService";

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

const BlogDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [recentPosts, setRecentPosts] = useState<BlogPost[]>([]);
  const [tags, setTags] = useState<string[]>(MOCK_TAGS);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch the blog post by slug
        const postResponse = await blogService.getPostBySlug(slug || "");

        if (!postResponse.success || !postResponse.data) {
          throw new Error(postResponse.message || "Could not fetch blog post");
        }
        setPost(postResponse.data);

        // Fetch blog categories
        const categoriesResponse = await categoryService.getAllCategories();
        if (categoriesResponse.success && categoriesResponse.data) {
          setCategories(categoriesResponse.data);
        }

        // Fetch latest posts for sidebar
        const latestPostsResponse = await blogService.getLatestPosts(3);
        if (latestPostsResponse.success && latestPostsResponse.data) {
          setRecentPosts(latestPostsResponse.data);
        }

        // For related posts, we can fetch posts from the same category
        // if the post has a category
        if (postResponse.data?.category?.slug) {
          const relatedPostsResponse = await blogService.getPostsByCategory(
            postResponse.data.category.slug,
            1,
            3,
          );
          if (relatedPostsResponse.success && relatedPostsResponse.data) {
            // Filter out the current post from related posts
            const filteredPosts = relatedPostsResponse.data.posts.filter(
              (relatedPost) => relatedPost._id !== postResponse.data?._id,
            );
            setRelatedPosts(filteredPosts);
          }
        }
      } catch (err) {
        console.error("Error fetching blog data:", err);
        setError("Could not load blog post. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchData();
    }
  }, [slug]);

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold">Loading post...</h1>
        </div>
      </Layout>
    );
  }

  if (error || !post) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-red-600">
            {error || "Blog post not found"}
          </h1>
          <p className="mt-4">Please check the URL or try again later.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Helmet>
        <title>Tin Tức Chi Tiết</title>
      </Helmet>
      <div className="container mx-auto mt-36 px-4 py-12">
        <div className="flex flex-col gap-12 lg:flex-row">
          {/* Main content */}
          <div className="lg:w-2/3">
            <BlogDetailSection post={post} relatedPosts={relatedPosts} />
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
    </Layout>
  );
};

export default BlogDetail;
