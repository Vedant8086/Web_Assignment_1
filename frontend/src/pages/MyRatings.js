import React, { useState, useEffect } from 'react';
import { ratingAPI } from '../utils/api';
import { Star, Calendar, MapPin } from 'lucide-react';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import StarRating from '../components/UI/StarRating';
import toast from 'react-hot-toast';

const MyRatings = () => {
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMyRatings();
  }, []);

  const loadMyRatings = async () => {
    try {
      setLoading(true);
      const response = await ratingAPI.getMyRatings();
      setRatings(response.data);
    } catch (error) {
      console.error('Error loading ratings:', error);
      toast.error('Failed to load your ratings');
    } finally {
      setLoading(false);
    }
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
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          My Ratings
        </h1>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {ratings.length} rating{ratings.length !== 1 ? 's' : ''}
        </div>
      </div>

      {ratings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ratings.map((rating) => (
            <div key={rating.id} className="card p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {rating.store_name}
                  </h3>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                    <MapPin className="h-4 w-4 mr-1" />
                    {rating.store_address}
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <StarRating rating={rating.rating} readOnly size="md" />
                  <span className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    {rating.rating}/5
                  </span>
                </div>

                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <Calendar className="h-4 w-4 mr-1" />
                  Rated on {new Date(rating.updated_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Star className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No ratings yet
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Start rating stores to see your reviews here.
          </p>
          <button
            onClick={() => window.location.href = '/stores'}
            className="btn-primary"
          >
            Browse Stores
          </button>
        </div>
      )}
    </div>
  );
};

export default MyRatings;
