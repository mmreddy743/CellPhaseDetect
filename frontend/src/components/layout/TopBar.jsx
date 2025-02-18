// src/components/layout/TopBar.jsx
import React from 'react';

const TopBar = () => {
    return (
        <div className="bg-red-700 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-10">
                    <div className="flex items-center space-x-4">
                        <span className="text-sm">Department of Oncology</span>
                        <span className="text-sm">|</span>
                        <span className="text-sm">UW-Madison</span>
                    </div>
                    <div className="flex items-center space-x-4">
                        <a href="#login" className="text-sm hover:text-gray-200">Login</a>
                        <a href="#contact" className="text-sm hover:text-gray-200">Contact</a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TopBar;