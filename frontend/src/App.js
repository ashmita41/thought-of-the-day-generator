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
      console.log('Received image URL:', data.imageUrl); // Debug log
      
      // Construct the full URL for the image
      const fullImageUrl = `${process.env.REACT_APP_API_URL}/images/${data.imageUrl}`;
      console.log('Full image URL:', fullImageUrl); // Debug log
      
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
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Thought of the Day Generator</h1>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Design Mode
          </label>
          <select 
            value={design} 
            onChange={(e) => setDesign(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            {designOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {design === 'fixed' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Day
            </label>
            <select 
              value={day} 
              onChange={(e) => setDay(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
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
          disabled={design === 'fixed' && !day}
          className={`w-full py-2 rounded-md text-white ${
            design === 'fixed' && !day 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          {isLoading ? 'Generating...' : 'Generate Image'}
        </button>

        {imageUrl && (
          <div className="mt-6 text-center">
            <img 
              src={imageUrl} 
              alt="Generated Quote" 
              className="mx-auto mb-4 max-w-full rounded-lg shadow-md"
              onError={(e) => {
                console.error('Error loading image:', e);
                alert('Failed to load image');
              }}
            />
            <button 
              onClick={downloadImage}
              className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md"
            >
              Download Image
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;