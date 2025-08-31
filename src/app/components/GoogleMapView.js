'use client';

import { useEffect, useState, useRef } from 'react';
import { LoadScript } from '@react-google-maps/api';
import ClusterMap from './ClusterMap';
import DisasterStats from './DisasterStats';
import EmergencySupport from './EmergencySupport';
import { useAuth } from '../../hooks/useAuth';
import { useAuthContext } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';

const disasterTypes = {
  EQ: { label: 'Earthquake', icon: '🗻', color: '#ff6b6b' },
  FL: { label: 'Flood', icon: '🌊', color: '#4ecdc4' },
  TC: { label: 'Cyclone', icon: '🌀', color: '#45b7d1' },
  VO: { label: 'Volcano', icon: '🌋', color: '#ffa726' },
  TS: { label: 'Tsunami', icon: '🌊', color: '#26c6da' },
  DR: { label: 'Drought', icon: '🌵', color: '#8d6e63' },
  WF: { label: 'Wildfire', icon: '🔥', color: '#ff7043' },
  EH: { label: 'Extreme Heat', icon: '☀️', color: '#ff9800' },
  CW: { label: 'Cold Wave', icon: '❄️', color: '#90caf9' },
  LS: { label: 'Landslide', icon: '🏔️', color: '#795548' },
};

