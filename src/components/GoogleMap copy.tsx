"use client";

import React, { useEffect } from 'react';

const GoogleMap: React.FC = () => {
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap`;
    script.async = true;
    document.head.appendChild(script);

    // Initialize the map after the script has loaded
    (window as any).initMap = () => {
      const mamburao = { lat: 13.4341, lng: 120.4603 };
      const map = new google.maps.Map(document.getElementById('map') as HTMLElement, {
        zoom: 14,
        center: mamburao,
        mapTypeId: 'roadmap'
      });

      new google.maps.Marker({
        position: mamburao,
        map: map,
        title: 'Mamburao, Occidental Mindoro'
      });
    };
  }, []);

  return (
    <div id="map" className="w-full h-screen"></div>
  );
}

export default GoogleMap;
