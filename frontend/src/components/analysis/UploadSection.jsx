import React, { useState, createContext, useContext } from 'react';
import { Upload, FileUp } from 'lucide-react';

// Create context with proper TypeScript-like interface
export const AnalysisContext = createContext({
    analysisResults: null,
    setAnalysisResults: (results) => { },
    analysisStatus: 'idle',
    setAnalysisStatus: (status) => { }
});

export const AnalysisProvider = ({ children }) => {
    const [analysisResults, setAnalysisResults] = useState(null);
    const [analysisStatus, setAnalysisStatus] = useState('idle');

    return (
        <AnalysisContext.Provider value={{
            analysisResults,
            setAnalysisResults,
            analysisStatus,
            setAnalysisStatus
        }}>
            {children}
        </AnalysisContext.Provider>
    );
};

const UploadSection = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [error, setError] = useState(null);
    const { setAnalysisResults, setAnalysisStatus } = useContext(AnalysisContext);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (!file) {
            setSelectedFile(null);
            return;
        }

        if (!file.name.toLowerCase().endsWith('.nd2')) {
            setError('Please upload an ND2 file');
            setSelectedFile(null);
            event.target.value = null;
            return;
        }

        setSelectedFile(file);
        setError(null);
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        setAnalysisStatus('uploading');
        setError(null);

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const response = await fetch('http://localhost:5000/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Upload failed: ${response.statusText}`);
            }

            const data = await response.json();

            // Update URLs to include the base API URL
            const results = {
                ...data,
                visualization_url: `http://localhost:5000${data.visualization_url}`,
                measurements_url: `http://localhost:5000${data.measurements_url}`
            };

            setAnalysisResults(results);
            setAnalysisStatus('complete');
            setSelectedFile(null);

        } catch (error) {
            console.error('Error:', error);
            setError(error.message);
            setAnalysisStatus('error');
            setAnalysisResults(null);
        }
    };

    return (
        <section id="upload" className="py-12 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h2 className="text-base text-red-700 font-semibold tracking-wide uppercase">Analysis</h2>
                    <p className="mt-2 text-3xl leading-8 font-extrabold text-gray-900 sm:text-4xl">
                        Upload and Process Your Images
                    </p>
                </div>

                <div className="mt-10 max-w-xl mx-auto">
                    <div className="bg-gray-50 p-8 rounded-lg shadow">
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Upload ND2 File
                                </label>
                                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-red-500 transition-colors">
                                    <div className="space-y-1 text-center">
                                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                        <div className="flex text-sm text-gray-600">
                                            <label className="relative cursor-pointer bg-white rounded-md font-medium text-red-700 hover:text-red-600">
                                                <span>Upload a file</span>
                                                <input
                                                    type="file"
                                                    className="sr-only"
                                                    accept=".nd2"
                                                    onChange={handleFileChange}
                                                />
                                            </label>
                                        </div>
                                        <p className="text-xs text-gray-500">
                                            ND2 files only
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {error && (
                                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                                    {error}
                                </div>
                            )}

                            {selectedFile && (
                                <div className="text-sm text-gray-600 bg-gray-100 p-3 rounded-md">
                                    <div className="flex items-center space-x-2">
                                        <FileUp className="h-4 w-4" />
                                        <span>Selected: {selectedFile.name}</span>
                                    </div>
                                    <div className="mt-1 text-xs text-gray-500">
                                        Size: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={handleUpload}
                                disabled={!selectedFile}
                                className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
                                    ${!selectedFile
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-red-700 hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
                                    }`}
                            >
                                Analyze Image
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default UploadSection;