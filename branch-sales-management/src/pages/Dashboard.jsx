import React, { useEffect, useState } from 'react';
import api from '../services/api';
import SummaryCard from '../components/SummaryCard';
import {
    BuildingStorefrontIcon,
    ShoppingBagIcon,
    CurrencyDollarIcon
} from '@heroicons/react/24/outline';

const Dashboard = () => {
    const [summary, setSummary] = useState({
        offlineBranches: 0,
        totalProducts: 0,
        totalRevenue: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                setLoading(true);
                const response = await api.get('/dashboard/summary');
                setSummary(response.data);
                setError(null);
            } catch (err) {
                console.error('Error fetching dashboard summary:', err);
                setError('Failed to load dashboard data. Please ensure the backend is running.');
            } finally {
                setLoading(false);
            }
        };

        fetchSummary();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-[calc(100vh-12rem)]">
            <div className="flex-1 space-y-8">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-800">Dashboard Overview</h2>
                    <div className="px-4 py-2 bg-white rounded-lg shadow-sm text-sm text-gray-500 border border-gray-100">
                        Real-time status: <span className="text-green-600 font-semibold italic">Connected</span>
                    </div>
                </div>

                {error && (
                    <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <SummaryCard
                        label="Offline Branches"
                        value={summary.offlineBranches}
                        icon={BuildingStorefrontIcon}
                        colorClass="text-red-600"
                    />
                    <SummaryCard
                        label="Total Products"
                        value={summary.totalProducts.toLocaleString()}
                        icon={ShoppingBagIcon}
                        colorClass="text-green-600"
                    />
                    <SummaryCard
                        label="Total Revenue Synced"
                        value={`$${summary.totalRevenue.toLocaleString()}`}
                        icon={CurrencyDollarIcon}
                        colorClass="text-green-700"
                    />
                </div>

                {/* Analytics Placeholder Section */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 min-h-[400px] flex flex-col items-center justify-center text-center space-y-4">
                    <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center text-green-600">
                        <CurrencyDollarIcon className="w-8 h-8" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800">Operational Insights</h3>
                        <p className="text-gray-500 max-w-sm mx-auto">
                            Advanced analytics and branch performance charts will be visualised here once more data is synced.
                        </p>
                    </div>
                </div>
            </div>

            {/* Dashboard Specific Footer */}
            <footer className="mt-auto pt-12 pb-6 text-center text-sm text-gray-400 font-medium">
                &copy; 2026 All Rights Reserved
            </footer>
        </div>
    );
};

export default Dashboard;
