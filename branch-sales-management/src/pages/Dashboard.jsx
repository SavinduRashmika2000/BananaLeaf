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
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date().toLocaleTimeString());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [summaryRes, branchesRes] = await Promise.all([
                    api.get('/dashboard/summary'),
                    api.get('/dashboard/branch-sales')
                ]);
                setSummary(summaryRes.data);
                setBranches(branchesRes.data);
                setError(null);
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
                setError('Failed to load dashboard data. Please ensure the backend is running.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="text-center py-10 text-gray-500">
                Fetching total sales data...
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-[calc(100vh-12rem)]">
            <div className="flex-1 space-y-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-black text-gray-900 tracking-tight"> Dashboard</h2>
                        <p className="text-gray-500 font-medium">Real-time revenue monitoring across all active branches</p>
                    </div>
                    <div className="flex items-center space-x-2 bg-green-50 px-4 py-2 rounded-full border border-green-100">
                        <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-green-700 text-xs font-bold uppercase tracking-widest">Live Sync Alpha</span>
                    </div>
                </div>

                {error && (
                    <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm flex items-center space-x-3 animate-shake">
                        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                            <span className="font-bold">!</span>
                        </div>
                        <span>{error}</span>
                    </div>
                )}

                {/* Primary Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <SummaryCard
                        label="Inactive Branches"
                        value={summary.offlineBranches}
                        icon={BuildingStorefrontIcon}
                        colorClass="text-rose-600"
                    />
                    <SummaryCard
                        label="Portfolio Items"
                        value={summary.totalProducts.toLocaleString()}
                        icon={ShoppingBagIcon}
                        colorClass="text-indigo-600"
                    />
                    <SummaryCard
                        label="Aggregate Revenue"
                        value={`Rs.${summary.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                        icon={CurrencyDollarIcon}
                        colorClass="text-emerald-700"
                    />
                </div>

                {/* Branch Sales Section - THE MAIN FOCUS */}
                <div className="space-y-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="h-8 w-5 bg-green-600 rounded-full shadow-[0_0_15px_rgba(22,163,74,0.5)]"></div>
                            <h3 className="text-2xl font-black text-gray-900 tracking-tight">Branch Performance <span className="text-green-600">Live</span></h3>
                        </div>
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-widest hidden md:block">
                            Updated {currentTime}
                        </div>
                    </div>

                    {branches.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {branches.map((branch) => (
                                <div
                                    key={branch.branchId}
                                    className="bg-white rounded-2xl shadow-md p-6 flex flex-col justify-between min-h-[12rem] hover:shadow-lg transition border-l-4 border-green-500"
                                >
                                    <div className="flex-1">
                                        <h2 className="text-lg font-semibold text-gray-700 mb-4">
                                            {branch.branchName}
                                        </h2>

                                        <div className="space-y-4">
                                            <div>
                                                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Today's Sales</p>
                                                <p className="text-xl font-bold text-green-600">
                                                    Rs. {branch.todaySales.toFixed(2)}
                                                </p>
                                            </div>

                                            <div className="pt-2 border-t border-gray-50">
                                                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Total Revenue</p>
                                                <p className="text-lg font-semibold text-gray-600">
                                                    Rs. {branch.totalSales.toFixed(2)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 text-gray-400">
                            No sales data available
                        </div>
                    )}
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
