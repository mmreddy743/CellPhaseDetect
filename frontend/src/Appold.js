import React, { useState, useEffect } from 'react';
import {
  BarChart2, Users, FileText, Mail, Menu, X, ChevronRight,
  ChevronDown, Github
} from 'lucide-react';

// Top Navigation Bar
const TopBar = () => (
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

// Main Navigation Component with Dropdown
const Navigation = ({ isOpen, setIsOpen }) => {
  const [activeDropdown, setActiveDropdown] = useState(null);

  const navItems = {
    'Home': ['About', 'News', 'Events'],
    'Research': ['Overview', 'Projects', 'Publications'],
    'Software': ['Features', 'Download', 'Documentation'],
    'Analysis': ['Upload', 'Results', 'Examples'],
    'Resources': ['Tutorials', 'FAQ', 'Support']
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-red-700">CellCycle Pro</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            {Object.entries(navItems).map(([category, items]) => (
              <div
                key={category}
                className="relative"
                onMouseEnter={() => setActiveDropdown(category)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button className="text-gray-700 hover:text-red-700 px-3 py-2 flex items-center">
                  {category}
                  <ChevronDown className="ml-1 h-4 w-4" />
                </button>

                {activeDropdown === category && (
                  <div className="absolute z-50 left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                    <div className="py-1">
                      {items.map((item) => (
                        <a
                          key={item}
                          href={`#${item.toLowerCase()}`}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-red-50"
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
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden">
          {Object.entries(navItems).map(([category, items]) => (
            <div key={category} className="px-2 pt-2 pb-3 space-y-1">
              <div className="font-medium text-gray-900 px-3 py-2">{category}</div>
              {items.map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="block px-3 py-2 text-base text-gray-600 hover:bg-red-50"
                >
                  {item}
                </a>
              ))}
            </div>
          ))}
        </div>
      )}
    </nav>
  );
};

// Image Slider Component
const ImageSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const images = [
    { src: "/api/placeholder/800/400", alt: "Analysis Example 1" },
    { src: "/api/placeholder/800/400", alt: "Analysis Example 2" },
    { src: "/api/placeholder/800/400", alt: "Analysis Example 3" }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative overflow-hidden h-96">
      <div
        className="flex transition-transform duration-500 h-full"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {images.map((image, index) => (
          <div key={index} className="w-full flex-shrink-0">
            <img
              src={image.src}
              alt={image.alt}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

// Section Components
const SectionHeader = ({ title, subtitle }) => (
  <div className="text-center mb-12">
    <h2 className="text-base text-red-700 font-semibold tracking-wide uppercase">{title}</h2>
    <p className="mt-2 text-3xl font-extrabold text-gray-900">{subtitle}</p>
  </div>
);

const FeatureCard = ({ icon: Icon, title, description }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-center mb-4">
      <div className="flex-shrink-0 bg-red-700 rounded-md p-3">
        <Icon className="h-6 w-6 text-white" />
      </div>
      <h3 className="ml-4 text-lg font-medium text-gray-900">{title}</h3>
    </div>
    <p className="text-gray-500">{description}</p>
  </div>
);

// Main Sections
const Hero = () => (
  <div className="relative bg-gray-50 pt-16 pb-20 px-4 sm:px-6 lg:pt-24 lg:pb-28 lg:px-8">
    <div className="relative max-w-7xl mx-auto">
      <div className="text-center">
        <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
          <span className="block">Advanced Cell Cycle</span>
          <span className="block text-red-700">Analysis Software</span>
        </h1>
        <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
          A comprehensive microscopy image analysis pipeline developed at the University of Wisconsin-Madison
        </p>
        <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
          <div className="rounded-md shadow">
            <a href="#download" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-red-700 hover:bg-red-800 md:py-4 md:text-lg md:px-10">
              Get Started
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const Features = () => (
  <section id="features" className="py-12 bg-white">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <SectionHeader
        title="Features"
        subtitle="Advanced Analysis Capabilities"
      />
      <div className="mt-10 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <FeatureCard
          icon={BarChart2}
          title="Multi-Channel Processing"
          description="Advanced fluorescence channel processing with Z-stack support"
        />
        <FeatureCard
          icon={Users}
          title="Automated Analysis"
          description="Intelligent segmentation and feature measurement"
        />
        <FeatureCard
          icon={Github}
          title="Open Source"
          description="Fully open source with active community development"
        />
      </div>
    </div>
  </section>
);

const Documentation = () => (
  <section id="documentation" className="py-12 bg-gray-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <SectionHeader
        title="Documentation"
        subtitle="Get Started with CellCycle Pro"
      />
      <div className="mt-10 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Start Guide</h3>
          <ul className="space-y-3 text-gray-500">
            <li>Installation and setup</li>
            <li>Basic usage tutorial</li>
            <li>Example workflows</li>
          </ul>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">API Documentation</h3>
          <ul className="space-y-3 text-gray-500">
            <li>Function reference</li>
            <li>Class documentation</li>
            <li>Integration guides</li>
          </ul>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Examples & Tutorials</h3>
          <ul className="space-y-3 text-gray-500">
            <li>Video tutorials</li>
            <li>Example notebooks</li>
            <li>Sample datasets</li>
          </ul>
        </div>
      </div>
    </div>
  </section>
);

const Results = () => (
  <section id="results" className="py-12 bg-white">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <SectionHeader
        title="Results"
        subtitle="Analysis Examples"
      />
      <ImageSlider />
    </div>
  </section>
);

const Team = () => (
  <section id="team" className="py-12 bg-gray-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <SectionHeader
        title="Team"
        subtitle="Meet Our Contributors"
      />
      <div className="mt-10 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {/* Add team member cards here */}
      </div>
    </div>
  </section>
);

const Contact = () => (
  <section id="contact" className="py-12 bg-white">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <SectionHeader
        title="Contact"
        subtitle="Get in Touch"
      />
      <div className="mt-10 max-w-lg mx-auto">
        <div className="bg-gray-50 rounded-lg p-6">
          <p className="text-gray-700 flex items-center">
            <Mail className="h-5 w-5 mr-2 text-red-700" />
            email@wisc.edu
          </p>
          <p className="mt-4 text-gray-700">
            Department of Oncology<br />
            University of Wisconsin-Madison<br />
            Madison, WI 53706
          </p>
        </div>
      </div>
    </div>
  </section>
);

// Main App Component
// Upload and Analysis Section
const UploadSection = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type === "image/tiff") {
      setSelectedFile(file);
    } else {
      alert("Please upload a TIFF file");
    }
  };

  const handleAnalyze = () => {
    if (selectedFile) {
      setAnalyzing(true);
      // Add your analysis logic here
      setTimeout(() => {
        setAnalyzing(false);
      }, 2000);
    }
  };

  return (
    <section id="upload" className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="Analysis"
          subtitle="Upload and Process Your Images"
        />
        <div className="mt-10 max-w-xl mx-auto">
          <div className="bg-gray-50 p-8 rounded-lg shadow">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Upload Image (.tiff format)
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <FileText className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label className="relative cursor-pointer bg-white rounded-md font-medium text-red-700 hover:text-red-600">
                        <span>Upload a file</span>
                        <input
                          type="file"
                          className="sr-only"
                          accept=".tiff"
                          onChange={handleFileChange}
                        />
                      </label>
                    </div>
                    <p className="text-xs text-gray-500">
                      TIFF files only
                    </p>
                  </div>
                </div>
              </div>
              {selectedFile && (
                <div className="text-sm text-gray-600">
                  Selected: {selectedFile.name}
                </div>
              )}
              <button
                onClick={handleAnalyze}
                disabled={!selectedFile || analyzing}
                className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
                  ${!selectedFile || analyzing ? 'bg-gray-400' : 'bg-red-700 hover:bg-red-800'}`}
              >
                {analyzing ? 'Analyzing...' : 'Analyze Image'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Analysis Results Section
const AnalysisResults = () => {
  return (
    <section id="analysis-results" className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="Results"
          subtitle="Analysis Output"
        />
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {/* Cell Metrics */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Cell Metrics</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Total Cells</p>
                  <p className="text-2xl font-semibold text-gray-900">157</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Average Size</p>
                  <p className="text-2xl font-semibold text-gray-900">245 μm²</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Cell Density</p>
                  <p className="text-2xl font-semibold text-gray-900">0.42/mm²</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Viability</p>
                  <p className="text-2xl font-semibold text-gray-900">94.2%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Cell Cycle Distribution */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Cell Cycle Distribution</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">G1 Phase</p>
                  <p className="text-2xl font-semibold text-gray-900">45%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">S Phase</p>
                  <p className="text-2xl font-semibold text-gray-900">32%</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">G2 Phase</p>
                  <p className="text-2xl font-semibold text-gray-900">18%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">M Phase</p>
                  <p className="text-2xl font-semibold text-gray-900">5%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Processing Details */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Processing Details</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>Image Resolution: 1024 x 1024 pixels</p>
              <p>Channels Processed: DAPI, GFP</p>
              <p>Processing Time: 3.2 seconds</p>
              <p>Algorithm Version: 2.1.0</p>
            </div>
          </div>

          {/* Export Options */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Export Options</h3>
            <div className="space-y-4">
              <button className="w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">
                Download Full Report (PDF)
              </button>
              <button className="w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">
                Export Raw Data (CSV)
              </button>
              <button className="w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">
                Save Processed Images
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const App = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar />
      <Navigation isOpen={isMenuOpen} setIsOpen={setIsMenuOpen} />
      <Hero />
      <Features />
      <Documentation />
      <UploadSection />
      <AnalysisResults />
      <Results />
      <Team />
      <Contact />
    </div>
  );
};

export default App;