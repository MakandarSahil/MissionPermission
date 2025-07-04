import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  StyleSheet,
} from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { globalStyles } from '../styles/globalStyles';

const CameraCapture = ({
  hasPermission,
  onRequestPermission,
}: {
  hasPermission: boolean;
  onRequestPermission: () => void;
}) => {
  const [media, setMedia] = useState<{
    uri: string;
    type: 'photo' | 'video';
  } | null>(null);

  const handleCapture = async (source: 'camera' | 'library') => {
    if (!hasPermission) {
      Alert.alert(
        'Permission Required',
        'Please grant camera and storage permissions first.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Grant Permission', onPress: onRequestPermission },
        ],
      );
      return;
    }

    try {
      const options = {
        mediaType: 'mixed' as const,
        quality: 1,
        saveToPhotos: true,
      };

      const result =
        source === 'camera'
          ? await launchCamera(options)
          : await launchImageLibrary(options);

      if (result.didCancel) {
        console.log('User cancelled');
      } else if (result.errorCode) {
        console.error('Error:', result.errorMessage);
        Alert.alert('Error', result.errorMessage || 'Failed to capture media');
      } else if (result.assets && result.assets[0]) {
        const asset = result.assets[0];
        setMedia({
          uri: asset.uri || '',
          type: asset.type?.startsWith('video') ? 'video' : 'photo',
        });
      }
    } catch (error) {
      console.error('Error capturing media:', error);
      Alert.alert('Error', 'Failed to capture media');
    }
  };

  return (
    <ScrollView style={globalStyles.moduleContainer}>
      <Text style={globalStyles.moduleTitle}>Media Capture</Text>

      {!hasPermission ? (
        <View style={globalStyles.permissionWarning}>
          <Text style={globalStyles.warningText}>
            Camera & Storage permissions required
          </Text>
          <Text style={{ color: '#616161', marginBottom: 15 }}>
            You need to grant camera and storage permissions to capture
            photos/videos.
          </Text>
          <TouchableOpacity
            style={globalStyles.button}
            onPress={onRequestPermission}
          >
            <Text style={globalStyles.buttonText}>Grant Permissions</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View>
          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={[styles.captureButton, { backgroundColor: '#6200ee' }]}
              onPress={() => handleCapture('camera')}
            >
              <Text style={styles.captureButtonText}>📷 Take Photo/Video</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.captureButton,
                { backgroundColor: '#03dac6', marginTop: 10 },
              ]}
              onPress={() => handleCapture('library')}
            >
              <Text style={styles.captureButtonText}>
                🖼️ Choose from Gallery
              </Text>
            </TouchableOpacity>
          </View>

          {media && (
            <View style={globalStyles.fileInfo}>
              <Text style={globalStyles.fileText}>
                {media.type === 'photo' ? '📸 Photo' : '🎥 Video'} selected:
              </Text>

              {media.type === 'photo' ? (
                <View style={globalStyles.previewContainer}>
                  <Image
                    source={{ uri: media.uri }}
                    style={globalStyles.previewImage}
                    resizeMode="contain"
                  />
                </View>
              ) : (
                <Text
                  style={{
                    color: '#616161',
                    fontFamily: 'monospace',
                    marginTop: 10,
                  }}
                >
                  {media.uri}
                </Text>
              )}

              <TouchableOpacity
                style={[globalStyles.button, { marginTop: 15 }]}
              >
                <Text style={globalStyles.buttonText}>
                  Upload {media.type === 'photo' ? 'Photo' : 'Video'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  buttonGroup: {
    marginBottom: 20,
  },
  captureButton: {
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  captureButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default CameraCapture;
