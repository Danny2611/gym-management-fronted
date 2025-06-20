// src/types/blog.ts
export interface BlogAuthor {
  id: string;
  name: string;
  bio: string;
  avatar: string;
}

export interface BlogCategory {
  _id: string;
  name: string;
  slug: string;
  postCount: number;
}

export interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  publishDate: string;
  readTime: number;
  author?: BlogAuthor;
  category: BlogCategory;
  tags?: string[];
  featured?: boolean;
}
