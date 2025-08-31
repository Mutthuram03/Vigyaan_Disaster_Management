'use client';
import GoogleMapView from '../components/GoogleMapView';
import ProtectedRoute from '../components/ProtectedRoute';

export default function MapPage() {
  return (
    <ProtectedRoute>
      <GoogleMapView />
    </ProtectedRoute>
  );
}
