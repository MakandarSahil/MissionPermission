import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { RNCamera, RNCameraProps } from 'react-native-camera';

interface CameraFeatureProps {
  hasPermission: boolean;
  onRequestPermission: () => Promise<void>;
}

const CameraFeature: React.FC<CameraFeatureProps> = ({
  hasPermission,
  onRequestPermission,
}) => {
  let cameraRef: RNCamera | null = null;

  const takePicture = async () => {
    if (!cameraRef) return;

    if (!hasPermission) {
      Alert.alert(
        'Permission required',
        'Camera permission is needed to take pictures',
      );
      await onRequestPermission();
      return;
    }

    try {
      const options = { quality: 0.5, base64: true };
      const data = await cameraRef.takePictureAsync(options);
      Alert.alert('Success', 'Picture taken successfully!');
      console.log('Picture data:', data);
    } catch (error) {
      console.error('Error taking picture:', error);
      Alert.alert('Error', 'Failed to take picture');
    }
  };

  if (!hasPermission) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>
          Camera permission is required to use this feature
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <RNCamera
        ref={ref => {
          cameraRef = ref;
        }}
        style={styles.preview}
        type={RNCamera.Constants.Type.back}
        captureAudio={false}
      >
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
            <Text style={styles.captureText}>Take Photo</Text>
          </TouchableOpacity>
        </View>
      </RNCamera>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    width: '100%',
  },
  buttonContainer: {
    flex: 0,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  captureButton: {
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 15,
    paddingHorizontal: 20,
    alignSelf: 'center',
    margin: 20,
  },
  captureText: {
    fontSize: 14,
    color: '#000',
  },
  text: {
    color: '#fff',
    fontSize: 16,
  },
});

export default CameraFeature;
