import React, { useState, useEffect } from 'react';
import { Edit2, Upload, Key } from 'lucide-react';
import { userService } from '../../services/userService';
import { useAuth } from '../../hooks/useAuth';
import type { User } from '../../types/interfaces';

export function UserList() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await userService.getUsers();
      setUsers(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred while loading users';
      setError(errorMessage);
      console.error('Error loading users:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateUser = async (userId: string, data: Partial<User>) => {
    try {
      setError(null);
      const updatedUser = await userService.updateUser(userId, data);
      setUsers(users.map(user => 
        user.id === userId ? updatedUser : user
      ));
      setEditingUser(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred while updating user';
      setError(errorMessage);
      console.error('Error updating user:', err);
    }
  };

  const handlePasswordChange = async () => {
    if (!selectedUserId || !newPassword) {
      setError('Password is required');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    
    try {
      setError(null);
      setIsSubmitting(true);
      await userService.updatePassword(selectedUserId, newPassword);
      setShowPasswordModal(false);
      setNewPassword('');
      setSelectedUserId(null);
      setError(null); // Clear any existing errors
    } catch (err) {
      if (err instanceof Error) {
        // Handle specific error messages
        if (err.message.includes('same_password')) {
          setError('New password must be different from your current password');
        } else if (err.message.includes('at least 6 characters')) {
          setError('Password must be at least 6 characters long');
        } else {
          setError(err.message);
        }
      } else {
        setError('Failed to update password. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAvatarUpload = async (userId: string, file: File) => {
    try {
      setError(null);
      const updatedUser = await userService.uploadAvatar(userId, file);
      setUsers(users.map(user => 
        user.id === userId ? updatedUser : user
      ));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred while uploading avatar';
      setError(errorMessage);
      console.error('Error uploading avatar:', err);
    }
  };

  const getDisplayName = (user: User) => {
    if (user.first_name) {
      return `${user.first_name} ${user.last_name || ''}`.trim();
    }
    return user.email.split('@')[0];
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-text-primary">Users</h1>
      </div>

      <div className="bg-card rounded-lg shadow border border-gray-800">
        <table className="min-w-full divide-y divide-gray-800">
          <thead className="bg-background">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-card divide-y divide-gray-800">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-background/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="relative group">
                      {user.avatar_url ? (
                        <img
                          src={user.avatar_url}
                          alt={getDisplayName(user)}
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-accent/20"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center font-medium">
                          {getDisplayName(user)[0].toUpperCase()}
                        </div>
                      )}
                      {currentUser?.id === user.id && (
                        <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                          <Upload className="w-5 h-5 text-white" />
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleAvatarUpload(user.id, file);
                            }}
                          />
                        </label>
                      )}
                    </div>
                    <div className="ml-4">
                      {editingUser?.id === user.id ? (
                        <div className="space-y-1">
                          <input
                            type="text"
                            value={editingUser.first_name || ''}
                            onChange={(e) => setEditingUser({ ...editingUser, first_name: e.target.value })}
                            placeholder="First Name"
                            className="px-2 py-1 text-sm bg-background border border-gray-700 rounded text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50"
                          />
                          <input
                            type="text"
                            value={editingUser.last_name || ''}
                            onChange={(e) => setEditingUser({ ...editingUser, last_name: e.target.value })}
                            placeholder="Last Name"
                            className="px-2 py-1 text-sm bg-background border border-gray-700 rounded text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50"
                          />
                        </div>
                      ) : (
                        <>
                          <div className="text-sm font-medium text-text-primary">
                            {getDisplayName(user)}
                          </div>
                          <div className="text-sm text-text-secondary">{user.email}</div>
                        </>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                  <div className="flex gap-2">
                    {editingUser?.id === user.id ? (
                      <>
                        <button
                          onClick={() => handleUpdateUser(user.id, {
                            first_name: editingUser.first_name,
                            last_name: editingUser.last_name
                          })}
                          className="text-sm text-accent hover:text-accent/80"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingUser(null)}
                          className="text-sm text-text-secondary hover:text-text-primary"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      currentUser?.id === user.id && (
                        <>
                          <button
                            onClick={() => setEditingUser(user)}
                            className="p-1 hover:text-accent"
                            title="Edit profile"
                          >
                            <Edit2 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedUserId(user.id);
                              setShowPasswordModal(true);
                              setError(null);
                              setNewPassword('');
                            }}
                            className="p-1 hover:text-accent"
                            title="Change password"
                          >
                            <Key className="w-5 h-5" />
                          </button>
                        </>
                      )
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-card p-6 rounded-lg border border-gray-800 w-96">
            <h3 className="text-lg font-medium text-text-primary mb-4">Change Password</h3>
            {error && (
              <div className="mb-4 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded text-sm">
                {error}
              </div>
            )}
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password"
              className="w-full px-3 py-2 bg-background border border-gray-700 rounded-md text-text-primary placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 mb-4"
              minLength={6}
              disabled={isSubmitting}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setNewPassword('');
                  setSelectedUserId(null);
                  setError(null);
                }}
                className="px-4 py-2 text-text-primary hover:bg-background rounded-md transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={handlePasswordChange}
                className="px-4 py-2 bg-accent text-white rounded-md hover:bg-accent/90 transition-colors disabled:opacity-50"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
