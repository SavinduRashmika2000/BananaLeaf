import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
    HomeIcon,
    MapPinIcon,
    Squares2X2Icon,
    ChartBarIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';

const Sidebar = ({ isOpen, toggleSidebar }) => {
    const menuItems = [
        { name: 'Dashboard', path: '/dashboard', icon: HomeIcon },
        { name: 'Branches', path: '/branches', icon: MapPinIcon },
        { name: 'Product Catalogue', path: '/products', icon: Squares2X2Icon },
        { name: 'Sales Report', path: '/sales', icon: ChartBarIcon },
    ];

    const activeStyles = "bg-green-600 text-white shadow-md";
    const inactiveStyles = "text-gray-600 hover:bg-green-50 hover:text-green-600";

    return (
        <>
            {/* Mobile Overlay */}
            <div
                className={`fixed inset-0 bg-black bg-opacity-50 transition-opacity z-40 lg:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={toggleSidebar}
            />

            {/* Sidebar Container */}
            <aside className={`fixed top-0 left-0 h-full bg-white shadow-xl z-50 transition-all duration-300 transform ${isOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0 lg:w-20'} overflow-hidden`}>
                <div className="flex flex-col h-full">
                    {/* Logo Section */}
                    <div className="flex items-center justify-between px-6 py-6 border-b border-gray-100 h-24">
                        <div className={`flex items-center space-x-3 overflow-hidden ${!isOpen && 'lg:justify-center lg:w-full lg:space-x-0'}`}>
                            <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center flex-shrink-0">
                                <Squares2X2Icon className="w-6 h-6 text-white" />
                            </div>
                            <span className={`text-xl font-bold text-gray-800 whitespace-nowrap transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'lg:opacity-0 lg:w-0'}`}>
                                BranchSales
                            </span>
                        </div>
                        <button
                            onClick={toggleSidebar}
                            className="lg:hidden text-gray-500 hover:text-green-600 transition-colors"
                        >
                            <XMarkIcon className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Navigation Items */}
                    <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                        {menuItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) =>
                                    `flex items-center p-3 rounded-xl transition-all duration-200 group ${isActive ? activeStyles : inactiveStyles} ${!isOpen && 'lg:justify-center'}`
                                }
                            >
                                <item.icon className={`w-6 h-6 flex-shrink-0 ${!isOpen && 'lg:mx-auto'}`} />
                                <span className={`ml-3 font-medium transition-all duration-200 ${isOpen ? 'opacity-100 w-auto' : 'lg:opacity-0 lg:w-0 overflow-hidden'}`}>
                                    {item.name}
                                </span>

                                {/* Tooltip for collapsed mode */}
                                {!isOpen && (
                                    <div className="absolute left-20 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity hidden lg:block whitespace-nowrap z-50">
                                        {item.name}
                                    </div>
                                )}
                            </NavLink>
                        ))}
                    </nav>

                    {/* User Section (Optional) */}
                    <div className={`p-4 border-t border-gray-100 transition-all duration-200 ${!isOpen && 'lg:items-center'}`}>
                        <div className={`flex items-center ${!isOpen && 'lg:justify-center'}`}>
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden border-2 border-green-600">
                                <img src="https://ui-avatars.com/api/?name=Admin&background=16a34a&color=fff" alt="User" />
                            </div>
                            <div className={`ml-3 transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'lg:opacity-0 lg:w-0 hide overflow-hidden'}`}>
                                <p className="text-sm font-semibold text-gray-800">Admin User</p>
                                <p className="text-xs text-gray-500">Super Admin</p>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
