import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { storeAPI, ratingAPI, adminAPI } from '../utils/api';
import { Search, Star, Plus, Mail, Edit, Trash2, User, MapPin, Store } from 'lucide-react';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import StarRating from '../components/UI/StarRating';
import Modal from '../components/UI/Modal';
import ConfirmationModal from '../components/UI/ConfirmationModal';
import toast from 'react-hot-toast';

const Stores = () => {
  const { user } = useAuth();
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);
  const [storeToEdit, setStoreToEdit] = useState(null);
  const [storeToDelete, setStoreToDelete] = useState(null);
  const [newRating, setNewRating] = useState(0);
  const [filters, setFilters] = useState({
    name: '',
    email: '',
    address: '',
    sortBy: 'name',
    sortOrder: 'asc'
  });

  const { register: registerCreate, handleSubmit: handleCreateSubmit, reset: resetCreate, formState: { errors: createErrors, isSubmitting: isCreating } } = useForm();
  const { register: registerEdit, handleSubmit: handleEditSubmit, reset: resetEdit, formState: { errors: editErrors, isSubmitting: isEditing } } = useForm();

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
      resetCreate();
      loadStores();
    } catch (error) {
      console.error('Error creating store:', error);
      toast.error(error.response?.data?.message || 'Failed to create store');
    }
  };

  const handleEditStore = (store) => {
    setStoreToEdit(store);
    resetEdit({
      name: store.name || '',
      email: store.email || '',
      address: store.address || '',
      owner_id: store.owner_id || '',
    });
    setIsEditModalOpen(true);
  };

  const handleStoreUpdate = async (data) => {
    try {
      // Filter out empty values
      const filteredData = Object.fromEntries(
        Object.entries(data).filter(([_, value]) => value && value.toString().trim() !== '')
      );

      await adminAPI.updateStore(storeToEdit.id, filteredData);
      toast.success(`Store "${storeToEdit.name}" updated successfully`);
      setIsEditModalOpen(false);
      setStoreToEdit(null);
      resetEdit();
      loadStores();
    } catch (error) {
      console.error('Error updating store:', error);
      toast.error(error.response?.data?.message || 'Failed to update store');
    }
  };

  const handleDeleteClick = (store) => {
    setStoreToDelete(store);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!storeToDelete) return;

    try {
      await adminAPI.deleteStore(storeToDelete.id);
      toast.success(`Store "${storeToDelete.name}" deleted successfully`);
      setIsDeleteModalOpen(false);
      setStoreToDelete(null);
      loadStores();
    } catch (error) {
      console.error('Error deleting store:', error);
      toast.error(error.response?.data?.message || 'Failed to delete store');
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

  // Admin Table View
  if (user?.role === 'admin') {
    return (
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Stores Management
          </h1>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="btn-primary"
          >
            <Plus className="h-4 w-4" />
            <span>Add Store</span>
          </button>
        </div>

        {/* Search Filters */}
        <div className="card p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              <label className="block text-sm font-medium mb-2">Store Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={filters.email}
                  onChange={(e) => handleFilterChange('email', e.target.value)}
                  className="input-field pl-10"
                  placeholder="Search by email..."
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
                <option value="email-asc">Email A-Z</option>
                <option value="email-desc">Email Z-A</option>
                <option value="overall_rating-desc">Highest Rated</option>
                <option value="overall_rating-asc">Lowest Rated</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stores Table */}
        <div className="table-container">
          <table className="table">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="table-header">Store Name</th>
                <th className="table-header">Email</th>
                <th className="table-header">Address</th>
                <th className="table-header">Rating</th>
                <th className="table-header">Created</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {stores.map((store) => (
                <tr key={store.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="table-cell">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {store.name}
                      </div>
                    </div>
                  </td>

                  <td className="table-cell">
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 text-gray-400 mr-2" />
                      <a 
                        href={`mailto:${store.email}`}
                        className="text-primary-600 dark:text-primary-400 hover:text-primary-500 hover:underline"
                      >
                        {store.email}
                      </a>
                    </div>
                  </td>

                  <td className="table-cell">
                    <div className="text-gray-500 dark:text-gray-400">
                      {store.address || 'No address provided'}
                    </div>
                  </td>

                  <td className="table-cell">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                      <span className="font-medium">
                        {parseFloat(store.overall_rating || 0).toFixed(1)}
                      </span>
                    </div>
                  </td>

                  <td className="table-cell">
                    <div className="text-gray-500 dark:text-gray-400">
                      {new Date(store.created_at).toLocaleDateString()}
                    </div>
                  </td>

                  <td className="table-cell">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditStore(store)}
                        className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors duration-200"
                        title="Edit store"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(store)}
                        className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
                        title="Delete store"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {stores.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Search className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                No stores found
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Try adjusting your search or add a new store.
              </p>
            </div>
          )}
        </div>

        {/* Create Store Modal */}
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => {
            setIsCreateModalOpen(false);
            resetCreate();
          }}
          title="Add New Store"
        >
          <form onSubmit={handleCreateSubmit(createStore)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Store Name</label>
              <div className="relative">
                <Store className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  {...registerCreate('name', { required: 'Store name is required' })}
                  className={`input-field pl-10 ${createErrors.name ? 'border-red-500' : ''}`}
                  placeholder="Enter store name"
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
                  placeholder="Enter store email"
                />
              </div>
              {createErrors.email && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {createErrors.email.message}
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
                  placeholder="Enter store address"
                />
              </div>
              {createErrors.address && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {createErrors.address.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Owner ID</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="number"
                  {...registerCreate('ownerId', { 
                    required: 'Owner ID is required',
                    min: { value: 1, message: 'Owner ID must be valid' }
                  })}
                  className={`input-field pl-10 ${createErrors.ownerId ? 'border-red-500' : ''}`}
                  placeholder="Enter store owner ID"
                />
              </div>
              {createErrors.ownerId && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {createErrors.ownerId.message}
                </p>
              )}
            </div>

            <div className="flex space-x-4 pt-4">
              <button
                type="submit"
                disabled={isCreating}
                className="btn-primary flex-1"
              >
                {isCreating ? <LoadingSpinner size="sm" /> : 'Create Store'}
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

        {/* Edit Store Modal */}
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setStoreToEdit(null);
            resetEdit();
          }}
          title={`Edit Store: ${storeToEdit?.name}`}
        >
          {storeToEdit && (
            <div className="space-y-4">
              {/* Current Store Details */}
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Current Store Details:
                </h4>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center">
                    <Store className="h-4 w-4 mr-2" />
                    <span><strong>Name:</strong> {storeToEdit.name}</span>
                  </div>
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2" />
                    <span><strong>Email:</strong> {storeToEdit.email}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span><strong>Address:</strong> {storeToEdit.address || 'Not specified'}</span>
                  </div>
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    <span><strong>Owner ID:</strong> {storeToEdit.owner_id}</span>
                  </div>
                </div>
              </div>

              <form onSubmit={handleEditSubmit(handleStoreUpdate)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Store Name</label>
                  <div className="relative">
                    <Store className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      {...registerEdit('name')}
                      className={`input-field pl-10 ${editErrors.name ? 'border-red-500' : ''}`}
                      placeholder="Enter store name"
                    />
                  </div>
                  {editErrors.name && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {editErrors.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Store Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      {...registerEdit('email', {
                        pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email format' }
                      })}
                      className={`input-field pl-10 ${editErrors.email ? 'border-red-500' : ''}`}
                      placeholder="Enter store email"
                    />
                  </div>
                  {editErrors.email && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {editErrors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Store Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <textarea
                      {...registerEdit('address', {
                        maxLength: { value: 400, message: 'Address cannot exceed 400 characters' }
                      })}
                      rows="3"
                      className={`input-field pl-10 resize-none ${editErrors.address ? 'border-red-500' : ''}`}
                      placeholder="Enter store address"
                    />
                  </div>
                  {editErrors.address && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {editErrors.address.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Owner ID</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="number"
                      {...registerEdit('owner_id', {
                        min: { value: 1, message: 'Owner ID must be a positive number' }
                      })}
                      className={`input-field pl-10 ${editErrors.owner_id ? 'border-red-500' : ''}`}
                      placeholder="Enter owner user ID"
                    />
                  </div>
                  {editErrors.owner_id && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {editErrors.owner_id.message}
                    </p>
                  )}
                </div>

                <div className="flex space-x-4 pt-4">
                  <button
                    type="submit"
                    disabled={isEditing}
                    className="btn-primary flex-1"
                  >
                    {isEditing ? <LoadingSpinner size="sm" /> : 'Update Store'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditModalOpen(false);
                      setStoreToEdit(null);
                      resetEdit();
                    }}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </Modal>

        {/* Delete Confirmation Modal */}
        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setStoreToDelete(null);
          }}
          onConfirm={handleDeleteConfirm}
          title="Delete Store"
          message={`Are you sure you want to delete "${storeToDelete?.name}"? This action cannot be undone and will also delete all associated ratings.`}
          confirmText="Delete Store"
          type="danger"
        />
      </div>
    );
  }

  // User Grid View
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Browse Stores
        </h1>
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
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mt-1">
                  <Mail className="h-4 w-4 mr-1" />
                  <a 
                    href={`mailto:${store.email}`}
                    className="text-primary-600 dark:text-primary-400 hover:text-primary-500 hover:underline"
                  >
                    {store.email}
                  </a>
                </div>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                  <MapPin className="h-4 w-4 mr-1" />
                  <p>{store.address}</p>
                </div>
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
            Try adjusting your search criteria.
          </p>
        </div>
      )}

      {/* Rating Modal (Users only) */}
      {user?.role === 'user' && (
        <Modal
          isOpen={isRatingModalOpen}
          onClose={() => {
            setIsRatingModalOpen(false);
            setSelectedStore(null);
            setNewRating(0);
          }}
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
                onClick={() => {
                  setIsRatingModalOpen(false);
                  setSelectedStore(null);
                  setNewRating(0);
                }}
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
