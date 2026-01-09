import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Plus, LogOut, Building2, Users, DollarSign, TrendingUp } from 'lucide-react';

interface School {
  id: string;
  name: string;
  slug: string;
  subscription_status: string;
  is_active: boolean;
  created_at: string;
}

const SuperAdminDashboard: React.FC = () => {
  const { signOut, profile } = useAuth();
  const [showCreateSchool, setShowCreateSchool] = useState(false);
  const [newSchool, setNewSchool] = useState({
    name: '',
    slug: '',
  });

  const { data: schools, isLoading } = useQuery({
    queryKey: ['schools'],
    queryFn: async () => {
      const { data } = await supabase.from('schools').select('*').order('created_at', { ascending: false });
      return (data || []) as School[];
    },
  });

  const createSchoolMutation = useMutation({
    mutationFn: async (schoolData: typeof newSchool) => {
      const { data, error } = await supabase
        .from('schools')
        .insert([
          {
            name: schoolData.name,
            slug: schoolData.slug,
            subscription_status: 'trial',
            is_active: true,
          },
        ])
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      setNewSchool({ name: '', slug: '' });
      setShowCreateSchool(false);
    },
  });

  const handleCreateSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    await createSchoolMutation.mutateAsync(newSchool);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Project Sovereign</h1>
            <p className="text-sm text-gray-600">Super Admin Panel</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-700">{profile?.first_name} {profile?.last_name}</span>
            <button
              onClick={signOut}
              className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-700 px-4 py-2 rounded-lg transition"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Dashboard</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Schools</p>
                  <p className="text-3xl font-bold text-gray-900">{schools?.length || 0}</p>
                </div>
                <Building2 className="h-8 w-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Active Schools</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {schools?.filter((s) => s.is_active).length || 0}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Users</p>
                  <p className="text-3xl font-bold text-gray-900">-</p>
                </div>
                <Users className="h-8 w-8 text-purple-600" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Revenue</p>
                  <p className="text-3xl font-bold text-gray-900">-</p>
                </div>
                <DollarSign className="h-8 w-8 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Schools</h3>
            <button
              onClick={() => setShowCreateSchool(!showCreateSchool)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
            >
              <Plus className="h-4 w-4" />
              Create School
            </button>
          </div>

          {showCreateSchool && (
            <div className="border-b border-gray-200 px-6 py-4 bg-gray-50">
              <form onSubmit={handleCreateSchool} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">School Name</label>
                    <input
                      type="text"
                      value={newSchool.name}
                      onChange={(e) => setNewSchool({ ...newSchool, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">School Slug</label>
                    <input
                      type="text"
                      value={newSchool.slug}
                      onChange={(e) => setNewSchool({ ...newSchool, slug: e.target.value.toLowerCase() })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={createSchoolMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition disabled:opacity-50"
                  >
                    {createSchoolMutation.isPending ? 'Creating...' : 'Create School'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateSchool(false)}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-t border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">School Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Slug</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Subscription</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                      Loading...
                    </td>
                  </tr>
                ) : schools && schools.length > 0 ? (
                  schools.map((school) => (
                    <tr key={school.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{school.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{school.slug}</td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                            school.is_active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {school.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 capitalize">{school.subscription_status}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(school.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                      No schools created yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SuperAdminDashboard;
