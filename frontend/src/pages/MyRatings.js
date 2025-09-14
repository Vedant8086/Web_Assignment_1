import React, { useState, useEffect } from 'react';
import { ratingAPI } from '../utils/api';
import { Star, Calendar, MapPin, Mail, Trash2, RefreshCw } from 'lucide-react';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import StarRating from '../components/UI/StarRating';
import ConfirmationModal from '../components/UI/ConfirmationModal';
import toast from 'react-hot-toast';

const MyRatings = () => {
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [ratingToDelete, setRatingToDelete] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    loadUserRatings();
  }, []);

  const loadUserRatings = async () => {
    try {
      setLoading(true);
      console.log('📊 Loading user ratings...');
      
      const response = await ratingAPI.getUserRatings();
      console.log('📊 Ratings response:', response.data);
      
      if (response.data.success) {
        setRatings(response.data.ratings || []);
        console.log('✅ Ratings loaded successfully:', response.data.ratings?.length || 0);
      } else {
        console.error('❌ Failed to load ratings:', response.data.message);
        toast.error('Failed to load ratings');
        setRatings([]);
      }
    } catch (error) {
      console.error('❌ Error loading ratings:', error);
      toast.error(error.response?.data?.message || 'Failed to load your ratings');
      setRatings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (rating) => {
    setRatingToDelete(rating);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!ratingToDelete) return;

    try {
      setDeleting(true);
      await ratingAPI.deleteRating(ratingToDelete.id);
      
      toast.success('Rating deleted successfully');
      setIsDeleteModalOpen(false);
      setRatingToDelete(null);
      
      // Reload ratings
      await loadUserRatings();
    } catch (error) {
      console.error('❌ Error deleting rating:', error);
      toast.error(error.response?.data?.message || 'Failed to delete rating');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-gray-600 dark:text-gray-400">Loading your ratings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            My Ratings
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {ratings.length} rating{ratings.length !== 1 ? 's' : ''} submitted
          </p>
        </div>
        
        <button
          onClick={loadUserRatings}
          className="btn-outline"
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Ratings List */}
      {ratings.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 text-gray-300 dark:text-gray-600">
            <Star className="w-full h-full" />
          </div>
          <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2">
            No ratings yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Start rating stores to see your reviews here.
          </p>
          <button
            onClick={() => window.location.href = '/stores'}
            className="btn-primary"
          >
            Browse Stores
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {ratings.map((rating) => (
            <div 
              key={rating.id}
              className="card p-6 hover:shadow-lg transition-shadow duration-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Store Name & Rating */}
                  <div className="flex items-center space-x-3 mb-3">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                      {rating.store_name}
                    </h3>
                    <StarRating 
                      rating={rating.rating} 
                      readOnly={true} 
                      size="md"
                      showValue={true}
                    />
                  </div>

                  {/* Store Details */}
                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    {rating.store_email && (
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4" />
                        <a 
                          href={`mailto:${rating.store_email}`}
                          className="text-primary-600 dark:text-primary-400 hover:underline"
                        >
                          {rating.store_email}
                        </a>
                      </div>
                    )}
                    
                    {rating.store_address && (
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4" />
                        <span>{rating.store_address}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>
                        Rated on {new Date(rating.created_at).toLocaleDateString()}
                        {rating.updated_at !== rating.created_at && (
                          <span className="text-xs ml-1">
                            (Updated {new Date(rating.updated_at).toLocaleDateString()})
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => handleDeleteClick(rating)}
                    className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
                    title="Delete rating"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setRatingToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Rating"
        message={`Are you sure you want to delete your rating for "${ratingToDelete?.store_name}"? This action cannot be undone.`}
        confirmText={deleting ? "Deleting..." : "Delete Rating"}
        type="danger"
        loading={deleting}
      />
    </div>
  );
};

export default MyRatings;
