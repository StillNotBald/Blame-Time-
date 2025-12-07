import React from 'react';

interface ScorecardProps {
  title: string;
  value: number;
  isCritical?: boolean;
}

const Scorecard: React.FC<ScorecardProps> = ({ title, value, isCritical = false }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col items-start justify-between shadow-sm hover:shadow-md transition-shadow duration-200">
      <span className="text-gray-500 text-sm font-medium uppercase tracking-wider">{title}</span>
      <span className={`text-4xl font-bold mt-2 ${isCritical && value > 0 ? 'text-red-600' : 'text-gray-900'}`}>
        {value}
      </span>
    </div>
  );
};

export default Scorecard;