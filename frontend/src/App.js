import React, { useState } from 'react';

function App() {
  const [design, setDesign] = useState('random');
  const [day, setDay] = useState('');
  const [imageUrl, setImageUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const designOptions = [
    { value: 'random', label: 'Random Design' },
    { value: 'fixed', label: 'Fixed Design by Day' }
  ];

  const days = [
    { value: 'monday', label: 'Monday' },
    { value: 'tuesday', label: 'Tuesday' },
    { value: 'wednesday', label: 'Wednesday' },
    { value: 'thursday', label: 'Thursday' },
    { value: 'friday', label: 'Friday' },
    { value: 'saturday', label: 'Saturday' },
    { value: 'sunday', label: 'Sunday' }
  ];

  const generateImage = async () => {
    setIsLoading(true);
    setImageUrl(null);

    try {
      const params = new URLSearchParams({
        mode: design,
        ...(design === 'fixed' && day ? { day } : {})
      });

      const response = await fetch(`${process.env.REACT_APP_API_URL}/image/quote-image?${params}`, {
        method: 'GET'
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      
      // Construct the full URL for the image
      const fullImageUrl = `${process.env.REACT_APP_API_URL}/images/${data.imageUrl}`;
      setImageUrl(fullImageUrl);
    } catch (error) {
      console.error('Error generating image:', error);
      alert('Failed to generate image');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadImage = async () => {
    if (imageUrl) {
      try {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'thought-of-the-day.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Error downloading image:', error);
        alert('Failed to download image');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 flex items-center justify-center">
      <div className="w-full max-w-6xl">
        {/* Main Container */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
            <h1 className="text-3xl font-bold text-center">Thought of the Day Generator</h1>
            <p className="text-center mt-2 text-blue-100">Create inspiring images with meaningful quotes</p>
          </div>
          
          {/* Content Area - Flexbox for side-by-side on larger screens */}
          <div className="md:flex">
            {/* Form Controls - Left side on larger screens, full width on mobile */}
            <div className="p-6 md:w-1/2">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Design Mode
                  </label>
                  <select 
                    value={design} 
                    onChange={(e) => setDesign(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  >
                    {designOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {design === 'fixed' && (
                  <div className="transition-all">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Day
                    </label>
                    <select 
                      value={day} 
                      onChange={(e) => setDay(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    >
                      <option value="">Select a day</option>
                      {days.map(dayOption => (
                        <option key={dayOption.value} value={dayOption.value}>
                          {dayOption.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <button 
                  onClick={generateImage} 
                  disabled={design === 'fixed' && !day || isLoading}
                  className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-all ${
                    design === 'fixed' && !day || isLoading
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
                  }`}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating...
                    </span>
                  ) : 'Generate Image'}
                </button>
              </div>
            </div>
            
            {/* Image Preview - Right side on larger screens, below on mobile */}
            <div className="p-6 md:w-1/2 flex items-center justify-center bg-gray-50">
              {imageUrl ? (
                <div className="w-full text-center">
                  <div className="relative mb-4 overflow-hidden rounded-lg shadow-lg">
                    <img 
                      src={imageUrl} 
                      alt="Generated Quote" 
                      className="w-full transition-all hover:scale-105 duration-300"
                      onError={(e) => {
                        console.error('Error loading image:', e);
                        alert('Failed to load image');
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-end justify-center p-4">
                      <button 
                        onClick={downloadImage}
                        className="bg-white text-blue-600 py-2 px-4 rounded-lg font-medium shadow-md transform transition-all hover:scale-105"
                      >
                        Download Image
                      </button>
                    </div>
                  </div>
                  <button 
                    onClick={downloadImage}
                    className="bg-green-500 hover:bg-green-600 transition-all text-white py-2 px-6 rounded-lg shadow-md md:hidden"
                  >
                    Download Image
                  </button>
                </div>
              ) : (
                <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-lg w-full">
                  <svg className="mx-auto h-24 w-24 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="mt-4 text-gray-500">
                    {isLoading ? 'Generating your image...' : 'Preview will appear here'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="mt-6 text-center text-gray-500 text-sm">
          <p>Generate beautiful thought-of-the-day images for inspiration and sharing</p>
        </div>
      </div>
    </div>
  );
}

export default App;