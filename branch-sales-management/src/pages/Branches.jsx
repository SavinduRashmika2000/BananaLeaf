import React, { useState, useEffect } from 'react';
import api from '../services/api';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import { PlusIcon, MapPinIcon, BuildingStorefrontIcon } from '@heroicons/react/24/outline';

const Branches = () => {
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({ name: '', location: '', active: true });
    const [message, setMessage] = useState({ text: '', type: '' });

    const columns = [
        { header: 'ID', accessor: 'id' },
        { header: 'Branch Name', accessor: 'name' },
        { header: 'Location', accessor: 'location' },
        {
            header: 'Status',
            render: (row) => <StatusBadge active={row.active} />
        },
    ];

    const fetchBranches = async () => {
        try {
            setLoading(true);
            const response = await api.get('/branches');
            setBranches(response.data);
        } catch (err) {
            console.error('Error fetching branches:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBranches();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.location) {
            setMessage({ text: 'Please fill in all fields.', type: 'error' });
            return;
        }

        try {
            setSubmitting(true);
            setMessage({ text: '', type: '' });
            await api.post('/branches', formData);
            setMessage({ text: 'Branch added successfully!', type: 'success' });
            setFormData({ name: '', location: '', active: true });
            fetchBranches(); // Refresh list
        } catch (err) {
            console.error('Error adding branch:', err);
            setMessage({ text: 'Failed to add branch. Please try again.', type: 'error' });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">Manage Branches</h2>
            </div>

            {/* Add Branch Form */}
            <section className="bg-white p-6 md:p-8 rounded-2xl shadow-md border border-gray-100">
                <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-green-100 rounded-lg text-green-600">
                        <PlusIcon className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800">Add New Branch</h3>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-600 block">Branch Name</label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                                <BuildingStorefrontIcon className="w-5 h-5" />
                            </span>
                            <input
                                type="text"
                                placeholder="Enter branch name"
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-600 outline-none transition-all"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-600 block">Location</label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                                <MapPinIcon className="w-5 h-5" />
                            </span>
                            <input
                                type="text"
                                placeholder="Enter location"
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-600 outline-none transition-all"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between space-x-4">
                        <div className="flex items-center space-x-3">
                            <span className="text-sm font-medium text-gray-600">Active Status</span>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, active: !formData.active })}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${formData.active ? 'bg-green-600' : 'bg-gray-300'}`}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.active ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className={`flex-1 py-2 px-6 rounded-xl font-semibold text-white transition-all shadow-lg shadow-green-600/20 ${submitting ? 'bg-green-400' : 'bg-green-600 hover:bg-green-700 active:scale-95'}`}
                        >
                            {submitting ? 'Adding...' : 'Add Branch'}
                        </button>
                    </div>
                </form>

                {message.text && (
                    <div className={`mt-4 p-3 rounded-xl text-sm border ${message.type === 'success' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                        {message.text}
                    </div>
                )}
            </section>

            {/* Branch List Table */}
            <section className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">Branch List</h3>
                <DataTable columns={columns} data={branches} loading={loading} />
            </section>
        </div>
    );
};

export default Branches;
