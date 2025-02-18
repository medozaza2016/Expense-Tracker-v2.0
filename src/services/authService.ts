import { supabase } from './supabase';
import type { User } from '../types/interfaces';

export const authService = {
  async signUp(email: string, password: string) {
    try {
      const { error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
      });
      
      if (error) throw error;
    } catch (error) {
      console.error('Error in signUp:', error);
      throw new Error('Failed to create account. Please try again.');
    }
  },

  async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });
      
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Invalid email or password');
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in signIn:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to sign in. Please try again.');
    }
  },

  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Error in signOut:', error);
      throw new Error('Failed to sign out. Please try again.');
    }
  },

  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      return profile;
    } catch (error) {
      console.error('Error in getCurrentUser:', error);
      return null;
    }
  },
};
