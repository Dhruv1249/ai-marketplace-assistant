"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Edit3, Eye } from 'lucide-react';
import SellerInfoTemplatePreview from '@/components/seller-info/SellerInfoTemplatePreview';
import EditableSellerInfoPreview from '@/components/seller-info/EditableSellerInfoPreview';

export default function SellerInfoPreviewPage() {
  const [data, setData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('sellerInfoPreviewData');
      if (raw) {
        const parsed = JSON.parse(raw);
        setData(parsed);
      }
    } catch (e) {
      console.error('Failed to read seller info preview data:', e);
    }
  }, []);

  const handleContentChange = (elementId, newText, newStyle) => {
    // Update the content based on element changes
    console.log('Content changed:', elementId, newText, newStyle);
    // You can implement saving logic here
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/seller-info" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-xl font-semibold text-gray-900">Seller Info Preview</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isEditing 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {isEditing ? (
                <>
                  <Eye size={16} />
                  Preview Mode
                </>
              ) : (
                <>
                  <Edit3 size={16} />
                  Edit Mode
                </>
              )}
            </button>
            
            <div className="text-xs text-gray-500">
              Keep the seller info tab open to maintain your data.
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {!data ? (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <p className="text-gray-700">
              No preview data found. Go back to the Seller Info page, fill in your information, and click Preview.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            {isEditing ? (
              <EditableSellerInfoPreview 
                templateType={data.templateType} 
                sellerData={data.sellerData}
                isEditing={true}
                onContentChange={handleContentChange}
              />
            ) : (
              <SellerInfoTemplatePreview 
                templateType={data.templateType} 
                sellerData={data.sellerData} 
              />
            )}
          </div>
        )}
      </div>

      {/* Edit Mode Instructions */}
      {isEditing && (
        <div className="fixed bottom-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg max-w-sm">
          <h3 className="font-semibold mb-2">Edit Mode Active</h3>
          <ul className="text-sm space-y-1">
            <li>• Click and drag elements to move them</li>
            <li>• Double-click text to edit content</li>
            <li>• Use resize handles to adjust size</li>
            <li>• Click outside to deselect elements</li>
          </ul>
        </div>
      )}
    </div>
  );
}