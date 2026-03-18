import React, { useState, useEffect } from 'react';
import { CubeIcon, ArrowPathIcon, MapPinIcon, FunnelIcon } from '@heroicons/react/24/outline';
import api from '../services/api';

const StockTable = ({ products, centralStock, loading: initialLoading, branches }) => {
    const [selectedBranchId, setSelectedBranchId] = useState('');
    const [selectedProductId, setSelectedProductId] = useState('');
    const [filteredStock, setFilteredStock] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!selectedBranchId && !selectedProductId) {
            setFilteredStock([]);
            return;
        }

        const fetchFilteredStock = async () => {
            setLoading(true);
            try {
                let endpoint = '';
                if (selectedBranchId && selectedProductId) {
                    endpoint = `/stock/branch/${selectedBranchId}/product/${selectedProductId}`;
                } else if (selectedBranchId) {
                    endpoint = `/stock/branch/${selectedBranchId}`;
                } else {
                    endpoint = `/stock/product/${selectedProductId}`;
                }
                const res = await api.get(endpoint);
                setFilteredStock(res.data);
            } catch (err) {
                console.error('Error fetching filtered stock:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchFilteredStock();
    }, [selectedBranchId, selectedProductId]);

    const getCentralQty = (productId) => {
        return centralStock
            .filter(item => item.product?.id === productId)
            .reduce((sum, item) => sum + item.remainingQuantity, 0);
    };

    if (initialLoading || (loading && (selectedBranchId || selectedProductId))) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center space-x-2 text-gray-500">
                    <FunnelIcon className="w-5 h-5" />
                    <span className="text-sm font-bold uppercase tracking-wider">Filter Stock By:</span>
                </div>
                
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => { setSelectedBranchId(''); setSelectedProductId(''); }}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            !selectedBranchId && !selectedProductId
                            ? 'bg-indigo-600 text-white shadow-md' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        Central Overview
                    </button>
                    
                    <select
                        className={`pl-3 pr-8 py-2 rounded-lg text-sm font-medium border-0 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all appearance-none cursor-pointer ${
                            selectedBranchId ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 text-gray-600'
                        }`}
                        value={selectedBranchId}
                        onChange={(e) => setSelectedBranchId(e.target.value)}
                    >
                        <option value="">All Branches</option>
                        {branches.map(b => (
                            <option key={b.id} value={b.id} className="text-gray-900 bg-white">{b.name}</option>
                        ))}
                    </select>

                    <select
                        className={`pl-3 pr-8 py-2 rounded-lg text-sm font-medium border-0 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all appearance-none cursor-pointer ${
                            selectedProductId ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 text-gray-600'
                        }`}
                        value={selectedProductId}
                        onChange={(e) => setSelectedProductId(e.target.value)}
                    >
                        <option value="">All Products</option>
                        {products.map(p => (
                            <option key={p.id} value={p.id} className="text-gray-900 bg-white">{p.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-100">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                {(!selectedBranchId && !selectedProductId) || (selectedBranchId && !selectedProductId) ? 'Product Info' : 'Branch Name'}
                            </th>
                            {((!selectedBranchId && !selectedProductId) || (selectedBranchId && !selectedProductId)) && (
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                            )}
                            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Current Stock
                            </th>
                            {selectedProductId && (
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Unit Price</th>
                            )}
                            <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {!selectedBranchId && !selectedProductId ? (
                            products.map((product) => {
                                const qty = getCentralQty(product.id);
                                return (
                                    <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 flex-shrink-0 bg-green-50 rounded-lg flex items-center justify-center">
                                                    <CubeIcon className="h-6 w-6 text-green-600" />
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                                    <div className="text-xs text-gray-400">Code: {product.code}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.category}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-900">{qty.toLocaleString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                                qty > 50 ? 'bg-green-100 text-green-700' : qty > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                                            }`}>
                                                {qty > 50 ? 'In Stock' : qty > 0 ? 'Low Stock' : 'Out of Stock'}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (selectedBranchId && !selectedProductId) ? (
                            Array.isArray(filteredStock) && filteredStock.reduce((acc, item) => {
                                const existing = acc.find(row => row.productId === item.product?.id);
                                if (existing) {
                                    existing.quantity += item.remainingQuantity;
                                } else {
                                    acc.push({
                                        productId: item.product?.id,
                                        name: item.product?.name,
                                        code: item.product?.code,
                                        category: item.product?.category,
                                        quantity: item.remainingQuantity
                                    });
                                }
                                return acc;
                            }, []).map((row) => (
                                <tr key={row.productId} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 flex-shrink-0 bg-indigo-50 rounded-lg flex items-center justify-center">
                                                <CubeIcon className="h-6 w-6 text-indigo-600" />
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{row.name}</div>
                                                <div className="text-xs text-gray-400">Code: {row.code}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.category}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-900">{row.quantity.toLocaleString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                            row.quantity > 20 ? 'bg-green-100 text-green-700' : row.quantity > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                                        }`}>
                                            {row.quantity > 20 ? 'Good' : row.quantity > 0 ? 'Low' : 'Empty'}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            Array.isArray(filteredStock) && filteredStock.map((batch) => (
                                <tr key={batch.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 flex-shrink-0 bg-blue-50 rounded-lg flex items-center justify-center">
                                                {selectedBranchId ? <CubeIcon className="h-6 w-6 text-blue-600" /> : <MapPinIcon className="h-6 w-6 text-blue-600" />}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{selectedBranchId ? batch.product?.name : batch.branch?.name}</div>
                                                <div className="text-xs text-gray-400">Batch: {new Date(batch.receivedAt).toLocaleDateString()}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-900">
                                        {batch.remainingQuantity.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500 font-mono">
                                        Rs.{(batch.purchasePrice || 0).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                            batch.remainingQuantity > 0 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
                                        }`}>
                                            {batch.remainingQuantity > 0 ? 'Active' : 'Depleted'}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default StockTable;
