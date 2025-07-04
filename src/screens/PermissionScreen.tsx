import React, { useEffect, useState } from 'react';
import {
  Alert,
  Platform,
  SafeAreaView,
  Text,
  StyleSheet,
  View,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import PermissionManager, { PermissionStatus } from '../permissions/PermissionManager';
import PermissionStatusItem from '../components/PermissionStatusItem';
import CameraFeature from '../features/camera/CameraFeature';
// import AudioFeature from '../features/audio/AudioFeature';
// import FileFeature from '../features/storage/FileFeature';

const PermissionScreen: React.FC = () => {
  const [permissionStatus, setPermissionStatus] = useState<PermissionStatus>({
    microphone: false,
    storage: false,
    camera: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  const checkPermissions = async () => {
    setIsLoading(true);
    const status = await PermissionManager.checkAllPermissions();
    setPermissionStatus(status);
    setIsLoading(false);
  };

  const requestAllPermissions = async () => {
    setIsLoading(true);
    const status = await PermissionManager.requestAllPermissions();
    setPermissionStatus(status);
    setIsLoading(false);

    if (status.microphone && status.storage && status.camera) {
      Alert.alert(
        'Success! 🎉',
        'All permissions granted successfully. You can now use all app features.',
        [{ text: 'OK', style: 'default' }]
      );
    }
  };

  useEffect(() => {
    checkPermissions();
  }, []);

  const allPermissionsGranted = permissionStatus.microphone && 
                              permissionStatus.storage && 
                              permissionStatus.camera;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>App Permissions & Features 🎤📂📷</Text>
        
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Checking permissions...</Text>
          </View>
        ) : (
          <View style={styles.permissionsContainer}>
            <PermissionStatusItem 
              label="Microphone Recording" 
              granted={permissionStatus.microphone} 
            />
            <PermissionStatusItem 
              label="File Storage Access" 
              granted={permissionStatus.storage} 
            />
            <PermissionStatusItem 
              label="Camera Access" 
              granted={permissionStatus.camera} 
            />
            
            {allPermissionsGranted && (
              <View style={styles.successBanner}>
                <Text style={styles.successText}>🎉 All permissions granted! Ready to go!</Text>
              </View>
            )}
          </View>
        )}

        {/* Feature Sections */}
        <View style={styles.featuresContainer}>
          <Text style={styles.sectionTitle}>Feature Demos</Text>
          
          <CameraFeature 
            hasPermission={permissionStatus.camera} 
            onRequestPermission={requestAllPermissions} 
          />
          
          {/* <AudioFeature 
            hasPermission={permissionStatus.microphone} 
            onRequestPermission={requestAllPermissions} 
          />
          
          <FileFeature 
            hasPermission={permissionStatus.storage} 
            onRequestPermission={requestAllPermissions} 
          /> */}
        </View>
        
        <TouchableOpacity 
          style={[styles.button, { 
            backgroundColor: allPermissionsGranted ? '#4CAF50' : '#FEE715' 
          }]} 
          onPress={requestAllPermissions}
          disabled={isLoading}
        >
          <Text style={[styles.buttonText, { 
            color: allPermissionsGranted ? '#FFFFFF' : '#101820' 
          }]}>
            {allPermissionsGranted ? 'Re-request Permissions' : 'Grant All Permissions'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.secondaryButton} 
          onPress={checkPermissions}
          disabled={isLoading}
        >
          <Text style={styles.secondaryButtonText}>Refresh Status</Text>
        </TouchableOpacity>
        
        <Text style={styles.infoText}>
          Platform: {Platform.OS} (API Level: {Platform.Version})
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#101820',
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    color: '#FEE715',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  loadingContainer: {
    backgroundColor: '#1F2937',
    borderRadius: 10,
    padding: 20,
    marginBottom: 30,
    width: '100%',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FEE715',
    fontSize: 16,
  },
  permissionsContainer: {
    backgroundColor: '#1F2937',
    borderRadius: 10,
    padding: 20,
    marginBottom: 30,
    width: '100%',
  },
  successBanner: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 15,
    marginTop: 10,
    alignItems: 'center',
  },
  successText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  button: {
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
    marginBottom: 15,
    width: '100%',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  secondaryButton: {
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginBottom: 15,
    width: '100%',
    borderWidth: 2,
    borderColor: '#FEE715',
  },
  secondaryButtonText: {
    color: '#FEE715',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  infoText: {
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 20,
    textAlign: 'center',
  },
  featuresContainer: {
    width: '100%',
    marginBottom: 30,
  },
  sectionTitle: {
    color: '#FEE715',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
});

export default PermissionScreen;