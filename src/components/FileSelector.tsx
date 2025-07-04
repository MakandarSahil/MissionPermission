import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  StyleSheet,
} from 'react-native';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { globalStyles } from '../styles/globalStyles';

const FileSelector = ({
  hasPermission,
  onRequestPermission,
}: {
  hasPermission: boolean;
  onRequestPermission: () => void;
}) => {
  const [selectedFile, setSelectedFile] = useState<any>(null);

  const selectFile = async (source: 'gallery' | 'camera') => {
    if (!hasPermission) {
      Alert.alert(
        'Permission Required',
        'Please grant storage permission first.',
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
        includeBase64: false,
      };

      const result =
        source === 'gallery'
          ? await launchImageLibrary(options)
          : await launchCamera(options);

      if (result.didCancel) {
        console.log('User cancelled file picker');
      } else if (result.errorCode) {
        console.error('Error:', result.errorMessage);
        Alert.alert('Error', result.errorMessage || 'Failed to select file');
      } else if (result.assets && result.assets[0]) {
        const asset = result.assets[0];
        setSelectedFile({
          uri: asset.uri,
          name: asset.fileName || 'file',
          type: asset.type || 'application/octet-stream',
          size: asset.fileSize || 0,
        });
      }
    } catch (error) {
      console.error('Error selecting file:', error);
      Alert.alert('Error', 'Failed to select file');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <ScrollView style={globalStyles.moduleContainer}>
      <Text style={globalStyles.moduleTitle}>File Selector</Text>

      {!hasPermission ? (
        <View style={globalStyles.permissionWarning}>
          <Text style={globalStyles.warningText}>
            Storage permission required
          </Text>
          <Text style={{ color: '#616161', marginBottom: 15 }}>
            You need to grant storage permission to select files.
          </Text>
          <TouchableOpacity
            style={globalStyles.button}
            onPress={onRequestPermission}
          >
            <Text style={globalStyles.buttonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View>
          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={[styles.selectButton, { backgroundColor: '#6200ee' }]}
              onPress={() => selectFile('gallery')}
            >
              <Text style={styles.selectButtonText}>📁 Open Gallery</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.selectButton,
                { backgroundColor: '#03dac6', marginTop: 10 },
              ]}
              onPress={() => selectFile('camera')}
            >
              <Text style={styles.selectButtonText}>📷 Take Photo/Video</Text>
            </TouchableOpacity>
          </View>

          {selectedFile && (
            <View style={globalStyles.fileInfo}>
              <Text style={globalStyles.fileText}>Selected File:</Text>
              <Text style={{ color: '#616161' }}>
                Name: {selectedFile.name}
              </Text>
              <Text style={{ color: '#616161' }}>
                Type: {selectedFile.type}
              </Text>
              <Text style={{ color: '#616161' }}>
                Size: {formatFileSize(selectedFile.size)}
              </Text>

              <TouchableOpacity
                style={[globalStyles.button, { marginTop: 15 }]}
              >
                <Text style={globalStyles.buttonText}>Upload File</Text>
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
  selectButton: {
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  selectButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default FileSelector;
