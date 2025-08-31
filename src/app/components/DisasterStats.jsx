'use client';

import { useState, useEffect } from 'react';

export default function DisasterStats({ disasters, historicalDisasters, showHistory, darkMode }) {
  const [stats, setStats] = useState({
    totalLive: 0,
    totalHistorical: 0,
    byType: {},
    byCountry: {},
    bySeverity: {},
    recentActivity: []
  });

  useEffect(() => {
    if (!disasters && !historicalDisasters) return;

    const calculateStats = () => {
      const allDisasters = [
        ...(disasters || []),
        ...(historicalDisasters || [])
      ];

      const byType = {};
      const byCountry = {};
      const bySeverity = {};
      const recentActivity = [];

      allDisasters.forEach(disaster => {
        // Count by type
        byType[disaster.type] = (byType[disaster.type] || 0) + 1;
        
        // Count by country
        byCountry[disaster.country] = (byCountry[disaster.country] || 0) + 1;
        
        // Count by severity
        if (disaster.severity && disaster.severity !== 'Unknown') {
          bySeverity[disaster.severity] = (bySeverity[disaster.severity] || 0) + 1;
        }

        // Recent activity (last 7 days)
        const disasterDate = new Date(disaster.date);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        
        if (disasterDate >= weekAgo) {
          recentActivity.push({
            ...disaster,
            daysAgo: Math.floor((new Date() - disasterDate) / (1000 * 60 * 60 * 24))
          });
        }
      });

      setStats({
        totalLive: disasters?.length || 0,
        totalHistorical: historicalDisasters?.length || 0,
        byType,
        byCountry,
        bySeverity,
        recentActivity: recentActivity.sort((a, b) => a.daysAgo - b.daysAgo)
      });
    };

    calculateStats();
  }, [disasters, historicalDisasters]);

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

  const getTopCountries = () => {
    return Object.entries(stats.byCountry)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);
  };

  const getTopTypes = () => {
    return Object.entries(stats.byType)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);
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
        📊 Disaster Statistics
      </h3>

      {/* Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '24px',
      }}>
        <div style={{
          background: darkMode ? '#3a3a3a' : '#fff',
          padding: '16px',
          borderRadius: '12px',
          textAlign: 'center',
          border: '2px solid #4CAF50',
        }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>🌍</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#4CAF50' }}>
            {stats.totalLive}
          </div>
          <div style={{ fontSize: '14px', color: darkMode ? '#d2c3b5' : '#666' }}>
            Live Events
          </div>
        </div>

        {showHistory && (
          <div style={{
            background: darkMode ? '#3a3a3a' : '#fff',
            padding: '16px',
            borderRadius: '12px',
            textAlign: 'center',
            border: '2px solid #FF9800',
          }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>📚</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#FF9800' }}>
              {stats.totalHistorical}
            </div>
            <div style={{ fontSize: '14px', color: darkMode ? '#d2c3b5' : '#666' }}>
              Historical Events
            </div>
          </div>
        )}

        <div style={{
          background: darkMode ? '#3a3a3a' : '#fff',
          padding: '16px',
          borderRadius: '12px',
          textAlign: 'center',
          border: '2px solid #2196F3',
        }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>⚡</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2196F3' }}>
            {stats.recentActivity.length}
          </div>
          <div style={{ fontSize: '14px', color: darkMode ? '#d2c3b5' : '#666' }}>
            Recent (7 days)
          </div>
        </div>

        <div style={{
          background: darkMode ? '#3a3a3a' : '#fff',
          padding: '16px',
          borderRadius: '12px',
          textAlign: 'center',
          border: '2px solid #9C27B0',
        }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>🌐</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#9C27B0' }}>
            {Object.keys(stats.byCountry).length}
          </div>
          <div style={{ fontSize: '14px', color: darkMode ? '#d2c3b5' : '#666' }}>
            Countries Affected
          </div>
        </div>
      </div>

      {/* Charts and Analytics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px',
      }}>
        {/* Top Disaster Types */}
        <div style={{
          background: darkMode ? '#3a3a3a' : '#fff',
          padding: '16px',
          borderRadius: '12px',
        }}>
          <h4 style={{
            marginBottom: '16px',
            fontWeight: '600',
            color: darkMode ? '#ffe8b3' : '#6d5b44',
          }}>
            🔥 Top Disaster Types
          </h4>
          {getTopTypes().map(([type, count]) => (
            <div key={type} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '8px',
              padding: '8px',
              background: darkMode ? '#4a4a4a' : '#f5f5f5',
              borderRadius: '6px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px' }}>
                  {disasterTypes[type]?.icon || '❔'}
                </span>
                <span style={{ fontWeight: '500' }}>
                  {disasterTypes[type]?.label || type}
                </span>
              </div>
              <span style={{
                background: disasterTypes[type]?.color || '#666',
                color: 'white',
                padding: '4px 8px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: 'bold',
              }}>
                {count}
              </span>
            </div>
          ))}
        </div>

        {/* Top Affected Countries */}
        <div style={{
          background: darkMode ? '#3a3a3a' : '#fff',
          padding: '16px',
          borderRadius: '12px',
        }}>
          <h4 style={{
            marginBottom: '16px',
            fontWeight: '600',
            color: darkMode ? '#ffe8b3' : '#6d5b44',
          }}>
            🌍 Most Affected Countries
          </h4>
          {getTopCountries().map(([country, count]) => (
            <div key={country} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '8px',
              padding: '8px',
              background: darkMode ? '#4a4a4a' : '#f5f5f5',
              borderRadius: '6px',
            }}>
              <span style={{ fontWeight: '500' }}>{country}</span>
              <span style={{
                background: '#2196F3',
                color: 'white',
                padding: '4px 8px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: 'bold',
              }}>
                {count}
              </span>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div style={{
          background: darkMode ? '#3a3a3a' : '#fff',
          padding: '16px',
          borderRadius: '12px',
        }}>
          <h4 style={{
            marginBottom: '16px',
            fontWeight: '600',
            color: darkMode ? '#ffe8b3' : '#6d5b44',
          }}>
            ⚡ Recent Activity (7 days)
          </h4>
          {stats.recentActivity.length > 0 ? (
            stats.recentActivity.slice(0, 5).map((disaster, index) => (
              <div key={disaster.id} style={{
                marginBottom: '8px',
                padding: '8px',
                background: darkMode ? '#4a4a4a' : '#f5f5f5',
                borderRadius: '6px',
                fontSize: '13px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '14px' }}>
                    {disasterTypes[disaster.type]?.icon || '❔'}
                  </span>
                  <span style={{ fontWeight: '500' }}>
                    {disaster.name}
                  </span>
                </div>
                <div style={{ color: darkMode ? '#d2c3b5' : '#666', fontSize: '12px' }}>
                  {disaster.country} • {disaster.daysAgo === 0 ? 'Today' : `${disaster.daysAgo} days ago`}
                </div>
              </div>
            ))
          ) : (
            <div style={{
              color: darkMode ? '#d2c3b5' : '#666',
              fontSize: '14px',
              textAlign: 'center',
              padding: '20px',
            }}>
              No recent activity
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 