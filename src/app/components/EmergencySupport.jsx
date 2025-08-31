'use client';

import { useState, useEffect, useRef } from 'react';

const emergencyContacts = {
  police: {
    name: 'Police',
    number: '100',
    icon: '🚔',
    description: 'Emergency Police Response'
  },
  ambulance: {
    name: 'Ambulance',
    number: '102',
    icon: '🚑',
    description: 'Medical Emergency Services'
  },
  fire: {
    name: 'Fire Brigade',
    number: '101',
    icon: '🚒',
    description: 'Fire Emergency Services'
  },
  women: {
    name: 'Women Helpline',
    number: '1091',
    icon: '👩‍⚖️',
    description: 'Women Safety & Support'
  },
  child: {
    name: 'Child Helpline',
    number: '1098',
    icon: '👶',
    description: 'Child Protection Services'
  },
  disaster: {
    name: 'Disaster Management',
    number: '1070',
    icon: '🌪️',
    description: 'National Disaster Response'
  },
  railway: {
    name: 'Railway Helpline',
    number: '139',
    icon: '🚂',
    description: 'Railway Emergency Services'
  },
  blood: {
    name: 'Blood Bank',
    number: '104',
    icon: '🩸',
    description: 'Blood Bank Information'
  },
  covid: {
    name: 'COVID-19 Helpline',
    number: '1075',
    icon: '🦠',
    description: 'COVID-19 Information & Support'
  },
  mental: {
    name: 'Mental Health',
    number: '1800-599-0019',
    icon: '🧠',
    description: 'Mental Health Support'
  }
};

const evacuationTypes = {
  hospital: {
    name: 'Hospital',
    icon: '🏥',
    description: 'Find nearest hospitals',
    color: '#ff6b6b'
  },
  school: {
    name: 'School',
    icon: '🏫',
    description: 'Find nearest schools',
    color: '#4ecdc4'
  },
  shelter: {
    name: 'Emergency Shelter',
    icon: '🏠',
    description: 'Find emergency shelters',
    color: '#45b7d1'
  },
  police: {
    name: 'Police Station',
    icon: '🚔',
    description: 'Find nearest police stations',
    color: '#ffa726'
  },
  fire: {
    name: 'Fire Station',
    icon: '🚒',
    description: 'Find nearest fire stations',
    color: '#ff7043'
  }
};

