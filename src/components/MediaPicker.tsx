import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  launchCamera,
  launchImageLibrary,
  MediaType,
  CameraOptions,
  ImageLibraryOptions,
} from 'react-native-image-picker';

type MediaItem = {
  uri: string;
  type?: 'photo' | 'video';
};

const MediaPicker = () => {
  const [media, setMedia] = useState<MediaItem | null>(null);
  const [isVideo, setIsVideo] = useState(false);

  const handleMedia = async (
    type: MediaType,
    options: CameraOptions | ImageLibraryOptions,
  ) => {
    try {
      const result = await (options.launchCamera
        ? launchCamera
        : launchImageLibrary)(options);

      if (result.didCancel) {
        Alert.alert('Cancelled', 'User cancelled media picker');
      } else if (result.errorCode) {
        Alert.alert('Error', result.errorMessage || 'Unknown error');
      } else if (result.assets && result.assets[0].uri) {
        setMedia({
          uri: result.assets[0].uri,
          type: type === 'video' ? 'video' : 'photo',
        });
        setIsVideo(type === 'video');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to access media');
      console.error(error);
    }
  };

  const takePhoto = () =>
    handleMedia('photo', {
      mediaType: 'photo',
      quality: 0.8,
      saveToPhotos: true,
      cameraType: 'back',
      launchCamera: true,
    });

  const recordVideo = () =>
    handleMedia('video', {
      mediaType: 'video',
      quality: 'high',
      videoQuality: 'high',
      durationLimit: 30, // 30 second limit
      launchCamera: true,
    });

  const pickFromGallery = () =>
    handleMedia('photo', {
      mediaType: 'photo',
      quality: 0.8,
      selectionLimit: 1,
      launchCamera: false,
    });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Media Picker</Text>

      {media ? (
        isVideo ? (
          <Text style={styles.videoText}>Video recorded: {media.uri}</Text>
        ) : (
          <Image source={{ uri: media.uri }} style={styles.image} />
        )
      ) : (
        <Text style={styles.placeholder}>No media selected</Text>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={takePhoto}>
          <Text style={styles.buttonText}>Take Photo</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={recordVideo}>
          <Text style={styles.buttonText}>Record Video</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={pickFromGallery}>
          <Text style={styles.buttonText}>Pick from Gallery</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  image: {
    width: 300,
    height: 300,
    borderRadius: 10,
    marginBottom: 20,
  },
  videoText: {
    fontSize: 16,
    marginBottom: 20,
    color: '#333',
  },
  placeholder: {
    fontSize: 16,
    color: '#999',
    marginBottom: 20,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    marginVertical: 8,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default MediaPicker;
