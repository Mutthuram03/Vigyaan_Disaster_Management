# 🚀 Project Vigyaan Setup Guide

## 📋 Prerequisites

- Node.js 18+ installed
- Google Maps API key (free tier available)

## 🔧 Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

### 3. Get Google Maps API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the **Maps JavaScript API**
4. Enable the **Places API** (for evacuation routes)
5. Enable the **Directions API** (for route navigation)
6. Create credentials (API Key)
7. Copy the API key to your `.env.local` file

### 4. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🌟 New Features Added

### 📚 Historical Disaster Data
- **Toggle History Mode**: Click the "📚 Show" button to display historical disasters
- **Date Range Selection**: Choose from 7 days to 1 year of historical data
- **Visual Distinction**: Historical events appear with reduced opacity and orange color coding
- **Enhanced Info Windows**: Detailed information including severity and alert levels

### 📍 Enhanced Location Features
- **Detailed Location Display**: Shows city, state, country, and coordinates
- **Location Refresh**: Manual refresh button to update your location
- **Error Handling**: Clear error messages for location permission issues
- **High Accuracy**: Uses high-accuracy GPS with timeout handling

### 📊 Statistics Dashboard
- **Live Event Count**: Real-time count of current disasters
- **Historical Event Count**: Number of past disasters in selected range
- **Recent Activity**: Events from the last 7 days
- **Top Disaster Types**: Most common disaster types with counts
- **Most Affected Countries**: Countries with highest disaster counts
- **Recent Activity Feed**: Latest disasters with timestamps

### 🚨 Emergency Support (India)
- **Emergency Contacts**: Complete list of Indian emergency numbers
- **One-Click Calling**: Direct phone calls to emergency services
- **Evacuation Routes**: Find nearest hospitals, schools, shelters, police stations, and fire stations
- **Route Navigation**: Get driving directions to emergency locations
- **Safety Tips**: Emergency preparedness guidelines

### 🎨 UI/UX Improvements
- **Enhanced Legend**: Color-coded disaster types with live/historical indicators
- **Better Map Controls**: Fullscreen, zoom, and map type controls
- **Responsive Design**: Works on desktop and mobile devices
- **Dark Mode Support**: Toggle between light and dark themes
- **Loading States**: Visual feedback during data fetching

## 🔍 How to Use

### Viewing Live Disasters
1. The map loads with current live disasters
2. Use the filter dropdown to show specific disaster types
3. Adjust proximity settings to focus on nearby, state, or country-level events
4. Click on markers for detailed information

### Exploring Historical Data
1. Click "📚 Show" to enable history mode
2. Select a date range (7 days to 1 year)
3. Historical events appear with orange coloring and reduced opacity
4. Use the statistics dashboard to analyze patterns

### Location Features
1. Allow location access when prompted
2. Your location appears in a detailed card below the header
3. Click "🔄 Refresh" to update your location
4. Use "📍 My Location" button to center the map on your position

### Statistics and Analytics
1. Scroll down to view the statistics dashboard
2. See live counts, recent activity, and top affected areas
3. Data updates automatically when toggling history mode
4. Use the information to understand disaster patterns

### Emergency Support
1. Scroll down to the Emergency Support section
2. Click "Show Contacts" to view Indian emergency numbers
3. Click any contact card to make an emergency call
4. Select evacuation type (hospital, school, shelter, etc.)
5. Click "Get Route" to see navigation directions
6. Review safety tips for emergency preparedness

## 🛠️ Technical Details

### APIs Used
- **GDACS API**: Global disaster data (live and historical)
- **OpenStreetMap Nominatim**: Reverse geocoding for location details
- **Google Maps JavaScript API**: Interactive mapping and clustering
- **Google Places API**: Find nearby emergency locations
- **Google Directions API**: Route navigation to emergency locations

### Key Components
- `GoogleMapView.js`: Main application component
- `ClusterMap.jsx`: Map rendering with marker clustering
- `DisasterStats.jsx`: Statistics and analytics dashboard
- `EmergencySupport.jsx`: Emergency contacts and evacuation routes

### Data Sources
- **Live Data**: Real-time disaster alerts from GDACS
- **Historical Data**: Past disasters with configurable date ranges
- **Location Data**: User's GPS coordinates with reverse geocoding

## 🚨 Troubleshooting

### Location Not Working
- Ensure location permissions are granted
- Check browser settings for location access
- Try refreshing the page and allowing location again

### Map Not Loading
- Verify your Google Maps API key is correct
- Check that the Maps JavaScript API is enabled
- Ensure your API key has proper restrictions set

### No Data Displayed
- Check internet connection
- Verify GDACS API is accessible
- Try refreshing the page

## 📈 Future Enhancements

- [ ] Email/SMS alert subscriptions
- [ ] Weather integration
- [ ] Mobile app version
- [ ] Offline capability
- [ ] Advanced filtering options
- [ ] Export functionality
- [ ] User accounts and preferences
- [ ] Real-time notifications
- [ ] Disaster severity predictions
- [ ] Interactive charts and graphs

## 🤝 Contributing

Feel free to contribute to this project by:
- Reporting bugs
- Suggesting new features
- Submitting pull requests
- Improving documentation

## 📄 License

This project is open source and available under the MIT License. 