export default function EmergencySupport({ userLocation, darkMode, mapRef }) {
  const [selectedEvacuationType, setSelectedEvacuationType] = useState(null);
  const [nearbyPlaces, setNearbyPlaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showEmergencyContacts, setShowEmergencyContacts] = useState(false);
  const [currentDirectionsRenderer, setCurrentDirectionsRenderer] = useState(null);
  const [currentMarkers, setCurrentMarkers] = useState([]);

  // Cleanup function for routes and markers
  const clearCurrentRoute = () => {
    // Clear previous directions renderer
    if (currentDirectionsRenderer) {
      currentDirectionsRenderer.setDirections({ routes: [] });
      setCurrentDirectionsRenderer(null);
    }

    // Clear previous markers
    currentMarkers.forEach(marker => {
      if (marker && marker.setMap) {
        marker.setMap(null);
      }
    });
    setCurrentMarkers([]);
  };

  // Cleanup when component unmounts or evacuation type changes
  useEffect(() => {
    return () => {
      clearCurrentRoute();
    };
  }, []);

  // Clear routes when evacuation type changes
  useEffect(() => {
    clearCurrentRoute();
  }, [selectedEvacuationType]);

  const handleEmergencyCall = (number) => {
    if (window.confirm(`Do you want to call ${number}?`)) {
      window.location.href = `tel:${number}`;
    }
  };

  const findNearbyPlaces = async (type) => {
    if (!userLocation || !window.google) return;
    
    setLoading(true);
    setSelectedEvacuationType(type);

    try {
      const service = new window.google.maps.places.PlacesService(mapRef.current);
      const request = {
        location: userLocation,
        radius: 5000, // 5km radius
        type: type === 'hospital' ? 'hospital' : 
              type === 'school' ? 'school' : 
              type === 'shelter' ? 'lodging' : 
              type === 'police' ? 'police' : 'fire_station',
        keyword: type === 'shelter' ? 'emergency shelter' : undefined
      };

      service.nearbySearch(request, (results, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
          const places = results.slice(0, 10).map(place => ({
            name: place.name,
            address: place.vicinity,
            location: place.geometry.location,
            rating: place.rating,
            distance: window.google.maps.geometry.spherical.computeDistanceBetween(
              userLocation,
              place.geometry.location
            ) / 1000 // Convert to km
          }));
          
          // Sort by distance (nearest first) and take top 5
          const sortedPlaces = places
            .sort((a, b) => a.distance - b.distance)
            .slice(0, 5);
          
          setNearbyPlaces(sortedPlaces);
        } else {
          setNearbyPlaces([]);
        }
        setLoading(false);
      });
    } catch (error) {
      console.error('Error finding nearby places:', error);
      setLoading(false);
      setNearbyPlaces([]);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const getDirections = (destination) => {
    if (!userLocation || !window.google || !mapRef.current) return;
    
    // Clear any existing routes first
    clearCurrentRoute();
    
    const directionsService = new window.google.maps.DirectionsService();
    const directionsRenderer = new window.google.maps.DirectionsRenderer({
      map: mapRef.current,
      suppressMarkers: true
    });

    const request = {
      origin: userLocation,
      destination: destination,
      travelMode: window.google.maps.TravelMode.DRIVING
    };

    directionsService.route(request, (result, status) => {
      if (status === window.google.maps.DirectionsStatus.OK) {
        directionsRenderer.setDirections(result);
        setCurrentDirectionsRenderer(directionsRenderer);
        
        // Add markers for origin and destination
        const originMarker = new window.google.maps.Marker({
          position: userLocation,
          map: mapRef.current,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: '#4CAF50',
            fillOpacity: 1,
            strokeColor: '#fff',
            strokeWeight: 2,
          },
          title: 'Your Location'
        });

        const destinationMarker = new window.google.maps.Marker({
          position: destination,
          map: mapRef.current,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: '#FF5722',
            fillOpacity: 1,
            strokeColor: '#fff',
            strokeWeight: 2,
          },
          title: 'Destination'
        });

        // Store markers for later cleanup
        setCurrentMarkers([originMarker, destinationMarker]);

        // Zoom to fit the route
        const bounds = new window.google.maps.LatLngBounds();
        bounds.extend(userLocation);
        bounds.extend(destination);
        mapRef.current.fitBounds(bounds);

        // Scroll to top to show the route
        scrollToTop();
      }
    });
  };

  return (
    <div style={{
      background: darkMode ? '#2a2a2a' : '#f9f3e9',
      borderRadius: '16px',
      padding: '20px',
      marginTop: '24px',
      boxShadow: '0 6px 14px rgba(0,0,0,0.2)',
      maxWidth: '1200px',
      width: '100%',
    }}>
      <h3 style={{
        textAlign: 'center',
        marginBottom: '20px',
        fontWeight: '700',
        fontSize: '1.5rem',
        color: darkMode ? '#ffe8b3' : '#6d5b44',
      }}>
        🚨 Emergency Support
      </h3>

      {/* Emergency Contacts */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
        }}>
          <h4 style={{
            fontWeight: '600',
            color: darkMode ? '#ffe8b3' : '#6d5b44',
            margin: 0,
          }}>
            📞 Emergency Contacts (India)
          </h4>
          <button
            onClick={() => setShowEmergencyContacts(!showEmergencyContacts)}
            style={{
              background: '#ff6b6b',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
            }}
          >
            {showEmergencyContacts ? 'Hide' : 'Show'} Contacts
          </button>
        </div>

        {showEmergencyContacts && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '12px',
          }}>
            {Object.entries(emergencyContacts).map(([key, contact]) => (
              <div key={key} style={{
                background: darkMode ? '#3a3a3a' : '#fff',
                padding: '16px',
                borderRadius: '12px',
                border: '2px solid #ff6b6b',
                cursor: 'pointer',
                transition: 'transform 0.2s',
                ':hover': { transform: 'scale(1.02)' }
              }}
              onClick={() => handleEmergencyCall(contact.number)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '24px' }}>{contact.icon}</span>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '16px' }}>{contact.name}</div>
                    <div style={{ color: darkMode ? '#d2c3b5' : '#666', fontSize: '14px' }}>
                      {contact.description}
                    </div>
                  </div>
                </div>
                <div style={{
                  background: '#ff6b6b',
                  color: 'white',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  textAlign: 'center',
                  fontWeight: 'bold',
                  fontSize: '18px',
                }}>
                  {contact.number}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Evacuation Routes */}
      <div>
        <h4 style={{
          fontWeight: '600',
          color: darkMode ? '#ffe8b3' : '#6d5b44',
          marginBottom: '16px',
        }}>
          🛣️ Safe Evacuation Routes
        </h4>

        {!userLocation ? (
          <div style={{
            background: darkMode ? '#3a3a3a' : '#fff',
            padding: '20px',
            borderRadius: '12px',
            textAlign: 'center',
            color: darkMode ? '#d2c3b5' : '#666',
          }}>
            📍 Please allow location access to find evacuation routes
          </div>
        ) : (
          <>
            {/* Evacuation Type Selection */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '12px',
              marginBottom: '20px',
            }}>
              {Object.entries(evacuationTypes).map(([key, type]) => (
                <button
                  key={key}
                  onClick={() => findNearbyPlaces(key)}
                  disabled={loading}
                  style={{
                    background: selectedEvacuationType === key ? type.color : (darkMode ? '#3a3a3a' : '#fff'),
                    color: selectedEvacuationType === key ? 'white' : (darkMode ? '#eee' : '#333'),
                    border: `2px solid ${type.color}`,
                    padding: '16px',
                    borderRadius: '12px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                    opacity: loading ? 0.6 : 1,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '20px' }}>{type.icon}</span>
                    <span style={{ fontWeight: '600' }}>{type.name}</span>
                  </div>
                  <div style={{ fontSize: '12px', opacity: 0.8 }}>
                    {type.description}
                  </div>
                </button>
              ))}
            </div>

            {/* Nearby Places Results */}
            {loading && (
              <div style={{
                background: darkMode ? '#3a3a3a' : '#fff',
                padding: '20px',
                borderRadius: '12px',
                textAlign: 'center',
                color: darkMode ? '#d2c3b5' : '#666',
              }}>
                🔍 Searching for nearby {selectedEvacuationType ? evacuationTypes[selectedEvacuationType]?.name : 'places'}...
              </div>
            )}

            {!loading && nearbyPlaces.length > 0 && (
              <div style={{
                background: darkMode ? '#3a3a3a' : '#fff',
                padding: '16px',
                borderRadius: '12px',
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '12px',
                }}>
                  <h5 style={{
                    fontWeight: '600',
                    color: darkMode ? '#ffe8b3' : '#6d5b44',
                  }}>
                    📍 Nearby {evacuationTypes[selectedEvacuationType]?.name}s
                  </h5>
                  {currentDirectionsRenderer && (
                    <button
                      onClick={clearCurrentRoute}
                      style={{
                        background: '#f44336',
                        color: 'white',
                        border: 'none',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '11px',
                        fontWeight: '600',
                      }}
                    >
                      🗑️ Clear Route
                    </button>
                  )}
                </div>
                
                {currentDirectionsRenderer && (
                  <div style={{
                    background: '#e8f5e8',
                    border: '1px solid #4CAF50',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    marginBottom: '12px',
                    fontSize: '12px',
                    color: '#2e7d32',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}>
                    🗺️ Route is currently displayed on the map above. Scroll up to view it.
                  </div>
                )}
                
                {nearbyPlaces.map((place, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px',
                    marginBottom: '8px',
                    background: darkMode ? '#4a4a4a' : '#f5f5f5',
                    borderRadius: '8px',
                  }}>
                    <div>
                      <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                        {place.name}
                      </div>
                      <div style={{ fontSize: '12px', color: darkMode ? '#d2c3b5' : '#666' }}>
                        {place.address} • {place.distance.toFixed(1)}km away
                      </div>
                      {place.rating && (
                        <div style={{ fontSize: '12px', color: '#FF9800' }}>
                          ⭐ {place.rating}/5
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => getDirections(place.location)}
                      style={{
                        background: currentDirectionsRenderer ? '#2196F3' : '#4CAF50',
                        color: 'white',
                        border: 'none',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: '600',
                      }}
                    >
                      {currentDirectionsRenderer ? '🔄 Update Route' : '🗺️ Get Route'}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {!loading && selectedEvacuationType && nearbyPlaces.length === 0 && (
              <div style={{
                background: darkMode ? '#3a3a3a' : '#fff',
                padding: '20px',
                borderRadius: '12px',
                textAlign: 'center',
                color: darkMode ? '#d2c3b5' : '#666',
              }}>
                ❌ No nearby {evacuationTypes[selectedEvacuationType]?.name}s found within 5km
              </div>
            )}
          </>
        )}
      </div>

      {/* Safety Tips */}
      <div style={{ marginTop: '24px' }}>
        <h4 style={{
          fontWeight: '600',
          color: darkMode ? '#ffe8b3' : '#6d5b44',
          marginBottom: '12px',
        }}>
          💡 Emergency Safety Tips
        </h4>
        <div style={{
          background: darkMode ? '#3a3a3a' : '#fff',
          padding: '16px',
          borderRadius: '12px',
          fontSize: '14px',
          lineHeight: '1.5',
        }}>
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
            <li>Stay calm and call emergency services immediately</li>
            <li>Follow evacuation orders and use designated routes</li>
            <li>Keep emergency contacts readily available</li>
            <li>Have a family emergency plan in place</li>
            <li>Stay informed about local emergency alerts</li>
            <li>Keep emergency supplies ready</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 