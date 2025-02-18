import React from 'react';
import TopBar from './components/layout/TopBar';
import Navigation from './components/layout/Navigation';
import Hero from './components/sections/Hero';
import Features from './components/sections/Features';
import UploadSection, { AnalysisProvider } from './components/analysis/UploadSection';
import AnalysisResults from './components/analysis/AnalysisResults';
import Contact from './components/sections/Contact';
import Footer from './components/layout/Footer';
import ImageSlider from './components/ui/ImageSlider';
import './styles/globals.css';

const App = () => {
    return (
        <AnalysisProvider>
            <div className="min-h-screen bg-gray-50">
                <TopBar />
                <Navigation />
                <main>
                    <Hero />
                    <ImageSlider />
                    <Features />
                    <div className="bg-white">
                        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
                            <div className="space-y-12">
                                {/* Analysis Section */}
                                <div className="space-y-8">
                                    <UploadSection />
                                    <AnalysisResults />
                                </div>
                            </div>
                        </div>
                    </div>
                    <Contact />
                </main>
                <Footer />
            </div>
        </AnalysisProvider>
    );
};

export default App;