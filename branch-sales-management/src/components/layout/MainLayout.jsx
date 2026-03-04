import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Bars3Icon } from '@heroicons/react/24/outline';

const MainLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <div className="flex h-screen bg-gray-100 font-sans text-gray-900 overflow-hidden">
            {/* Sidebar */}
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

            {/* Main Content Area */}
            <div className={`flex flex-col flex-1 min-w-0 transition-all duration-300 ${isSidebarOpen ? 'lg:ml-72' : 'lg:ml-20'}`}>

                {/* Header / Top bar area */}
                <header className="h-20 flex items-center px-4 md:px-8 bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-30">
                    <button
                        onClick={toggleSidebar}
                        className="p-2 rounded-lg text-gray-600 hover:bg-green-50 hover:text-green-600 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500/20"
                    >
                        <Bars3Icon className="w-7 h-7" />
                    </button>

                    <div className="ml-6">
                        <h1 className="text-xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
                            Branch Sales Portal
                        </h1>
                    </div>
                </header>

                {/* Dynamic Page Content */}
                <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>

                {/* Footer */}
                <footer className="py-4 px-8 bg-white border-t border-gray-200 text-center text-sm text-gray-500">
                    &copy; {new Date().getFullYear()} Branch Sales Management System. All Rights Reserved.
                </footer>
            </div>
        </div>
    );
};

export default MainLayout;
