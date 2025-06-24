import React from "react";
import { Link } from "react-router-dom";
import { BlogPost } from "~/types/blog";
import { formatDate } from "~/utils/formatters";
import Avatar from "~/components/ui/avatar/Avatar";

interface BlogDetailProps {
  post: BlogPost;
  relatedPosts?: BlogPost[];
}

const BlogDetail: React.FC<BlogDetailProps> = ({ post, relatedPosts = [] }) => {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-4xl">
        {/* Post Header */}
        <div className="mb-8">
          <div className="mb-3 flex items-center space-x-4 text-sm text-gray-500">
            <span>{formatDate(post.publishDate)}</span>
            <span>•</span>
            <Link
              to={`/blog/category/${post.category.slug}`}
              className="text-primary-500 hover:underline"
            >
              {post.category.name}
            </Link>
            <span>•</span>
            <span>{post.readTime} min read</span>
          </div>
          <h1 className="mb-4 text-3xl font-bold md:text-4xl lg:text-5xl">
            {post.title}
          </h1>
          <p className="text-xl text-gray-600">{post.excerpt}</p>
        </div>

        {/* Featured Image */}
        <div className="mb-10">
          <img
            src={
              `${post.coverImage}` ||
              "/images/blog/default.jpg"
            }
            alt={post.title}
            className="h-auto w-full rounded-lg shadow-lg"
          />
        </div>

        {/* Post Content */}
        <div className="prose mb-12 max-w-none">
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="mb-10">
            <h3 className="mb-3 text-lg font-semibold">Tags:</h3>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Link
                  key={tag}
                  to={`/blog/tag/${tag}`}
                  className="hover:bg-primary-100 hover:text-primary-600 rounded-full bg-gray-100 px-3 py-1 text-sm transition-colors"
                >
                  {tag}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Author Info */}
        {post.author && (
          <div className="mb-10 flex items-center space-x-4 rounded-lg bg-gray-50 p-6">
           
            <Avatar
              src={post.author.avatar}
              size="large"
              alt={post.author.name}
              className="h-16 w-16 rounded-full"
            />
            <div>
              <h3 className="text-lg font-bold">{post.author.name}</h3>
              <p className="text-gray-600">{post.author.bio}</p>
            </div>
          </div>
        )}

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="mt-12">
            <h2 className="mb-6 text-2xl font-bold">Related Posts</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {relatedPosts.map((relatedPost) => (
                <div
                  key={relatedPost._id}
                  className="overflow-hidden rounded-lg bg-white shadow-md"
                >
                  <img
                    src={relatedPost.coverImage}
                    alt={relatedPost.title}
                    className="h-48 w-full object-cover"
                  />
                  <div className="p-4">
                    <Link
                      to={`/blog/${relatedPost.slug}`}
                      className="hover:text-primary-500 text-lg font-semibold transition-colors"
                    >
                      {relatedPost.title}
                    </Link>
                    <p className="mt-2 text-sm text-gray-500">
                      {formatDate(relatedPost.publishDate)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogDetail;
