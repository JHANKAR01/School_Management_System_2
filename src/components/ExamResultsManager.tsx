import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Upload, FileText } from 'lucide-react';

interface Exam {
  id: string;
  name: string;
  exam_type: string;
  academic_year: string;
  start_date: string;
  end_date: string;
  is_published: boolean;
}

interface ExamResultsManagerProps {
  examId?: string;
}

const ExamResultsManager: React.FC<ExamResultsManagerProps> = ({ examId }) => {
  const { profile } = useAuth();
  const [showCreateExam, setShowCreateExam] = useState(false);
  const [newExam, setNewExam] = useState({
    name: '',
    examType: 'unit_test',
    startDate: '',
    endDate: '',
  });
  const [marksData, setMarksData] = useState<Record<string, Record<string, number>>>({});

  const { data: exams, isLoading: examsLoading, refetch: refetchExams } = useQuery({
    queryKey: ['exams', profile?.school_id],
    queryFn: async () => {
      const { data } = await supabase
        .from('exams')
        .select('*')
        .eq('school_id', profile?.school_id)
        .order('start_date', { ascending: false });

      return (data || []) as Exam[];
    },
    enabled: !!profile?.school_id,
  });

  const { data: students } = useQuery({
    queryKey: ['students', profile?.school_id],
    queryFn: async () => {
      const { data } = await supabase
        .from('students')
        .select('id, first_name, last_name')
        .eq('school_id', profile?.school_id)
        .eq('is_active', true)
        .order('first_name');

      return (data || []) as any[];
    },
    enabled: !!profile?.school_id,
  });

  const { data: subjects } = useQuery({
    queryKey: ['subjects', profile?.school_id],
    queryFn: async () => {
      const { data } = await supabase
        .from('subjects')
        .select('id, name')
        .eq('school_id', profile?.school_id)
        .eq('is_active', true);

      return (data || []) as any[];
    },
    enabled: !!profile?.school_id,
  });

  const createExamMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from('exams')
        .insert([
          {
            school_id: profile?.school_id,
            name: newExam.name,
            exam_type: newExam.examType,
            start_date: newExam.startDate,
            end_date: newExam.endDate,
            academic_year: new Date().getFullYear().toString(),
            is_published: false,
          },
        ])
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      setNewExam({ name: '', examType: 'unit_test', startDate: '', endDate: '' });
      setShowCreateExam(false);
      refetchExams();
    },
  });

  const publishResultsMutation = useMutation({
    mutationFn: async (targetExamId: string) => {
      const { error } = await supabase
        .from('exams')
        .update({ is_published: true })
        .eq('id', targetExamId);

      if (error) throw error;
    },
    onSuccess: () => {
      refetchExams();
    },
  });

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    await createExamMutation.mutateAsync();
  };

  const calculateGrade = (percentage: number): string => {
    if (percentage >= 90) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Exams</h2>
          <button
            onClick={() => setShowCreateExam(!showCreateExam)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
          >
            <Plus className="h-4 w-4" />
            Create Exam
          </button>
        </div>

        {showCreateExam && (
          <form onSubmit={handleCreateExam} className="space-y-4 p-4 bg-gray-50 rounded-lg mb-4">
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Exam Name"
                value={newExam.name}
                onChange={(e) => setNewExam({ ...newExam, name: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
              <select
                value={newExam.examType}
                onChange={(e) => setNewExam({ ...newExam, examType: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="unit_test">Unit Test</option>
                <option value="half_yearly">Half Yearly</option>
                <option value="final">Final</option>
                <option value="supplementary">Supplementary</option>
              </select>
              <input
                type="date"
                value={newExam.startDate}
                onChange={(e) => setNewExam({ ...newExam, startDate: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                type="date"
                value={newExam.endDate}
                onChange={(e) => setNewExam({ ...newExam, endDate: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={createExamMutation.isPending}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition disabled:opacity-50"
              >
                {createExamMutation.isPending ? 'Creating...' : 'Create Exam'}
              </button>
              <button
                type="button"
                onClick={() => setShowCreateExam(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="space-y-3">
          {examsLoading ? (
            <p className="text-gray-600">Loading exams...</p>
          ) : exams && exams.length > 0 ? (
            exams.map((exam) => (
              <div key={exam.id} className="border border-gray-200 rounded-lg p-4 flex justify-between items-center">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{exam.name}</h3>
                  <p className="text-sm text-gray-600">
                    {exam.start_date} to {exam.end_date} • {exam.exam_type}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button className="flex items-center gap-2 bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-2 rounded-lg transition">
                    <Upload className="h-4 w-4" />
                    Upload Marks
                  </button>
                  {!exam.is_published && (
                    <button
                      onClick={() => publishResultsMutation.mutate(exam.id)}
                      disabled={publishResultsMutation.isPending}
                      className="flex items-center gap-2 bg-green-100 hover:bg-green-200 text-green-700 px-3 py-2 rounded-lg transition disabled:opacity-50"
                    >
                      <FileText className="h-4 w-4" />
                      Publish
                    </button>
                  )}
                  {exam.is_published && (
                    <span className="inline-block px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
                      Published
                    </span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-600">No exams found</p>
          )}
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Mark Entry</h2>
        <p className="text-gray-600 text-sm mb-4">
          Enter marks for students in a selected exam. Marks will be automatically converted to grades.
        </p>

        {exams && exams.length > 0 && subjects && subjects.length > 0 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Exam</label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                  {exams.map((exam) => (
                    <option key={exam.id} value={exam.id}>
                      {exam.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Subject</label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Student Name</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Marks (100)</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Percentage</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {students?.map((student) => {
                    const marks = marksData[student.id]?.marks || 0;
                    const percentage = marks;
                    const grade = calculateGrade(percentage);

                    return (
                      <tr key={student.id}>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {student.first_name} {student.last_name}
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Marks"
                          />
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{percentage}%</td>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">{grade}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition">
              Save Marks
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamResultsManager;
