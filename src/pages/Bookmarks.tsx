import React, { useState, useEffect } from 'react';
import { Bookmark, Search, BookOpen, Clock, ExternalLink } from 'lucide-react';
import { api } from '../services/api';
import { Resource } from '../types';
import { useRole } from '../contexts/RoleContext';

export function Bookmarks() {
  const { user } = useRole();
  const [bookmarkedResources, setBookmarkedResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadBookmarks();
  }, []);

  const loadBookmarks = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const [allResources, bookmarkedIds] = await Promise.all([
        api.resources.getAll(),
        api.bookmarks.getAll(user.id)
      ]);
      
      const bookmarked = allResources.filter(r => bookmarkedIds.includes(r.id));
      setBookmarkedResources(bookmarked);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResourceClick = async (resource: Resource) => {
    window.open(resource.resource_url, '_blank');
    if (!user) return;
    try {
      await api.resources.trackView(resource.id, user.id);
    } catch (e) {
      console.error(e);
    }
  };

  const handleRemoveBookmark = async (id: string) => {
    if (!user) return;
    try {
      await api.bookmarks.toggle(id, user.id);
      setBookmarkedResources(prev => prev.filter(r => r.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Bookmark className="w-6 h-6 text-indigo-600 fill-current" />
          My Bookmarks
        </h1>
        <p className="text-sm text-gray-500 mt-1">Quick access to your saved study materials.</p>
      </div>

      {isLoading ? (
        <div className="py-20 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500">Loading bookmarks...</p>
        </div>
      ) : bookmarkedResources.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bookmark className="w-8 h-8 text-indigo-300" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">No bookmarks yet</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            You haven't saved any resources. Go to the Resource Explorer to find and bookmark materials.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookmarkedResources.map(resource => (
            <div key={resource.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-all flex flex-col h-full">
              <div className="flex justify-between items-start mb-3">
                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-indigo-50 text-indigo-700 ring-1 ring-indigo-600/10">
                  {resource.resource_type}
                </span>
                <button 
                  onClick={() => handleRemoveBookmark(resource.id)}
                  className="p-1.5 rounded-full text-indigo-600 hover:bg-red-50 hover:text-red-600 transition-colors"
                  title="Remove bookmark"
                >
                  <Bookmark className="w-5 h-5 fill-current" />
                </button>
              </div>
              
              <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                {resource.title}
              </h3>
              
              <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-1">
                {resource.description}
              </p>
              
              <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-100 mt-auto">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5" /> {resource.views || 0}
                  </span>
                </div>
                
                <button 
                  onClick={() => handleResourceClick(resource)}
                  className="text-indigo-600 font-medium hover:text-indigo-800 flex items-center gap-1 transition-colors"
                >
                  Open <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
