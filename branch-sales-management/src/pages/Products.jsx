import React, { useState, useEffect } from 'react';
import api from '../services/api';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import ToggleSwitch from '../components/ToggleSwitch';
import {
    PlusIcon,
    TagIcon,
    HashtagIcon,
    CurrencyDollarIcon
} from '@heroicons/react/24/outline';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]); // New: categories
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        sku: '',
        sellingPrice: '',
        active: true,
        categoryId: '' // New: selected category
    });
    const [message, setMessage] = useState({ text: '', type: '' });

    const columns = [
        { header: 'ID', accessor: 'id' },
        { header: 'SKU / Code', accessor: 'sku' },
        { header: 'Product Name', accessor: 'name' },
        {
            header: 'Selling Price',
            render: (row) =>
                `$${parseFloat(row.sellingPrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}`
        },
        {
            header: 'Status',
            render: (row) => <StatusBadge active={row.active} />
        },
        {
            header: 'Category', // Show category in table
            accessor: 'category'
        }
    ];

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await api.get('/products');
            setProducts(response.data);
        } catch (err) {
            console.error('Error fetching products:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await api.get('/products/categories');
            setCategories(res.data);
        } catch (err) {
            console.error('Error fetching categories:', err);
        }
    };

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            setMessage({ text: '', type: '' });

            const payload = {
                ...formData,
                sellingPrice: parseFloat(formData.sellingPrice)
            };

            await api.post('/products', payload);
            setMessage({ text: 'Product added successfully!', type: 'success' });
            setFormData({
                name: '',
                sku: '',
                sellingPrice: '',
                active: true,
                categoryId: ''
            });
            fetchProducts();
        } catch (err) {
            console.error('Error adding product:', err);
            setMessage({ text: 'Failed to add product. Please check your inputs.', type: 'error' });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">Master Product List</h2>
            </div>

            {/* Add Product Form */}
            <section className="bg-white p-6 md:p-8 rounded-2xl shadow-md border border-gray-100">
                <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-green-100 rounded-lg text-green-600">
                        <PlusIcon className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800">Add New Product</h3>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Product Name */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-600 block">Product Name</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                                    <TagIcon className="w-5 h-5" />
                                </span>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Wireless Mouse"
                                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-600 outline-none transition-all"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* SKU / Code */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-600 block">SKU / Code</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                                    <HashtagIcon className="w-5 h-5" />
                                </span>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. WM-001"
                                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-600 outline-none transition-all"
                                    value={formData.sku}
                                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Selling Price */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-600 block">Selling Price</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                                    <CurrencyDollarIcon className="w-5 h-5" />
                                </span>
                                <input
                                    type="number"
                                    required
                                    step="0.01"
                                    placeholder="0.00"
                                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-600 outline-none transition-all"
                                    value={formData.sellingPrice}
                                    onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Category Dropdown */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-600 block">Category</label>
                            <select
                                required
                                className="w-full pl-3 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-600 outline-none transition-all"
                                value={formData.categoryId}
                                onChange={(e) => setFormData({ ...formData, categoryId: parseInt(e.target.value) })}
                            >
                                <option value="">Select Category</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Active Switch & Button */}
                        <div className="flex flex-col justify-end space-y-2">
                            <div className="flex items-center justify-between pb-2">
                                <ToggleSwitch
                                    enabled={formData.active}
                                    setEnabled={(val) => setFormData({ ...formData, active: val })}
                                    label="Active Status"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={submitting}
                                className={`w-full py-2 px-6 rounded-xl font-semibold text-white transition-all shadow-lg shadow-green-600/20 ${submitting ? 'bg-green-400' : 'bg-green-600 hover:bg-green-700 active:scale-95'
                                    }`}
                            >
                                {submitting ? 'Adding...' : 'Add Product'}
                            </button>
                        </div>
                    </div>
                </form>

                {message.text && (
                    <div className={`mt-6 p-3 rounded-xl text-sm border ${message.type === 'success' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'
                        }`}>
                        {message.text}
                    </div>
                )}
            </section>

            {/* Product List Table */}
            <section className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">Catalogue List</h3>
                <DataTable columns={columns} data={products} loading={loading} />
            </section>
        </div>
    );
};

export default Products;