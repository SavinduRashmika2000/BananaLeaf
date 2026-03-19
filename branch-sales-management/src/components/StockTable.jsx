import React, { useState, useEffect } from 'react';
import { CubeIcon, ArrowPathIcon, MapPinIcon, FunnelIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import api from '../services/api';

const fmt = (dt) => {
    if (!dt) return '—';
    const d = new Date(dt);
    return d.toLocaleString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
    });
};

const StockTable = ({ products, centralStock, loading: initialLoading, branches }) => {
    const [selectedBranchId, setSelectedBranchId] = useState('');
    const [selectedProductId, setSelectedProductId] = useState('');
    const [filteredStock, setFilteredStock] = useState([]);
    const [loading, setLoading] = useState(false);
    const [expanded, setExpanded] = useState({});   // productId -> batches[]
    const [loadingBatches, setLoadingBatches] = useState({});

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
        setExpanded({}); // reset expanded when filter changes
    }, [selectedBranchId, selectedProductId]);

    const getCentralQty = (productId) => {
        return centralStock
            .filter(item => item.product?.id === productId)
            .reduce((sum, item) => sum + item.remainingQuantity, 0);
    };

    // For branch-selected view: toggle expand fetches batches per product
    const toggleProductBatches = async (productId) => {
        if (expanded[productId]) {
            setExpanded(prev => { const n = { ...prev }; delete n[productId]; return n; });
            return;
        }
        setLoadingBatches(prev => ({ ...prev, [productId]: true }));
        try {
            const res = await api.get(`/stock/branch/${selectedBranchId}/product/${productId}`);
            setExpanded(prev => ({ ...prev, [productId]: res.data || [] }));
        } catch (err) {
            console.error('Error fetching product batches:', err);
        } finally {
            setLoadingBatches(prev => ({ ...prev, [productId]: false }));
        }
    };

    if (initialLoading || (loading && (selectedBranchId || selectedProductId))) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
        );
    }

    // Aggregate branch stock by product
    const branchProducts = (selectedBranchId && !selectedProductId)
        ? Array.isArray(filteredStock) && filteredStock.reduce((acc, item) => {
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
        }, [])
        : [];

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

            {/* Table */}
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
                            {selectedBranchId && !selectedProductId && (
                                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Batches</th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {/* === CENTRAL OVERVIEW === */}
                        {!selectedBranchId && !selectedProductId ? (
                            products.map((product) => {
                                const qty = getCentralQty(product.id);
                                const productBatches = centralStock.filter(b => b.product?.id === product.id);
                                
                                return (
                                    <React.Fragment key={product.id}>
                                        <tr className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                <div className="flex items-center">
                                                    <div className="h-10 w-10 flex-shrink-0 bg-green-50 rounded-lg flex items-center justify-center">
                                                        <CubeIcon className="h-6 w-6 text-green-600" />
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                                        <div className="text-xs text-gray-400">Code: {product.code || product.sku}</div>
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
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <button
                                                    onClick={() => setExpanded(prev => ({ 
                                                        ...prev, 
                                                        [product.id]: prev[product.id] ? null : productBatches 
                                                    }))}
                                                    className="inline-flex items-center gap-1.5 text-xs font-medium text-green-600 hover:text-green-800 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg transition-all"
                                                >
                                                    {expanded[product.id] ? (
                                                        <><ChevronUpIcon className="w-3.5 h-3.5" /> View Less</>
                                                    ) : (
                                                        <><ChevronDownIcon className="w-3.5 h-3.5" /> View More</>
                                                    )}
                                                </button>
                                            </td>
                                        </tr>
                                        {/* Expanded central batches */}
                                        {expanded[product.id] && Array.isArray(expanded[product.id]) && expanded[product.id].map(batch => (
                                            <tr key={`central-batch-${batch.id}`} className="bg-green-50/30">
                                                <td className="pl-16 pr-6 py-3">
                                                    <div className="text-xs font-bold text-gray-700">{batch.dealer?.name || 'Unknown Dealer'}</div>
                                                    <div className="text-[10px] text-gray-400">Batch #{batch.id} • {fmt(batch.createdAt)}</div>
                                                </td>
                                                <td className="px-6 py-3 text-xs text-gray-400">&nbsp;</td>
                                                <td className="px-6 py-3 text-right">
                                                    <div className="text-xs font-bold text-gray-700">{batch.remainingQuantity.toLocaleString()} / {batch.quantity.toLocaleString()}</div>
                                                    <div className="text-[10px] text-gray-400 uppercase tracking-tighter">Units Available</div>
                                                </td>
                                                <td className="px-6 py-3 text-center">
                                                    <div className="text-xs font-bold text-green-600">Rs.{batch.costPrice.toLocaleString()}</div>
                                                    <div className="text-[10px] text-gray-400 uppercase tracking-tighter">Cost Price</div>
                                                </td>
                                                <td className="px-6 py-3 text-center">
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                                        batch.remainingQuantity > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                                                    }`}>
                                                        {batch.remainingQuantity > 0 ? 'STOCKED' : 'DEPLETED'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </React.Fragment>
                                );
                            })

                        /* === BRANCH SELECTED - Product list with View More === */
                        ) : (selectedBranchId && !selectedProductId) ? (
                            branchProducts && branchProducts.length > 0 ? branchProducts.map((row) => (
                                <React.Fragment key={row.productId}>
                                    <tr className="hover:bg-gray-50 transition-colors">
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
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <button
                                                onClick={() => toggleProductBatches(row.productId)}
                                                disabled={loadingBatches[row.productId]}
                                                className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-all disabled:opacity-50"
                                            >
                                                {loadingBatches[row.productId] ? (
                                                    <div className="w-3.5 h-3.5 border-b-2 border-indigo-600 rounded-full animate-spin" />
                                                ) : expanded[row.productId] ? (
                                                    <><ChevronUpIcon className="w-3.5 h-3.5" /> View Less</>
                                                ) : (
                                                    <><ChevronDownIcon className="w-3.5 h-3.5" /> View More</>
                                                )}
                                            </button>
                                        </td>
                                    </tr>
                                    {/* Expanded batch rows */}
                                    {expanded[row.productId] && Array.isArray(expanded[row.productId]) && expanded[row.productId].map(batch => (
                                        <tr key={`batch-${batch.id}`} className="bg-indigo-50/40">
                                            <td className="pl-16 pr-6 py-3" colSpan={1}>
                                                <div className="text-xs text-indigo-500 font-medium">Batch #{batch.id}</div>
                                                <div className="text-xs text-gray-500 mt-0.5">Added: {fmt(batch.receivedAt)}</div>
                                            </td>
                                            <td className="px-6 py-3 text-xs text-gray-400">&nbsp;</td>
                                            <td className="px-6 py-3 text-right">
                                                <div className="text-xs font-semibold text-gray-700">{batch.remainingQuantity?.toLocaleString()} / {batch.quantity?.toLocaleString()}</div>
                                                <div className="text-xs text-gray-400">remaining / total</div>
                                            </td>
                                            <td className="px-6 py-3 text-center">
                                                <span className="text-xs font-semibold text-indigo-700">
                                                    Rs.{(batch.purchasePrice || 0).toLocaleString()} /unit
                                                </span>
                                            </td>
                                            <td className="px-6 py-3 text-center">
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                                    batch.remainingQuantity > 0 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
                                                }`}>
                                                    {batch.remainingQuantity > 0 ? 'Active' : 'Depleted'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </React.Fragment>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-400">
                                        No stock found for this branch.
                                    </td>
                                </tr>
                            )

                        /* === PRODUCT OR BRANCH+PRODUCT SELECTED (batch view) === */
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
                                                <div className="text-xs text-gray-400">Batch added: {fmt(batch.receivedAt)}</div>
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
