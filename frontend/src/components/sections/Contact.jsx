import React from 'react';
import { Mail, Phone, MapPin, Globe } from 'lucide-react';

const Contact = () => {
    return (
        <section id="contact" className="py-12 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h2 className="text-base text-red-700 font-semibold tracking-wide uppercase">Contact</h2>
                    <p className="mt-2 text-3xl leading-8 font-extrabold text-gray-900 sm:text-4xl">
                        Get in Touch
                    </p>
                </div>
                <div className="mt-10 max-w-xl mx-auto">
                    <div className="bg-gray-50 rounded-lg p-8">
                        <div className="mb-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-1">
                                Aussie Suzuki, PhD
                            </h3>
                            <p className="text-gray-700 font-medium">
                                Assistant Professor
                            </p>
                            <p className="text-gray-700">
                                Department of Oncology
                            </p>
                            <p className="text-gray-700">
                                McArdle Laboratory for Cancer Research
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center">
                                <Mail className="h-5 w-5 text-red-700 mr-3 flex-shrink-0" />
                                <a href="mailto:aussie.suzuki@wisc.edu"
                                    className="text-gray-700 hover:text-red-700">
                                    aussie.suzuki@wisc.edu
                                </a>
                            </div>

                            <div className="flex items-center">
                                <Phone className="h-5 w-5 text-red-700 mr-3 flex-shrink-0" />
                                <a href="tel:608-262-1686"
                                    className="text-gray-700 hover:text-red-700">
                                    (608) 262-1686
                                </a>
                            </div>

                            <div className="flex items-start">
                                <MapPin className="h-5 w-5 text-red-700 mr-3 flex-shrink-0 mt-1" />
                                <div className="text-gray-700">
                                    6533 Wisconsin Institutes for Medical Research II
                                    <br />
                                    1111 Highland Ave
                                    <br />
                                    Madison, WI 53705
                                </div>
                            </div>

                            <div className="flex items-center">
                                <Globe className="h-5 w-5 text-red-700 mr-3 flex-shrink-0" />
                                <a href="#"
                                    className="text-gray-700 hover:text-red-700">
                                    Suzuki Lab Website
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Contact;