export default function GoogleMapView() {
  const [disasters, setDisasters] = useState([]);
  const [historicalDisasters, setHistoricalDisasters] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [googleLoaded, setGoogleLoaded] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [userState, setUserState] = useState(null);
  const [userCountry, setUserCountry] = useState(null);
  const [proximityMode, setProximityMode] = useState('nearby');
  const [radiusKm, setRadiusKm] = useState(500);
  const [alertDisasters, setAlertDisasters] = useState([]);
  const [address, setAddress] = useState('');
  const [alertVisible, setAlertVisible] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [historyDateRange, setHistoryDateRange] = useState('30');
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [detailedLocation, setDetailedLocation] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mapRef = useRef(null);
  const [userInfo, setUserInfo] = useState(null);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const { logout } = useAuth();
  const { user } = useAuthContext();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const fetchDisasters = async () => {
    try {
      const res = await fetch('https://www.gdacs.org/gdacsapi/api/events/geteventlist/MAP?format=geojson');
      const json = await res.json();
      const features = json.features || [];
      const markers = features.map((feature, index) => {
        const coords = feature.geometry?.coordinates;
        const props = feature.properties || {};
        if (!coords || coords.length < 2) return null;
        return {
          id: props.eventid + '-' + index,
          lat: parseFloat(coords[1]),
          lng: parseFloat(coords[0]),
          name: props.name || props.description || 'Unknown',
          type: props.eventtype,
          country: props.country || 'Unknown',
          state: props.adm1 || null,
          date: props.fromdate || props.datemodified,
          toDate: props.todate || props.datemodified,
          severity: props.severity || 'Unknown',
          alertlevel: props.alertlevel || 'Unknown',
        };
      }).filter(Boolean);
      setDisasters(markers);
    } catch (err) {
      console.error('Error fetching disaster data:', err);
    }
  };

  const fetchHistoricalDisasters = async (days = 30) => {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const res = await fetch(`https://www.gdacs.org/gdacsapi/api/events/geteventlist/MAP?format=geojson&fromdate=${startDate.toISOString().split('T')[0]}&todate=${endDate.toISOString().split('T')[0]}`);
      const json = await res.json();
      const features = json.features || [];
      const markers = features.map((feature, index) => {
        const coords = feature.geometry?.coordinates;
        const props = feature.properties || {};
        if (!coords || coords.length < 2) return null;
        return {
          id: 'hist-' + props.eventid + '-' + index,
          lat: parseFloat(coords[1]),
          lng: parseFloat(coords[0]),
          name: props.name || props.description || 'Unknown',
          type: props.eventtype,
          country: props.country || 'Unknown',
          state: props.adm1 || null,
          date: props.fromdate || props.datemodified,
          toDate: props.todate || props.datemodified,
          severity: props.severity || 'Unknown',
          alertlevel: props.alertlevel || 'Unknown',
          isHistorical: true,
        };
      }).filter(Boolean);
      setHistoricalDisasters(markers);
    } catch (err) {
      console.error('Error fetching historical disaster data:', err);
    }
  };

  const reverseGeocodeUser = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`
      );
      const json = await res.json();
      const address = json.address || {};
      setUserState(address.state || null);
      setUserCountry(address.country || null);
      setDetailedLocation({
        city: address.city || address.town || address.village || 'Unknown',
        state: address.state || 'Unknown',
        country: address.country || 'Unknown',
        postcode: address.postcode || null,
        fullAddress: json.display_name || 'Unknown',
        coordinates: { lat, lng }
      });
    } catch {
      setUserState(null);
      setUserCountry(null);
      setDetailedLocation(null);
    }
  };

  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
      );
      const json = await res.json();
      return json.display_name || '';
    } catch {
      return '';
    }
  };

  const haversineDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

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

  const getCurrentLocation = () => {
    setLocationLoading(true);
    setLocationError(null);
    
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser.');
      setLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async pos => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setUserLocation(coords);
        await reverseGeocodeUser(coords.lat, coords.lng);
        setLocationLoading(false);
      },
      err => {
        console.error('Location error:', err);
        setLocationError('Unable to get your location. Please check your browser settings.');
        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  useEffect(() => {
  const stored = localStorage.getItem('loginInfo');
  if (stored) {
    setUserInfo(JSON.parse(stored));
  }
}, []);

  useEffect(() => {
  const stored = localStorage.getItem('loginInfo');
  if (stored) {
    setUserInfo(JSON.parse(stored));
  }
}, []);


  useEffect(() => {
    fetchDisasters();
    fetchHistoricalDisasters(parseInt(historyDateRange));
    getCurrentLocation();
  }, []);

  useEffect(() => {
    if (!userLocation || disasters.length === 0) {
      setAlertDisasters([]);
      setAlertVisible(false);
      return;
    }

    let filtered = [];

    if (proximityMode === 'nearby') {
      filtered = disasters.filter(d =>
        haversineDistance(userLocation.lat, userLocation.lng, d.lat, d.lng) <= radiusKm
      );
    } else if (proximityMode === 'state') {
      filtered = disasters.filter(
        d => d.state && userState && d.state.toLowerCase() === userState.toLowerCase()
      );
    } else if (proximityMode === 'country') {
      filtered = disasters.filter(
        d => d.country && userCountry && d.country.toLowerCase() === userCountry.toLowerCase()
      );
    }

    setAlertDisasters(filtered);
    setAlertVisible(filtered.length > 0);

    if (filtered.length > 0) {
      reverseGeocode(filtered[0].lat, filtered[0].lng).then(setAddress);
    } else {
      setAddress('');
    }
  }, [userLocation, disasters, proximityMode, radiusKm, userState, userCountry]);

  const filteredDisasters = filter === 'ALL' ? disasters : disasters.filter(d => d.type === filter);
  const allDisasters = showHistory ? [...filteredDisasters, ...historicalDisasters] : filteredDisasters;

  const getEmojiIcon = (type) => {
    const emoji = disasterTypes[type]?.icon || '❔';
    if (!window.google || !googleLoaded) return null;
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30">
        <foreignObject width="100%" height="100%">
          <div xmlns="http://www.w3.org/1999/xhtml" style="font-size: 16px; text-align: center;">
            ${emoji}
          </div>
        </foreignObject>
      </svg>
    `;
    return {
      url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg),
      scaledSize: new window.google.maps.Size(30, 30),
    };
  };

  return (
    <div style={{
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      backgroundColor: darkMode ? '#0f172a' : '#f8fafc',
      color: darkMode ? '#e2e8f0' : '#1e293b',
      minHeight: '100vh',
      position: 'relative',
    }}>
      {/* Header */}
      <header style={{
        background: darkMode ? '#1e293b' : '#ffffff',
        borderBottom: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
        padding: '1rem 1.5rem',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}>
          {/* Logo and Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '12px',
              padding: '0.5rem',
              fontSize: '1.5rem',
            }}>
              🌐
            </div>
            <div>
              <h1 style={{
                margin: 0,
                fontSize: '1.5rem',
                fontWeight: '700',
                color: darkMode ? '#f1f5f9' : '#1e293b',
                lineHeight: '1.2',
              }}>
                Project Vigyaan
              </h1>
              <p style={{
                margin: 0,
                fontSize: '0.875rem',
                color: darkMode ? '#94a3b8' : '#64748b',
                fontWeight: '500',
              }}>
                Live Environmental Disaster Monitor
              </p>
            </div>
          </div>

          {/* Desktop Controls */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            '@media (max-width: 768px)': { display: 'none' }
          }}>
            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              style={{
                background: darkMode ? '#334155' : '#f1f5f9',
                border: `1px solid ${darkMode ? '#475569' : '#e2e8f0'}`,
                borderRadius: '8px',
                padding: '0.5rem',
                cursor: 'pointer',
                fontSize: '1.25rem',
                transition: 'all 0.2s',
                ':hover': {
                  background: darkMode ? '#475569' : '#e2e8f0',
                }
              }}
            >
              {darkMode ? '☀️' : '🌙'}
            </button>

            {/* Notification Bell */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                style={{
                  background: alertVisible ? '#ef4444' : (darkMode ? '#334155' : '#f1f5f9'),
                  border: `1px solid ${darkMode ? '#475569' : '#e2e8f0'}`,
                  borderRadius: '8px',
                  padding: '0.5rem',
                  cursor: 'pointer',
                  fontSize: '1.25rem',
                  transition: 'all 0.2s',
                  position: 'relative',
                }}
              >
                🔔
                {alertVisible && (
                  <span style={{
                    position: 'absolute',
                    top: '-2px',
                    right: '-2px',
                    width: '8px',
                    height: '8px',
                    background: '#ef4444',
                    borderRadius: '50%',
                    animation: 'pulse 2s infinite',
                  }} />
                )}
              </button>

              {/* Notification Dropdown */}
              {notifOpen && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  width: '320px',
                  background: darkMode ? '#1e293b' : '#ffffff',
                  border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
                  borderRadius: '12px',
                  padding: '1rem',
                  marginTop: '0.5rem',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                  zIndex: 1001,
                }}>
                  {alertVisible ? (
                    <>
                      <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '1rem', fontWeight: '600' }}>
                        ⚠️ Disaster Alert{alertDisasters.length > 1 ? `s (${alertDisasters.length})` : ''}
                      </h4>
                      <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem' }}>
                        <strong>📍 Location:</strong> {address}
                      </p>
                      <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.875rem' }}>
                        <strong>📡 Mode:</strong> {proximityMode.toUpperCase()}
                      </p>
                      <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                        {alertDisasters.map((d, idx) => (
                          <div key={d.id} style={{
                            padding: '0.5rem',
                            marginBottom: '0.5rem',
                            background: darkMode ? '#334155' : '#f8fafc',
                            borderRadius: '8px',
                            fontSize: '0.875rem',
                          }}>
                            <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                              {disasterTypes[d.type]?.label || d.type}
                            </div>
                            <div style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>
                              📍 {d.name || 'Unknown Location'}
                            </div>
                            <div style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>
                              🕒 {new Date(d.date).toLocaleString()}
                            </div>
                            <div style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>
                              ⏱️ {formatDuration(d.date, d.toDate)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <p style={{ margin: 0, fontWeight: '600', color: '#10b981' }}>
                      ✅ No environmental dangers detected nearby currently.
                    </p>
                  )}
                </div>
              )}
            </div>

        {user && (
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: darkMode ? '#334155' : '#f1f5f9',
                border: `1px solid ${darkMode ? '#475569' : '#e2e8f0'}`,
                borderRadius: '9999px',
                padding: '0.4rem 0.75rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: darkMode ? '#f8fafc' : '#1e293b',
                cursor: 'pointer'
              }}
            >
              👤 {user.email}
            </button>

            {userDropdownOpen && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '0.5rem',
                background: darkMode ? '#1e293b' : '#ffffff',
                color: darkMode ? '#f8fafc' : '#1e293b',
                border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
                borderRadius: '12px',
                padding: '1rem',
                boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                zIndex: 1001,
                minWidth: '260px'
              }}>
                <p style={{ marginBottom: '0.5rem' }}><strong>📛 Email:</strong> {user.email || 'Guest User'}</p>
                <p style={{ marginBottom: '0.5rem' }}><strong>🛡️ Role:</strong> {user.isAnonymous ? 'Guest User' : user.providerData?.[0]?.providerId === 'google.com' ? 'Google User' : 'Email User'}</p>
                <p style={{ marginBottom: '0.5rem' }}><strong>⏱️ Login Time:</strong> {new Date().toLocaleString()}</p>
                <p style={{ marginBottom: '0.5rem' }}><strong>🔐 Access Level:</strong> View & Alert</p>
                <p style={{ marginBottom: '0.5rem' }}><strong>📞 Contact:</strong>91+ 9742884588 </p>
                <p style={{ marginBottom: '0.5rem' }}><strong>🆔 Session ID:</strong> {Math.random().toString(36).substr(2, 8)}</p>
                <button
                  onClick={handleLogout}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#ef4444',
                    color: 'white',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    marginTop: '0.5rem',
                  }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        )}


            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                background: darkMode ? '#334155' : '#f1f5f9',
                border: `1px solid ${darkMode ? '#475569' : '#e2e8f0'}`,
                borderRadius: '8px',
                padding: '0.5rem',
                cursor: 'pointer',
                fontSize: '1.25rem',
                display: 'none',
                '@media (max-width: 768px)': { display: 'block' }
              }}
            >
              ☰
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div style={{
          background: darkMode ? '#1e293b' : '#ffffff',
          borderBottom: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
          padding: '1rem',
          '@media (min-width: 769px)': { display: 'none' }
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}>
            <button
              onClick={() => setDarkMode(!darkMode)}
              style={{
                background: darkMode ? '#334155' : '#f1f5f9',
                border: `1px solid ${darkMode ? '#475569' : '#e2e8f0'}`,
                borderRadius: '8px',
                padding: '0.75rem',
                cursor: 'pointer',
                fontSize: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              {darkMode ? '☀️' : '🌙'} {darkMode ? 'Light Mode' : 'Dark Mode'}
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '1.5rem',
        '@media (max-width: 768px)': { padding: '1rem' }
      }}>
        {/* Location Card */}
        {detailedLocation && (
          <div style={{
            background: darkMode ? '#1e293b' : '#ffffff',
            borderRadius: '16px',
            padding: '1.5rem',
            marginBottom: '1.5rem',
            border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
            boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: '1rem',
              flexWrap: 'wrap',
            }}>
              <div style={{ flex: 1 }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  marginBottom: '1rem',
                }}>
                  <div style={{
                    background: '#10b981',
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.25rem',
                  }}>
                    📍
                  </div>
                  <div>
                    <h3 style={{
                      margin: 0,
                      fontSize: '1.25rem',
                      fontWeight: '600',
                      color: darkMode ? '#f1f5f9' : '#1e293b',
                    }}>
                      Your Location
                    </h3>
                    <p style={{
                      margin: 0,
                      fontSize: '0.875rem',
                      color: darkMode ? '#94a3b8' : '#64748b',
                    }}>
                      {detailedLocation.city}, {detailedLocation.state}
                    </p>
                  </div>
                </div>

                {locationError && (
                  <div style={{
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: '8px',
                    padding: '0.75rem',
                    marginBottom: '1rem',
                    color: '#dc2626',
                    fontSize: '0.875rem',
                  }}>
                    ⚠️ {locationError}
                  </div>
                )}

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '1rem',
                  fontSize: '0.875rem',
                }}>
                  <div>
                    <strong style={{ color: darkMode ? '#cbd5e1' : '#475569' }}>City:</strong>
                    <br />{detailedLocation.city}
                  </div>
                  <div>
                    <strong style={{ color: darkMode ? '#cbd5e1' : '#475569' }}>State:</strong>
                    <br />{detailedLocation.state}
                  </div>
                  <div>
                    <strong style={{ color: darkMode ? '#cbd5e1' : '#475569' }}>Country:</strong>
                    <br />{detailedLocation.country}
                  </div>
                  {detailedLocation.postcode && (
                    <div>
                      <strong style={{ color: darkMode ? '#cbd5e1' : '#475569' }}>Postcode:</strong>
                      <br />{detailedLocation.postcode}
                    </div>
                  )}
                  <div>
                    <strong style={{ color: darkMode ? '#cbd5e1' : '#475569' }}>Coordinates:</strong>
                    <br />{detailedLocation.coordinates.lat.toFixed(4)}, {detailedLocation.coordinates.lng.toFixed(4)}
                  </div>
                </div>
              </div>

              <button
                onClick={getCurrentLocation}
                disabled={locationLoading}
                style={{
                  background: locationLoading ? '#94a3b8' : '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.75rem 1rem',
                  cursor: locationLoading ? 'not-allowed' : 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap',
                }}
              >
                {locationLoading ? '🔄 Updating...' : '🔄 Refresh Location'}
              </button>
            </div>
          </div>
        )}

        {/* Controls Section */}
        <div style={{
          background: darkMode ? '#1e293b' : '#ffffff',
          borderRadius: '16px',
          padding: '1.5rem',
          marginBottom: '1.5rem',
          border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
          boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
        }}>
          <h3 style={{
            margin: '0 0 1rem 0',
            fontSize: '1.125rem',
            fontWeight: '600',
            color: darkMode ? '#f1f5f9' : '#1e293b',
          }}>
            🎛️ Map Controls
          </h3>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1rem',
            alignItems: 'end',
          }}>
            {/* Filter Control */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: darkMode ? '#cbd5e1' : '#475569',
              }}>
                Disaster Type Filter
              </label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: `1px solid ${darkMode ? '#475569' : '#d1d5db'}`,
                  background: darkMode ? '#334155' : '#ffffff',
                  color: darkMode ? '#f1f5f9' : '#1e293b',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                }}
              >
                <option value="ALL">All Disaster Types</option>
                {Object.entries(disasterTypes).map(([key, { label }]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            {/* Proximity Control */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: darkMode ? '#cbd5e1' : '#475569',
              }}>
                Proximity Mode
              </label>
              <select
                value={proximityMode}
                onChange={(e) => setProximityMode(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: `1px solid ${darkMode ? '#475569' : '#d1d5db'}`,
                  background: darkMode ? '#334155' : '#ffffff',
                  color: darkMode ? '#f1f5f9' : '#1e293b',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                }}
              >
                <option value="nearby">Nearby (Radius-based)</option>
                <option value="state">State Level</option>
                <option value="country">Country Level</option>
              </select>
            </div>

            {/* Radius Control */}
            {proximityMode === 'nearby' && (
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: darkMode ? '#cbd5e1' : '#475569',
                }}>
                  Search Radius: {radiusKm} km
                </label>
                <input
                  type="range"
                  min="50"
                  max="1000"
                  step="50"
                  value={radiusKm}
                  onChange={(e) => setRadiusKm(e.target.value)}
                  style={{
                    width: '100%',
                    height: '6px',
                    borderRadius: '3px',
                    background: darkMode ? '#475569' : '#d1d5db',
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                />
              </div>
            )}

            {/* History Toggle */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: darkMode ? '#cbd5e1' : '#475569',
              }}>
                Historical Data
              </label>
          <button
                onClick={() => setShowHistory(!showHistory)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: `1px solid ${showHistory ? '#10b981' : (darkMode ? '#475569' : '#d1d5db')}`,
                  background: showHistory ? '#10b981' : (darkMode ? '#334155' : '#ffffff'),
                  color: showHistory ? 'white' : (darkMode ? '#f1f5f9' : '#1e293b'),
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {showHistory ? '📚 History Enabled' : '📚 Enable History'}
          </button>
            </div>

            {/* History Date Range */}
            {showHistory && (
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: darkMode ? '#cbd5e1' : '#475569',
                }}>
                  Date Range
                </label>
                <select
                  value={historyDateRange}
                  onChange={(e) => {
                    setHistoryDateRange(e.target.value);
                    fetchHistoricalDisasters(parseInt(e.target.value));
                  }}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: `1px solid ${darkMode ? '#475569' : '#d1d5db'}`,
                    background: darkMode ? '#334155' : '#ffffff',
                    color: darkMode ? '#f1f5f9' : '#1e293b',
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                  }}
                >
                  <option value="7">Last 7 days</option>
                  <option value="30">Last 30 days</option>
                  <option value="90">Last 90 days</option>
                  <option value="180">Last 6 months</option>
                  <option value="365">Last year</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Map Section */}
        <div style={{
          background: darkMode ? '#1e293b' : '#ffffff',
          borderRadius: '16px',
          padding: '1.5rem',
          marginBottom: '1.5rem',
          border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
          boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 300px',
            gap: '1.5rem',
            '@media (max-width: 1024px)': {
              gridTemplateColumns: '1fr',
            }
          }}>
            {/* Map Container */}
            <div style={{
              background: darkMode ? '#334155' : '#f8fafc',
              borderRadius: '12px',
              overflow: 'hidden',
              position: 'relative',
              minHeight: '500px',
            }}>
      <LoadScript
        googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
        onLoad={() => setGoogleLoaded(true)}
                libraries={['places', 'geometry']}
      >
        <ClusterMap
                  disasters={allDisasters}
          getEmojiIcon={getEmojiIcon}
          userLocation={userLocation}
                  radiusKm={radiusKm}
                  proximityMode={proximityMode}
          darkMode={darkMode}
          mapRef={mapRef}
                  showHistory={showHistory}
        />
      </LoadScript>

              {/* Recenter Button */}
      {userLocation && (
        <button
          onClick={() => {
            if (mapRef.current) {
              mapRef.current.panTo(userLocation);
              mapRef.current.setZoom(6);
            }
          }}
                  style={{
                    position: 'absolute',
                    bottom: '1rem',
                    right: '1rem',
                    background: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0.75rem 1rem',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    zIndex: 100,
                  }}
                >
                  📍 My Location
        </button>
      )}
            </div>

            {/* Legend */}
            <div style={{
              background: darkMode ? '#334155' : '#f8fafc',
              borderRadius: '12px',
              padding: '1.5rem',
              height: 'fit-content',
            }}>
              <h4 style={{
                margin: '0 0 1rem 0',
                fontSize: '1rem',
                fontWeight: '600',
                color: darkMode ? '#f1f5f9' : '#1e293b',
                textAlign: 'center',
              }}>
                🗺️ Map Legend
              </h4>

              <div style={{ marginBottom: '1rem' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                }}>
                  <span>Live Events</span>
                  <span style={{ color: '#10b981' }}>●</span>
                </div>
                {showHistory && (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                  }}>
                    <span>Historical Events</span>
                    <span style={{ color: '#f59e0b' }}>●</span>
                  </div>
                )}
              </div>

              <div style={{
                display: 'grid',
                gap: '0.5rem',
              }}>
                {Object.entries(disasterTypes).map(([type, { label, icon, color }]) => (
                  <div
                    key={type}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem',
                      borderRadius: '6px',
                      background: darkMode ? '#475569' : '#f1f5f9',
                    }}
                  >
                    <span style={{ fontSize: '1.125rem' }}>{icon}</span>
                    <span style={{
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: darkMode ? '#e2e8f0' : '#475569',
                    }}>
                      {label}
            </span>
                  </div>
                ))}
              </div>

              {showHistory && (
                <div style={{
                  marginTop: '1rem',
                  padding: '0.75rem',
                  background: darkMode ? '#475569' : '#f1f5f9',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  textAlign: 'center',
                }}>
                  <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                    📚 History Mode
                  </div>
                  <div style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>
                    Showing events from the last {historyDateRange} days
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Statistics Component */}
        <DisasterStats 
          disasters={disasters}
          historicalDisasters={historicalDisasters}
          showHistory={showHistory}
          darkMode={darkMode}
        />

        {/* Emergency Support Component */}
        <EmergencySupport 
          userLocation={userLocation}
          darkMode={darkMode}
          mapRef={mapRef}
        />
      </main>

      {/* Animations */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}