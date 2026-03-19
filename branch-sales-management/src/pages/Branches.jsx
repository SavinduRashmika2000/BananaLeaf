import React, { useState, useEffect } from 'react';
import api from '../services/api';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import BranchModal from '../components/BranchModal';
import { PlusIcon, MagnifyingGlassIcon, BuildingStorefrontIcon, FunnelIcon } from '@heroicons/react/24/outline';

const Branches = () => {
    const [branches, setBranches] = useState([]);
    const [filteredBranches, setFilteredBranches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedBranch, setSelectedBranch] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [message, setMessage] = useState({ text: '', type: '' });

    const columns = [
        { header: 'ID', accessor: 'id' },
        { header: 'Branch Name', accessor: 'name' },
        { header: 'Location', accessor: 'location' },
        {
            header: 'Status',
            render: (row) => <StatusBadge active={row.active} />
        },
        {
            header: 'Actions',
            render: (row) => (
                <button
                    onClick={() => handleEditClick(row)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                    title="Edit Branch"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                    </svg>
                </button>
            )
        },
    ];

    const fetchBranches = async () => {
        try {
            setLoading(true);
            const response = await api.get('/branches');
            setBranches(response.data);
            setFilteredBranches(response.data);
        } catch (err) {
            console.error('Error fetching branches:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBranches();
    }, []);

    useEffect(() => {
        let result = branches;

        if (filterStatus !== 'ALL') {
            const isActive = filterStatus === 'ACTIVE';
            result = result.filter(b => b.active === isActive);
        }

        if (searchTerm) {
            result = result.filter(b => 
                b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                b.location.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredBranches(result);
    }, [branches, searchTerm, filterStatus]);

    const handleSave = async (formData) => {
        try {
            setSubmitting(true);
            setMessage({ text: '', type: '' });
            
            if (selectedBranch) {
                await api.put(`/branches/${selectedBranch.id}`, formData);
                setMessage({ text: 'Branch updated successfully!', type: 'success' });
            } else {
                await api.post('/branches', formData);
                setMessage({ text: 'Branch added successfully!', type: 'success' });
            }
            
            setIsModalOpen(false);
            fetchBranches();
        } catch (err) {
            console.error('Error saving branch:', err);
            setMessage({ text: `Failed to ${selectedBranch ? 'update' : 'add'} branch.`, type: 'error' });
        } finally {
            setSubmitting(false);
        }
    };

    const handleEditClick = (branch) => {
        setSelectedBranch(branch);
        setIsModalOpen(true);
    };

    const openModal = () => {
        setSelectedBranch(null);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                        <BuildingStorefrontIcon className="w-8 h-8 mr-3 text-green-600" />
                        Manage Branches
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">Configure and manage your restaurant branch network.</p>
                </div>
                <button
                    onClick={openModal}
                    className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-md active:scale-95"
                >
                    <PlusIcon className="w-5 h-5" />
                    <span>Add New Branch</span>
                </button>
            </div>

            {/* Controls Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                        <MagnifyingGlassIcon className="w-5 h-5" />
                    </span>
                    <input
                        type="text"
                        placeholder="Search by branch name or location..."
                        className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-600 outline-none transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                        <FunnelIcon className="w-5 h-5" />
                    </span>
                    <select
                        className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-600 outline-none transition-all appearance-none font-semibold text-gray-700"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="ALL">All Statuses</option>
                        <option value="ACTIVE">Active Only</option>
                        <option value="INACTIVE">Inactive Only</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor font-bold">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>
            </div>

            {message.text && (
                <div className={`p-4 rounded-2xl text-sm border flex items-center justify-between ${message.type === 'success' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                    <span>{message.text}</span>
                    <button onClick={() => setMessage({ text: '', type: '' })} className="ml-4 opacity-50 hover:opacity-100">×</button>
                </div>
            )}

            <section className="bg-white p-2 rounded-3xl shadow-sm border border-gray-100">
                <DataTable 
                    columns={columns} 
                    data={filteredBranches} 
                    loading={loading} 
                />
            </section>

            <BranchModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                branch={selectedBranch}
                onSave={handleSave}
                submitting={submitting}
            />
        </div>
    );
};

export default Branches;
