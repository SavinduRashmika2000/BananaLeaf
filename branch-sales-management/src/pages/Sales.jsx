import React, { useState, useEffect } from 'react';
import api from '../services/api';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import DownloadReportModal from '../components/DownloadReportModal';
import StatusBadge from '../components/StatusBadge';
import {
    EyeIcon,
    DocumentTextIcon,
    CalendarIcon,
    BuildingStorefrontIcon
} from '@heroicons/react/24/outline';

const Sales = () => {
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [downloadModalOpen, setDownloadModalOpen] = useState(false);
    const [selectedSale, setSelectedSale] = useState(null);
    const [loadingItems, setLoadingItems] = useState(false);

    const columns = [
        {
            header: 'Branch Name',
            render: (row) => {
                if (row.branch?.name) return row.branch.name;
                // If branch is null but id is 0 (or composite id ends in -0)
                if (row.id?.endsWith('-0')) return 'Central Office';
                return row.branchName || 'Unknown Branch';
            }
        },
        { header: 'Invoice ID', accessor: 'invoiceLocal' },
        {
            header: 'Date / Time',
            render: (row) => row.saleDateTime ? new Date(row.saleDateTime).toLocaleString() : 'N/A'
        },
        {
            header: 'Total Amount',
            render: (row) => `$${(row.totalAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`
        },
        {
            header: 'Payment Type',
            accessor: 'paymentType'
        },
        {
            header: 'Status',
            render: (row) => {
                const statusLabel = row.status === '1' ? 'Completed' : (row.status || 'Pending');
                const isCompleted = statusLabel === 'Completed';
                return (
                    <span className={`px-2 py-1 rounded text-xs font-bold ${isCompleted ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                        {statusLabel}
                    </span>
                );
            }
        },
        {
            header: 'Action',
            render: (row) => (
                <button
                    onClick={() => handleViewItems(row.id)}
                    className="flex items-center space-x-1 text-green-600 hover:text-green-800 font-semibold transition-colors"
                >
                    <EyeIcon className="w-4 h-4" />
                    <span>View Items</span>
                </button>
            )
        },
    ];

    const fetchSales = async () => {
        try {
            setLoading(true);
            const response = await api.get('/sales');
            if (response.data && Array.isArray(response.data)) {
                setSales(response.data);
            } else {
                console.error('Unexpected API response format:', response.data);
                setSales([]);
            }
        } catch (err) {
            console.error('Error fetching sales:', err);
            // Optionally set an error state to show a message in the UI
        } finally {
            setLoading(false);
        }
    };

    const handleViewItems = async (id) => {
        setModalOpen(true);
        setLoadingItems(true);
        try {
            const saleResponse = await api.get(`/sales/${id}`);
            const itemsResponse = await api.get(`/sales/${id}/items`);
            setSelectedSale({ ...saleResponse.data, items: itemsResponse.data });
        } catch (err) {
            console.error('Error fetching sale details:', err);
        } finally {
            setLoadingItems(false);
        }
    };

    useEffect(() => {
        fetchSales();
    }, []);

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">Sales Report</h2>
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => setDownloadModalOpen(true)}
                        className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-all shadow-sm"
                    >
                        <DocumentTextIcon className="w-5 h-5" />
                        <span>Download PDF</span>
                    </button>
                    {/*<div className="flex items-center space-x-2 text-sm text-gray-500">
                        <CalendarIcon className="w-5 h-5" />
                        <span>Last 30 Days</span>
                    </div>*/}
                </div>
            </div>

            {/* Sales List Table */}
            <section className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <DataTable columns={columns} data={sales} loading={loading} />
            </section>

            {/* Sale Details Modal */}
            <Modal
                isOpen={modalOpen}
                onClose={() => { setModalOpen(false); setSelectedSale(null); }}
                title={selectedSale ? `Invoice: ${selectedSale.invoiceLocal}` : 'Loading details...'}
            >
                {loadingItems ? (
                    <div className="flex flex-col items-center py-10 space-y-4">
                        <div className="w-10 h-10 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
                        <p className="text-gray-500 text-sm italic">Fetching transaction details...</p>
                    </div>
                ) : selectedSale ? (
                    <div className="space-y-6">
                        {/* Modal Header Info */}
                        <div className="grid grid-cols-2 gap-4 pb-6 border-b border-gray-100">
                            <div>
                                <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Branch</p>
                                <div className="flex items-center text-gray-700 font-semibold">
                                    <BuildingStorefrontIcon className="w-4 h-4 mr-2 text-green-600" />
                                    {selectedSale.branch?.name}
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Date & Time</p>
                                <p className="text-gray-700 font-semibold">{new Date(selectedSale.saleDateTime).toLocaleString()}</p>
                            </div>
                        </div>

                        {/* Items Table */}
                        <div className="overflow-hidden rounded-xl border border-gray-100">
                            <table className="w-full text-left bg-white">
                                <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
                                    <tr>
                                        <th className="px-4 py-3 font-bold">Product</th>
                                        <th className="px-4 py-3 font-bold text-center">Qty</th>
                                        <th className="px-4 py-3 font-bold text-right">Price</th>
                                        <th className="px-4 py-3 font-bold text-right">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-sm">
                                    {!selectedSale.items || selectedSale.items.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="px-4 py-10 text-center text-gray-500 italic">
                                                No items found for this invoice in the database.
                                            </td>
                                        </tr>
                                    ) : selectedSale.items.map((item, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-3 font-medium text-gray-800">{item.productName || 'Unknown Product'}</td>
                                            <td className="px-4 py-3 text-center text-gray-600">{item.quantity || 0}</td>
                                            <td className="px-4 py-3 text-right text-gray-600">${(item.price || 0).toFixed(2)}</td>
                                            <td className="px-4 py-3 text-right font-bold text-gray-800">${((item.quantity || 0) * (item.price || 0)).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Total Section */}
                        <div className="flex justify-end pt-4">
                            <div className="bg-green-50 p-4 rounded-xl border border-green-100 text-right min-w-[200px]">
                                <p className="text-xs text-green-600 font-bold uppercase tracking-widest">Grand Total</p>
                                <p className="text-3xl font-black text-green-700">
                                    ${selectedSale.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </p>
                            </div>
                        </div>
                    </div>
                ) : null}
            </Modal>

            {/* Download Report Modal */}
            <DownloadReportModal
                isOpen={downloadModalOpen}
                onClose={() => setDownloadModalOpen(false)}
            />
        </div>
    );
};

export default Sales;
