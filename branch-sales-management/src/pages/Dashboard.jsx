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
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
                <p className="text-gray-500 font-medium animate-pulse">Fetching today's sales data...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-[calc(100vh-12rem)]">
            <div className="flex-1 space-y-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-black text-gray-900 tracking-tight">Executive Dashboard</h2>
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
                        value={`Rs. ${summary.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                        icon={CurrencyDollarIcon}
                        colorClass="text-emerald-700"
                    />
                </div>

                {/* Branch Sales Section - THE MAIN FOCUS */}
                <div className="space-y-6">
                    <div className="flex items-center space-x-3">
                        <div className="h-8 w-1.5 bg-green-600 rounded-full"></div>
                        <h3 className="text-xl font-black text-gray-800 uppercase tracking-tight">Revenue by Branch (Today)</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                        {branches.map((branch, index) => (
                            <div 
                                key={branch.branchId} 
                                className="group relative bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden"
                            >
                                {/* Decorative background element */}
                                <div className="absolute -right-4 -top-4 w-24 h-24 bg-gray-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700"></div>
                                
                                <div className="relative z-10 flex flex-col h-full">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform group-hover:rotate-12 duration-500 ${
                                            index % 5 === 0 ? 'bg-gradient-to-br from-green-400 to-green-600' :
                                            index % 5 === 1 ? 'bg-gradient-to-br from-blue-400 to-blue-600' :
                                            index % 5 === 2 ? 'bg-gradient-to-br from-indigo-400 to-indigo-600' :
                                            index % 5 === 3 ? 'bg-gradient-to-br from-purple-400 to-purple-600' :
                                            'bg-gradient-to-br from-rose-400 to-rose-600'
                                        }`}>
                                            <BuildingStorefrontIcon className="w-6 h-6" />
                                        </div>
                                        <div className="px-3 py-1 bg-green-50 text-green-600 text-[10px] font-black rounded-full uppercase tracking-tighter">
                                            Active
                                        </div>
                                    </div>

                                    <div className="mt-auto">
                                        <h2 className="text-gray-400 text-xs font-bold uppercase tracking-[0.2em] mb-1">{branch.branchName}</h2>
                                        <div className="flex items-baseline space-x-1">
                                            <span className="text-gray-400 text-xs font-bold">Rs.</span>
                                            <p className="text-3xl font-black text-gray-900 tracking-tighter">
                                                {branch.totalSales.toLocaleString(undefined, { minimumFractionDigits: 0 })}
                                            </p>
                                            <span className="text-gray-400 text-xs font-bold">.{(branch.totalSales % 1).toFixed(2).split('.')[1]}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-6 pt-6 border-t border-gray-50 flex items-center justify-between">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase">Contribution</p>
                                        <p className="text-xs font-black text-gray-700">
                                            {((branch.totalSales / summary.totalRevenue * 100) || 0).toFixed(1)}%
                                        </p>
                                    </div>
                                    <div className="mt-2 h-1 w-full bg-gray-50 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full rounded-full transition-all duration-1000 delay-300 ${
                                                index % 5 === 0 ? 'bg-green-500' :
                                                index % 5 === 1 ? 'bg-blue-500' :
                                                index % 5 === 2 ? 'bg-indigo-500' :
                                                index % 5 === 3 ? 'bg-purple-500' :
                                                'bg-rose-500'
                                            }`}
                                            style={{ width: `${(branch.totalSales / summary.totalRevenue * 100) || 0}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer Insight */}
                <div className="mt-8 bg-gray-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-green-500 blur-[120px] opacity-20 group-hover:opacity-40 transition-opacity duration-700"></div>
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="text-center md:text-left">
                            <h3 className="text-2xl font-black mb-2 tracking-tight">Ready for Deeper Insights?</h3>
                            <p className="text-gray-400 max-w-md font-medium">Your branch sales are synced in real-time. Review the detailed analytics to optimize your inventory and staffing levels across all locations.</p>
                        </div>
                        <button className="whitespace-nowrap px-10 py-4 bg-white text-gray-900 rounded-full font-black hover:scale-105 active:scale-95 transition-all shadow-xl shadow-green-900/20 uppercase tracking-widest text-xs">
                            Launch Sales Analytics
                        </button>
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
