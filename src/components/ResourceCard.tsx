import React, { useState } from 'react';
import { Resource } from '../types';
import { mockSubjects } from '../data/seed';
import { FileText, ExternalLink, BookmarkPlus, BookmarkCheck, Calendar, User, Eye, Tag } from 'lucide-react';
import { cn } from '../lib/utils';

interface ResourceCardProps {
  resource: Resource;
  isBookmarked?: boolean;
  onBookmark?: (id: string) => void;
  onClick?: (resource: Resource) => void;
}

export function ResourceCard({ resource, isBookmarked = false, onBookmark, onClick }: ResourceCardProps) {
  const subject = mockSubjects.find(s => s.id === resource.subject_id);

  const getResourceTypeColor = (type: string) => {
    switch (type) {
      case 'Notes': return 'bg-blue-100 text-blue-800';
      case 'Question Papers': return 'bg-red-100 text-red-800';
      case 'Assignments': return 'bg-orange-100 text-orange-800';
      case 'Video Lectures': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div 
      className="group flex flex-col bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer h-full"
      onClick={() => onClick?.(resource)}
    >
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-3">
          <span className={cn("px-2.5 py-1 rounded-md text-xs font-medium", getResourceTypeColor(resource.resource_type))}>
            {resource.resource_type}
          </span>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onBookmark?.(resource.id);
            }}
            className="text-gray-400 hover:text-indigo-600 transition-colors p-1"
          >
            {isBookmarked ? (
              <BookmarkCheck className="w-5 h-5 text-indigo-600" />
            ) : (
              <BookmarkPlus className="w-5 h-5" />
            )}
          </button>
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
          {resource.title}
        </h3>
        
        <p className="text-sm text-gray-500 mb-4 line-clamp-2 flex-1">
          {resource.description}
        </p>

        <div className="space-y-2 mt-auto">
          <div className="flex items-center text-xs text-gray-500 gap-2">
            <BookOpenIcon className="w-3.5 h-3.5" />
            <span className="font-medium">{subject?.name || 'Unknown Subject'}</span>
            <span className="text-gray-300">•</span>
            <span>Sem {resource.semester}</span>
          </div>
          
          <div className="flex flex-wrap gap-1 mt-2">
            {resource.tags.slice(0, 3).map(tag => (
              <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-gray-50 text-gray-600 border border-gray-100">
                <Tag className="w-3 h-3" /> {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
      
      <div className="border-t border-gray-100 p-4 bg-gray-50 flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> {resource.uploaded_by}</span>
          {resource.views !== undefined && (
            <span className="flex items-center gap-1.5"><Eye className="w-3.5 h-3.5" /> {resource.views}</span>
          )}
        </div>
      </div>
    </div>
  );
}

// Fix missing icon in imports
import { BookOpen as BookOpenIcon } from 'lucide-react';
