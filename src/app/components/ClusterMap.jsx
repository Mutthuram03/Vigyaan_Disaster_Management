'use client';

import { GoogleMap } from '@react-google-maps/api';
import { MarkerClusterer } from '@googlemaps/markerclusterer';
import { useEffect, useRef } from 'react';

const containerStyle = {
  width: '100%',
  height: '420px',
  borderRadius: '12px',
  overflow: 'hidden',
};

const center = {
  lat: 20.5937,
  lng: 78.9629,
};

const darkModeMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#1d2c4d' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8ec3b9' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1a3646' }] },
  { featureType: 'administrative.country', elementType: 'geometry.stroke', stylers: [{ color: '#4b6878' }] },
  { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#0e1626' }] },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#6f9ba5' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#304a7d' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#2c6675' }] },
  { featureType: 'transit', elementType: 'labels.text.fill', stylers: [{ color: '#98a5be' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0e1626' }] },
];

export default function ClusterMap({
  disasters,
  getEmojiIcon,
  userLocation,
  radiusKm,
  proximityMode,
  darkMode,
  mapRef,
  showHistory
}) {
  const clustererRef = useRef(null);
  const infoWindowRef = useRef(null);
  const directionsRendererRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current || !window.google) return;

    // Clear previous markers and directions
    if (clustererRef.current) clustererRef.current.clearMarkers();
    if (directionsRendererRef.current) directionsRendererRef.current.setDirections({ routes: [] });

    const infoWindow = infoWindowRef.current || new window.google.maps.InfoWindow();
    infoWindowRef.current = infoWindow;

    const markers = disasters
      .filter(d => !isNaN(d.lat) && !isNaN(d.lng))
      .map(d => {
        // Create different styling for historical vs live events
        const isHistorical = d.isHistorical;
        const opacity = isHistorical ? 0.6 : 1.0;
        const zIndex = isHistorical ? 1 : 2;
        
        const marker = new window.google.maps.Marker({
          position: { lat: d.lat, lng: d.lng },
          icon: getEmojiIcon(d.type),
          opacity: opacity,
          zIndex: zIndex,
        });

        const formatDate = (dateString) => {
          try {
            return new Date(dateString).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });
          } catch {
            return 'Unknown date';
          }
        };

        const getSeverityColor = (severity) => {
          switch(severity?.toLowerCase()) {
            case 'red': return '#ff4444';
            case 'orange': return '#ff8800';
            case 'yellow': return '#ffcc00';
            case 'green': return '#00cc44';
            default: return '#666666';
          }
        };

        const content = `
          <div style="font-size:13px; max-width:280px; padding: 8px;">
            <div style="display: flex; align-items: center; margin-bottom: 8px;">
              <span style="font-size: 20px; margin-right: 8px;">${getEmojiIcon(d.type)?.url ? '🗺️' : '📍'}</span>
              <strong style="color: ${isHistorical ? '#FF9800' : '#4CAF50'}">${d.name}</strong>
              ${isHistorical ? '<span style="color: #FF9800; margin-left: 4px;">(Historical)</span>' : ''}
            </div>
            <div style="margin-bottom: 6px;">
              <strong>Type:</strong> ${d.type}<br/>
              <strong>Country:</strong> ${d.country}<br/>
              ${d.state ? `<strong>State:</strong> ${d.state}<br/>` : ''}
              <strong>Started:</strong> ${formatDate(d.date)}<br/>
              <strong>Duration:</strong> ${formatDuration(d.date, d.toDate)}<br/>
              ${d.severity !== 'Unknown' ? `<strong>Severity:</strong> <span style="color: ${getSeverityColor(d.severity)}">${d.severity}</span><br/>` : ''}
              ${d.alertlevel !== 'Unknown' ? `<strong>Alert Level:</strong> ${d.alertlevel}<br/>` : ''}
            </div>
            <div style="font-size: 11px; color: #666; border-top: 1px solid #eee; padding-top: 6px;">
              Coordinates: ${d.lat.toFixed(4)}, ${d.lng.toFixed(4)}
            </div>
          </div>
        `;

        marker.addListener('click', () => {
          infoWindow.setContent(content);
          infoWindow.open(mapRef.current, marker);
        });

        return marker;
      });

    clustererRef.current = new MarkerClusterer({ 
      map: mapRef.current, 
      markers,
      renderer: {
        render: ({ count, position }) => {
          const isHistoricalCluster = markers.some(m => m.opacity === 0.6);
          const color = isHistoricalCluster ? '#FF9800' : '#4CAF50';
          
          return new window.google.maps.Marker({
            position,
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 20,
              fillColor: color,
              fillOpacity: 0.8,
              strokeColor: '#fff',
              strokeWeight: 2,
            },
            label: {
              text: count.toString(),
              color: '#fff',
              fontSize: '14px',
              fontWeight: 'bold',
            },
            zIndex: 3,
          });
        }
      }
    });

    return () => {
      clustererRef.current?.clearMarkers();
      infoWindow.close();
      if (directionsRendererRef.current) {
        directionsRendererRef.current.setDirections({ routes: [] });
      }
    };
  }, [disasters, getEmojiIcon, showHistory]);

  const formatDuration = (start, end) => {
    const diff = new Date(end) - new Date(start);
    if (diff <= 0) return 'Ongoing';

    const mins = Math.floor(diff / 60000);
    const hrs = Math.floor(mins / 60);
    const days = Math.floor(hrs / 24);

    if (days > 0) return `${days} days`;
    if (hrs > 0) return `${hrs} hours`;
    return `${mins} minutes`;
  };

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={3}
      onLoad={(map) => { 
        mapRef.current = map;
        // Initialize directions renderer
        directionsRendererRef.current = new window.google.maps.DirectionsRenderer({
          map: map,
          suppressMarkers: true
        });
      }}
      options={{
        styles: darkMode ? darkModeMapStyle : [],
        mapTypeControl: true,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true,
      }}
    />
  );
}
