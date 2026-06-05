import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, AlertCircle, CheckCircle2, ChevronRight, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const UpcomingBillsWidget = ({ bills, loading }) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-3xl border border-gray-100 animate-pulse h-full min-h-[300px]">
        <div className="h-6 w-48 bg-gray-200 rounded mb-6"></div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-4 items-center">
              <div className="w-12 h-12 bg-gray-100 rounded-xl"></div>
              <div className="flex-1">
                <div className="h-4 w-32 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 w-24 bg-gray-100 rounded"></div>
              </div>
              <div className="h-5 w-16 bg-gray-200 rounded-full"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Handle empty state or undefined bills
  const displayBills = Array.isArray(bills) ? bills.slice(0, 4) : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow h-full flex flex-col"
    >
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Calendar className="text-blue-500" size={20} />
          Upcoming Bills
        </h3>
        <button 
          onClick={() => navigate('/bill-reminders')}
          className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
        >
          View Calendar <ChevronRight size={16} />
        </button>
      </div>

      <div className="flex-1 flex flex-col gap-4">
        {displayBills.length > 0 ? (
          displayBills.map((bill, index) => {
            const isUrgent = bill.daysUntilDue <= 3;
            
            return (
              <div 
                key={bill.recurringId || index} 
                className="flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100 cursor-pointer"
                onClick={() => navigate('/bill-reminders')}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  isUrgent ? 'bg-rose-50 text-rose-500' : 'bg-blue-50 text-blue-500'
                }`}>
                  {isUrgent ? <AlertCircle size={24} /> : <Clock size={24} />}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">{bill.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{bill.categoryName}</p>
                </div>
                
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-gray-900">₹{(bill.amount || 0).toLocaleString()}</p>
                  <p className={`text-xs font-medium mt-0.5 ${
                    isUrgent ? 'text-rose-600' : 'text-gray-500'
                  }`}>
                    {bill.daysUntilDue === 0 ? 'Due Today' : 
                     bill.daysUntilDue === 1 ? 'Due Tomorrow' : 
                     `In ${bill.daysUntilDue} days`}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center py-8 text-center">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-3">
              <CheckCircle2 className="text-emerald-500" size={32} />
            </div>
            <p className="text-sm font-medium text-gray-900">All caught up!</p>
            <p className="text-xs text-gray-500 mt-1">No upcoming bills in the next 30 days.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default UpcomingBillsWidget;
