import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, User, Mail, MapPin, Users, Lock } from 'lucide-react';
import LoadingSpinner from './UI/LoadingSpinner';

const EditUserModal = ({ isOpen, onClose, user, onUserUpdated, isProfile = false }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      address: user?.address || '',
      role: user?.role || '',
    }
  });

  useEffect(() => {
    if (user && isOpen) {
      reset({
        name: user.name || '',
        email: user.email || '',
        address: user.address || '',
        role: user.role || '',
      });
    }
  }, [user, isOpen, reset]);

  const onSubmit = async (data) => {
    try {
      // Filter out empty values
      const filteredData = Object.fromEntries(
        Object.entries(data).filter(([_, value]) => value && value.trim() !== '')
      );

      await onUserUpdated(filteredData);
      reset();
      onClose();
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              {isProfile ? 'Edit Profile' : `Edit User: ${user.name}`}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
            {/* Name Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  {...register('name', {
                    minLength: {
                      value: 20,
                      message: 'Name must be at least 20 characters',
                    },
                    maxLength: {
                      value: 60,
                      message: 'Name cannot exceed 60 characters',
                    },
                  })}
                  className={`input-field pl-10 ${
                    errors.name ? 'border-red-500 focus:ring-red-500' : ''
                  }`}
                  placeholder="Enter full name"
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  {...register('email', {
                    pattern: {
                      value: /\S+@\S+\.\S+/,
                      message: 'Please enter a valid email address',
                    },
                  })}
                  className={`input-field pl-10 ${
                    errors.email ? 'border-red-500 focus:ring-red-500' : ''
                  }`}
                  placeholder="Enter email address"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Address Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Address
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <textarea
                  {...register('address', {
                    maxLength: {
                      value: 400,
                      message: 'Address cannot exceed 400 characters',
                    },
                  })}
                  rows="3"
                  className={`input-field pl-10 resize-none ${
                    errors.address ? 'border-red-500 focus:ring-red-500' : ''
                  }`}
                  placeholder="Enter address"
                />
              </div>
              {errors.address && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.address.message}
                </p>
              )}
            </div>

            {/* Role Field (Admin only) */}
            {!isProfile && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Role
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <select
                    {...register('role')}
                    className="input-field pl-10"
                  >
                    <option value="">Select role</option>
                    <option value="admin">Admin</option>
                    <option value="user">User</option>
                    <option value="store_owner">Store Owner</option>
                  </select>
                </div>
              </div>
            )}

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                New Password (Leave blank to keep current)
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="password"
                  {...register('password', {
                    minLength: {
                      value: 8,
                      message: 'Password must be at least 8 characters',
                    },
                    maxLength: {
                      value: 16,
                      message: 'Password cannot exceed 16 characters',
                    },
                    pattern: {
                      value: /^(?=.*[A-Z])(?=.*[!@#$%^&*])/,
                      message: 'Password must contain at least one uppercase letter and one special character',
                    },
                  })}
                  className={`input-field pl-10 ${
                    errors.password ? 'border-red-500 focus:ring-red-500' : ''
                  }`}
                  placeholder="Enter new password"
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary flex-1"
              >
                {isSubmitting ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  'Update User'
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditUserModal;
