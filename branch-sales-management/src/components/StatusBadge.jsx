import React from 'react';

const StatusBadge = ({ active }) => {
    return (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${active
                ? 'bg-green-100 text-green-700 border border-green-200'
                : 'bg-red-100 text-red-700 border border-red-200'
            }`}>
            {active ? 'Active' : 'Inactive'}
        </span>
    );
};

export default StatusBadge;
