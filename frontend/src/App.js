import React, { useState } from 'react';

function App() {
  const [design, setDesign] = useState('random');
  const [day, setDay] = useState('');
  const [imageUrl, setImageUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [contentType, setContentType] = useState('thought'); // 'thought' or 'word'

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

  const contentTypes = [
    { value: 'thought', label: 'Thought of the Day' },
    { value: 'word', label: 'Word of the Day' }
  ];

  const generateImage = async () => {
    setIsLoading(true);
    setImageUrl(null);

    try {
      const params = new URLSearchParams({
        mode: design,
        ...(design === 'fixed' && day ? { day } : {})
      });

      // Use the appropriate endpoint based on content type
      const endpoint = contentType === 'thought' ? 'quote-image' : 'word-image';
      console.log(`Calling API endpoint: ${process.env.REACT_APP_API_URL}/image/${endpoint}?${params}`);
      
      const response = await fetch(`${process.env.REACT_APP_API_URL}/image/${endpoint}?${params}`, {
        method: 'GET'
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', response.status, errorText);
        throw new Error(`Network response was not ok: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      console.log('API Response data:', data);
      
      // Construct the full URL for the image
      // Remove any leading slash from data.imageUrl to prevent double slash
      const imageUrlPath = data.imageUrl.startsWith('/') ? data.imageUrl.substring(1) : data.imageUrl;
      const fullImageUrl = `${process.env.REACT_APP_API_URL}/${imageUrlPath}`;
      console.log('Full image URL:', fullImageUrl);
      setImageUrl(fullImageUrl);
    } catch (error) {
      console.error('Error generating image:', error);
      alert(`Failed to generate image: ${error.message}`);
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
        const filename = contentType === 'thought' ? 'thought-of-the-day.png' : 'word-of-the-day.png';
        link.download = filename;
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

  // Get app title based on content type
  const getAppTitle = () => {
    return contentType === 'thought' 
      ? 'Thought of the Day Generator' 
      : 'Word of the Day Generator';
  };
  
  // Get app description based on content type
  const getAppDescription = () => {
    return contentType === 'thought'
      ? 'Create inspiring images with meaningful quotes'
      : 'Create educational images with interesting words';
  };

  // Get features list based on content type
  const getFeaturesList = () => {
    if (contentType === 'thought') {
      return [
        'Unique quotes from public APIs',
        'Dynamic background styles based on design configuration',
        'Auto-sizing text with intelligent wrapping for optimal readability',
        'Multiple font styles, layouts, and colors for variation',
        'Post-ready 1:1 ratio images (1080×1080px)',
        'One-click download for easy sharing'
      ];
    } else {
      return [
        'Interesting vocabulary words with pronunciation',
        'Clear definitions and usage examples',
        'Educational content for language learning',
        'Dynamic background styles based on design configuration',
        'Post-ready 1:1 ratio images (1080×1080px)',
        'One-click download for easy sharing'
      ];
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 flex items-center justify-center">
      <div className="w-full max-w-6xl">
        {/* Main Container */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
            <h1 className="text-3xl font-bold text-center">{getAppTitle()}</h1>
            <p className="text-center mt-2 text-blue-100">{getAppDescription()}</p>
          </div>
          
          {/* Content Area - Flexbox for side-by-side on larger screens */}
          <div className="md:flex">
            {/* Form Controls - Left side on larger screens, full width on mobile */}
            <div className="p-6 md:w-1/2">
              <div className="space-y-6">
                {/* Content Type Toggle */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content Type
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    {contentTypes.map(type => (
                      <button
                        key={type.value}
                        onClick={() => setContentType(type.value)}
                        className={`py-3 px-4 rounded-lg font-medium transition-all ${
                          contentType === type.value
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

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
                  <p className="mt-1 text-sm text-gray-500">
                    {design === 'random' 
                      ? 'Randomly selects from available design configurations' 
                      : 'Each day of the week has a predefined design configuration'}
                  </p>
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
                  disabled={(design === 'fixed' && !day) || isLoading}
                  className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-all ${
                    (design === 'fixed' && !day) || isLoading
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
                  ) : `Generate ${contentType === 'thought' ? 'Thought' : 'Word'} Image`}
                </button>
              </div>
              
              {/* Features section */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Features</h3>
                <ul className="space-y-3">
                  {getFeaturesList().map((feature, index) => (
                    <li key={index} className="flex items-start text-gray-600">
                      <svg className="h-5 w-5 mr-2 text-green-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            {/* Image Preview - Right side on larger screens, below on mobile */}
            <div className="p-6 md:w-1/2 flex flex-col items-center justify-center bg-gray-50">
              {/* Instagram-sized preview canvas (1:1 ratio) */}
              <div className="w-full max-w-md aspect-square bg-white rounded-lg overflow-hidden shadow-lg flex items-center justify-center border border-gray-200">
                {imageUrl ? (
                  <img 
                    src={imageUrl} 
                    alt={contentType === 'thought' ? "Thought of the Day" : "Word of the Day"} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error('Error loading image:', e);
                      alert(`Failed to load image: ${imageUrl}`);
                      setImageUrl(null);
                    }}
                  />
                ) : (
                  <div className="text-center p-6">
                    <div className="w-32 h-32 mx-auto text-blue-200">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="mt-4 text-gray-500">Click "Generate {contentType === 'thought' ? 'Thought' : 'Word'} Image" to create your image</p>
                  </div>
                )}
              </div>
              
              {/* Download button appears when image is generated */}
              {imageUrl && (
                <button 
                  onClick={downloadImage}
                  className="mt-6 py-3 px-6 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all flex items-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download Image
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;