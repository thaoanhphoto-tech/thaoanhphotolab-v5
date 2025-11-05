

import React from 'react';
import { blogPosts } from '../data/blogData';
// Fix: Corrected import path to be a relative path.
import type { PageState } from '../App';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { NewspaperIcon } from './icons/NewspaperIcon';


interface BlogPostPageProps {
  postId?: string;
  navigateTo: (state: PageState) => void;
}

const FacebookIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
  </svg>
);

const TwitterIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const LinkedInIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5V8h3v11zM6.5 6.732a1.732 1.732 0 110-3.464 1.732 1.732 0 010 3.464zM20 19h-3v-5.5c0-1.32-.47-2.22-1.64-2.22-1.18 0-1.89.79-2.2 1.56-.11.28-.14.67-.14 1.06V19h-3V8h3v1.32c.4-.76 1.34-1.32 2.86-1.32 3.14 0 4.12 2.06 4.12 6.36V19z" />
  </svg>
);


export const BlogPostPage: React.FC<BlogPostPageProps> = ({ postId, navigateTo }) => {
  const post = blogPosts.find(p => p.slug === postId);

  if (!post) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-red-600">404 - Không tìm thấy bài viết</h2>
        <p className="mt-4 text-slate-500">Bài viết bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.</p>
        <button
          onClick={() => navigateTo({ page: 'blog' })}
          className="mt-8 px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
        >
          Quay lại trang Blog
        </button>
      </div>
    );
  }

  const renderContent = () => {
    return post.content.map((item, index) => {
      if (item.type === 'heading') {
        return <h2 key={index} className="text-2xl font-bold text-slate-800 dark:text-zinc-100 mt-8 mb-4">{item.text}</h2>;
      }
      return <p key={index} className="text-slate-600 dark:text-zinc-300 leading-relaxed mb-4">{item.text}</p>;
    });
  };

  const postUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareText = encodeURIComponent(post.title);
  const shareDescription = encodeURIComponent(post.description);

  const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`;
  const twitterShareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(postUrl)}&text=${shareText}`;
  const linkedInShareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(postUrl)}&title=${shareText}&summary=${shareDescription}`;

  return (
    <main className="container mx-auto px-4 py-12 sm:py-16">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => navigateTo({ page: 'blog' })}
          className="flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline mb-8"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Quay lại trang Blog
        </button>

        <article>
          <header className="mb-8">
            <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">{post.category}</p>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mt-2">
              {post.title}
            </h1>
            <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-zinc-400 mt-4">
              <span>Bởi <strong className="text-slate-700 dark:text-zinc-200">{post.author}</strong></span>
              <time dateTime={post.date}>Vào ngày {post.date}</time>
            </div>

            <div className="mt-6 flex items-center gap-4 border-y border-slate-200 dark:border-zinc-700 py-4">
                <span className="text-sm font-semibold text-slate-700 dark:text-zinc-300">Chia sẻ bài viết:</span>
                <div className="flex items-center gap-3">
                    <a href={facebookShareUrl} target="_blank" rel="noopener noreferrer" aria-label="Share on Facebook" className="text-slate-500 hover:text-blue-600 dark:hover:text-blue-500 transition-colors">
                        <FacebookIcon className="w-6 h-6" />
                    </a>
                    <a href={twitterShareUrl} target="_blank" rel="noopener noreferrer" aria-label="Share on Twitter" className="text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors">
                        <TwitterIcon className="w-5 h-5" />
                    </a>
                    <a href={linkedInShareUrl} target="_blank" rel="noopener noreferrer" aria-label="Share on LinkedIn" className="text-slate-500 hover:text-sky-700 dark:hover:text-sky-500 transition-colors">
                        <LinkedInIcon className="w-6 h-6" />
                    </a>
                </div>
            </div>

          </header>

          <div className="aspect-video rounded-lg overflow-hidden bg-slate-200 dark:bg-zinc-800 mb-8">
             <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
          </div>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            {renderContent()}
          </div>
        </article>
      </div>
    </main>
  );
};