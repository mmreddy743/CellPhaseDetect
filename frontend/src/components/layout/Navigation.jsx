import React, { useState } from 'react';
import '../../styles/globals.css';

const Navigation = () => {
    const [activeDropdown, setActiveDropdown] = useState(null);

    const navItems = {
        'Home': ['About', 'News', 'Events'],
        'Research': ['Overview', 'Projects', 'Publications'],
        'Software': ['Features', 'Download', 'Documentation'],
        'Analysis': ['Upload', 'Results', 'Examples'],
        'Resources': ['Tutorials', 'FAQ', 'Support']
    };

    return (
        <div className="min-h-screen">
            {/* Top Bar */}
            <div className="top-bar">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                            <span>Suzuki Lab</span>
                            <span className="text-gray-300">|</span>
                            <span>UW-Madison</span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <a href="/login" className="top-bar-link">Login</a>
                            <a href="/contact" className="top-bar-link">Contact</a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Navigation */}
            <nav className="bg-white shadow-lg sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        {/* Logo */}
                        <div className="flex-shrink-0 flex items-center">
                            <a href="/" className="text-2xl font-bold text-red-700 hover:text-red-800 transition-colors duration-200">
                                CellCycle Pro
                            </a>
                        </div>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex md:items-center md:space-x-4">
                            {Object.entries(navItems).map(([category, items]) => (
                                <div
                                    key={category}
                                    className="relative"
                                    onMouseEnter={() => setActiveDropdown(category)}
                                    onMouseLeave={() => setActiveDropdown(null)}
                                >
                                    <button className="nav-link inline-flex items-center">
                                        {category}
                                        <svg
                                            className={`ml-2 h-4 w-4 transition-transform duration-200 ${activeDropdown === category ? 'transform rotate-180' : ''
                                                }`}
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    </button>

                                    {activeDropdown === category && (
                                        <div className="nav-dropdown dropdown-animate">
                                            <div className="py-1">
                                                {items.map((item) => (
                                                    <a
                                                        key={item}
                                                        href={`#${item.toLowerCase()}`}
                                                        className="nav-dropdown-item"
                                                    >
                                                        {item}
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Mobile menu button */}
                        <div className="md:hidden flex items-center">
                            <button
                                onClick={() => setActiveDropdown(activeDropdown ? null : 'mobile')}
                                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                            >
                                <span className="sr-only">Open main menu</span>
                                <svg
                                    className={`${activeDropdown ? 'hidden' : 'block'} h-6 w-6`}
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                </svg>
                                <svg
                                    className={`${activeDropdown ? 'block' : 'hidden'} h-6 w-6`}
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile menu */}
                {activeDropdown === 'mobile' && (
                    <div className="md:hidden">
                        {Object.entries(navItems).map(([category, items]) => (
                            <div key={category} className="px-2 pt-2 pb-3 space-y-1">
                                <div className="text-gray-900 font-medium px-3 py-2">{category}</div>
                                {items.map((item) => (
                                    <a
                                        key={item}
                                        href={`#${item.toLowerCase()}`}
                                        className="block px-3 py-2 text-base text-gray-600 hover:bg-red-50 rounded-md"
                                    >
                                        {item}
                                    </a>
                                ))}
                            </div>
                        ))}
                    </div>
                )}
            </nav>
        </div>
    );
};

export default Navigation;