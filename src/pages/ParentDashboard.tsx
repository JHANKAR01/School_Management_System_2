import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, AlertCircle, DollarSign, CheckCircle } from 'lucide-react';

const ParentDashboard: React.FC = () => {
  const { signOut, profile } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Parent Portal</h1>
            <p className="text-sm text-gray-600">Fee Payment & Academic Updates</p>
          </div>
          <button
            onClick={signOut}
            className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-700 px-4 py-2 rounded-lg transition"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Dashboard</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-lg shadow border-l-4 border-orange-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Pending Fees</p>
                  <p className="text-3xl font-bold text-gray-900">₹0</p>
                </div>
                <AlertCircle className="h-8 w-8 text-orange-600" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Paid Fees</p>
                  <p className="text-3xl font-bold text-gray-900">₹0</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <div className="flex gap-4 px-6 py-4 overflow-x-auto">
              <button
                onClick={() => setActiveTab('overview')}
                className={`pb-2 px-4 border-b-2 whitespace-nowrap transition ${
                  activeTab === 'overview'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('fees')}
                className={`pb-2 px-4 border-b-2 whitespace-nowrap transition ${
                  activeTab === 'fees'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Fees
              </button>
              <button
                onClick={() => setActiveTab('attendance')}
                className={`pb-2 px-4 border-b-2 whitespace-nowrap transition ${
                  activeTab === 'attendance'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Attendance
              </button>
              <button
                onClick={() => setActiveTab('results')}
                className={`pb-2 px-4 border-b-2 whitespace-nowrap transition ${
                  activeTab === 'results'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Results
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <button className="p-4 border border-gray-200 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition text-center">
                      <DollarSign className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                      <p className="text-sm font-medium text-gray-900">Pay Fees</p>
                    </button>
                    <button className="p-4 border border-gray-200 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition text-center">
                      <CheckCircle className="h-6 w-6 mx-auto mb-2 text-green-600" />
                      <p className="text-sm font-medium text-gray-900">View Report Card</p>
                    </button>
                    <button className="p-4 border border-gray-200 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition text-center">
                      <AlertCircle className="h-6 w-6 mx-auto mb-2 text-orange-600" />
                      <p className="text-sm font-medium text-gray-900">Attendance</p>
                    </button>
                    <button className="p-4 border border-gray-200 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition text-center">
                      <AlertCircle className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                      <p className="text-sm font-medium text-gray-900">Notifications</p>
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h3>
                  <p className="text-gray-600">No activities yet</p>
                </div>
              </div>
            )}
            {activeTab === 'fees' && (
              <div className="text-gray-600">
                <p>Fee payment features coming soon...</p>
              </div>
            )}
            {activeTab === 'attendance' && (
              <div className="text-gray-600">
                <p>Attendance tracking features coming soon...</p>
              </div>
            )}
            {activeTab === 'results' && (
              <div className="text-gray-600">
                <p>Report card features coming soon...</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ParentDashboard;
