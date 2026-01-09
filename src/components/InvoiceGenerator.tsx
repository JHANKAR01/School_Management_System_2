import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Download, Send, Eye } from 'lucide-react';

interface Invoice {
  id: string;
  invoice_number: string;
  student_id: string;
  total_amount: number;
  net_amount: number;
  status: string;
  due_date: string;
  created_at: string;
  students: {
    first_name: string;
    last_name: string;
  };
}

interface InvoiceGeneratorProps {
  classSectionId?: string;
}

const InvoiceGenerator: React.FC<InvoiceGeneratorProps> = ({ classSectionId }) => {
  const { profile } = useAuth();
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );

  const { data: invoices, isLoading: invoicesLoading } = useQuery({
    queryKey: ['invoices', profile?.school_id],
    queryFn: async () => {
      const { data } = await supabase
        .from('invoices')
        .select('*, students(first_name, last_name)')
        .eq('school_id', profile?.school_id)
        .order('created_at', { ascending: false });

      return (data || []) as Invoice[];
    },
    enabled: !!profile?.school_id,
  });

  const { data: students } = useQuery({
    queryKey: ['students', profile?.school_id],
    queryFn: async () => {
      let query = supabase
        .from('students')
        .select('id, first_name, last_name, admission_number')
        .eq('school_id', profile?.school_id)
        .eq('is_active', true);

      if (classSectionId) {
        query = query.eq('class_section_id', classSectionId);
      }

      const { data } = await query;
      return (data || []) as any[];
    },
    enabled: !!profile?.school_id,
  });

  const generateInvoicesMutation = useMutation({
    mutationFn: async () => {
      const academicYear = new Date().getFullYear().toString();

      const invoicesToCreate = selectedStudents.map((studentId) => ({
        school_id: profile?.school_id,
        student_id: studentId,
        invoice_number: `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        academic_year: academicYear,
        total_amount: 50000,
        discount_amount: 0,
        net_amount: 50000,
        due_date: dueDate,
        status: 'pending',
      }));

      const { error } = await supabase.from('invoices').insert(invoicesToCreate);

      if (error) throw error;
    },
    onSuccess: () => {
      setSelectedStudents([]);
    },
  });

  const handleGenerateInvoices = async () => {
    if (selectedStudents.length === 0) {
      alert('Please select at least one student');
      return;
    }
    await generateInvoicesMutation.mutateAsync();
  };

  const toggleStudent = (studentId: string) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId]
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Generate Invoices</h2>

        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Selected Students</label>
            <div className="px-4 py-2 bg-gray-100 rounded-lg font-semibold text-gray-900">
              {selectedStudents.length} students
            </div>
          </div>
          <div className="flex items-end">
            <button
              onClick={handleGenerateInvoices}
              disabled={selectedStudents.length === 0 || generateInvoicesMutation.isPending}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50"
            >
              {generateInvoicesMutation.isPending ? 'Creating...' : 'Generate Invoices'}
            </button>
          </div>
        </div>

        <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
          <table className="w-full">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedStudents(students?.map((s) => s.id) || []);
                      } else {
                        setSelectedStudents([]);
                      }
                    }}
                    className="rounded"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Admission No.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {students?.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedStudents.includes(student.id)}
                      onChange={() => toggleStudent(student.id)}
                      className="rounded"
                    />
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {student.first_name} {student.last_name}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{student.admission_number}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Invoices</h2>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Invoice #</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Student</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Due Date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {invoicesLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-600">
                    Loading...
                  </td>
                </tr>
              ) : invoices && invoices.length > 0 ? (
                invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{invoice.invoice_number}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {invoice.students.first_name} {invoice.students.last_name}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">₹{invoice.net_amount}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{invoice.due_date}</td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                          invoice.status === 'pending'
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm flex gap-2">
                      <button className="text-blue-600 hover:text-blue-700">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="text-green-600 hover:text-green-700">
                        <Download className="h-4 w-4" />
                      </button>
                      <button className="text-purple-600 hover:text-purple-700">
                        <Send className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-600">
                    No invoices found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InvoiceGenerator;
