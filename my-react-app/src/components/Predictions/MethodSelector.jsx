import React from 'react';
import { Brain, BarChart3, Sparkles } from 'lucide-react';

const MethodSelector = ({ method, onMethodChange }) => {
  const methods = [
    { id: 'STATISTICAL', name: 'Statistical', icon: BarChart3, description: 'Based on historical patterns', color: 'blue' },
    { id: 'AI', name: 'AI Powered', icon: Brain, description: 'Advanced machine learning predictions', color: 'purple' },
    { id: 'AUTO', name: 'Auto', icon: Sparkles, description: 'Best available method', color: 'green' }
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles size={18} className="text-gray-500" />
        <h3 className="text-base font-medium text-gray-900">Prediction Method</h3>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {methods.map((m) => {
          const isActive = method === m.id;
          const colorClasses = {
            blue: isActive ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300',
            purple: isActive ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-300',
            green: isActive ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-300'
          };
          
          return (
            <button
              key={m.id}
              onClick={() => onMethodChange(m.id)}
              className={`p-4 rounded-xl border-2 transition-all text-left ${
                colorClasses[m.color]
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <m.icon size={18} className={
                  m.color === 'blue' ? 'text-blue-600' : 
                  m.color === 'purple' ? 'text-purple-600' : 'text-green-600'
                } />
                <span className="font-medium text-gray-900">{m.name}</span>
              </div>
              <p className="text-xs text-gray-500">{m.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MethodSelector;