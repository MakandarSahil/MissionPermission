import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import {
  launchCamera,
  launchImageLibrary,
  Asset,
  CameraOptions,
} from 'react-native-image-picker';
import FileViewer from 'react-native-file-viewer';
import RNFS from 'react-native-fs';

const CameraCapture = () => {
  const [media, setMedia] = useState<{
    uri: string;
    type: 'photo' | 'video';
  } | null>(null);

  const handleMedia = async (
    source: 'camera' | 'gallery',
    mediaType: 'photo' | 'video',
  ) => {
    try {
      const options: CameraOptions = {
        mediaType,
        quality: 1,
        videoQuality: 'high',
        durationLimit: 60,
        saveToPhotos: true,
      };

      const result =
        source === 'camera'
          ? await launchCamera(options)
          : await launchImageLibrary(options);

      if (result.didCancel) {
        console.log('User cancelled');
      } else if (result.errorCode) {
        Alert.alert('Error', result.errorMessage || 'Operation failed');
      } else if (result.assets && result.assets.length > 0) {
        const asset: Asset = result.assets[0];
        setMedia({
          uri: asset.uri || '',
          type: asset.type?.startsWith('video') ? 'video' : 'photo',
        });
      }
    } catch (err) {
      console.error('Error:', err);
      Alert.alert('Error', 'Something went wrong');
    }
  };

  const openInNativeApp = async (uri: string) => {
    try {
      const exists = await RNFS.exists(uri);
      if (!exists) {
        Alert.alert('File not found', 'The media file is not available.');
        return;
      }

      await FileViewer.open(uri, { showOpenWithDialog: true });
    } catch (err) {
      console.log('Viewer error:', err);
      Alert.alert('Error', 'No compatible app found to open this media.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>🎬 Capture or Select Media</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => handleMedia('camera', 'photo')}
      >
        <Text style={styles.buttonText}>📷 Take Photo</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => handleMedia('camera', 'video')}
      >
        <Text style={styles.buttonText}>🎥 Record Video</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => handleMedia('gallery', 'photo')}
      >
        <Text style={styles.buttonText}>🖼️ Pick Photo from Gallery</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => handleMedia('gallery', 'video')}
      >
        <Text style={styles.buttonText}>📁 Pick Video from Gallery</Text>
      </TouchableOpacity>

      {media && (
        <View style={styles.previewSection}>
          <Text style={styles.previewLabel}>
            {media.type === 'photo'
              ? '📸 Photo Selected:'
              : '🎥 Video Selected:'}
          </Text>

          {media.type === 'photo' ? (
            <Image
              source={{ uri: media.uri }}
              style={styles.image}
              resizeMode="contain"
            />
          ) : (
            <Text
              style={styles.linkText}
              onPress={() => openInNativeApp(media.uri)}
            >
              {media.uri.split('/').pop() || 'Open in Native Player'}
            </Text>
          )}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
    color: '#333',
  },
  button: {
    backgroundColor: '#6200ee',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  previewSection: {
    marginTop: 20,
    alignItems: 'center',
  },
  previewLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  image: {
    width: '100%',
    height: 250,
    borderRadius: 10,
  },
  linkText: {
    color: '#1e88e5',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});

export default CameraCapture;
