import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Trash2, Edit2 } from 'lucide-react';

interface StudentData {
  id: string;
  first_name: string;
  last_name: string;
  roll_number: string;
  admission_number: string;
  class_section_id: string;
  father_name: string;
  father_phone: string;
  mother_name: string;
  mother_phone: string;
}

interface StudentManagerProps {
  classSectionId?: string;
}

const StudentManager: React.FC<StudentManagerProps> = ({ classSectionId }) => {
  const { profile } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    rollNumber: '',
    admissionNumber: '',
    fatherName: '',
    fatherPhone: '',
    motherName: '',
    motherPhone: '',
  });

  const { data: students, isLoading, refetch } = useQuery({
    queryKey: ['students', profile?.school_id, classSectionId],
    queryFn: async () => {
      let query = supabase
        .from('students')
        .select('*, users(first_name, last_name), class_sections(name)')
        .eq('school_id', profile?.school_id)
        .eq('is_active', true);

      if (classSectionId) {
        query = query.eq('class_section_id', classSectionId);
      }

      const { data } = await query.order('roll_number');
      return (data || []) as any[];
    },
    enabled: !!profile?.school_id,
  });

  const createStudentMutation = useMutation({
    mutationFn: async () => {
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: `${formData.fatherPhone}@student.local`,
        password: 'defaultpass123',
      });

      if (signUpError) throw signUpError;

      if (authData.user) {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .insert([
            {
              id: authData.user.id,
              school_id: profile?.school_id,
              phone: formData.fatherPhone,
              first_name: formData.firstName,
              last_name: formData.lastName,
              role: 'student',
              is_active: true,
            },
          ])
          .select();

        if (userError) throw userError;

        if (userData && userData[0]) {
          const { error: studentError } = await supabase.from('students').insert([
            {
              user_id: userData[0].id,
              school_id: profile?.school_id,
              roll_number: formData.rollNumber,
              admission_number: formData.admissionNumber,
              father_name: formData.fatherName,
              father_phone: formData.fatherPhone,
              mother_name: formData.motherName,
              mother_phone: formData.motherPhone,
              class_section_id: classSectionId,
              admission_date: new Date().toISOString().split('T')[0],
            },
          ]);

          if (studentError) throw studentError;
        }
      }
    },
    onSuccess: () => {
      setFormData({
        firstName: '',
        lastName: '',
        rollNumber: '',
        admissionNumber: '',
        fatherName: '',
        fatherPhone: '',
        motherName: '',
        motherPhone: '',
      });
      setShowForm(false);
      refetch();
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createStudentMutation.mutateAsync();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Students</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
        >
          <Plus className="h-4 w-4" />
          Add Student
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="First Name"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="text"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="text"
              placeholder="Roll Number"
              value={formData.rollNumber}
              onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="text"
              placeholder="Admission Number"
              value={formData.admissionNumber}
              onChange={(e) => setFormData({ ...formData, admissionNumber: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="text"
              placeholder="Father's Name"
              value={formData.fatherName}
              onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="tel"
              placeholder="Father's Phone"
              value={formData.fatherPhone}
              onChange={(e) => setFormData({ ...formData, fatherPhone: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="text"
              placeholder="Mother's Name"
              value={formData.motherName}
              onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="tel"
              placeholder="Mother's Phone"
              value={formData.motherPhone}
              onChange={(e) => setFormData({ ...formData, motherPhone: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={createStudentMutation.isPending}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition disabled:opacity-50"
            >
              {createStudentMutation.isPending ? 'Creating...' : 'Create Student'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg transition"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Name</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Roll No.</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Admission No.</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Father Phone</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-600">
                  Loading...
                </td>
              </tr>
            ) : students && students.length > 0 ? (
              students.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {student.first_name} {student.last_name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{student.roll_number}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{student.admission_number}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{student.father_phone}</td>
                  <td className="px-6 py-4 text-sm">
                    <button className="text-blue-600 hover:text-blue-700 mr-3">
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button className="text-red-600 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-600">
                  No students found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentManager;
