import React, { useState, useEffect } from 'react';
import { PlusIcon, ArrowRightIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import api from '../services/api';
import StockTable from '../components/StockTable';
import StockInwardModal from '../components/StockInwardModal';
import StockDistributionModal from '../components/StockDistributionModal';

const StockManagement = () => {
    const [products, setProducts] = useState([]);
    const [dealers, setDealers] = useState([]);
    const [branches, setBranches] = useState([]);
    const [centralStock, setCentralStock] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isInwardModalOpen, setIsInwardModalOpen] = useState(false);
    const [isDistributeModalOpen, setIsDistributeModalOpen] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        
        // Fetch products
        try {
            const res = await api.get('/products');
            setProducts(res.data || []);
        } catch (err) { console.error('Error fetching products:', err); }

        // Fetch dealers
        try {
            const res = await api.get('/dealers');
            setDealers(res.data || []);
        } catch (err) { console.error('Error fetching dealers:', err); }

        // Fetch branches
        try {
            const res = await api.get('/branches');
            setBranches(res.data || []);
        } catch (err) { console.error('Error fetching branches:', err); }

        // Fetch central stock
        try {
            const res = await api.get('/stock/central');
            setCentralStock(res.data || []);
        } catch (err) { 
            console.error('Error fetching central stock:', err);
            setCentralStock([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filteredProducts = products.filter(p => 
        (p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         p.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         p.sku?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="space-y-6">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Stock Management</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage central inventory and branch distribution.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsInwardModalOpen(true)}
                        className="flex items-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-xl hover:bg-green-700 transition-all font-medium whitespace-nowrap shadow-sm"
                    >
                        <PlusIcon className="w-5 h-5" />
                        Stock Inward
                    </button>
                    <button
                        onClick={() => setIsDistributeModalOpen(true)}
                        className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl hover:bg-indigo-700 transition-all font-medium whitespace-nowrap shadow-sm"
                    >
                        <ArrowRightIcon className="w-5 h-5" />
                        Distribute
                    </button>
                </div>
            </header>

            <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="relative mb-6">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search product name, code or SKU..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border-gray-200 focus:border-green-500 focus:ring-green-500 transition-all sm:text-sm shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <StockTable 
                    products={filteredProducts} 
                    centralStock={centralStock}
                    loading={loading}
                    branches={branches}
                />
            </section>

            <StockInwardModal 
                isOpen={isInwardModalOpen}
                onClose={() => setIsInwardModalOpen(false)}
                onSuccess={fetchData}
                products={products}
                dealers={dealers}
            />

            <StockDistributionModal 
                isOpen={isDistributeModalOpen}
                onClose={() => setIsDistributeModalOpen(false)}
                onSuccess={fetchData}
                products={products}
                branches={branches}
            />
        </div>
    );
};

export default StockManagement;
