'use client';

import { useState } from 'react';

const UploadPage = () => {
  const [loading, setLoading] = useState(false);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const formData = new FormData();
      formData.append('file', event.target.files[0]);

      setLoading(true);

      try {
        const response = await fetch('/api/convert', {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          throw new Error('Failed to convert GeoJSON');
        }

        // Create a link element, set its href to the URL of the converted file, and simulate a click
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'converted.geojson';
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Upload GeoJSON File</h1>
      <input 
        type="file" 
        accept=".geojson" 
        onChange={handleFileChange}
        className="mb-4"
      />
      {loading && <p>Loading...</p>}
    </div>
  );
};

export default UploadPage;
