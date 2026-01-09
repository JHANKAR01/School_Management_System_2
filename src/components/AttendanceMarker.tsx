import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Check, X, AlertCircle } from 'lucide-react';

interface Student {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  roll_number: string;
}

interface AttendanceMarkerProps {
  classSectionId: string;
  attendanceDate?: string;
}

const AttendanceMarker: React.FC<AttendanceMarkerProps> = ({
  classSectionId,
  attendanceDate = new Date().toISOString().split('T')[0],
}) => {
  const { profile } = useAuth();
  const [attendance, setAttendance] = useState<Record<string, string>>({});
  const [isOnline, setIsOnline] = useState(true);

  const { data: students, isLoading } = useQuery({
    queryKey: ['students', classSectionId],
    queryFn: async () => {
      const { data } = await supabase
        .from('students')
        .select('id, user_id, first_name, last_name, roll_number')
        .eq('class_section_id', classSectionId)
        .eq('is_active', true)
        .order('roll_number');

      return (data || []) as Student[];
    },
    enabled: !!classSectionId,
  });

  const markAttendanceMutation = useMutation({
    mutationFn: async () => {
      const records = Object.entries(attendance).map(([studentId, status]) => ({
        school_id: profile?.school_id,
        student_id: studentId,
        class_section_id: classSectionId,
        attendance_date: attendanceDate,
        status,
        marked_by_teacher_id: profile?.id,
      }));

      const { error } = await supabase.from('attendance_records').insert(records);
      if (error) throw error;
    },
    onSuccess: () => {
      setAttendance({});
    },
  });

  const toggleAttendance = (studentId: string) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: prev[studentId] === 'absent' ? 'present' : 'absent',
    }));
  };

  const presentCount = Object.values(attendance).filter((s) => s === 'present').length;
  const totalCount = students?.length || 0;
  const attendancePercentage = totalCount > 0 ? ((presentCount / totalCount) * 100).toFixed(1) : 0;

  if (isLoading) return <div className="text-center py-8">Loading students...</div>;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Mark Attendance</h2>
            <p className="text-gray-600 text-sm">{attendanceDate}</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-blue-600">{presentCount}</p>
            <p className="text-gray-600 text-sm">Present ({attendancePercentage}%)</p>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <div className={`h-3 w-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-orange-500'}`}></div>
          <span className="text-sm text-gray-600">{isOnline ? 'Online' : 'Offline - Changes will sync'}</span>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium">Default: All Present</p>
            <p>Tap only on absent students to mark them absent</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-6 max-h-96 overflow-y-auto">
        {students?.map((student) => {
          const isAbsent = attendance[student.id] === 'absent';
          return (
            <button
              key={student.id}
              onClick={() => toggleAttendance(student.id)}
              className={`p-4 rounded-lg border-2 transition text-left ${
                isAbsent
                  ? 'border-red-500 bg-red-50'
                  : 'border-green-500 bg-green-50 hover:border-green-600'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    {student.first_name} {student.last_name}
                  </p>
                  <p className="text-xs text-gray-600">Roll: {student.roll_number}</p>
                </div>
                <div className="ml-2">
                  {isAbsent ? (
                    <X className="h-5 w-5 text-red-600 flex-shrink-0" />
                  ) : (
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="space-y-3">
        <button
          onClick={() => markAttendanceMutation.mutate()}
          disabled={Object.keys(attendance).length === 0 || markAttendanceMutation.isPending}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {markAttendanceMutation.isPending ? 'Submitting...' : 'Submit Attendance'}
        </button>

        <div className="flex gap-2">
          <button
            onClick={() => {
              setAttendance(
                students?.reduce((acc, s) => ({ ...acc, [s.id]: 'present' }), {}) || {}
              );
            }}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 rounded-lg transition"
          >
            Mark All Present
          </button>
          <button
            onClick={() => setAttendance({})}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 rounded-lg transition"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
};

export default AttendanceMarker;
