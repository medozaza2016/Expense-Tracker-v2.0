import { supabase } from './supabase';
import type { User } from '../types/interfaces';

export const userService = {
  async getUsers(): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error in getUsers:', error);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error('Error in getUsers:', error);
      return [];
    }
  },

  async updateUser(userId: string, userData: Partial<User>): Promise<User> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(userData)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('User not found');
      
      return data;
    } catch (error) {
      console.error('Error in updateUser:', error);
      throw error instanceof Error ? error : new Error('An unexpected error occurred');
    }
  },

  async updatePassword(userId: string, newPassword: string): Promise<void> {
    try {
      const { error } = await supabase.auth.updateUser({ 
        password: newPassword 
      });

      if (error) {
        if (error.message.includes('same_password')) {
          throw new Error('New password must be different from your current password');
        }
        if (error.message.includes('at least 6 characters')) {
          throw new Error('Password must be at least 6 characters long');
        }
        throw error;
      }
    } catch (error) {
      console.error('Error in updatePassword:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to update password. Please try again.');
    }
  },

  async uploadAvatar(userId: string, file: File): Promise<User> {
    try {
      // Generate a unique filename
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'png';
      const fileName = `${userId}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;

      // Upload the file
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { 
          upsert: true,
          contentType: file.type 
        });

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update the user's profile with the new avatar URL
      const { data, error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: filePath })
        .eq('id', userId)
        .select()
        .single();

      if (updateError) throw updateError;
      if (!data) throw new Error('User not found');
      
      return data;
    } catch (error) {
      console.error('Error in uploadAvatar:', error);
      throw error instanceof Error ? error : new Error('Failed to upload avatar. Please try again.');
    }
  }
};
