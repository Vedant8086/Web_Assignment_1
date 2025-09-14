import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { User, Mail, MapPin, Lock, Users as UsersIcon } from 'lucide-react';
import Modal from './UI/Modal';
import LoadingSpinner from './UI/LoadingSpinner';

const ProfileModal = ({ isOpen, onClose, user, onUpdate, isUpdating }) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    if (isOpen && user) {
      console.log('🔧 ProfileModal - Setting form values for user:', user);
      reset({
        name: user.name || '',
        email: user.email || '',
        address: user.address || '',
        password: ''
      });
    }
  }, [isOpen, user, reset]);

  const onSubmit = async (data) => {
    console.log('📝 ProfileModal - Form submitted with data:', data);
    
    // Filter out empty fields
    const filteredData = {};
    
    if (data.name && data.name.trim() !== user.name) {
      filteredData.name = data.name.trim();
    }
    
    if (data.email && data.email.trim() !== user.email) {
      filteredData.email = data.email.trim();
    }
    
    if (data.address !== user.address) {
      filteredData.address = data.address || '';
    }
    
    if (data.password && data.password.trim() !== '') {
      filteredData.password = data.password.trim();
    }

    console.log('📝 ProfileModal - Filtered data for update:', filteredData);

    if (Object.keys(filteredData).length === 0) {
      console.log('⚠️ No changes detected');
      return;
    }

    await onUpdate(filteredData);
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit My Profile" size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Info Banner */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>📝 Profile Update:</strong> You can update your personal information below. 
            Your role cannot be changed through this form.
          </p>
        </div>

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
                minLength: { value: 2, message: 'Name must be at least 2 characters' },
                maxLength: { value: 60, message: 'Name cannot exceed 60 characters' }
              })}
              className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              } dark:bg-gray-700 dark:text-gray-100`}
              placeholder="Enter your full name"
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
                  value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                  message: 'Please enter a valid email address' 
                }
              })}
              className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              } dark:bg-gray-700 dark:text-gray-100`}
              placeholder="Enter your email address"
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
                maxLength: { value: 400, message: 'Address cannot exceed 400 characters' }
              })}
              rows={3}
              className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none ${
                errors.address ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              } dark:bg-gray-700 dark:text-gray-100`}
              placeholder="Enter your address"
            />
          </div>
          {errors.address && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.address.message}
            </p>
          )}
        </div>

        {/* Role Display (Read-Only) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Role
          </label>
          <div className="relative">
            <UsersIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={user?.role === 'store_owner' ? 'Store Owner' : (user?.role || '')}
              disabled
              className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed"
            />
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            🔒 Role cannot be changed by users
          </p>
        </div>

        {/* Password Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            New Password (Optional)
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="password"
              {...register('password', {
                minLength: { value: 8, message: 'Password must be at least 8 characters' },
                maxLength: { value: 16, message: 'Password cannot exceed 16 characters' },
                pattern: {
                  value: /^(?=.*[A-Z])(?=.*[!@#$%^&*])/,
                  message: 'Password must contain at least one uppercase letter and one special character'
                }
              })}
              className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                errors.password ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              } dark:bg-gray-700 dark:text-gray-100`}
              placeholder="Leave blank to keep current password"
            />
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4 pt-6">
          <button
            type="submit"
            disabled={isUpdating}
            className="flex-1 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
          >
            {isUpdating ? (
              <>
                <LoadingSpinner size="sm" />
                <span className="ml-2">Updating...</span>
              </>
            ) : (
              'Update Profile'
            )}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 font-medium py-2 px-4 rounded-lg transition-colors duration-200"
          >
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ProfileModal;
