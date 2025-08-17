"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import FullTemplatePreview from '@/components/templates/FullPreview';

export default function PreviewPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('previewData');
      if (raw) {
        const parsed = JSON.parse(raw);
        setData(parsed);
      }
    } catch (e) {
      console.error('Failed to read preview data:', e);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/create" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-xl font-semibold text-gray-900">Template Preview</h1>
          </div>
          <div className="text-xs text-gray-500">
            Keep the creation tab open to view uploaded images in this preview.
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {!data ? (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <p className="text-gray-700">
              No preview data found. Go back to the Create page, generate content, choose a layout, and click Preview.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <FullTemplatePreview layoutType={data.layoutType} content={data.content} images={data.images} />
          </div>
        )}
      </div>
    </div>
  );
}
