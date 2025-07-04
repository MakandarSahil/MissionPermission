import React, { useState, useEffect } from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import PermissionManager from './src/components/PermissionManager';
import AudioRecorder from './src/components/AudioRecorder';
import CameraCapture from './src/components/CameraCapture';
import FileSelector from './src/components/FileSelector';
import TabBar from './src/components/TabBar';
import { globalStyles } from './src/styles/globalStyles';
import { Platform, PermissionsAndroid } from 'react-native';

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
  const [activeTab, setActiveTab] = useState<
    'permissions' | 'audio' | 'camera' | 'files'
  >('permissions');

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

  const renderContent = () => {
    switch (activeTab) {
      case 'permissions':
        return (
          <PermissionManager
            permissionStatus={permissionStatus}
            onPermissionUpdate={setPermissionStatus}
            isLoading={isLoading}
            onRefresh={checkPermissions}
          />
        );
      case 'audio':
        return (
          <AudioRecorder
            hasPermission={permissionStatus.microphone}
            onRequestPermission={checkPermissions}
          />
        );
      case 'camera':
        return (
          <CameraCapture
            hasPermission={permissionStatus.camera && permissionStatus.storage}
            onRequestPermission={checkPermissions}
          />
        );
      case 'files':
        return (
          <FileSelector
            hasPermission={permissionStatus.storage}
            onRequestPermission={checkPermissions}
          />
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={globalStyles.container}>
      <View style={globalStyles.header}>
        <Text style={globalStyles.title}>File Upload App</Text>
      </View>

      <TabBar activeTab={activeTab} setActiveTab={setActiveTab} />

      <View style={globalStyles.contentContainer}>{renderContent()}</View>
    </SafeAreaView>
  );
};

export default App;
