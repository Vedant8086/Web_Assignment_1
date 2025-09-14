import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { userAPI, adminAPI } from '../utils/api';
import { Plus, Search, Edit, Trash2, Settings, User, Mail, MapPin, Users as UsersIcon, Lock, Calendar } from 'lucide-react';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import Modal from '../components/UI/Modal';
import ConfirmationModal from '../components/UI/ConfirmationModal';
import toast from 'react-hot-toast';

const Users = () => {
  const { user, setUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [userToEdit, setUserToEdit] = useState(null);
  const [filters, setFilters] = useState({
    name: '',
    email: '',
    role: '',
    sortBy: 'name',
    sortOrder: 'asc'
  });

  const { register: registerCreate, handleSubmit: handleCreateSubmit, reset: resetCreate, formState: { errors: createErrors } } = useForm();
  const { register: registerEdit, handleSubmit: handleEditSubmit, reset: resetEdit, formState: { errors: editErrors, isSubmitting: isEditing } } = useForm();
  const { register: registerProfile, handleSubmit: handleProfileSubmit, reset: resetProfile, formState: { errors: profileErrors, isSubmitting: isUpdatingProfile } } = useForm();

  useEffect(() => {
    loadUsers();
  }, [filters]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getAllUsers(filters);
      setUsers(response.data);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (data) => {
    try {
      await userAPI.createUser(data);
      toast.success('User created successfully');
      setIsCreateModalOpen(false);
      resetCreate();
      loadUsers();
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error(error.response?.data?.message || 'Failed to create user');
    }
  };

  const handleDeleteClick = (userToDelete) => {
    setUserToDelete(userToDelete);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;

    try {
      await adminAPI.deleteUser(userToDelete.id);
      toast.success(`User "${userToDelete.name}" deleted successfully`);
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
      loadUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleEditClick = (userToEdit) => {
    setUserToEdit(userToEdit);
    resetEdit({
      name: userToEdit.name || '',
      email: userToEdit.email || '',
      address: userToEdit.address || '',
      role: userToEdit.role || '',
      password: ''
    });
    setIsEditModalOpen(true);
  };

  const handleEditUser = async (data) => {
    try {
      // Filter out empty values
      const filteredData = Object.fromEntries(
        Object.entries(data).filter(([_, value]) => value && value.trim() !== '')
      );

      await adminAPI.updateUser(userToEdit.id, filteredData);
      toast.success(`User "${userToEdit.name}" updated successfully`);
      setIsEditModalOpen(false);
      setUserToEdit(null);
      resetEdit();
      loadUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error(error.response?.data?.message || 'Failed to update user');
    }
  };

  const handleProfileEditClick = () => {
    setUserToEdit(user);
    resetProfile({
      name: user.name || '',
      email: user.email || '',
      address: user.address || '',
      password: ''
    });
    setIsProfileModalOpen(true);
  };

  const handleProfileUpdate = async (data) => {
    try {
      // Filter out empty values but keep empty strings for address (to allow clearing)
      const filteredData = {};
      
      if (data.name && data.name.trim() !== '') {
        filteredData.name = data.name.trim();
      }
      
      if (data.email && data.email.trim() !== '') {
        filteredData.email = data.email.trim();
      }
      
      // Include address even if empty (allows clearing address)
      if (data.address !== undefined) {
        filteredData.address = data.address;
      }
      
      if (data.password && data.password.trim() !== '') {
        filteredData.password = data.password.trim();
      }

      const result = await userAPI.updateProfile(filteredData);
      toast.success('Profile updated successfully');
      
      // Update the local user state with new data
      setUser(result.data.user);
      
      setIsProfileModalOpen(false);
      setUserToEdit(null);
      resetProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Users Management
        </h1>
        <div className="flex space-x-3">
          <button
            onClick={handleProfileEditClick}
            className="btn-outline"
          >
            <Settings className="h-4 w-4" />
            <span>Edit Profile</span>
          </button>
          {user?.role === 'admin' && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="btn-primary"
            >
              <Plus className="h-4 w-4" />
              <span>Add User</span>
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      {user?.role === 'admin' && (
        <div className="card p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Name</label>
              <input
                type="text"
                value={filters.name}
                onChange={(e) => handleFilterChange('name', e.target.value)}
                className="input-field"
                placeholder="Search by name..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={filters.email}
                onChange={(e) => handleFilterChange('email', e.target.value)}
                className="input-field"
                placeholder="Search by email..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Role</label>
              <select
                value={filters.role}
                onChange={(e) => handleFilterChange('role', e.target.value)}
                className="input-field"
              >
                <option value="">All Roles</option>
                <option value="admin">Admin</option>
                <option value="user">User</option>
                <option value="store_owner">Store Owner</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Sort By</label>
              <select
                value={`${filters.sortBy}-${filters.sortOrder}`}
                onChange={(e) => {
                  const [sortBy, sortOrder] = e.target.value.split('-');
                  setFilters(prev => ({ ...prev, sortBy, sortOrder }));
                }}
                className="input-field"
              >
                <option value="name-asc">Name A-Z</option>
                <option value="name-desc">Name Z-A</option>
                <option value="email-asc">Email A-Z</option>
                <option value="created_at-desc">Newest First</option>
                <option value="created_at-asc">Oldest First</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Users Table (Admin Only) */}
      {user?.role === 'admin' && (
        <div className="table-container">
          <table className="table">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="table-header">Name</th>
                <th className="table-header">Email</th>
                <th className="table-header">Role</th>
                <th className="table-header">Address</th>
                <th className="table-header">Created</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {users.map((userItem) => (
                <tr key={userItem.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="table-cell font-medium">{userItem.name}</td>
                  <td className="table-cell">
                    <a 
                      href={`mailto:${userItem.email}`}
                      className="text-primary-600 dark:text-primary-400 hover:text-primary-500 hover:underline"
                    >
                      {userItem.email}
                    </a>
                  </td>
                  <td className="table-cell">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      userItem.role === 'admin' 
                        ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                        : userItem.role === 'store_owner'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                        : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                    }`}>
                      {userItem.role === 'store_owner' ? 'Store Owner' : userItem.role}
                    </span>
                  </td>
                  <td className="table-cell text-gray-500 dark:text-gray-400">
                    {userItem.address || 'N/A'}
                  </td>
                  <td className="table-cell text-gray-500 dark:text-gray-400">
                    {new Date(userItem.created_at).toLocaleDateString()}
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditClick(userItem)}
                        className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors duration-200"
                        title="Edit user"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(userItem)}
                        className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
                        title="Delete user"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {users.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No users found matching your criteria.
            </div>
          )}
        </div>
      )}

      {/* Profile Info for Non-Admin Users */}
      {user?.role !== 'admin' && (
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            My Profile
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Name
              </label>
              <p className="text-gray-900 dark:text-gray-100">{user?.name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <p className="text-gray-900 dark:text-gray-100">{user?.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Role
              </label>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                user?.role === 'store_owner'
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                  : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
              }`}>
                {user?.role === 'store_owner' ? 'Store Owner' : user?.role}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Address
              </label>
              <p className="text-gray-900 dark:text-gray-100">{user?.address || 'Not provided'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Create User Modal (Admin Only) */}
      {user?.role === 'admin' && (
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => {
            setIsCreateModalOpen(false);
            resetCreate();
          }}
          title="Create New User"
        >
          <form onSubmit={handleCreateSubmit(createUser)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  {...registerCreate('name', {
                    required: 'Name is required',
                    minLength: { value: 20, message: 'Name must be at least 20 characters' },
                    maxLength: { value: 60, message: 'Name cannot exceed 60 characters' }
                  })}
                  className={`input-field pl-10 ${createErrors.name ? 'border-red-500' : ''}`}
                  placeholder="Enter full name"
                />
              </div>
              {createErrors.name && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {createErrors.name.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  {...registerCreate('email', {
                    required: 'Email is required',
                    pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email format' }
                  })}
                  className={`input-field pl-10 ${createErrors.email ? 'border-red-500' : ''}`}
                  placeholder="Enter email address"
                />
              </div>
              {createErrors.email && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {createErrors.email.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="password"
                  {...registerCreate('password', {
                    required: 'Password is required',
                    minLength: { value: 8, message: 'Password must be at least 8 characters' },
                    pattern: {
                      value: /^(?=.*[A-Z])(?=.*[!@#$%^&*])/,
                      message: 'Password must contain uppercase letter and special character'
                    }
                  })}
                  className={`input-field pl-10 ${createErrors.password ? 'border-red-500' : ''}`}
                  placeholder="Enter password"
                />
              </div>
              {createErrors.password && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {createErrors.password.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Role</label>
              <div className="relative">
                <UsersIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  {...registerCreate('role', { required: 'Role is required' })}
                  className={`input-field pl-10 ${createErrors.role ? 'border-red-500' : ''}`}
                >
                  <option value="">Select role</option>
                  <option value="admin">Admin</option>
                  <option value="user">User</option>
                  <option value="store_owner">Store Owner</option>
                </select>
              </div>
              {createErrors.role && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {createErrors.role.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Address</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <textarea
                  {...registerCreate('address', {
                    maxLength: { value: 400, message: 'Address cannot exceed 400 characters' }
                  })}
                  rows="3"
                  className={`input-field pl-10 resize-none ${createErrors.address ? 'border-red-500' : ''}`}
                  placeholder="Enter address"
                />
              </div>
              {createErrors.address && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {createErrors.address.message}
                </p>
              )}
            </div>

            <div className="flex space-x-4 pt-4">
              <button type="submit" className="btn-primary flex-1">
                Create User
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsCreateModalOpen(false);
                  resetCreate();
                }}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit User Modal (Admin Only) */}
      {user?.role === 'admin' && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setUserToEdit(null);
            resetEdit();
          }}
          title={`Edit User: ${userToEdit?.name}`}
        >
          <form onSubmit={handleEditSubmit(handleEditUser)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  {...registerEdit('name', {
                    minLength: { value: 20, message: 'Name must be at least 20 characters' },
                    maxLength: { value: 60, message: 'Name cannot exceed 60 characters' }
                  })}
                  className={`input-field pl-10 ${editErrors.name ? 'border-red-500' : ''}`}
                  placeholder="Enter full name"
                />
              </div>
              {editErrors.name && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {editErrors.name.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  {...registerEdit('email', {
                    pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email format' }
                  })}
                  className={`input-field pl-10 ${editErrors.email ? 'border-red-500' : ''}`}
                  placeholder="Enter email address"
                />
              </div>
              {editErrors.email && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {editErrors.email.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Role</label>
              <div className="relative">
                <UsersIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  {...registerEdit('role')}
                  className="input-field pl-10"
                >
                  <option value="">Select role</option>
                  <option value="admin">Admin</option>
                  <option value="user">User</option>
                  <option value="store_owner">Store Owner</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Address</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <textarea
                  {...registerEdit('address', {
                    maxLength: { value: 400, message: 'Address cannot exceed 400 characters' }
                  })}
                  rows="3"
                  className={`input-field pl-10 resize-none ${editErrors.address ? 'border-red-500' : ''}`}
                  placeholder="Enter address"
                />
              </div>
              {editErrors.address && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {editErrors.address.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">New Password (Leave blank to keep current)</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="password"
                  {...registerEdit('password', {
                    minLength: { value: 8, message: 'Password must be at least 8 characters' },
                    pattern: {
                      value: /^(?=.*[A-Z])(?=.*[!@#$%^&*])/,
                      message: 'Password must contain uppercase letter and special character'
                    }
                  })}
                  className={`input-field pl-10 ${editErrors.password ? 'border-red-500' : ''}`}
                  placeholder="Enter new password"
                />
              </div>
              {editErrors.password && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {editErrors.password.message}
                </p>
              )}
            </div>

            <div className="flex space-x-4 pt-4">
              <button
                type="submit"
                disabled={isEditing}
                className="btn-primary flex-1"
              >
                {isEditing ? <LoadingSpinner size="sm" /> : 'Update User'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setUserToEdit(null);
                  resetEdit();
                }}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit Profile Modal (All Personal Details Editable Except Role) */}
      <Modal
        isOpen={isProfileModalOpen}
        onClose={() => {
          setIsProfileModalOpen(false);
          setUserToEdit(null);
          resetProfile();
        }}
        title="Edit My Profile"
      >
        <form onSubmit={handleProfileSubmit(handleProfileUpdate)} className="space-y-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 mb-4">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Note:</strong> You can update your personal information below. 
              Your role cannot be changed - contact an administrator if needed.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                {...registerProfile('name', {
                  minLength: { value: 20, message: 'Name must be at least 20 characters' },
                  maxLength: { value: 60, message: 'Name cannot exceed 60 characters' }
                })}
                className={`input-field pl-10 ${profileErrors.name ? 'border-red-500' : ''}`}
                placeholder="Enter full name"
              />
            </div>
            {profileErrors.name && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {profileErrors.name.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="email"
                {...registerProfile('email', {
                  pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email format' }
                })}
                className={`input-field pl-10 ${profileErrors.email ? 'border-red-500' : ''}`}
                placeholder="Enter email address"
              />
            </div>
            {profileErrors.email && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {profileErrors.email.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Address</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <textarea
                {...registerProfile('address', {
                  maxLength: { value: 400, message: 'Address cannot exceed 400 characters' }
                })}
                rows="3"
                className={`input-field pl-10 resize-none ${profileErrors.address ? 'border-red-500' : ''}`}
                placeholder="Enter address"
              />
            </div>
            {profileErrors.address && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {profileErrors.address.message}
              </p>
            )}
          </div>

          {/* Role Display (Read-Only) */}
          <div>
            <label className="block text-sm font-medium mb-2">Role</label>
            <div className="relative">
              <UsersIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={user?.role === 'store_owner' ? 'Store Owner' : user?.role || ''}
                disabled
                className="input-field pl-10 bg-gray-100 dark:bg-gray-700 text-gray-500 cursor-not-allowed"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Role cannot be changed by users
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">New Password (Leave blank to keep current)</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="password"
                {...registerProfile('password', {
                  minLength: { value: 8, message: 'Password must be at least 8 characters' },
                  pattern: {
                    value: /^(?=.*[A-Z])(?=.*[!@#$%^&*])/,
                    message: 'Password must contain uppercase letter and special character'
                  }
                })}
                className={`input-field pl-10 ${profileErrors.password ? 'border-red-500' : ''}`}
                placeholder="Enter new password (optional)"
              />
            </div>
            {profileErrors.password && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {profileErrors.password.message}
              </p>
            )}
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              type="submit"
              disabled={isUpdatingProfile}
              className="btn-primary flex-1"
            >
              {isUpdatingProfile ? <LoadingSpinner size="sm" /> : 'Update Profile'}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsProfileModalOpen(false);
                setUserToEdit(null);
                resetProfile();
              }}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal (Admin Only) */}
      {user?.role === 'admin' && (
        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setUserToDelete(null);
          }}
          onConfirm={handleDeleteConfirm}
          title="Delete User"
          message={`Are you sure you want to delete "${userToDelete?.name}"? This action cannot be undone and will also delete all associated data including ratings and stores (if store owner).`}
          confirmText="Delete User"
          type="danger"
        />
      )}
    </div>
  );
};

export default Users;
