import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import Geolocation from '@react-native-community/geolocation';

type LiveLocationTrackerProps = {
  hasPermission: boolean;
  onRequestPermission: () => Promise<void>;
};

const LiveLocationTracker: React.FC<LiveLocationTrackerProps> = ({
  hasPermission,
  onRequestPermission,
}) => {
  const [location, setLocation] = useState<{
    latitude: number | null;
    longitude: number | null;
  }>({
    latitude: null,
    longitude: null,
  });

  const [address, setAddress] = useState<string>('Fetching address...');

  const reverseGeocode = async (lat: number, lon: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
        {
          headers: {
            'User-Agent': 'ReactNativeApp', // Required by Nominatim
          },
        },
      );
      const data = await res.json();
      const result = data.display_name || 'Unknown location';
      setAddress(result);
    } catch (err) {
      console.error('Reverse geocoding error:', err);
      setAddress('Failed to fetch address');
    }
  };

  useEffect(() => {
    let watchId: number;

    const startLocationUpdates = () => {
      watchId = Geolocation.watchPosition(
        position => {
          const { latitude, longitude } = position.coords;
          console.log('LIVE LOCATION:', latitude, longitude);
          setLocation({ latitude, longitude });
          reverseGeocode(latitude, longitude); // 🔁 get address
        },
        error => {
          console.error('Location Error:', error.message);
          Alert.alert('Location Error', error.message);
        },
        {
          enableHighAccuracy: true,
          distanceFilter: 0,
          interval: 1000,
          fastestInterval: 500,
        },
      );
    };

    if (hasPermission) {
      startLocationUpdates();
    } else {
      onRequestPermission().then(startLocationUpdates);
    }

    return () => {
      if (watchId !== null) {
        Geolocation.clearWatch(watchId);
      }
    };
  }, [hasPermission]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Live Location Tracker</Text>
      {location.latitude !== null && location.longitude !== null ? (
        <>
          <Text style={styles.text}>
            Latitude: {location.latitude.toFixed(6)}
          </Text>
          <Text style={styles.text}>
            Longitude: {location.longitude.toFixed(6)}
          </Text>
          <Text style={[styles.text, { marginTop: 8 }]}>
            Address: {address}
          </Text>
        </>
      ) : (
        <Text style={styles.text}>Fetching location...</Text>
      )}
    </View>
  );
};

export default LiveLocationTracker;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f4f4f4',
    borderRadius: 10,
    margin: 20,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    marginVertical: 4,
  },
});
