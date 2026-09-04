import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, BookOpen, ExternalLink, Bookmark, Clock, Library, SlidersHorizontal, ChevronRight, X } from 'lucide-react';
import { api } from '../services/api';
import { Resource, Subject } from '../types';
import { useRole } from '../contexts/RoleContext';

export function Resources() {
  const { user } = useRole();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  const [resources, setResources] = useState<Resource[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const [resData, subData, bookmarksData] = await Promise.all([
          api.resources.getAll(),
          api.subjects.getAll(),
          user ? api.bookmarks.getAll(user.id) : Promise.resolve([])
        ]);
        setResources(resData);
        setSubjects(subData);
        setBookmarkedIds(new Set(bookmarksData));
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleResourceClick = async (resource: Resource) => {
    window.open(resource.resource_url, '_blank');
    if (!user) return;
    try {
      await api.resources.trackView(resource.id, user.id);
      setResources(prev => prev.map(r => r.id === resource.id ? { ...r, views: (r.views || 0) + 1 } : r));
    } catch (e) {
      console.error('Failed to track view', e);
    }
  };

  const handleToggleBookmark = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!user) return;
    try {
      const isNowBookmarked = await api.bookmarks.toggle(id, user.id);
      setBookmarkedIds(prev => {
        const next = new Set(prev);
        if (isNowBookmarked) next.add(id);
        else next.delete(id);
        return next;
      });
    } catch (err) {
      console.error(err);
    }
  };

  const filteredResources = useMemo(() => {
    return resources.filter(resource => {
      const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            resource.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesSubject = selectedSubject ? resource.subject_id === selectedSubject : true;
      const matchesType = selectedType ? resource.resource_type === selectedType : true;
      const matchesSemester = selectedSemester ? resource.semester === selectedSemester : true;

      return matchesSearch && matchesSubject && matchesType && matchesSemester;
    });
  }, [resources, searchQuery, selectedSubject, selectedType, selectedSemester]);

  const semesters = ['1', '2', '3', '4', '5', '6', '7', '8'];
  const resourceTypes = ['Notes', 'Question Papers', 'Assignments', 'Lab Manuals', 'Reference Material', 'Video Lectures', 'Books', 'Other'];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Library className="w-6 h-6 text-indigo-600" />
            Resource Library
          </h1>
          <p className="text-sm text-gray-500 mt-1">Discover study materials, notes, and question papers.</p>
        </div>
        
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 lg:hidden"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Filters Sidebar */}
        <div className={`lg:w-64 flex-shrink-0 space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between lg:hidden">
              <h2 className="font-semibold text-gray-900">Filters</h2>
              <button onClick={() => setShowFilters(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Subject</h3>
              <div className="space-y-2">
                <button 
                  onClick={() => setSelectedSubject('')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${!selectedSubject ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  All Subjects
                </button>
                {subjects.map(subject => (
                  <button 
                    key={subject.id}
                    onClick={() => setSelectedSubject(subject.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${selectedSubject === subject.id ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    {subject.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Resource Type</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                <button 
                  onClick={() => setSelectedType('')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${!selectedType ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  All Types
                </button>
                {resourceTypes.map(type => (
                  <button 
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${selectedType === type ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Semester</h3>
              <div className="grid grid-cols-4 gap-2">
                <button 
                  onClick={() => setSelectedSemester('')}
                  className={`col-span-4 text-center py-1.5 rounded-md text-sm font-medium transition-colors ${!selectedSemester ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  All
                </button>
                {semesters.map(sem => (
                  <button 
                    key={sem}
                    onClick={() => setSelectedSemester(sem)}
                    className={`py-1.5 rounded-md text-sm font-medium transition-colors ${selectedSemester === sem ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >
                    {sem}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 space-y-6">
          <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-200 flex items-center gap-2">
            <Search className="w-5 h-5 text-gray-400 ml-3" />
            <input 
              type="text" 
              placeholder="Search by title, description, or tags..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="p-2 text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center justify-between text-sm text-gray-500">
            <p>Showing <span className="font-semibold text-gray-900">{filteredResources.length}</span> resources</p>
          </div>

          {isLoading ? (
            <div className="py-20 text-center">
              <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-500">Loading resources...</p>
            </div>
          ) : filteredResources.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">No resources found</h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                We couldn't find any resources matching your current filters. Try adjusting your search criteria or clearing filters.
              </p>
              <button 
                onClick={() => {
                  setSearchQuery(''); setSelectedSubject(''); setSelectedType(''); setSelectedSemester('');
                }}
                className="text-indigo-600 font-medium hover:text-indigo-700"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredResources.map(resource => (
                <div key={resource.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:border-indigo-300 hover:shadow-md transition-all group flex flex-col h-full">
                  <div className="flex justify-between items-start mb-3">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-indigo-50 text-indigo-700 ring-1 ring-indigo-600/10">
                      {resource.resource_type}
                    </span>
                    <button 
                      onClick={(e) => handleToggleBookmark(e, resource.id)}
                      className={`p-1.5 rounded-full hover:bg-gray-100 transition-colors ${
                        bookmarkedIds.has(resource.id) ? 'text-indigo-600' : 'text-gray-400 hover:text-indigo-600'
                      }`}
                    >
                      <Bookmark className={`w-5 h-5 ${bookmarkedIds.has(resource.id) ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                    {resource.title}
                  </h3>
                  
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-1">
                    {resource.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-1.5 mb-4 mt-auto">
                    {resource.tags.slice(0, 3).map((tag, idx) => (
                      <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5" /> {resource.views || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> 
                        {new Date(resource.created_at).toLocaleDateString()}
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
      </div>
    </div>
  );
}
