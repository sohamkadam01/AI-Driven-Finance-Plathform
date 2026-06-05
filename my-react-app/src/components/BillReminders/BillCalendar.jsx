import React from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, CheckCircle, AlertCircle } from 'lucide-react';

const BillCalendar = ({ year, month, bills, onMarkAsPaid, onPreviousMonth, onNextMonth, loading }) => {
  const getDaysInMonth = (year, month) => {
    return new Date(year, month, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month - 1, 1).getDay();
  };

  const formatDate = (year, month, day) => {
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const getBillsForDate = (date) => {
    return bills.filter(bill => bill.dueDate === date);
  };

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const today = new Date().toISOString().split('T')[0];
  const currentDate = `${year}-${String(month).padStart(2, '0')}`;

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-gray-200 rounded"></div>
          <div className="grid grid-cols-7 gap-2">
            {[1,2,3,4,5,6,7].map(i => (
              <div key={i} className="h-24 bg-gray-100 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Calendar Header */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onPreviousMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft size={20} className="text-gray-500" />
          </button>
          <h2 className="text-lg font-semibold text-gray-900">
            {monthNames[month - 1]} {year}
          </h2>
          <button
            onClick={onNextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight size={20} className="text-gray-500" />
          </button>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <span className="text-gray-500">Due</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-gray-500">Paid</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            <span className="text-gray-500">Overdue</span>
          </div>
        </div>
      </div>

      {/* Week Days Header */}
      <div className="grid grid-cols-7 gap-px bg-gray-100">
        {weekDays.map(day => (
          <div key={day} className="bg-gray-50 py-3 text-center">
            <span className="text-xs font-medium text-gray-500">{day}</span>
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-px bg-gray-100">
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} className="bg-white p-2 min-h-[100px]" />
        ))}
        
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const date = formatDate(year, month, day);
          const dayBills = getBillsForDate(date);
          const isToday = date === today;
          const isPast = date < today;
          
          return (
            <div
              key={day}
              className={`bg-white p-2 min-h-[100px] transition-colors ${
                isToday ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex justify-between items-start mb-1">
                <span className={`text-sm font-medium ${
                  isToday ? 'text-blue-600' : 'text-gray-700'
                }`}>
                  {day}
                </span>
                {dayBills.length > 0 && (
                  <span className="text-xs bg-gray-100 px-1.5 py-0.5 rounded-full text-gray-600">
                    {dayBills.length}
                  </span>
                )}
              </div>
              
              <div className="space-y-1">
                {dayBills.slice(0, 2).map((bill, idx) => (
                  <div
                    key={idx}
                    className={`text-xs p-1 rounded cursor-pointer transition-colors ${
                      bill.paid ? 'bg-green-50 text-green-700' :
                      isPast && !bill.paid ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'
                    }`}
                    onClick={() => !bill.paid && onMarkAsPaid(bill)}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="truncate">{bill.name}</span>
                      <span>₹{bill.amount.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
                {dayBills.length > 2 && (
                  <div className="text-xs text-gray-400 text-center">
                    +{dayBills.length - 2} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BillCalendar;
