import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, Store, Mail, MapPin, User } from 'lucide-react';
import LoadingSpinner from './UI/LoadingSpinner';

const EditStoreModal = ({ isOpen, onClose, store, onStoreUpdated, isOwner = false }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: store?.name || '',
      email: store?.email || '',
      address: store?.address || '',
      owner_id: store?.owner_id || '',
    }
  });

  useEffect(() => {
    if (store && isOpen) {
      reset({
        name: store.name || '',
        email: store.email || '',
        address: store.address || '',
        owner_id: store.owner_id || '',
      });
    }
  }, [store, isOpen, reset]);

  const onSubmit = async (data) => {
    try {
      // Filter out empty values
      const filteredData = Object.fromEntries(
        Object.entries(data).filter(([_, value]) => value && value.toString().trim() !== '')
      );

      // Remove owner_id if user is store owner (they can't change it)
      if (isOwner) {
        delete filteredData.owner_id;
      }

      await onStoreUpdated(filteredData);
      reset();
      onClose();
    } catch (error) {
      console.error('Error updating store:', error);
    }
  };

  if (!isOpen || !store) return null;

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
              Edit Store: {store.name}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Store Details Display */}
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
              Current Store Details:
            </h4>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center">
                <Store className="h-4 w-4 mr-2" />
                <span><strong>Name:</strong> {store.name}</span>
              </div>
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-2" />
                <span><strong>Email:</strong> {store.email}</span>
              </div>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2" />
                <span><strong>Address:</strong> {store.address || 'Not specified'}</span>
              </div>
              {!isOwner && (
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  <span><strong>Owner ID:</strong> {store.owner_id}</span>
                </div>
              )}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
            {/* Store Name Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Store Name
              </label>
              <div className="relative">
                <Store className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  {...register('name')}
                  className={`input-field pl-10 ${
                    errors.name ? 'border-red-500 focus:ring-red-500' : ''
                  }`}
                  placeholder="Enter store name"
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
                Store Email
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
                  placeholder="Enter store email"
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
                Store Address
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
                  placeholder="Enter store address"
                />
              </div>
              {errors.address && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.address.message}
                </p>
              )}
            </div>

            {/* Owner ID Field (Admin only) */}
            {!isOwner && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Owner ID
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    {...register('owner_id', {
                      min: {
                        value: 1,
                        message: 'Owner ID must be a positive number',
                      },
                    })}
                    className={`input-field pl-10 ${
                      errors.owner_id ? 'border-red-500 focus:ring-red-500' : ''
                    }`}
                    placeholder="Enter owner user ID"
                  />
                </div>
                {errors.owner_id && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.owner_id.message}
                  </p>
                )}
              </div>
            )}

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
                  'Update Store'
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

export default EditStoreModal;
