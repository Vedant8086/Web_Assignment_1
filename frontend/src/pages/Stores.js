import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { storeAPI, ratingAPI } from '../utils/api';
import { Search, Star, Plus } from 'lucide-react';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import StarRating from '../components/UI/StarRating';
import Modal from '../components/UI/Modal';
import toast from 'react-hot-toast';

const Stores = () => {
  const { user } = useAuth();
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);
  const [newRating, setNewRating] = useState(0);
  const [filters, setFilters] = useState({
    name: '',
    address: '',
    sortBy: 'name',
    sortOrder: 'asc'
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    loadStores();
  }, [filters]);

  const loadStores = async () => {
    try {
      setLoading(true);
      const response = await storeAPI.getAllStores(filters);
      setStores(response.data);
    } catch (error) {
      console.error('Error loading stores:', error);
      toast.error('Failed to load stores');
    } finally {
      setLoading(false);
    }
  };

  const createStore = async (data) => {
    try {
      await storeAPI.createStore(data);
      toast.success('Store created successfully');
      setIsCreateModalOpen(false);
      reset();
      loadStores();
    } catch (error) {
      console.error('Error creating store:', error);
      toast.error(error.response?.data?.message || 'Failed to create store');
    }
  };

  const submitRating = async () => {
    if (!selectedStore || newRating === 0) {
      toast.error('Please select a rating');
      return;
    }

    try {
      await ratingAPI.submitRating({
        storeId: selectedStore.id,
        rating: newRating
      });
      toast.success('Rating submitted successfully');
      setIsRatingModalOpen(false);
      setSelectedStore(null);
      setNewRating(0);
      loadStores();
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast.error(error.response?.data?.message || 'Failed to submit rating');
    }
  };

  const openRatingModal = (store) => {
    setSelectedStore(store);
    setNewRating(store.user_rating || 0);
    setIsRatingModalOpen(true);
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
          {user?.role === 'admin' ? 'Stores Management' : 'Browse Stores'}
        </h1>
        {user?.role === 'admin' && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="btn-primary"
          >
            <Plus className="h-4 w-4" />
            <span>Add Store</span>
          </button>
        )}
      </div>

      {/* Search Filters */}
      <div className="card p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Store Name</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={filters.name}
                onChange={(e) => handleFilterChange('name', e.target.value)}
                className="input-field pl-10"
                placeholder="Search stores..."
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Address</label>
            <input
              type="text"
              value={filters.address}
              onChange={(e) => handleFilterChange('address', e.target.value)}
              className="input-field"
              placeholder="Search by address..."
            />
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
              <option value="overall_rating-desc">Highest Rated</option>
              <option value="overall_rating-asc">Lowest Rated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stores Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stores.map((store) => (
          <div key={store.id} className="card p-6 card-hover">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {store.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {store.address}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Star className="h-5 w-5 text-yellow-400 fill-current" />
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {parseFloat(store.overall_rating || 0).toFixed(1)}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Overall
                  </span>
                </div>
                
                {user?.role === 'user' && (
                  <div className="text-right">
                    {store.user_rating ? (
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Your rating: <span className="text-yellow-500">★ {store.user_rating}</span>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Not rated
                      </div>
                    )}
                  </div>
                )}
              </div>

              {user?.role === 'user' && (
                <button
                  onClick={() => openRatingModal(store)}
                  className="w-full btn-outline"
                >
                  {store.user_rating ? 'Update Rating' : 'Rate Store'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {stores.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Search className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No stores found
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {user?.role === 'admin' 
              ? 'Try adjusting your search or add a new store.'
              : 'Try adjusting your search criteria.'}
          </p>
        </div>
      )}

      {/* Create Store Modal (Admin only) */}
      {user?.role === 'admin' && (
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Add New Store"
        >
          <form onSubmit={handleSubmit(createStore)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Store Name</label>
              <input
                type="text"
                {...register('name', { required: 'Store name is required' })}
                className="input-field"
                placeholder="Enter store name"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                {...register('email', {
                  required: 'Email is required',
                  pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email format' }
                })}
                className="input-field"
                placeholder="Enter store email"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Address</label>
              <textarea
                {...register('address', {
                  maxLength: { value: 400, message: 'Address cannot exceed 400 characters' }
                })}
                rows="3"
                className="input-field resize-none"
                placeholder="Enter store address"
              />
              {errors.address && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.address.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Owner ID</label>
              <input
                type="number"
                {...register('ownerId', { 
                  required: 'Owner ID is required',
                  min: { value: 1, message: 'Owner ID must be valid' }
                })}
                className="input-field"
                placeholder="Enter store owner ID"
              />
              {errors.ownerId && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.ownerId.message}
                </p>
              )}
            </div>

            <div className="flex space-x-4 pt-4">
              <button type="submit" className="btn-primary flex-1">
                Create Store
              </button>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Rating Modal (Users only) */}
      {user?.role === 'user' && (
        <Modal
          isOpen={isRatingModalOpen}
          onClose={() => setIsRatingModalOpen(false)}
          title={`Rate ${selectedStore?.name}`}
        >
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                How would you rate this store?
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                {selectedStore?.address}
              </p>
              
              <div className="flex justify-center mb-6">
                <StarRating
                  rating={newRating}
                  onRatingChange={setNewRating}
                  size="lg"
                />
              </div>
              
              {newRating > 0 && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  You selected {newRating} star{newRating !== 1 ? 's' : ''}
                </p>
              )}
            </div>

            <div className="flex space-x-4">
              <button
                onClick={submitRating}
                disabled={newRating === 0}
                className="btn-primary flex-1 disabled:opacity-50"
              >
                Submit Rating
              </button>
              <button
                onClick={() => setIsRatingModalOpen(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Stores;
