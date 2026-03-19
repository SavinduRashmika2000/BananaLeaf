import React, { useState } from 'react';
import Modal from './Modal';
import { CubeIcon, MapPinIcon, CalculatorIcon, ChevronRightIcon, BeakerIcon, AdjustmentsHorizontalIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import api from '../services/api';

const fmtDate = (dt) => {
    if (!dt) return '—';
    const d = new Date(dt);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const StockDistributionModal = ({ isOpen, onClose, onSuccess, products, branches }) => {
    const [formData, setFormData] = useState({
        productId: '',
        distributions: {}, // branchId -> quantity (for FIFO)
        manualAllocations: {}, // branchId -> { batchId -> quantity }
    });
    const [isManualMode, setIsManualMode] = useState(false);
    const [expandedBranches, setExpandedBranches] = useState({});
    const [loading, setLoading] = useState(false);

    const selectedProduct = products.find(p => p.id === Number(formData.productId));
    const availableBatches = selectedProduct?.centralStock || [];
    const totalAvailableStock = availableBatches.reduce((sum, b) => sum + b.remainingQuantity, 0);

    const totalToDistribute = isManualMode
        ? Object.values(formData.manualAllocations).reduce((sum, branchMap) => 
            sum + Object.values(branchMap).reduce((s, q) => s + (Number(q) || 0), 0), 0)
        : Object.values(formData.distributions).reduce((sum, qty) => sum + (Number(qty) || 0), 0);

    const handleQuantityChange = (branchId, value) => {
        setFormData(prev => ({
            ...prev,
            distributions: { ...prev.distributions, [branchId]: value }
        }));
    };

    const handleManualChange = (branchId, batchId, value) => {
        setFormData(prev => ({
            ...prev,
            manualAllocations: {
                ...prev.manualAllocations,
                [branchId]: {
                    ...(prev.manualAllocations[branchId] || {}),
                    [batchId]: value
                }
            }
        }));
    };

    const toggleBranch = (branchId) => {
        setExpandedBranches(prev => ({ ...prev, [branchId]: !prev[branchId] }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (totalToDistribute <= 0) {
            alert('Please specify at least one quantity to distribute.');
            return;
        }

        if (totalToDistribute > totalAvailableStock) {
            alert(`Total requested (${totalToDistribute}) exceeds available stock (${totalAvailableStock})!`);
            return;
        }

        setLoading(true);
        try {
            let distributions = [];

            if (isManualMode) {
                distributions = Object.entries(formData.manualAllocations)
                    .map(([branchId, batchMap]) => {
                        const batchAllocations = Object.entries(batchMap)
                            .filter(([_, qty]) => Number(qty) > 0)
                            .map(([batchId, qty]) => ({
                                batchId: Number(batchId),
                                quantity: Number(qty)
                            }));
                        
                        const totalBranchQty = batchAllocations.reduce((s, a) => s + a.quantity, 0);
                        
                        return totalBranchQty > 0 ? {
                            branchId: Number(branchId),
                            quantity: totalBranchQty,
                            batchAllocations
                        } : null;
                    })
                    .filter(Boolean);
            } else {
                distributions = Object.entries(formData.distributions)
                    .filter(([_, qty]) => Number(qty) > 0)
                    .map(([branchId, qty]) => ({
                        branchId: Number(branchId),
                        quantity: Number(qty)
                    }));
            }

            await api.post('/stock/distribute', {
                productId: Number(formData.productId),
                distributions
            });
            onSuccess();
            onClose();
            setFormData({ productId: '', distributions: {}, manualAllocations: {} });
            setIsManualMode(false);
        } catch (err) {
            console.error('Error distributing stock:', err);
            alert(err.response?.data?.message || 'Error distributing stock.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Distribute Stock to Branches">
            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest px-1">Select Product</label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                                <CubeIcon className="w-5 h-5" />
                            </span>
                            <select
                                required
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-600 outline-none transition-all appearance-none"
                                value={formData.productId}
                                onChange={(e) => setFormData({ ...formData, productId: e.target.value, distributions: {}, manualAllocations: {} })}
                            >
                                <option value="">Choose a product...</option>
                                {products.map(p => {
                                    const qty = p.centralStock?.reduce((s, b) => s + b.remainingQuantity, 0) || 0;
                                    return (
                                        <option key={p.id} value={p.id}>{p.name} (Available: {qty})</option>
                                    );
                                })}
                            </select>
                        </div>
                    </div>

                    {formData.productId && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center px-1">
                                <div className="flex items-center gap-3">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Branch Allocation</label>
                                    <button
                                        type="button"
                                        onClick={() => setIsManualMode(!isManualMode)}
                                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border ${
                                            isManualMode 
                                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                                            : 'bg-white text-gray-400 border-gray-200 hover:border-blue-400 hover:text-blue-500'
                                        }`}
                                    >
                                        <AdjustmentsHorizontalIcon className="w-3.5 h-3.5" />
                                        Manual Batch Selection
                                    </button>
                                </div>
                                <div className={`text-sm font-bold ${totalToDistribute > totalAvailableStock ? 'text-red-600' : 'text-green-600'}`}>
                                    Total: {totalToDistribute.toLocaleString()} / {totalAvailableStock.toLocaleString()}
                                </div>
                            </div>
                            
                            <div className="max-h-[350px] overflow-y-auto border border-gray-100 rounded-xl divide-y divide-gray-100 bg-gray-50/30">
                                {branches.map(branch => {
                                    const isExpanded = expandedBranches[branch.id];
                                    const branchManualQty = Object.values(formData.manualAllocations[branch.id] || {}).reduce((s, q) => s + (Number(q) || 0), 0);
                                    
                                    return (
                                        <div key={branch.id} className="bg-white">
                                            <div className="flex items-center justify-between p-3">
                                                <div className="flex items-center space-x-3">
                                                    <MapPinIcon className="w-5 h-5 text-gray-400" />
                                                    <span className="text-sm font-medium text-gray-700">{branch.name}</span>
                                                    {isManualMode && branchManualQty > 0 && (
                                                        <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                                                            {branchManualQty} units
                                                        </span>
                                                    )}
                                                </div>
                                                
                                                <div className="flex items-center gap-3">
                                                    {!isManualMode ? (
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            step="1"
                                                            placeholder="0"
                                                            className="w-24 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-right focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                                            value={formData.distributions[branch.id] || ''}
                                                            onChange={(e) => handleQuantityChange(branch.id, e.target.value)}
                                                        />
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            onClick={() => toggleBranch(branch.id)}
                                                            className={`p-1.5 rounded-lg transition-all ${isExpanded ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:bg-gray-100'}`}
                                                        >
                                                            {isExpanded ? <ChevronUpIcon className="w-5 h-5" /> : <ChevronDownIcon className="w-5 h-5" />}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            {isManualMode && isExpanded && (
                                                <div className="px-3 pb-4 pt-1 space-y-2 border-t border-gray-50 bg-gray-50/50">
                                                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1 mb-1">Available Batches</div>
                                                    {availableBatches.length > 0 ? availableBatches.map(batch => (
                                                        <div key={batch.id} className="flex items-center justify-between bg-white p-2 rounded-lg border border-gray-100 shadow-sm">
                                                            <div className="flex flex-col">
                                                                <span className="text-xs font-bold text-gray-700">{batch.dealerName} • Rs.{batch.costPrice}</span>
                                                                <span className="text-[9px] text-gray-400">Batch #{batch.id} • Available: {batch.remainingQuantity} • {fmtDate(batch.createdAt)}</span>
                                                            </div>
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                max={batch.remainingQuantity}
                                                                placeholder="0"
                                                                className="w-16 px-2 py-1 bg-gray-50 border border-gray-200 rounded-md text-xs text-right focus:ring-1 focus:ring-blue-500 outline-none"
                                                                value={formData.manualAllocations[branch.id]?.[batch.id] || ''}
                                                                onChange={(e) => handleManualChange(branch.id, batch.id, e.target.value)}
                                                            />
                                                        </div>
                                                    )) : (
                                                        <div className="text-[10px] text-gray-400 italic px-1">No batches available.</div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex justify-end pt-2">
                    <button
                        type="submit"
                        disabled={loading || totalToDistribute <= 0 || totalToDistribute > totalAvailableStock}
                        className={`group flex items-center space-x-2 px-8 py-3 rounded-xl font-bold text-white transition-all shadow-lg ${
                            loading || totalToDistribute <= 0 || totalToDistribute > totalAvailableStock
                            ? 'bg-gray-300 cursor-not-allowed shadow-none' 
                            : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95 hover:shadow-indigo-600/30'
                        }`}
                    >
                        <span>{loading ? 'Distributing...' : 'Perform Distribution'}</span>
                        {!loading && <ChevronRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default StockDistributionModal;
