import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Resource, Subject } from '../types';
import { Plus, Edit2, Trash2, Database, ShieldAlert, X, Save } from 'lucide-react';
import { useRole } from '../contexts/RoleContext';

const RESOURCE_TYPES = ['Notes', 'Question Papers', 'Assignments', 'Lab Manuals', 'Reference Material', 'Video Lectures', 'Books', 'Other'];

export function Admin() {
  const { role, isFaculty } = useRole();
  const [activeTab, setActiveTab] = useState('resources');
  const [resources, setResources] = useState<Resource[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    resource_type: 'Notes',
    subject_id: '',
    branch: '',
    semester: '1',
    resource_url: '',
    tags: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [resData, subData] = await Promise.all([
        api.resources.getAll(),
        api.subjects.getAll()
      ]);
      setResources(resData);
      setSubjects(subData);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (resource?: Resource) => {
    if (resource) {
      setEditingId(resource.id);
      setFormData({
        title: resource.title,
        description: resource.description,
        resource_type: resource.resource_type,
        subject_id: resource.subject_id,
        branch: resource.branch,
        semester: resource.semester,
        resource_url: resource.resource_url,
        tags: resource.tags.join(', ')
      });
    } else {
      setEditingId(null);
      setFormData({
        title: '', description: '', resource_type: 'Notes', subject_id: subjects[0]?.id || '',
        branch: 'Computer Science', semester: '1', resource_url: '', tags: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        uploaded_by: role === 'ADMIN' ? 'Admin User' : 'Faculty Member',
        resource_type: formData.resource_type as any
      };

      if (editingId) {
        await api.resources.update(editingId, payload);
      } else {
        await api.resources.create(payload);
      }
      setIsModalOpen(false);
      loadData();
      alert(`Resource ${editingId ? 'updated' : 'added'} successfully!`);
    } catch (e) {
      console.error(e);
      alert('Failed to save resource.');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this resource?')) {
      try {
        await api.resources.delete(id);
        loadData();
      } catch (e) {
        alert('Failed to delete.');
      }
    }
  };

  if (!isFaculty) {
    return <div className="p-8 text-center text-red-600 font-bold">Unauthorized Access</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-red-500" />
            Management Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-1">Manage resources, subjects, and analytics.</p>
        </div>
        
        <button onClick={() => handleOpenModal()} className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-indigo-700 transition-colors shadow-sm">
          <Plus className="w-4 h-4" />
          Add Resource
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button 
            onClick={() => setActiveTab('resources')}
            className={`py-3 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'resources' 
                ? 'border-indigo-500 text-indigo-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Resources
          </button>
          <button 
            onClick={() => setActiveTab('analytics')}
            className={`py-3 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'analytics' 
                ? 'border-indigo-500 text-indigo-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Analytics
          </button>
        </nav>
      </div>

      {/* Resources Table */}
      {activeTab === 'resources' && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 font-semibold">Title</th>
                  <th className="px-6 py-3 font-semibold">Type</th>
                  <th className="px-6 py-3 font-semibold">Subject</th>
                  <th className="px-6 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {isLoading ? (
                  <tr><td colSpan={4} className="p-8 text-center text-gray-500">Loading resources...</td></tr>
                ) : resources.length === 0 ? (
                  <tr><td colSpan={4} className="p-8 text-center text-gray-500">No resources found.</td></tr>
                ) : (
                  resources.map(resource => (
                    <tr key={resource.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">{resource.title}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                          {resource.resource_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {subjects.find(s => s.id === resource.subject_id)?.name}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleOpenModal(resource)} className="p-1 text-gray-400 hover:text-indigo-600 transition-colors">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(resource.id)} className="p-1 text-gray-400 hover:text-red-600 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm text-center">
            <h3 className="text-gray-500 text-sm font-medium">Total Resources</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{resources.length}</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm text-center">
            <h3 className="text-gray-500 text-sm font-medium">Total Views</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {resources.reduce((acc, r) => acc + (r.views || 0), 0)}
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm text-center">
            <h3 className="text-gray-500 text-sm font-medium">Subjects</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{subjects.length}</p>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">{editingId ? 'Edit Resource' : 'Add New Resource'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Title</label>
                  <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500" />
                </div>
                
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Resource Type</label>
                  <select required value={formData.resource_type} onChange={e => setFormData({...formData, resource_type: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500">
                    {RESOURCE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Subject</label>
                  <select required value={formData.subject_id} onChange={e => setFormData({...formData, subject_id: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500">
                    <option value="">Select a subject...</option>
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Branch & Semester</label>
                  <div className="flex gap-2">
                    <input required placeholder="Branch" value={formData.branch} onChange={e => setFormData({...formData, branch: e.target.value})} className="w-1/2 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500" />
                    <input required placeholder="Sem" value={formData.semester} onChange={e => setFormData({...formData, semester: e.target.value})} className="w-1/2 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500" />
                  </div>
                </div>
                
                <div className="space-y-1 md:col-span-2">
                  <label className="text-sm font-medium text-gray-700">Resource URL (Link)</label>
                  <input required type="url" placeholder="https://..." value={formData.resource_url} onChange={e => setFormData({...formData, resource_url: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500" />
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="text-sm font-medium text-gray-700">Description</label>
                  <textarea required rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"></textarea>
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="text-sm font-medium text-gray-700">Tags (comma separated)</label>
                  <input placeholder="dbms, unit1, notes" value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center gap-2">
                  <Save className="w-4 h-4" /> Save Resource
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
