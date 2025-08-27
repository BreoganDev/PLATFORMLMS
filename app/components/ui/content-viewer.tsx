'use client';

import { FileText, Download, ExternalLink } from 'lucide-react';

interface Resource {
  type: 'image' | 'pdf' | 'document' | 'video';
  name: string;
  url: string;
  size: number;
}

interface ContentViewerProps {
  content?: string | null;
  resources?: Resource[] | null;
  className?: string;
}

export default function ContentViewer({ content, resources, className = '' }: ContentViewerProps) {
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="h-5 w-5 text-red-500" />;
      case 'document':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'image':
        return <FileText className="h-5 w-5 text-green-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Contenido HTML */}
      {content && (
        <div 
          className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900 prose-ul:text-gray-700 prose-ol:text-gray-700 prose-blockquote:text-gray-600 prose-blockquote:border-blue-200 prose-img:rounded-lg prose-img:shadow-md"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      )}

      {/* Recursos descargables */}
      {resources && resources.length > 0 && (
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Download className="h-5 w-5" />
            Recursos Descargables
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {resources.map((resource, index) => (
              <a
                key={index}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors group"
              >
                <div className="flex-shrink-0">
                  {getFileIcon(resource.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-600">
                    {resource.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(resource.size)}
                  </p>
                </div>
                <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-blue-500" />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
