import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  PermissionsAndroid,
  ActivityIndicator,
} from 'react-native';
import { globalStyles } from '../styles/globalStyles';

const PermissionManager = ({
  permissionStatus,
  onPermissionUpdate,
  isLoading,
  onRefresh,
}: {
  permissionStatus: {
    microphone: boolean;
    storage: boolean;
    camera: boolean;
  };
  onPermissionUpdate: (status: {
    microphone: boolean;
    storage: boolean;
    camera: boolean;
  }) => void;
  isLoading: boolean;
  onRefresh: () => void;
}) => {
  const requestAndroidPermissions = async () => {
    try {
      const apiLevel = Platform.Version as number;

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

      if (apiLevel >= 33) {
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

      onPermissionUpdate(finalStatus);

      const allGranted =
        finalStatus.microphone && finalStatus.storage && finalStatus.camera;

      if (allGranted) {
        Alert.alert('Success!', 'All permissions granted successfully!');
      } else {
        const deniedPermissions = [];
        if (!finalStatus.microphone) deniedPermissions.push('Microphone');
        if (!finalStatus.storage) deniedPermissions.push('File Storage');
        if (!finalStatus.camera) deniedPermissions.push('Camera');

        Alert.alert(
          'Permissions Required',
          `Please grant ${deniedPermissions.join(
            ', ',
          )} permission(s) to use all features.`,
          [{ text: 'OK' }],
        );
      }
    } catch (err) {
      console.warn('Permission error:', err);
      Alert.alert('Error', 'Failed to request permissions.');
    }
  };

  const PermissionStatusItem = ({
    label,
    granted,
  }: {
    label: string;
    granted: boolean;
  }) => (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
      }}
    >
      <Text style={{ fontSize: 16 }}>{label}</Text>
      <View
        style={{
          backgroundColor: granted ? '#e8f5e9' : '#ffebee',
          paddingHorizontal: 12,
          paddingVertical: 4,
          borderRadius: 12,
        }}
      >
        <Text
          style={{ color: granted ? '#2e7d32' : '#c62828', fontWeight: '500' }}
        >
          {granted ? 'GRANTED' : 'DENIED'}
        </Text>
      </View>
    </View>
  );

  const allPermissionsGranted =
    permissionStatus.microphone &&
    permissionStatus.storage &&
    permissionStatus.camera;

  return (
    <ScrollView style={globalStyles.moduleContainer}>
      <Text style={globalStyles.moduleTitle}>App Permissions</Text>

      {isLoading ? (
        <View style={{ alignItems: 'center', padding: 20 }}>
          <ActivityIndicator size="large" color="#6200ee" />
          <Text style={{ marginTop: 10 }}>Checking permissions...</Text>
        </View>
      ) : (
        <View>
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
            <View
              style={{
                backgroundColor: '#e8f5e9',
                padding: 15,
                borderRadius: 8,
                marginTop: 15,
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <Text
                style={{ color: '#2e7d32', marginLeft: 10, fontWeight: '500' }}
              >
                All permissions granted! You can now use all app features.
              </Text>
            </View>
          )}
        </View>
      )}

      <TouchableOpacity
        style={[
          globalStyles.button,
          allPermissionsGranted && { backgroundColor: '#03dac6' },
        ]}
        onPress={
          Platform.OS === 'android' ? requestAndroidPermissions : onRefresh
        }
        disabled={isLoading}
      >
        <Text style={globalStyles.buttonText}>
          {allPermissionsGranted
            ? 'Re-request Permissions'
            : 'Request All Permissions'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={globalStyles.secondaryButton}
        onPress={onRefresh}
        disabled={isLoading}
      >
        <Text style={globalStyles.secondaryButtonText}>Refresh Status</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default PermissionManager;
