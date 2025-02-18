import React, { useContext, useState } from 'react';
import { Download, Image as ImageIcon, Table, AlertCircle, Loader } from 'lucide-react';
import { AnalysisContext } from './UploadSection';

const AnalysisResults = () => {
    const { analysisResults, analysisStatus } = useContext(AnalysisContext);
    const [downloadError, setDownloadError] = useState(null);

    const downloadData = async () => {
        if (!analysisResults?.measurements_url) return;
        try {
            setDownloadError(null);
            const response = await fetch(analysisResults.measurements_url);
            if (!response.ok) throw new Error('Download failed');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'cell_measurements.csv';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Download failed:', error);
            setDownloadError('Failed to download measurements. Please try again.');
        }
    };

    if (analysisStatus === 'idle') return null;

    if (analysisStatus === 'uploading') {
        return (
            <section className="py-12 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-center">
                        <Loader className="animate-spin h-6 w-6 text-red-700 mr-2" />
                        <p className="text-lg text-gray-600">Processing image...</p>
                    </div>
                </div>
            </section>
        );
    }

    if (analysisStatus === 'error' || !analysisResults) {
        return (
            <section className="py-12 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-center text-red-600">
                        <AlertCircle className="h-6 w-6 mr-2" />
                        <p>Error processing image. Please try again.</p>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section id="analysis-results" className="py-12 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center">
                    <h2 className="text-base text-red-700 font-semibold tracking-wide uppercase">Results</h2>
                    <p className="mt-2 text-3xl leading-8 font-extrabold text-gray-900 sm:text-4xl">
                        Analysis Output
                    </p>
                </div>

                <div className="mt-10 grid gap-6 lg:grid-cols-2">
                    {/* Cell Metrics */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Cell Metrics</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-500">Total Nuclei</p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {analysisResults.nuclei_count}
                                </p>
                            </div>
                            {analysisResults.channel_data?.DAPI && (
                                <>
                                    <div>
                                        <p className="text-sm text-gray-500">Mean Intensity</p>
                                        <p className="text-2xl font-semibold text-gray-900">
                                            {analysisResults.channel_data.DAPI.mean_intensity.toFixed(2)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Std Deviation</p>
                                        <p className="text-2xl font-semibold text-gray-900">
                                            {analysisResults.channel_data.DAPI.std_intensity.toFixed(2)}
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Channel Analysis */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Channel Analysis</h3>
                        <div className="space-y-4">
                            {Object.entries(analysisResults.channel_data || {}).map(([channel, data]) => (
                                <div key={channel} className="border-b pb-4 last:border-b-0">
                                    <p className="text-sm font-medium text-gray-900">{channel}</p>
                                    <div className="grid grid-cols-3 gap-4 mt-2">
                                        <div>
                                            <p className="text-xs text-gray-500">Mean</p>
                                            <p className="text-sm font-semibold">{data.mean_intensity.toFixed(2)}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Max</p>
                                            <p className="text-sm font-semibold">{data.max_intensity.toFixed(2)}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Min</p>
                                            <p className="text-sm font-semibold">{data.min_intensity.toFixed(2)}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Visualization */}
                    <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Visualization</h3>
                        <div className="rounded-lg overflow-hidden">
                            <img
                                src={analysisResults.visualization_url}
                                alt="Analysis visualization"
                                className="w-full h-auto"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = 'placeholder.png';
                                }}
                            />
                        </div>
                    </div>

                    {/* Export Options */}
                    <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Export Options</h3>

                        {downloadError && (
                            <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded-md">
                                {downloadError}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button
                                onClick={downloadData}
                                className="flex items-center justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                                <Table className="h-4 w-4 mr-2" />
                                Export Measurements (CSV)
                            </button>
                            <a
                                href={analysisResults.visualization_url}
                                download="analysis_visualization.png"
                                className="flex items-center justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                                <ImageIcon className="h-4 w-4 mr-2" />
                                Download Visualization
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AnalysisResults;