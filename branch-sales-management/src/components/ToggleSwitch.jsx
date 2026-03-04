import React from 'react';

const ToggleSwitch = ({ enabled, setEnabled, label }) => {
    return (
        <div className="flex items-center space-x-3">
            {label && <span className="text-sm font-medium text-gray-600">{label}</span>}
            <button
                type="button"
                onClick={() => setEnabled(!enabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500/20 ${enabled ? 'bg-green-600' : 'bg-gray-300'
                    }`}
            >
                <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                />
            </button>
        </div>
    );
};

export default ToggleSwitch;
