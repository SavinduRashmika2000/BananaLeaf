import React from 'react';
import DataTable from './DataTable';
import { PencilSquareIcon } from '@heroicons/react/24/outline';

const ProductTable = ({ products, loading, onEdit }) => {
    const columns = [
        { header: 'Product Name', accessor: 'name' },
        {
            header: 'Default Price',
            render: (row) => `Rs.${(row.sellingPrice || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`
        },
        {
            header: 'SKU / Code',
            accessor: 'sku'
        },
        {
            header: 'Actions',
            render: (row) => (
                <button
                    onClick={() => onEdit(row)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit Branch Settings"
                >
                    <PencilSquareIcon className="w-5 h-5" />
                </button>
            )
        }
    ];

    return (
        <section className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
            <DataTable columns={columns} data={products} loading={loading} />
        </section>
    );
};

export default ProductTable;
