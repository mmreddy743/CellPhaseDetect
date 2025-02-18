// src/components/layout/Footer.jsx
import React from 'react';

const Footer = () => {
    return (
        <footer className="bg-gray-800 text-white">
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Contact</h3>
                        <p className="text-gray-300">
                            Department of Oncology<br />
                            University of Wisconsin-Madison<br />
                            Madison, WI 53706
                        </p>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
                        <ul className="space-y-2">
                            <li><a href="#home" className="text-gray-300 hover:text-white">Home</a></li>
                            <li><a href="#research" className="text-gray-300 hover:text-white">Research</a></li>
                            <li><a href="#software" className="text-gray-300 hover:text-white">Software</a></li>
                            <li><a href="#contact" className="text-gray-300 hover:text-white">Contact</a></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
                        <div className="flex space-x-4">
                            <a href="#" className="text-gray-300 hover:text-white">Twitter</a>
                            <a href="#" className="text-gray-300 hover:text-white">GitHub</a>
                        </div>
                    </div>
                </div>
                <div className="mt-8 pt-8 border-t border-gray-700 text-center">
                    <p className="text-gray-300">© 2024 CellCycle Pro. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;