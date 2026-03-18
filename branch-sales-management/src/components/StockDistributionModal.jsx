import React, { useState } from 'react';
import Modal from './Modal';
import { CubeIcon, MapPinIcon, CalculatorIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import api from '../services/api';

const StockDistributionModal = ({ isOpen, onClose, onSuccess, products, branches }) => {
    const [formData, setFormData] = useState({
        productId: '',
        distributions: {} // branchId -> quantity
    });
    const [loading, setLoading] = useState(false);

    const selectedProduct = products.find(p => p.id === Number(formData.productId));
    const availableStock = selectedProduct 
        ? (Array.isArray(selectedProduct.centralStock) 
            ? selectedProduct.centralStock.reduce((sum, batch) => sum + batch.remainingQuantity, 0)
            : selectedProduct.centralStock || 0)
        : 0;

    const totalToDistribute = Object.values(formData.distributions)
        .reduce((sum, qty) => sum + (Number(qty) || 0), 0);

    const handleQuantityChange = (branchId, value) => {
        setFormData(prev => ({
            ...prev,
            distributions: {
                ...prev.distributions,
                [branchId]: value
            }
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (totalToDistribute <= 0) {
            alert('Please specify at least one quantity to distribute.');
            return;
        }

        if (totalToDistribute > availableStock) {
            alert(`Total requested (${totalToDistribute}) exceeds available stock (${availableStock})!`);
            return;
        }

        setLoading(true);
        try {
            const distributions = Object.entries(formData.distributions)
                .filter(([_, qty]) => Number(qty) > 0)
                .map(([branchId, qty]) => ({
                    branchId: Number(branchId),
                    quantity: Number(qty)
                }));

            await api.post('/stock/distribute', {
                productId: Number(formData.productId),
                distributions
            });
            onSuccess();
            onClose();
            setFormData({ productId: '', distributions: {} });
        } catch (err) {
            console.error('Error distributing stock:', err);
            alert(err.response?.data?.message || 'Error distributing stock.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Distribute Stock to Branches">
            <form onSubmit={handleSubmit} className="space-y-6">
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
                                onChange={(e) => setFormData({ ...formData, productId: e.target.value, distributions: {} })}
                            >
                                <option value="">Choose a product...</option>
                                {products.map(p => {
                                    const qty = Array.isArray(p.centralStock) 
                                        ? p.centralStock.reduce((sum, b) => sum + b.remainingQuantity, 0)
                                        : p.centralStock || 0;
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
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Branch Allocation</label>
                                <div className={`text-sm font-bold ${totalToDistribute > availableStock ? 'text-red-600' : 'text-green-600'}`}>
                                    Total: {totalToDistribute} / {availableStock}
                                </div>
                            </div>
                            
                            <div className="max-h-64 overflow-y-auto border border-gray-100 rounded-xl divide-y divide-gray-100">
                                {branches.map(branch => (
                                    <div key={branch.id} className="flex items-center justify-between p-3 hover:bg-gray-50">
                                        <div className="flex items-center space-x-3">
                                            <MapPinIcon className="w-5 h-5 text-gray-400" />
                                            <span className="text-sm font-medium text-gray-700">{branch.name}</span>
                                        </div>
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            placeholder="0.00"
                                            className="w-24 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm text-right focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                            value={formData.distributions[branch.id] || ''}
                                            onChange={(e) => handleQuantityChange(branch.id, e.target.value)}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={loading || totalToDistribute <= 0 || totalToDistribute > availableStock}
                        className={`group flex items-center space-x-2 px-8 py-3 rounded-xl font-bold text-white transition-all shadow-lg ${
                            loading || totalToDistribute <= 0 || totalToDistribute > availableStock
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
