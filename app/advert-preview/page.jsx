"use client";

import React, { useEffect, useState } from 'react';
import { ArrowLeft, Download, Copy, Eye, Code } from 'lucide-react';
import Link from 'next/link';
import AdvertPreview from '@/components/advert/AdvertPreview';
import JSONRenderer from '@/components/advert/JSONRenderer';

export default function AdvertPreviewPage() {
  const [templateData, setTemplateData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showJSON, setShowJSON] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Get template data from localStorage
    const savedData = localStorage.getItem('advertPreviewData');
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        setTemplateData(data);
      } catch (error) {
        console.error('Failed to parse preview data:', error);
      }
    }
    setLoading(false);
  }, []);

  const handleCopyJSON = () => {
    if (templateData) {
      navigator.clipboard.writeText(JSON.stringify(templateData, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadJSON = () => {
    if (templateData) {
      const element = document.createElement('a');
      element.setAttribute(
        'href',
        'data:text/plain;charset=utf-8,' +
          encodeURIComponent(JSON.stringify(templateData, null, 2))
      );
      element.setAttribute('download', `template-${Date.now()}.json`);
      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading preview...</p>
        </div>
      </div>
    );
  }

  if (!templateData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link href="/advert" className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8">
            <ArrowLeft size={20} />
            Back to Editor
          </Link>
          <div className="bg-white rounded-lg border shadow-sm p-12 text-center">
            <p className="text-gray-600 mb-4">No template data found</p>
            <Link
              href="/advert"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Create a Template
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/advert" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {templateData.name || 'Template Preview'}
              </h1>
              <p className="text-sm text-gray-600">
                {templateData.sections?.length || 0} sections
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowJSON(!showJSON)}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              <Code size={16} />
              {showJSON ? 'Hide' : 'Show'} JSON
            </button>
            <button
              onClick={handleCopyJSON}
              className="flex items-center gap-2 px-4 py-2 text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 transition"
            >
              <Copy size={16} />
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button
              onClick={handleDownloadJSON}
              className="flex items-center gap-2 px-4 py-2 text-green-700 bg-green-100 rounded-lg hover:bg-green-200 transition"
            >
              <Download size={16} />
              Download
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showJSON ? (
          <JSONRenderer data={templateData} title="Template JSON" />
        ) : (
          <div className="space-y-8">
            {/* Preview */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Eye size={20} />
                Live Preview
              </h2>
              <AdvertPreview data={templateData} />
            </div>

            {/* Template Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Colors */}
              <div className="bg-white rounded-lg border shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Colors</h3>
                <div className="space-y-3">
                  {templateData.colors &&
                    Object.entries(templateData.colors).map(([key, value]) => (
                      <div key={key} className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded border border-gray-300"
                          style={{ backgroundColor: value }}
                        />
                        <div className="flex-1">
                          <p className="text-xs text-gray-600 capitalize">{key}</p>
                          <p className="text-sm font-mono text-gray-900">{value}</p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Fonts */}
              <div className="bg-white rounded-lg border shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Fonts</h3>
                <div className="space-y-3">
                  {templateData.fonts &&
                    Object.entries(templateData.fonts).map(([key, value]) => (
                      <div key={key}>
                        <p className="text-xs text-gray-600 capitalize mb-1">{key}</p>
                        <p className="text-sm font-medium text-gray-900">{value}</p>
                      </div>
                    ))}
                </div>
              </div>

              {/* Stats */}
              <div className="bg-white rounded-lg border shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Statistics</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Total Sections</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {templateData.sections?.length || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Total Items</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {templateData.sections?.reduce(
                        (sum, s) => sum + (s.items?.length || 0),
                        0
                      ) || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Layout Type</p>
                    <p className="text-sm font-medium text-gray-900 capitalize">
                      {templateData.layout || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sections List */}
            <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
              <div className="p-6 border-b bg-gray-50">
                <h3 className="font-semibold text-gray-900">Sections</h3>
              </div>
              <div className="divide-y">
                {templateData.sections?.map((section, idx) => (
                  <div key={section.id || idx} className="p-4 hover:bg-gray-50 transition">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-gray-900">
                          {section.title || `Section ${idx + 1}`}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          Type: <span className="font-mono">{section.type}</span>
                        </p>
                        {section.items && section.items.length > 0 && (
                          <p className="text-sm text-gray-600 mt-1">
                            Items: <span className="font-semibold">{section.items.length}</span>
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <div
                          className="w-6 h-6 rounded border border-gray-300"
                          style={{ backgroundColor: section.backgroundColor }}
                          title={section.backgroundColor}
                        />
                        <div
                          className="w-6 h-6 rounded border border-gray-300"
                          style={{ backgroundColor: section.textColor }}
                          title={section.textColor}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
