import { Resource, Subject, Quiz, QuizQuestion, QuizAttempt, Bookmark } from '../types';
import { supabase } from '../lib/supabase';

export const api = {
  resources: {
    getAll: async (): Promise<Resource[]> => {
      const { data, error } = await supabase.from('resources').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    create: async (resource: Omit<Resource, 'id' | 'created_at' | 'updated_at' | 'views'>): Promise<Resource> => {
      const { data, error } = await supabase.from('resources').insert([resource]).select().single();
      if (error) throw error;
      return data;
    },
    update: async (id: string, updates: Partial<Resource>): Promise<void> => {
      const { error } = await supabase.from('resources').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id);
      if (error) throw error;
    },
    delete: async (id: string): Promise<void> => {
      const { error } = await supabase.from('resources').delete().eq('id', id);
      if (error) throw error;
    },
    trackView: async (id: string, userId: string): Promise<void> => {
      // Record view
      await supabase.from('resource_views').insert([{ user_id: userId, resource_id: id }]);
      // Increment counter
      const { data } = await supabase.from('resources').select('views').eq('id', id).single();
      if (data) {
        await supabase.from('resources').update({ views: (data.views || 0) + 1 }).eq('id', id);
      }
    }
  },
  
  subjects: {
    getAll: async (): Promise<Subject[]> => {
      const { data, error } = await supabase.from('subjects').select('*');
      if (error) throw error;
      return data || [];
    }
  },

  bookmarks: {
    getAll: async (userId: string): Promise<string[]> => {
      const { data, error } = await supabase.from('bookmarks').select('resource_id').eq('user_id', userId);
      if (error) throw error;
      return data ? data.map(b => b.resource_id) : [];
    },
    toggle: async (resourceId: string, userId: string): Promise<boolean> => {
      const { data: existing } = await supabase.from('bookmarks')
        .select('id').eq('user_id', userId).eq('resource_id', resourceId).single();
      
      if (existing) {
        await supabase.from('bookmarks').delete().eq('id', existing.id);
        return false; // unbookmarked
      } else {
        await supabase.from('bookmarks').insert([{ user_id: userId, resource_id: resourceId }]);
        return true; // bookmarked
      }
    }
  },

  quizzes: {
    getAll: async (): Promise<Quiz[]> => {
      const { data, error } = await supabase.from('quizzes').select('*');
      if (error) throw error;
      return data || [];
    },
    getQuestions: async (quizId: string): Promise<QuizQuestion[]> => {
      const { data, error } = await supabase.from('quiz_questions').select('*').eq('quiz_id', quizId);
      if (error) throw error;
      return data || [];
    },
    submitAttempt: async (attempt: Omit<QuizAttempt, 'id' | 'completed_at'>): Promise<void> => {
      const { error } = await supabase.from('quiz_attempts').insert([attempt]);
      if (error) throw error;
    }
  }
};
