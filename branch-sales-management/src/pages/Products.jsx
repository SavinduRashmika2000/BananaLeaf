import React, { useState, useEffect } from 'react';
import api from '../services/api';
import ProductSearchBar from '../components/ProductSearchBar';
import ProductTable from '../components/ProductTable';
import EditProductModal from '../components/EditProductModal';
import ToggleSwitch from '../components/ToggleSwitch';
import {
    PlusIcon,
    TagIcon,
    HashtagIcon,
    CurrencyDollarIcon,
    ArrowPathIcon,
    BuildingStorefrontIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        sku: '',
        sellingPrice: '',
        active: true,
    });
    const [branchPrices, setBranchPrices] = useState({}); // { branchId: price }
    const [overriddenBranches, setOverriddenBranches] = useState(new Set());
    const [message, setMessage] = useState({ text: '', type: '' });
    const [showAddForm, setShowAddForm] = useState(false);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const endpoint = searchTerm 
                ? `/products/search?name=${encodeURIComponent(searchTerm)}` 
                : '/products';
            const response = await api.get(endpoint);
            setProducts(response.data);
        } catch (err) {
            console.error('Error fetching products:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchBranches = async () => {
        try {
            const response = await api.get('/branches');
            setBranches(response.data);
        } catch (err) {
            console.error('Error fetching branches:', err);
        }
    };

    useEffect(() => {
        fetchBranches();
    }, []);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchProducts();
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    // Sync branch prices with default price unless overridden
    useEffect(() => {
        if (!formData.sellingPrice) return;
        const newBranchPrices = { ...branchPrices };
        branches.forEach(branch => {
            if (!overriddenBranches.has(branch.id)) {
                newBranchPrices[branch.id] = formData.sellingPrice;
            }
        });
        setBranchPrices(newBranchPrices);
    }, [formData.sellingPrice, branches, overriddenBranches]);

    const handleBranchPriceChange = (branchId, value) => {
        setBranchPrices(prev => ({ ...prev, [branchId]: value }));
        if (value === '' || value === formData.sellingPrice) {
            setOverriddenBranches(prev => {
                const next = new Set(prev);
                next.delete(branchId);
                return next;
            });
            // Revert to default if cleared
            if (value === '') {
                setBranchPrices(prev => ({ ...prev, [branchId]: formData.sellingPrice }));
            }
        } else {
            setOverriddenBranches(prev => new Set(prev).add(branchId));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            setMessage({ text: '', type: '' });

            const branchProducts = branches.map(branch => ({
                branchId: branch.id,
                branchPrice: parseFloat(branchPrices[branch.id] || formData.sellingPrice),
                isAvailable: true
            }));

            const payload = {
                ...formData,
                sellingPrice: parseFloat(formData.sellingPrice),
                price: parseFloat(formData.sellingPrice),
                branchProducts
            };

            await api.post('/products', payload);
            setMessage({ text: 'Product added successfully! Branch records generated.', type: 'success' });
            setFormData({
                name: '',
                sku: '',
                sellingPrice: '',
                active: true,
            });
            setBranchPrices({});
            setOverriddenBranches(new Set());
            fetchProducts();
        } catch (err) {
            console.error('Error adding product:', err);
            setMessage({ text: 'Failed to add product. Please check your inputs.', type: 'error' });
        } finally {
            setSubmitting(false);
        }
    };

    const handleEditProduct = (product) => {
        setSelectedProduct(product);
        setIsEditModalOpen(true);
    };

    const handleUpdateSuccess = () => {
        setMessage({ text: 'Branch settings updated successfully!', type: 'success' });
        fetchProducts();
    };

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Product Management</h2>
                    <p className="text-sm text-gray-500 mt-1">Manage global products and branch-specific configurations.</p>
                </div>
                <div className="flex items-center space-x-3">
                    <ProductSearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
                    <button
                        onClick={() => setShowAddForm(!showAddForm)}
                        className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-bold transition-all shadow-md active:scale-95 ${
                            showAddForm 
                            ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' 
                            : 'bg-green-600 text-white hover:bg-green-700 hover:shadow-green-600/20'
                        }`}
                    >
                        {showAddForm ? (
                            <>
                                <XMarkIcon className="w-5 h-5" />
                                <span>Close Form</span>
                            </>
                        ) : (
                            <>
                                <PlusIcon className="w-5 h-5" />
                                <span>Register Product</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Add Product Form */}
            {showAddForm && (
                <section className="bg-white p-6 md:p-8 rounded-3xl shadow-lg border border-gray-100 animate-in slide-in-from-top-4 duration-300">
                <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-green-100 rounded-xl text-green-600">
                        <PlusIcon className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800">Register New Product</h3>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-600 block">Product Name</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                                    <TagIcon className="w-5 h-5" />
                                </span>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Paracetamol 500mg"
                                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-600 outline-none transition-all"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-600 block">SKU / Code</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                                    <HashtagIcon className="w-5 h-5" />
                                </span>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. MED-001"
                                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-600 outline-none transition-all"
                                    value={formData.sku}
                                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-600 block">Global Default Price</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                                    <CurrencyDollarIcon className="w-5 h-5" />
                                </span>
                                <input
                                    type="number"
                                    required
                                    step="0.01"
                                    placeholder="0.00"
                                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-600 outline-none transition-all font-bold text-green-700"
                                    value={formData.sellingPrice}
                                    onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Branch Specific Prices Section */}
                    {branches.length > 0 && (
                        <div className="mt-8 pt-8 border-t border-gray-50">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center">
                                    <BuildingStorefrontIcon className="w-4 h-4 mr-2 text-green-500" />
                                    Branch-wise Price Overrides
                                </h4>
                                <span className="text-[10px] text-gray-400 bg-gray-50 px-2 py-1 rounded-full border border-gray-100 italic">
                                    Leave empty to use Global Default Price
                                </span>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {branches.map(branch => (
                                    <div key={branch.id} className={`p-4 rounded-2xl border transition-all ${overriddenBranches.has(branch.id) ? 'bg-green-50 border-green-200 ring-1 ring-green-100' : 'bg-gray-50 border-gray-100'}`}>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-bold text-gray-600 truncate">{branch.name}</span>
                                            {overriddenBranches.has(branch.id) && (
                                                <span className="text-[10px] font-bold text-green-600 uppercase tracking-tighter">Overridden</span>
                                            )}
                                        </div>
                                        <div className="relative">
                                            <span className="absolute inset-y-0 left-0 pl-2 flex items-center text-gray-400 text-xs font-bold">Rs.</span>
                                            <input
                                                type="number"
                                                step="0.01"
                                                placeholder={formData.sellingPrice || "0.00"}
                                                className={`w-full pl-6 pr-3 py-1.5 text-sm rounded-lg border outline-none transition-all ${overriddenBranches.has(branch.id) ? 'bg-white border-green-300 focus:ring-2 focus:ring-green-500/10' : 'bg-gray-100/50 border-transparent focus:bg-white focus:border-gray-200'}`}
                                                value={branchPrices[branch.id] || ''}
                                                onChange={(e) => handleBranchPriceChange(branch.id, e.target.value)}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={submitting}
                            className={`min-w-[200px] py-3 px-8 rounded-xl font-bold text-white transition-all shadow-lg shadow-green-600/20 ${submitting ? 'bg-green-400' : 'bg-green-600 hover:bg-green-700 active:scale-95 hover:shadow-green-600/40'
                                }`}
                        >
                            {submitting ? (
                                <span className="flex items-center justify-center space-x-2">
                                    <ArrowPathIcon className="w-4 h-4 animate-spin" />
                                    <span>Syncing Global & Branches...</span>
                                </span>
                            ) : (
                                <span className="flex items-center justify-center space-x-2">
                                    <PlusIcon className="w-5 h-5" />
                                    <span>Register & Deploy Product</span>
                                </span>
                            )}
                        </button>
                    </div>
                </form >

                {message.text && (
                    <div className={`mt-6 p-4 rounded-2xl text-sm border flex items-center space-x-3 animate-in fade-in slide-in-from-top-2 duration-300 ${message.type === 'success' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'
                        }`}>
                        <div className={`w-2 h-2 rounded-full ${message.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}></div>
                        <span>{message.text}</span>
                    </div>
                )}
            </section >
            )}

            {/* Product List Table */}
            < section className="space-y-4" >
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-800">Catalogue Inventory</h3>
                    <span className="text-xs text-gray-400 italic">Showing {products.length} products</span>
                </div>
                <ProductTable 
                    products={products} 
                    loading={loading} 
                    onEdit={handleEditProduct} 
                />
            </section >

            {/* Edit Modal */}
            <EditProductModal 
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                product={selectedProduct}
                onUpdateSuccess={handleUpdateSuccess}
            />
        </div >
    );
};

export default Products;