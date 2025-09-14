'use client';
import React from 'react';

const newsItems = [
  {
    title: 'Hand-carved Wooden Bowls Trending',
    description:
      "Unique hand-carved wooden bowls are selling fast this week. Add them to your shop for a trending lineup!",
    date: '2024-06-20',
  },
  {
    title: 'Eco-friendly Home Decor Hot Item',
    description:
      'Products with natural and recycled materials are topping artisan marketplace charts. Eco is in! Check top sellers in the Home Decor section.',
    date: '2024-06-19',
  },
  {
    title: 'Summer Jewelry Collections Launched',
    description:
      'New artisan jewelry lines for summer just launched. Promote your summer collections in the trending section.',
    date: '2024-06-18',
  },
  {
    title: 'Custom Stationery Gains Momentum',
    description:
      'Personalized notebooks, planners, and wedding invites see a surge in demand across boutique stores.',
    date: '2024-06-17',
  },
];

export default function News({ className = '', fullPage = false }) {
  return (
    <>
      {fullPage ? (
        <section className="w-full px-0 sm:px-2 md:px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {newsItems.map((news, idx) => (
              <article key={idx} className="p-5 border rounded-xl bg-white dark:bg-indigo-100 border-gray-200 dark:border-gray-500 shadow-sm">
                <div className="text-lg font-semibold text-blue-600 dark:text-blue-300 mb-1">{news.title}</div>
                <p className="text-gray-700 dark:text-gray-200 text-sm mb-2">{news.description}</p>
                <time className="text-xs text-gray-400 dark:text-gray-500">{news.date}</time>
              </article>
            ))}
          </div>
        </section>
      ) : (
        <aside className={`w-full max-w-xs min-w-[280px] bg-white dark:bg-indigo-200 border border-gray-200  p-4 rounded-xl shadow-sm ${className}`}>
          {/* <h3 className="text-lg font-bold mb-2 text-blue-700 dark:text-blue-300">Latest Marketplace News</h3> */}
          <div className="flex flex-col gap-3">
            {newsItems.map((news, idx) => (
              <article key={idx} className="p-3 bg-gray-50 dark:bg-white-100 rounded-lg">
                <div className="text-sm font-semibold text-blue-600 dark:text-blue-600 mb-1">{news.title}</div>
                <p className="text-gray-700 dark:text-gray-200 text-xs mb-1">{news.description}</p>
                <time className="text-xs text-gray-400 dark:text-gray-500">{news.date}</time>
              </article>
            ))}
          </div>
        </aside>
      )}
    </>
  );
}
