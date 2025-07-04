import React, { useEffect, useState } from 'react';
import {
  Alert,
  Platform,
  PermissionsAndroid,
  SafeAreaView,
  Text,
  StyleSheet,
  View,
  TouchableOpacity,
} from 'react-native';

interface PermissionStatus {
  microphone: boolean;
  storage: boolean;
  camera: boolean;
}

const App = () => {
  const [permissionStatus, setPermissionStatus] = useState<PermissionStatus>({
    microphone: false,
    storage: false,
    camera: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  const requestAndroidPermissions = async () => {
    try {
      const apiLevel = Platform.Version as number;

      // Request microphone permission
      const microphoneGranted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        {
          title: 'Microphone Permission',
          message:
            'This app needs access to your microphone to record audio files.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );

      // Request camera permission
      const cameraGranted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Camera Permission',
          message:
            'This app needs access to your camera to capture photos and videos.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );

      let storageGranted = false;

      // Handle storage permissions based on Android version
      if (apiLevel >= 33) {
        // For Android 13+ (API 33+), request media permissions
        const mediaPermissions = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO,
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
        ]);

        storageGranted =
          mediaPermissions[PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          mediaPermissions[PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          mediaPermissions[PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO] ===
            PermissionsAndroid.RESULTS.GRANTED;
      } else {
        // For older Android versions, request storage permissions
        const storagePermissions = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        ]);

        storageGranted =
          storagePermissions[
            PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
          ] === PermissionsAndroid.RESULTS.GRANTED &&
          storagePermissions[
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
          ] === PermissionsAndroid.RESULTS.GRANTED;
      }

      const finalStatus = {
        microphone: microphoneGranted === PermissionsAndroid.RESULTS.GRANTED,
        storage: storageGranted,
        camera: cameraGranted === PermissionsAndroid.RESULTS.GRANTED,
      };

      setPermissionStatus(finalStatus);

      // Check if all permissions are granted
      const allGranted =
        finalStatus.microphone && finalStatus.storage && finalStatus.camera;

      if (allGranted) {
        Alert.alert(
          'Success! 🎉',
          'All permissions granted successfully. You can now use all app features.',
          [{ text: 'OK', style: 'default' }],
        );
        console.log('✅ All Android permissions granted');
      } else {
        const deniedPermissions = [];
        if (!finalStatus.microphone) deniedPermissions.push('Microphone');
        if (!finalStatus.storage) deniedPermissions.push('File Storage');
        if (!finalStatus.camera) deniedPermissions.push('Camera');

        Alert.alert(
          'Permissions Required',
          `Please grant ${deniedPermissions.join(
            ', ',
          )} permission(s) to use all app features. You can try again or grant them manually in device settings.`,
          [
            { text: 'Try Again', onPress: () => requestAndroidPermissions() },
            { text: 'OK', style: 'cancel' },
          ],
        );
      }
    } catch (err) {
      console.warn('Android permission error:', err);
      Alert.alert('Error', 'Failed to request permissions. Please try again.');
    }
  };

  const requestIOSPermissions = async () => {
    try {
      console.log(
        'iOS permissions should be handled through Info.plist and react-native-permissions',
      );

      // For iOS, permissions are typically requested when the feature is first used
      // and are configured in Info.plist
      setPermissionStatus({
        microphone: true, // This would be checked via react-native-permissions
        storage: true,
        camera: true,
      });

      Alert.alert(
        'iOS Permissions',
        'On iOS, permissions will be requested when you first use each feature (recording, camera, file access).',
        [{ text: 'OK', style: 'default' }],
      );

      console.log('✅ iOS permissions handled (placeholder)');
    } catch (err) {
      console.warn('iOS permission error:', err);
    }
  };

  const requestAllPermissions = async () => {
    setIsLoading(true);

    if (Platform.OS === 'android') {
      await requestAndroidPermissions();
    } else if (Platform.OS === 'ios') {
      await requestIOSPermissions();
    }

    setIsLoading(false);
  };

  const checkPermissions = async () => {
    setIsLoading(true);

    if (Platform.OS === 'android') {
      try {
        const microphonePermission = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        );
        const cameraPermission = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.CAMERA,
        );

        const apiLevel = Platform.Version as number;
        let storagePermission = false;

        if (apiLevel >= 33) {
          const audioMediaPermission = await PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO,
          );
          const imageMediaPermission = await PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
          );
          const videoMediaPermission = await PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
          );
          storagePermission =
            audioMediaPermission &&
            imageMediaPermission &&
            videoMediaPermission;
        } else {
          const readPermission = await PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          );
          const writePermission = await PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          );
          storagePermission = readPermission && writePermission;
        }

        setPermissionStatus({
          microphone: microphonePermission,
          storage: storagePermission,
          camera: cameraPermission,
        });
      } catch (err) {
        console.warn('Error checking permissions:', err);
      }
    } else {
      // For iOS, you'd use react-native-permissions to check status
      setPermissionStatus({
        microphone: true,
        storage: true,
        camera: true,
      });
    }

    setIsLoading(false);
  };

  useEffect(() => {
    checkPermissions();
  }, []);

  const PermissionStatusItem = ({
    label,
    granted,
  }: {
    label: string;
    granted: boolean;
  }) => (
    <View style={styles.permissionItem}>
      <Text style={styles.permissionLabel}>{label}</Text>
      <View
        style={[
          styles.statusBadge,
          { backgroundColor: granted ? '#4CAF50' : '#F44336' },
        ]}
      >
        <Text style={styles.statusText}>
          {granted ? '✅ Granted' : '❌ Denied'}
        </Text>
      </View>
    </View>
  );

  const allPermissionsGranted =
    permissionStatus.microphone &&
    permissionStatus.storage &&
    permissionStatus.camera;

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>File Upload App Permissions 🎤📂📷</Text>

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
              <Text style={styles.successText}>
                🎉 All permissions granted! Ready to go!
              </Text>
            </View>
          )}
        </View>
      )}

      <TouchableOpacity
        style={[
          styles.button,
          { backgroundColor: allPermissionsGranted ? '#4CAF50' : '#FEE715' },
        ]}
        onPress={requestAllPermissions}
        disabled={isLoading}
      >
        <Text
          style={[
            styles.buttonText,
            { color: allPermissionsGranted ? '#FFFFFF' : '#101820' },
          ]}
        >
          {allPermissionsGranted
            ? 'Re-request Permissions'
            : 'Grant All Permissions'}
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#101820',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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
  permissionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  permissionLabel: {
    color: '#E5E7EB',
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  statusBadge: {
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
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
});

export default App;
