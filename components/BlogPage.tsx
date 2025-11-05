

import React from 'react';
import { blogPosts } from '../data/blogData';
// Fix: Corrected import path to be a relative path.
import type { PageState } from '../App';

interface BlogPageProps {
  navigateTo: (state: PageState) => void;
}

export const BlogPage: React.FC<BlogPageProps> = ({ navigateTo }) => {
  const featuredPost = blogPosts[0];
  const otherPosts = blogPosts.slice(1);

  // FIX: Explicitly type PostCard as a React.FC to allow React's special `key` prop.
  // Fix: Removed `key` from the prop type definition as it's a special React prop.
  const PostCard: React.FC<{ post: typeof blogPosts[0]; isFeatured?: boolean }> = ({ post, isFeatured = false }) => (
    <button
      onClick={() => navigateTo({ page: 'blog_post', postId: post.slug })}
      className={`text-left group ${isFeatured ? 'grid md:grid-cols-2 gap-8 items-center' : 'block'}`}
    >
      <div className="relative aspect-video overflow-hidden rounded-lg bg-slate-200 dark:bg-zinc-800">
        <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
      </div>
      <div>
        <p className={`mt-4 text-sm font-semibold ${isFeatured ? 'md:mt-0' : ''}`}>
          <span className="text-blue-600 dark:text-blue-400">{post.category}</span>
          <span className="text-slate-500 dark:text-zinc-400"> · {post.date}</span>
        </p>
        <h2 className={`mt-2 font-bold group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors ${isFeatured ? 'text-2xl md:text-3xl' : 'text-xl'}`}>
          {post.title}
        </h2>
        <p className="mt-2 text-slate-500 dark:text-zinc-400 text-sm leading-relaxed hidden sm:block">{post.description}</p>
      </div>
    </button>
  );

  return (
    <main className="container mx-auto px-4 py-12 sm:py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-800 dark:text-zinc-100">
          Tin Tức & Blog
        </h1>
        <p className="mt-4 text-lg text-slate-500 dark:text-zinc-400 max-w-2xl mx-auto">
          Cập nhật những xu hướng, mẹo và câu chuyện mới nhất từ thế giới nhiếp ảnh và in ấn.
        </p>
      </div>

      {featuredPost && (
        <div className="mb-16">
          <PostCard post={featuredPost} isFeatured />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
        {otherPosts.map(post => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>
    </main>
  );
};