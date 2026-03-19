import React, { useState, useMemo } from 'react';
import Modal from './Modal';
import { 
    CubeIcon, UserIcon, CalculatorIcon, CurrencyDollarIcon, 
    ChevronRightIcon, PlusIcon, XMarkIcon,
    CheckIcon, TrashIcon, ShoppingCartIcon
} from '@heroicons/react/24/outline';
import api from '../services/api';

const StockInwardModal = ({ isOpen, onClose, onSuccess, products, dealers }) => {
    // Current input state
    const [formData, setFormData] = useState({
        productId: '',
        quantity: '',
        costPrice: ''
    });
    
    // Bulk list state
    const [dealerId, setDealerId] = useState('');
    const [selectedItems, setSelectedItems] = useState([]);
    
    const [loading, setLoading] = useState(false);
    
    // Search states
    const [searchProduct, setSearchProduct] = useState('');
    const [searchDealer, setSearchDealer] = useState('');
    const [isProductListOpen, setIsProductListOpen] = useState(false);
    const [isDealerListOpen, setIsDealerListOpen] = useState(false);

    // Quick Add Product states
    const [showQuickAdd, setShowQuickAdd] = useState(false);
    const [quickAddData, setQuickAddData] = useState({
        name: '',
        sku: '',
        sellingPrice: ''
    });
    const [quickAddLoading, setQuickAddLoading] = useState(false);

    // Filtered lists
    const filteredProducts = useMemo(() => {
        if (!searchProduct) return products;
        return products.filter(p => 
            p.name.toLowerCase().includes(searchProduct.toLowerCase()) ||
            p.code?.toLowerCase().includes(searchProduct.toLowerCase()) ||
            p.sku?.toLowerCase().includes(searchProduct.toLowerCase())
        );
    }, [products, searchProduct]);

    const filteredDealers = useMemo(() => {
        if (!searchDealer) return dealers;
        return dealers.filter(d => 
            d.name.toLowerCase().includes(searchDealer.toLowerCase())
        );
    }, [dealers, searchDealer]);

    const handleSelectProduct = (product) => {
        setFormData(prev => ({ ...prev, productId: product.id }));
        setSearchProduct(product.name);
        setIsProductListOpen(false);
    };

    const handleSelectDealer = (dealer) => {
        setDealerId(dealer.id);
        setSearchDealer(dealer.name);
        setIsDealerListOpen(false);
    };

    const addItemToList = () => {
        if (!formData.productId || !formData.quantity || !formData.costPrice) {
            alert('Please select a product and enter quantity & price.');
            return;
        }

        const product = products.find(p => p.id === formData.productId);
        const newItem = {
            productId: formData.productId,
            productName: product.name,
            productCode: product.code || product.sku,
            quantity: parseFloat(formData.quantity),
            costPrice: parseFloat(formData.costPrice)
        };

        setSelectedItems([...selectedItems, newItem]);
        
        // Reset product inputs (but keep dealer)
        setFormData({ productId: '', quantity: '', costPrice: '' });
        setSearchProduct('');
    };

    const removeItem = (index) => {
        setSelectedItems(selectedItems.filter((_, i) => i !== index));
    };

    const handleQuickAddProduct = async (e) => {
        e.preventDefault();
        setQuickAddLoading(true);
        try {
            const res = await api.post('/products', {
                ...quickAddData,
                sellingPrice: parseFloat(quickAddData.sellingPrice),
                price: parseFloat(quickAddData.sellingPrice),
                active: true
            });
            
            const newProd = res.data;
            onSuccess(); // refresh parent
            handleSelectProduct(newProd);
            setShowQuickAdd(false);
            setQuickAddData({ name: '', sku: '', sellingPrice: '' });
        } catch (err) {
            console.error('Error quick adding product:', err);
            alert('Failed to add product.');
        } finally {
            setQuickAddLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // If there's content in the fields but not in the list, add it automatically
        let finalItems = [...selectedItems];
        if (formData.productId && formData.quantity && formData.costPrice) {
            const product = products.find(p => p.id === formData.productId);
            finalItems.push({
                productId: formData.productId,
                productName: product.name,
                productCode: product.code || product.sku,
                quantity: parseFloat(formData.quantity),
                costPrice: parseFloat(formData.costPrice)
            });
        }

        if (!dealerId) {
            alert('Please select a dealer.');
            return;
        }
        if (finalItems.length === 0) {
            alert('Please add at least one product.');
            return;
        }

        setLoading(true);
        try {
            await api.post('/stock/inward/bulk', {
                dealerId: Number(dealerId),
                items: finalItems.map(item => ({
                    productId: Number(item.productId),
                    quantity: Number(item.quantity),
                    costPrice: Number(item.costPrice)
                }))
            });
            onSuccess();
            handleClose();
        } catch (err) {
            console.error('Error recording stock inward:', err);
            alert('Failed to record stock inward.');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        onClose();
        setFormData({ productId: '', quantity: '', costPrice: '' });
        setSelectedItems([]);
        setDealerId('');
        setSearchProduct('');
        setSearchDealer('');
        setShowQuickAdd(false);
    };

    const totalPrice = selectedItems.reduce((acc, item) => acc + (item.quantity * item.costPrice), 0);

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={handleClose} 
            title={showQuickAdd ? "Register New Product" : "Stock Inward Entry"}
            maxWidth="max-w-2xl"
        >
            {showQuickAdd ? (
                /* Quick Add Form */
                <form onSubmit={handleQuickAddProduct} className="space-y-5">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest px-1">Product Name</label>
                            <input
                                required
                                type="text"
                                placeholder="e.g. Paracetamol 500mg"
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-600 outline-none transition-all"
                                value={quickAddData.name}
                                onChange={(e) => setQuickAddData({ ...quickAddData, name: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest px-1">SKU / Code</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="MED-001"
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-600 outline-none transition-all"
                                    value={quickAddData.sku}
                                    onChange={(e) => setQuickAddData({ ...quickAddData, sku: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest px-1">Default Price</label>
                                <input
                                    required
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-600 outline-none transition-all"
                                    value={quickAddData.sellingPrice}
                                    onChange={(e) => setQuickAddData({ ...quickAddData, sellingPrice: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={() => setShowQuickAdd(false)}
                            className="flex-1 px-6 py-3 rounded-xl font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-all border border-gray-200"
                        >
                            Back
                        </button>
                        <button
                            type="submit"
                            disabled={quickAddLoading}
                            className="flex-2 px-10 py-3 rounded-xl font-bold text-white bg-green-600 hover:bg-green-700 transition-all shadow-lg shadow-green-600/20 disabled:opacity-50"
                        >
                            {quickAddLoading ? 'Creating...' : 'Register Product'}
                        </button>
                    </div>
                </form>
            ) : (
                /* Main Inward Form */
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-5">
                        {/* Dealer Selection (Fixed for all items) */}
                        <div className="space-y-2 relative">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest px-1">Step 1: Source Dealer</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                                    <UserIcon className="w-5 h-5" />
                                </span>
                                <input
                                    type="text"
                                    placeholder="Search dealer..."
                                    className={`w-full pl-10 pr-10 py-2.5 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-600 outline-none transition-all ${dealerId ? 'border-green-200 ring-1 ring-green-50' : 'border-gray-200'}`}
                                    value={searchDealer}
                                    onChange={(e) => { 
                                        setSearchDealer(e.target.value); 
                                        setIsDealerListOpen(true);
                                        if (dealerId) setDealerId('');
                                    }}
                                    onFocus={() => setIsDealerListOpen(true)}
                                />
                                {dealerId && (
                                    <span className="absolute inset-y-0 right-3 flex items-center text-green-500">
                                        <CheckIcon className="w-5 h-5" />
                                    </span>
                                )}
                            </div>

                            {/* Dropdown Results */}
                            {isDealerListOpen && (
                                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-100 rounded-xl shadow-xl max-h-40 overflow-y-auto animate-in fade-in slide-in-from-top-1 duration-200">
                                    {filteredDealers.length > 0 ? (
                                        filteredDealers.map(d => (
                                            <button
                                                key={d.id}
                                                type="button"
                                                onClick={() => handleSelectDealer(d)}
                                                className="w-full text-left px-4 py-3 hover:bg-green-50 transition-colors flex items-center justify-between group"
                                            >
                                                <div className="text-sm font-semibold text-gray-800">{d.name}</div>
                                                <ChevronRightIcon className="w-4 h-4 text-gray-300 group-hover:text-green-500 transition-colors" />
                                            </button>
                                        ))
                                    ) : (
                                        <div className="px-4 py-6 text-center text-sm text-gray-400 italic">
                                            No dealers found.
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="h-px bg-gray-100 w-full"></div>

                        {/* Product Entry Form (Repeated) */}
                        <div className="space-y-4 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                            <div className="flex justify-between items-center px-1">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Step 2: Add Products</label>
                                <button 
                                    type="button"
                                    onClick={() => setShowQuickAdd(true)}
                                    className="text-[10px] font-bold text-green-600 hover:text-green-700 uppercase tracking-wider flex items-center gap-1 bg-green-50 px-2 py-0.5 rounded-full border border-green-100"
                                >
                                    <PlusIcon className="w-3 h-3" /> New Product
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2 relative">
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                                            <CubeIcon className="w-5 h-5" />
                                        </span>
                                        <input
                                            type="text"
                                            placeholder="Search product..."
                                            className="w-full pl-10 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-600 outline-none transition-all"
                                            value={searchProduct}
                                            onChange={(e) => { 
                                                setSearchProduct(e.target.value); 
                                                setIsProductListOpen(true);
                                                if (formData.productId) setFormData(prev => ({ ...prev, productId: '' }));
                                            }}
                                            onFocus={() => setIsProductListOpen(true)}
                                        />
                                        {formData.productId && (
                                            <span className="absolute inset-y-0 right-3 flex items-center text-green-500">
                                                <CheckIcon className="w-5 h-5" />
                                            </span>
                                        )}
                                    </div>
                                    
                                    {isProductListOpen && (
                                        <div className="absolute z-40 w-full mt-1 bg-white border border-gray-100 rounded-xl shadow-xl max-h-40 overflow-y-auto animate-in fade-in slide-in-from-top-1 duration-200">
                                            {filteredProducts.length > 0 ? (
                                                filteredProducts.map(p => (
                                                    <button
                                                        key={p.id}
                                                        type="button"
                                                        onClick={() => handleSelectProduct(p)}
                                                        className="w-full text-left px-4 py-2.5 hover:bg-green-50 transition-colors flex items-center justify-between group"
                                                    >
                                                        <div>
                                                            <div className="text-sm font-semibold text-gray-800">{p.name}</div>
                                                            <div className="text-[10px] text-gray-400 uppercase tracking-wider">{p.code || p.sku || 'N/A'}</div>
                                                        </div>
                                                        <ChevronRightIcon className="w-4 h-4 text-gray-300 group-hover:text-green-500 transition-colors" />
                                                    </button>
                                                ))
                                            ) : (
                                                <div className="px-4 py-6 text-center text-sm text-gray-400 italic">No products found.</div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                                            <CalculatorIcon className="w-4 h-4" />
                                        </span>
                                        <input
                                            type="number"
                                            placeholder="Qty"
                                            className="w-full pl-8 pr-3 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-600 outline-none transition-all text-sm"
                                            value={formData.quantity}
                                            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                        />
                                    </div>
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                                            <CurrencyDollarIcon className="w-4 h-4" />
                                        </span>
                                        <input
                                            type="number"
                                            placeholder="Price"
                                            className="w-full pl-8 pr-3 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-600 outline-none transition-all text-sm"
                                            value={formData.costPrice}
                                            onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                            
                            <button
                                type="button"
                                onClick={addItemToList}
                                className="w-full py-2 bg-gray-100 hover:bg-green-600 hover:text-white text-gray-600 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 border border-gray-200 border-dashed hover:border-solid hover:shadow-lg hover:shadow-green-600/20 active:scale-[0.98]"
                            >
                                <PlusIcon className="w-4 h-4" /> Add to Batch
                            </button>
                        </div>

                        {/* Selected Items List */}
                        {selectedItems.length > 0 && (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between px-1">
                                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                        <ShoppingCartIcon className="w-3 h-3" /> 
                                        Stock Entry List ({selectedItems.length})
                                    </h4>
                                    <span className="text-xs font-bold text-green-600">Total: Rs.{totalPrice.toLocaleString()}</span>
                                </div>
                                <div className="max-h-40 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                                    {selectedItems.map((item, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl shadow-sm group hover:border-green-200 transition-all">
                                            <div className="flex-1 min-w-0">
                                                <div className="text-xs font-bold text-gray-800 truncate">{item.productName}</div>
                                                <div className="text-[10px] text-gray-500">{item.productCode}</div>
                                            </div>
                                            <div className="flex items-center space-x-6 text-right">
                                                <div className="text-xs">
                                                    <span className="text-gray-400 block text-[9px] uppercase font-bold tracking-tighter">Qty</span>
                                                    <span className="font-bold text-gray-700">{item.quantity}</span>
                                                </div>
                                                <div className="text-xs">
                                                    <span className="text-gray-400 block text-[9px] uppercase font-bold tracking-tighter">Price</span>
                                                    <span className="font-bold text-green-600">Rs.{item.costPrice}</span>
                                                </div>
                                                <button 
                                                    type="button" 
                                                    onClick={() => removeItem(idx)}
                                                    className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                >
                                                    <TrashIcon className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end pt-4 border-t border-gray-50">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`group flex items-center space-x-2 px-10 py-3.5 rounded-xl font-bold text-white transition-all shadow-lg ${
                                loading 
                                ? 'bg-green-400 cursor-not-allowed' 
                                : 'bg-green-600 hover:bg-green-700 active:scale-95 shadow-green-600/20 shadow-xl'
                            }`}
                        >
                            <span>{loading ? 'Recording...' : 'Finalize & Record Batch'}</span>
                            {!loading && <ChevronRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                        </button>
                    </div>
                </form>
            )}
            
            {(isProductListOpen || isDealerListOpen) && (
                <div 
                    className="fixed inset-0 z-30" 
                    onClick={() => { setIsProductListOpen(false); setIsDealerListOpen(false); }}
                />
            )}

            <style dyamic="true">{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #e5e7eb;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #d1d5db;
                }
            `}</style>
        </Modal>
    );
};

export default StockInwardModal;
