'use client'

import { useState } from 'react'

export default function IncidentReportPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState({
    type: '',
    location: '',
    urgency: '',
    description: '',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Incident submitted:', formData)
    alert('✅ Disaster report submitted!')
    setIsOpen(false)
    setFormData({ type: '', location: '', urgency: '', description: '' })
  }

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          bottom: '1rem',
          right: '1rem',
          backgroundColor: '#059669',
          color: 'white',
          padding: '10px 16px',
          borderRadius: '9999px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
          fontWeight: 'bold',
          zIndex: 1000,
        }}
      >
        📝 Report Incident
      </button>

      {/* Slide-in Form */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: '360px',
          height: '100vh',
          backgroundColor: '#f9fafb',
          boxShadow: '-2px 0 6px rgba(0,0,0,0.1)',
          padding: '20px',
          zIndex: 1001,
          overflowY: 'auto',
        }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827' }}>Disaster Report Form</h2>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                backgroundColor: '#f87171',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '30px',
                height: '30px',
                fontSize: '18px',
                fontWeight: 'bold',
              }}
            >
              ×
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontWeight: '600' }}>Disaster Type</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  marginTop: '4px',
                }}
              >
                <option value="">Select...</option>
                <option value="Fire">🔥 Fire</option>
                <option value="Flood">🌊 Flood</option>
                <option value="Earthquake">🌎 Earthquake</option>
                <option value="Gas Leak">☣️ Gas Leak</option>
                <option value="Building Collapse">🏚️ Building Collapse</option>
              </select>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontWeight: '600' }}>Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. Block A, 2nd floor"
                required
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  marginTop: '4px',
                }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontWeight: '600' }}>Urgency</label>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '4px' }}>
                {['Low', 'Medium', 'High'].map((level) => (
                  <label key={level} style={{ fontSize: '14px' }}>
                    <input
                      type="radio"
                      name="urgency"
                      value={level}
                      checked={formData.urgency === level}
                      onChange={handleChange}
                      required
                      style={{ marginRight: '6px' }}
                    />
                    {level}
                  </label>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontWeight: '600' }}>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                placeholder="Add any specific details..."
                required
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  marginTop: '4px',
                }}
              />
            </div>

            <button type="submit" style={{
              backgroundColor: '#ef4444',
              color: 'white',
              padding: '10px',
              borderRadius: '8px',
              width: '100%',
              fontWeight: 'bold',
              fontSize: '16px',
              border: 'none',
            }}>
              🚨 Submit Report
            </button>
          </form>
        </div>
      )}
    </>
  )
}
