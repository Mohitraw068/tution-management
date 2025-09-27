'use client';

import { useState } from 'react';
import { useInstituteBranding } from '@/components/providers/InstituteProvider';

interface Student {
  id: string;
  name: string;
  rollNumber: string;
  avatar?: string;
}

interface MobileAttendanceMarkerProps {
  students: Student[];
  onAttendanceChange: (studentId: string, status: 'present' | 'absent' | 'late') => void;
  initialAttendance?: Record<string, 'present' | 'absent' | 'late'>;
}

export function MobileAttendanceMarker({
  students,
  onAttendanceChange,
  initialAttendance = {}
}: MobileAttendanceMarkerProps) {
  const [attendance, setAttendance] = useState<Record<string, 'present' | 'absent' | 'late'>>(initialAttendance);
  const { primaryColor } = useInstituteBranding();

  const handleStatusChange = (studentId: string, status: 'present' | 'absent' | 'late') => {
    setAttendance(prev => ({ ...prev, [studentId]: status }));
    onAttendanceChange(studentId, status);
  };

  const getStatusColor = (status: 'present' | 'absent' | 'late') => {
    switch (status) {
      case 'present':
        return 'bg-green-500';
      case 'absent':
        return 'bg-red-500';
      case 'late':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-200';
    }
  };

  const getStatusText = (status: 'present' | 'absent' | 'late') => {
    switch (status) {
      case 'present':
        return 'Present';
      case 'absent':
        return 'Absent';
      case 'late':
        return 'Late';
      default:
        return 'Not marked';
    }
  };

  return (
    <div className="space-y-3">
      {students.map((student) => {
        const currentStatus = attendance[student.id];

        return (
          <div
            key={student.id}
            className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  {student.avatar ? (
                    <img
                      src={student.avatar}
                      alt={student.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-medium text-gray-600">
                      {student.name.charAt(0)}
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{student.name}</h3>
                  <p className="text-sm text-gray-500">Roll: {student.rollNumber}</p>
                </div>
              </div>

              {currentStatus && (
                <div className={`px-3 py-1 rounded-full text-white text-sm font-medium ${getStatusColor(currentStatus)}`}>
                  {getStatusText(currentStatus)}
                </div>
              )}
            </div>

            {/* Status Buttons */}
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleStatusChange(student.id, 'present')}
                className={`py-3 px-4 rounded-lg text-sm font-medium transition-colors min-h-[44px] ${
                  currentStatus === 'present'
                    ? 'bg-green-500 text-white'
                    : 'bg-green-50 text-green-700 hover:bg-green-100'
                }`}
              >
                <div className="flex flex-col items-center space-y-1">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Present</span>
                </div>
              </button>

              <button
                onClick={() => handleStatusChange(student.id, 'late')}
                className={`py-3 px-4 rounded-lg text-sm font-medium transition-colors min-h-[44px] ${
                  currentStatus === 'late'
                    ? 'bg-yellow-500 text-white'
                    : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
                }`}
              >
                <div className="flex flex-col items-center space-y-1">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  <span>Late</span>
                </div>
              </button>

              <button
                onClick={() => handleStatusChange(student.id, 'absent')}
                className={`py-3 px-4 rounded-lg text-sm font-medium transition-colors min-h-[44px] ${
                  currentStatus === 'absent'
                    ? 'bg-red-500 text-white'
                    : 'bg-red-50 text-red-700 hover:bg-red-100'
                }`}
              >
                <div className="flex flex-col items-center space-y-1">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  <span>Absent</span>
                </div>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}