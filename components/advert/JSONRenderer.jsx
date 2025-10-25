"use client";

import React, { useState } from 'react';
import { Copy, Download, ChevronDown, ChevronUp } from 'lucide-react';

export default function JSONRenderer({ data, title = 'Template JSON' }) {
  const [expandedSections, setExpandedSections] = useState({});
  const [copied, setCopied] = useState(false);

  const jsonString = JSON.stringify(data, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    element.setAttribute(
      'href',
      'data:text/plain;charset=utf-8,' + encodeURIComponent(jsonString)
    );
    element.setAttribute('download', `template-${Date.now()}.json`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const toggleSection = (key) => {
    setExpandedSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const renderValue = (value, depth = 0) => {
    if (value === null) {
      return <span className="text-red-600">null</span>;
    }

    if (typeof value === 'boolean') {
      return <span className="text-blue-600">{value.toString()}</span>;
    }

    if (typeof value === 'number') {
      return <span className="text-green-600">{value}</span>;
    }

    if (typeof value === 'string') {
      return <span className="text-orange-600">"{value}"</span>;
    }

    if (Array.isArray(value)) {
      const key = `array-${depth}-${Math.random()}`;
      const isExpanded = expandedSections[key];

      return (
        <div key={key}>
          <button
            onClick={() => toggleSection(key)}
            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-mono text-sm"
          >
            {isExpanded ? (
              <ChevronDown size={14} />
            ) : (
              <ChevronUp size={14} />
            )}
            <span>[{value.length} items]</span>
          </button>
          {isExpanded && (
            <div className="ml-4 mt-1 space-y-1">
              {value.map((item, idx) => (
                <div key={idx} className="font-mono text-xs">
                  <span className="text-gray-600">[{idx}]:</span>{' '}
                  {renderValue(item, depth + 1)}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (typeof value === 'object') {
      const key = `obj-${depth}-${Math.random()}`;
      const isExpanded = expandedSections[key];
      const keys = Object.keys(value);

      return (
        <div key={key}>
          <button
            onClick={() => toggleSection(key)}
            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-mono text-sm"
          >
            {isExpanded ? (
              <ChevronDown size={14} />
            ) : (
              <ChevronUp size={14} />
            )}
            <span>{`{${keys.length} keys}`}</span>
          </button>
          {isExpanded && (
            <div className="ml-4 mt-1 space-y-1">
              {keys.map((k) => (
                <div key={k} className="font-mono text-xs">
                  <span className="text-purple-600">"{k}"</span>
                  <span className="text-gray-600">:</span>{' '}
                  {renderValue(value[k], depth + 1)}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    return <span>{String(value)}</span>;
  };

  return (
    <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded transition"
            title="Copy to clipboard"
          >
            <Copy size={14} />
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-green-100 hover:bg-green-200 text-green-700 rounded transition"
            title="Download as JSON"
          >
            <Download size={14} />
            Download
          </button>
        </div>
      </div>

      {/* Raw JSON View */}
      <div className="p-4 bg-gray-900 text-gray-100 font-mono text-xs overflow-auto max-h-96">
        <pre>{jsonString}</pre>
      </div>

      {/* Structured View */}
      <div className="p-4 bg-gray-50 border-t">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Structured View</h4>
        <div className="space-y-2 font-mono text-xs text-gray-700">
          {renderValue(data)}
        </div>
      </div>

      {/* Stats */}
      <div className="p-4 border-t bg-white grid grid-cols-4 gap-4">
        <div>
          <p className="text-xs text-gray-600">Sections</p>
          <p className="text-lg font-semibold text-gray-900">
            {data.sections?.length || 0}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-600">Total Items</p>
          <p className="text-lg font-semibold text-gray-900">
            {data.sections?.reduce((sum, s) => sum + (s.items?.length || 0), 0) || 0}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-600">JSON Size</p>
          <p className="text-lg font-semibold text-gray-900">
            {(jsonString.length / 1024).toFixed(2)} KB
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-600">Layout</p>
          <p className="text-lg font-semibold text-gray-900 capitalize">
            {data.layout || 'N/A'}
          </p>
        </div>
      </div>
    </div>
  );
}
