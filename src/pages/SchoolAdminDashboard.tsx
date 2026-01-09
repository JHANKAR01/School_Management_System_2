import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { LogOut, Users, BookOpen, DollarSign, BarChart3 } from 'lucide-react';
import StudentManager from '../components/StudentManager';
import InvoiceGenerator from '../components/InvoiceGenerator';
import ExamResultsManager from '../components/ExamResultsManager';

const SchoolAdminDashboard: React.FC = () => {
  const { signOut, profile } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const { data: students } = useQuery({
    queryKey: ['students', profile?.school_id],
    queryFn: async () => {
      const { data } = await supabase
        .from('students')
        .select('id')
        .eq('school_id', profile?.school_id)
        .eq('is_active', true);
      return (data || []) as any[];
    },
    enabled: !!profile?.school_id,
  });

  const { data: teachers } = useQuery({
    queryKey: ['teachers', profile?.school_id],
    queryFn: async () => {
      const { data } = await supabase
        .from('teachers')
        .select('id')
        .eq('school_id', profile?.school_id)
        .eq('is_active', true);
      return (data || []) as any[];
    },
    enabled: !!profile?.school_id,
  });

  const { data: pendingInvoices } = useQuery({
    queryKey: ['pendingInvoices', profile?.school_id],
    queryFn: async () => {
      const { data } = await supabase
        .from('invoices')
        .select('id, net_amount')
        .eq('school_id', profile?.school_id)
        .eq('status', 'pending');
      return (data || []) as any[];
    },
    enabled: !!profile?.school_id,
  });

  const { data: verifiedTransactions } = useQuery({
    queryKey: ['verifiedTransactions', profile?.school_id],
    queryFn: async () => {
      const { data } = await supabase
        .from('transactions')
        .select('amount')
        .eq('school_id', profile?.school_id)
        .eq('verification_status', 'verified');
      return (data || []) as any[];
    },
    enabled: !!profile?.school_id,
  });

  const totalPendingFees = pendingInvoices?.reduce((sum, inv) => sum + inv.net_amount, 0) || 0;
  const totalCollections = verifiedTransactions?.reduce((sum, trans) => sum + trans.amount, 0) || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">School Admin</h1>
            <p className="text-sm text-gray-600">School Management System</p>
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Students</p>
                  <p className="text-3xl font-bold text-gray-900">{students?.length || 0}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Staff</p>
                  <p className="text-3xl font-bold text-gray-900">{teachers?.length || 0}</p>
                </div>
                <BookOpen className="h-8 w-8 text-green-600" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Pending Fees</p>
                  <p className="text-3xl font-bold text-gray-900">₹{totalPendingFees.toLocaleString()}</p>
                </div>
                <DollarSign className="h-8 w-8 text-orange-600" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Collections</p>
                  <p className="text-3xl font-bold text-gray-900">₹{totalCollections.toLocaleString()}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <div className="flex gap-4 px-6 py-4">
              <button
                onClick={() => setActiveTab('overview')}
                className={`pb-2 px-4 border-b-2 transition ${
                  activeTab === 'overview'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('students')}
                className={`pb-2 px-4 border-b-2 transition ${
                  activeTab === 'students'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Students
              </button>
              <button
                onClick={() => setActiveTab('staff')}
                className={`pb-2 px-4 border-b-2 transition ${
                  activeTab === 'staff'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Staff
              </button>
              <button
                onClick={() => setActiveTab('fees')}
                className={`pb-2 px-4 border-b-2 transition ${
                  activeTab === 'fees'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Fees
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Welcome to School Admin Dashboard</h3>
                <p className="text-gray-600 mb-6">
                  Manage your school's students, staff, and finances from this dashboard. Use the tabs above to
                  navigate to different sections.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border border-blue-200 bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">Quick Setup</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>✓ Create school configuration</li>
                      <li>✓ Add classes and sections</li>
                      <li>→ Add students and staff</li>
                      <li>→ Configure fee structure</li>
                    </ul>
                  </div>
                  <div className="border border-green-200 bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-900 mb-2">Features</h4>
                    <ul className="text-sm text-green-800 space-y-1">
                      <li>✓ Student & Staff Management</li>
                      <li>✓ Fee Structure & Invoicing</li>
                      <li>✓ Attendance Tracking</li>
                      <li>✓ Exam & Results</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'students' && <StudentManager />}
            {activeTab === 'staff' && (
              <div className="text-gray-600">
                <p>Staff management features coming soon...</p>
              </div>
            )}
            {activeTab === 'fees' && (
              <div className="space-y-8">
                <InvoiceGenerator />
                <ExamResultsManager />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default SchoolAdminDashboard;
