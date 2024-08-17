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
      const paluanCenter = { lat: 13.4341, lng: 120.4603 }; // Coordinates for Paluan
      const map = new google.maps.Map(document.getElementById('map') as HTMLElement, {
        zoom: 12,
        center: paluanCenter,
        mapTypeId: 'roadmap'
      });

      // Define the LatLng coordinates for the polygon's path.
      const paluanCoords = [
        { lat: 13.5055926, lng: 120.3459180 },
        { lat: 13.4989264, lng: 120.3410890 },
        { lat: 13.4940022, lng: 120.3348234 },
        { lat: 13.4931676, lng: 120.3275278 },
        { lat: 13.4871583, lng: 120.3212621 },
        { lat: 13.4807817, lng: 120.3193474 },
        { lat: 13.4777769, lng: 120.3122234 },
        { lat: 13.4711829, lng: 120.3116226 },
        { lat: 13.4526520, lng: 120.3054428 },
        { lat: 13.4512329, lng: 120.3008080 },
        { lat: 13.4427182, lng: 120.2969456 },
        { lat: 13.4301125, lng: 120.3068161 },
        { lat: 13.4187585, lng: 120.3062153 },
        { lat: 13.4162444, lng: 120.3129644 },
        { lat: 13.3778461, lng: 120.3438091 },
        { lat: 13.3818535, lng: 120.3591916 },
        { lat: 13.3708312, lng: 120.3834817 },
        { lat: 13.3756317, lng: 120.3913292 },
        { lat: 13.3861410, lng: 120.3958654 },
        { lat: 13.4096099, lng: 120.3945807 },
        { lat: 13.4138710, lng: 120.4133057 },
        { lat: 13.4228459, lng: 120.4243349 },
        { lat: 13.4260635, lng: 120.4362059 },
        { lat: 13.4209222, lng: 120.4496627 },
        { lat: 13.4132483, lng: 120.4621696 },
        { lat: 13.4086402, lng: 120.4626323 },
        { lat: 13.3999685, lng: 120.4696879 },
        { lat: 13.3980945, lng: 120.4732418 },
        { lat: 13.3958898, lng: 120.4737234 },
        { lat: 13.3930576, lng: 120.4720812 },
        { lat: 13.3902188, lng: 120.4724246 },
        { lat: 13.3886856, lng: 120.4703923 },
        { lat: 13.3855127, lng: 120.4673453 },
        { lat: 13.3797512, lng: 120.4659291 },
        { lat: 13.3748939, lng: 120.4658434 },
        { lat: 13.3669610, lng: 120.4675600 },
        { lat: 13.3630320, lng: 120.4706902 },
        { lat: 13.3599818, lng: 120.4711968 },
        { lat: 13.3565092, lng: 120.4735323 },
        { lat: 13.3390301, lng: 120.4787786 },
        { lat: 13.3192291, lng: 120.4862859 },
        { lat: 13.3152262, lng: 120.4860614 },
        { lat: 13.3062969, lng: 120.4883550 },
        { lat: 13.3003665, lng: 120.4832910 },
        { lat: 13.2998235, lng: 120.4811024 },
        { lat: 13.2976100, lng: 120.4802870 },
        { lat: 13.2953417, lng: 120.4817422 },
        { lat: 13.2920840, lng: 120.4816993 },
        { lat: 13.2918334, lng: 120.4831155 },
        { lat: 13.2862998, lng: 120.4884293 },
        { lat: 13.2848380, lng: 120.4884293 },
        { lat: 13.2805360, lng: 120.4899313 },
        { lat: 13.2803987, lng: 120.4918008 },
        { lat: 13.2702291, lng: 120.5001521 },
        { lat: 13.2642636, lng: 120.5049197 },
        { lat: 13.2645955, lng: 120.5086240 },
        { lat: 13.2658636, lng: 120.5125399 },
        { lat: 13.2679652, lng: 120.5147641 },
        { lat: 13.2683876, lng: 120.5197352 },
        { lat: 13.2648067, lng: 120.5239436 },
        { lat: 13.2598247, lng: 120.5247828 },
        { lat: 13.2548090, lng: 120.5257843 },
        { lat: 13.2496323, lng: 120.5289456 },
        { lat: 13.2506348, lng: 120.5302330 },
        { lat: 13.2497576, lng: 120.5323788 },
        { lat: 13.2500082, lng: 120.5367133 },
        { lat: 13.2526546, lng: 120.5372048 },
        { lat: 13.2541584, lng: 120.5398226 },
        { lat: 13.2562470, lng: 120.5417967 },
        { lat: 13.2544508, lng: 120.5442858 },
        { lat: 13.2562052, lng: 120.5453587 },
        { lat: 13.2588786, lng: 120.5468607 },
        { lat: 13.2597863, lng: 120.5489445 },
        { lat: 13.2943731, lng: 120.6005368 },
        { lat: 13.3788475, lng: 120.5862533 },
        { lat: 13.4544474, lng: 120.5812155 },
        { lat: 13.5035466, lng: 120.5823319 },
        { lat: 13.5117253, lng: 120.5591577 },
        { lat: 13.5055072, lng: 120.5378321 },
        { lat: 13.5128304, lng: 120.5073166 },
        { lat: 13.5066775, lng: 120.4769741 },
        { lat: 13.5213655, lng: 120.4556881 },
        { lat: 13.5326312, lng: 120.4133809 },
        { lat: 13.5224139, lng: 120.3779852 },
        { lat: 13.5055926, lng: 120.3459180 }
      ];

      // Construct the polygon.
      const paluanPolygon = new google.maps.Polygon({
        paths: paluanCoords,
        strokeColor: "#FF0000",
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: "#FF0000",
        fillOpacity: 0.35,
      });

      // Add the polygon to the map.
      paluanPolygon.setMap(map);

      // Add a marker at the center of Paluan
      new google.maps.Marker({
        position: paluanCenter,
        map: map,
        title: 'Paluan, Occidental Mindoro'
      });
    };
  }, []);

  return (
    <div id="map" className="w-full h-screen"></div>
  );
}

export default GoogleMap;
