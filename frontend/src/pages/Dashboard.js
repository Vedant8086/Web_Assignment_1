import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI, storeAPI } from '../utils/api';
import { Users, Store, Star, TrendingUp } from 'lucide-react';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [user?.role]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      if (user?.role === 'admin') {
        const response = await userAPI.getDashboardStats();
        setStats(response.data);
      } else if (user?.role === 'store_owner') {
        const response = await storeAPI.getMyStores();
        setStores(response.data);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
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

  const renderAdminDashboard = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Admin Dashboard
        </h1>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Welcome back, {user?.name}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Total Users
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {stats?.totalUsers || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Store className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Total Stores
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {stats?.totalStores || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Star className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Total Ratings
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {stats?.totalRatings || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => window.location.href = '/users'}
            className="btn-primary justify-start p-4 h-auto"
          >
            <Users className="h-5 w-5 mr-3" />
            <div className="text-left">
              <div className="font-medium">Manage Users</div>
              <div className="text-sm opacity-90">Add, edit, and view users</div>
            </div>
          </button>
          <button
            onClick={() => window.location.href = '/stores'}
            className="btn-secondary justify-start p-4 h-auto"
          >
            <Store className="h-5 w-5 mr-3" />
            <div className="text-left">
              <div className="font-medium">Manage Stores</div>
              <div className="text-sm opacity-90">Add, edit, and view stores</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );

  const renderStoreOwnerDashboard = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Store Owner Dashboard
        </h1>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Welcome back, {user?.name}
        </div>
      </div>

      {/* Store Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <div className="flex items-center">
            <Store className="h-8 w-8 text-primary-600 mr-4" />
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                My Stores
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {stores.length}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <Star className="h-8 w-8 text-yellow-600 mr-4" />
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Average Rating
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {stores.length > 0
                  ? (stores.reduce((acc, store) => acc + parseFloat(store.average_rating || 0), 0) / stores.length).toFixed(1)
                  : '0.0'}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-green-600 mr-4" />
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Total Reviews
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {stores.reduce((acc, store) => acc + parseInt(store.total_ratings || 0), 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* My Stores */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
          My Stores
        </h2>
        {stores.length > 0 ? (
          <div className="space-y-4">
            {stores.map((store) => (
              <div
                key={store.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">
                      {store.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {store.address}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-2">
                      <Star className="h-5 w-5 text-yellow-400 fill-current" />
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {parseFloat(store.average_rating || 0).toFixed(1)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {store.total_ratings} reviews
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No stores found. Contact admin to add your store.
          </div>
        )}
      </div>
    </div>
  );

  const renderUserDashboard = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Welcome to StoreRating
        </h1>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Hello, {user?.name}
        </div>
      </div>

      <div className="card p-8 text-center">
        <Store className="h-16 w-16 text-primary-600 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Ready to Rate Stores?
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Browse stores and share your experience with ratings from 1 to 5 stars.
        </p>
        <button
          onClick={() => window.location.href = '/stores'}
          className="btn-primary"
        >
          Browse Stores
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto">
      {user?.role === 'admin' && renderAdminDashboard()}
      {user?.role === 'store_owner' && renderStoreOwnerDashboard()}
      {user?.role === 'user' && renderUserDashboard()}
    </div>
  );
};

export default Dashboard;
