import React from 'react';

const SummaryCard = ({ label, value, icon: Icon, colorClass = "text-green-600" }) => {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 flex items-center space-x-4 hover:scale-105 transition-transform duration-300 cursor-default">
            <div className={`p-4 rounded-xl bg-gray-50 flex-shrink-0`}>
                <Icon className={`w-8 h-8 ${colorClass}`} />
            </div>
            <div>
                <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">{label}</p>
                <p className="text-2xl font-bold text-gray-800">{value}</p>
            </div>
        </div>
    );
};

export default SummaryCard;
