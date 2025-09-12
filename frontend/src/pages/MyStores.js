import React, { useState, useEffect } from 'react';
import { storeAPI } from '../utils/api';
import { Star, Users, Eye, Store, MapPin, Calendar, Plus } from 'lucide-react';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import Modal from '../components/UI/Modal';
import AddStoreForm from '../components/AddStoreForm';
import toast from 'react-hot-toast';

const MyStores = () => {
  const [stores, setStores] = useState([]);
  const [selectedStoreRatings, setSelectedStoreRatings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ratingsLoading, setRatingsLoading] = useState(false);
  const [isRatingsModalOpen, setIsRatingsModalOpen] = useState(false);
  const [isAddStoreModalOpen, setIsAddStoreModalOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);

  useEffect(() => {
    loadMyStores();
  }, []);

  const loadMyStores = async () => {
    try {
      setLoading(true);
      const response = await storeAPI.getMyStores();
      setStores(response.data);
    } catch (error) {
      console.error('Error loading stores:', error);
      toast.error('Failed to load your stores');
    } finally {
      setLoading(false);
    }
  };

  const loadStoreRatings = async (storeId) => {
    try {
      setRatingsLoading(true);
      const response = await storeAPI.getStoreRatings(storeId);
      setSelectedStoreRatings(response.data);
    } catch (error) {
      console.error('Error loading store ratings:', error);
      toast.error('Failed to load store ratings');
      setSelectedStoreRatings(null);
    } finally {
      setRatingsLoading(false);
    }
  };

  const viewRatings = async (store) => {
    setSelectedStore(store);
    setSelectedStoreRatings(null);
    setIsRatingsModalOpen(true);
    await loadStoreRatings(store.id);
  };

  const closeRatingsModal = () => {
    setIsRatingsModalOpen(false);
    setSelectedStore(null);
    setSelectedStoreRatings(null);
  };

  const handleStoreAdded = () => {
    loadMyStores(); // Refresh stores list
  };

  const calculateOverallStats = () => {
    const totalRatings = stores.reduce((sum, store) => sum + parseInt(store.total_ratings || 0), 0);
    const avgRating = stores.length > 0 
      ? stores.reduce((sum, store) => sum + parseFloat(store.average_rating || 0), 0) / stores.length 
      : 0;
    
    return { totalRatings, avgRating };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const { totalRatings, avgRating } = calculateOverallStats();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            My Stores
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Manage and monitor your store performance
          </p>
        </div>
        <button
          onClick={() => setIsAddStoreModalOpen(true)}
          className="btn-primary"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Store</span>
        </button>
      </div>

      {/* Overview Stats */}
      {stores.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Store className="h-8 w-8 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Total Stores
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {stores.length}
                </p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Star className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Average Rating
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {avgRating.toFixed(1)}
                </p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Total Reviews
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {totalRatings}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stores List */}
      {stores.length > 0 ? (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Store Details
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {stores.map((store) => (
              <div key={store.id} className="card p-6 hover:shadow-xl transition-all duration-300">
                <div className="space-y-4">
                  {/* Store Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                        {store.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {store.email}
                      </p>
                      <div className="flex items-center text-gray-500 dark:text-gray-400 mt-1">
                        <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                        <p className="text-sm">{store.address || 'No address provided'}</p>
                      </div>
                      <div className="flex items-center text-gray-500 dark:text-gray-400 mt-1">
                        <Calendar className="h-4 w-4 mr-1 flex-shrink-0" />
                        <p className="text-sm">
                          Since {new Date(store.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                      <div className="flex items-center justify-center mb-2">
                        <Star className="h-6 w-6 text-yellow-500 fill-current" />
                      </div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {parseFloat(store.average_rating || 0).toFixed(1)}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Average Rating
                      </div>
                      <div className="flex justify-center mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${
                              i < Math.round(parseFloat(store.average_rating || 0))
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300 dark:text-gray-600'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center justify-center mb-2">
                        <Users className="h-6 w-6 text-blue-500" />
                      </div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {store.total_ratings}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Total Reviews
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => viewRatings(store)}
                    className="w-full btn-outline"
                    disabled={store.total_ratings === 0}
                  >
                    <Eye className="h-4 w-4" />
                    <span>
                      {store.total_ratings === 0 ? 'No Reviews Yet' : 'View All Reviews'}
                    </span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Store className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No stores created yet
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Create your first store to start receiving ratings from customers.
          </p>
          <button
            onClick={() => setIsAddStoreModalOpen(true)}
            className="btn-primary"
          >
            <Plus className="h-4 w-4" />
            <span>Add Your First Store</span>
          </button>
        </div>
      )}

      {/* Add Store Modal */}
      <AddStoreForm
        isOpen={isAddStoreModalOpen}
        onClose={() => setIsAddStoreModalOpen(false)}
        onStoreAdded={handleStoreAdded}
      />

      {/* Store Ratings Modal */}
      <Modal
        isOpen={isRatingsModalOpen}
        onClose={closeRatingsModal}
        title={`Reviews for ${selectedStore?.name}`}
        size="lg"
      >
        <div className="space-y-4">
          {/* Store Info Header */}
          {selectedStore && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-gray-900 dark:text-gray-100">
                {selectedStore.name}
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {selectedStore.address}
              </p>
              {selectedStoreRatings && (
                <div className="flex items-center mt-2 space-x-4">
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium">
                      {selectedStoreRatings.summary.averageRating} average
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedStoreRatings.summary.totalRatings} total reviews
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Ratings List */}
          {ratingsLoading ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner size="md" />
            </div>
          ) : selectedStoreRatings && selectedStoreRatings.ratings.length > 0 ? (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {selectedStoreRatings.ratings.map((rating, index) => (
                <div
                  key={index}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {rating.user_name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {rating.user_email}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-2 mb-1">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < rating.rating
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300 dark:text-gray-600'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {rating.rating}/5
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>Rated on {new Date(rating.created_at).toLocaleDateString()}</span>
                    {rating.updated_at !== rating.created_at && (
                      <span>Updated on {new Date(rating.updated_at).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : selectedStoreRatings ? (
            <div className="text-center py-8">
              <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 mb-2">
                No reviews yet for this store
              </p>
              <p className="text-sm text-gray-400">
                Encourage customers to leave their first review!
              </p>
            </div>
          ) : null}

          {/* Modal Footer */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-6">
            <button
              onClick={closeRatingsModal}
              className="w-full btn-secondary"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MyStores;
