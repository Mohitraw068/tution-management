'use client';

import { ReactNode } from 'react';

interface Column {
  key: string;
  label: string;
  render?: (value: any, row: any) => ReactNode;
  className?: string;
  hideOnMobile?: boolean;
}

interface ResponsiveTableProps {
  columns: Column[];
  data: any[];
  onRowClick?: (row: any) => void;
  loading?: boolean;
  emptyMessage?: string;
  mobileCardRender?: (row: any, index: number) => ReactNode;
}

export function ResponsiveTable({
  columns,
  data,
  onRowClick,
  loading,
  emptyMessage = 'No data available',
  mobileCardRender
}: ResponsiveTableProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading...</span>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 mb-2">
          <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${column.className || ''}`}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((row, index) => (
              <tr
                key={index}
                onClick={() => onRowClick?.(row)}
                className={onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${column.className || ''}`}
                  >
                    {column.render ? column.render(row[column.key], row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {data.map((row, index) => {
          if (mobileCardRender) {
            return mobileCardRender(row, index);
          }

          return (
            <div
              key={index}
              onClick={() => onRowClick?.(row)}
              className={`bg-white rounded-lg border border-gray-200 p-4 space-y-3 ${
                onRowClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''
              }`}
            >
              {columns
                .filter(col => !col.hideOnMobile)
                .map((column) => (
                  <div key={column.key} className="flex justify-between items-start">
                    <span className="text-sm font-medium text-gray-500 min-w-0 flex-1">
                      {column.label}:
                    </span>
                    <span className="text-sm text-gray-900 ml-2 text-right">
                      {column.render ? column.render(row[column.key], row) : row[column.key]}
                    </span>
                  </div>
                ))}
            </div>
          );
        })}
      </div>
    </>
  );
}