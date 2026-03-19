import React, { useState, useEffect } from 'react';
import axios from 'axios';
import api from '../services/api';
import Modal from './Modal';
import { 
    CalendarIcon, 
    BuildingStorefrontIcon, 
    ArrowDownTrayIcon 
} from '@heroicons/react/24/outline';

const DownloadReportModal = ({ isOpen, onClose, initialBranchId = '', initialPeriod = 'LAST_30_DAYS' }) => {
    const [branches, setBranches] = useState([]);
    const [branchId, setBranchId] = useState(initialBranchId);
    const [period, setPeriod] = useState(initialPeriod);
    const [loading, setLoading] = useState(false);

    const periods = [
        { id: 'TODAY', name: 'Today' },
        { id: 'WEEK', name: 'This Week' },
        { id: 'LAST_15_DAYS', name: 'Last 15 Days' },
        { id: 'LAST_30_DAYS', name: 'Last 30 Days' },
        { id: 'LAST_3_MONTHS', name: 'Last 3 Months' },
        { id: 'ALL', name: 'All Time' }
    ];

    useEffect(() => {
        if (isOpen) {
            fetchBranches();
            setBranchId(initialBranchId);
            setPeriod(initialPeriod);
        }
    }, [isOpen, initialBranchId, initialPeriod]);

    const fetchBranches = async () => {
        try {
            const response = await api.get('/branches');
            setBranches(response.data);
        } catch (err) {
            console.error('Error fetching branches:', err);
        }
    };

    const handleDownload = async () => {
        setLoading(true);
        try {
            console.log('Initiating download for:', { branchId, period });
            
            const response = await api.get('/reports/sales/download', {
                params: {
                    period,
                    branchId: branchId || undefined
                },
                responseType: 'blob'
            });

            console.log('Download successful, response received.');

            const blob = new Blob([response.data], { type: 'application/pdf' });
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            
            // Generate a descriptive filename
            const dateStr = new Date().toISOString().split('T')[0];
            const filename = `sales-report-${period.toLowerCase()}-${dateStr}.pdf`;
            link.setAttribute('download', filename);
            
            document.body.appendChild(link);
            link.click();
            
            // Clean up
            setTimeout(() => {
                link.remove();
                window.URL.revokeObjectURL(downloadUrl);
            }, 500);
            
            onClose();
        } catch (err) {
            console.error('Download Error:', err);
            let errorMessage = 'Failed to download report.';
            
            if (err.response) {
                errorMessage += `\n- Server Error: ${err.response.status} ${err.response.statusText}`;
            } else {
                errorMessage += `\n- Detail: ${err.message}`;
            }
            
            alert(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Download Sales Report"
        >
            <div className="space-y-6">
                <p className="text-gray-500 text-sm">
                    Select a branch and time period to filter the sales report. The report will be generated as a professional PDF.
                </p>

                <div className="space-y-4">
                    {/* Branch Selection */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                            <BuildingStorefrontIcon className="w-4 h-4 mr-2 text-green-600" />
                            Select Branch
                        </label>
                        <select
                            value={branchId}
                            onChange={(e) => setBranchId(e.target.value)}
                            className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all bg-gray-50"
                        >
                            <option value="">All Branches</option>
                            {branches.map((branch) => (
                                <option key={branch.id} value={branch.id}>
                                    {branch.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Time Period Selection */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                            <CalendarIcon className="w-4 h-4 mr-2 text-green-600" />
                            Time Period
                        </label>
                        <select
                            value={period}
                            onChange={(e) => setPeriod(e.target.value)}
                            className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all bg-gray-50"
                        >
                            {periods.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Single Action Button */}
                <div className="pt-4">
                    <button
                        onClick={handleDownload}
                        disabled={loading}
                        className={`w-full flex items-center justify-center space-x-2 py-4 rounded-2xl font-bold text-white shadow-lg transition-all active:scale-95 ${
                            loading 
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : 'bg-green-600 hover:bg-green-700 shadow-green-200'
                        }`}
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <ArrowDownTrayIcon className="w-6 h-6" />
                        )}
                        <span>{loading ? 'Generating Report...' : 'Download Report'}</span>
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default DownloadReportModal;
