import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { Lock, User, Save } from 'lucide-react';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import toast from 'react-hot-toast';

const Settings = () => {
  const { user, updatePassword } = useAuth();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm();

  const newPassword = watch('newPassword');

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const result = await updatePassword(data.currentPassword, data.newPassword);
      if (result.success) {
        toast.success('Password updated successfully');
        reset();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
        Settings
      </h1>

      {/* User Profile */}
      <div className="card p-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="bg-primary-100 dark:bg-primary-900 p-3 rounded-full">
            <User className="h-8 w-8 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Profile Information
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              Your account details
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Full Name
            </label>
            <div className="input-field bg-gray-50 dark:bg-gray-700 cursor-not-allowed">
              {user?.name}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email Address
            </label>
            <div className="input-field bg-gray-50 dark:bg-gray-700 cursor-not-allowed">
              {user?.email}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Role
            </label>
            <div className="input-field bg-gray-50 dark:bg-gray-700 cursor-not-allowed">
              {user?.role === 'store_owner' ? 'Store Owner' : 
               user?.role === 'admin' ? 'Administrator' : 'User'}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Address
            </label>
            <div className="input-field bg-gray-50 dark:bg-gray-700 cursor-not-allowed">
              {user?.address || 'No address provided'}
            </div>
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div className="card p-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="bg-orange-100 dark:bg-orange-900 p-3 rounded-full">
            <Lock className="h-8 w-8 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Change Password
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              Update your account password
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Current Password
            </label>
            <input
              type="password"
              {...register('currentPassword', {
                required: 'Current password is required',
              })}
              className={`input-field ${
                errors.currentPassword ? 'border-red-500 focus:ring-red-500' : ''
              }`}
              placeholder="Enter your current password"
            />
            {errors.currentPassword && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.currentPassword.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              New Password
            </label>
            <input
              type="password"
              {...register('newPassword', {
                required: 'New password is required',
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
              className={`input-field ${
                errors.newPassword ? 'border-red-500 focus:ring-red-500' : ''
              }`}
              placeholder="Enter your new password"
            />
            {errors.newPassword && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.newPassword.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Confirm New Password
            </label>
            <input
              type="password"
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (value) =>
                  value === newPassword || 'Passwords do not match',
              })}
              className={`input-field ${
                errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : ''
              }`}
              placeholder="Confirm your new password"
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
            >
              {loading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Update Password</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;
