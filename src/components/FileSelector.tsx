import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { pick, keepLocalCopy } from '@react-native-documents/picker';
import { viewDocument } from '@react-native-documents/viewer';

type StoredFile = {
  name: string;
  localUri: string;
  type?: string;
};

type FileSelectorProps = {
  hasPermission: boolean;
  onRequestPermission: () => Promise<void>;
};

const FileSelector = ({
  hasPermission,
  onRequestPermission,
}: FileSelectorProps) => {
  const [files, setFiles] = useState<StoredFile[]>([]);

  const handlePickFiles = async () => {
    try {
      const rawPicked = await pick({ allowMultiSelection: true });

      if (!rawPicked.length) return;

      // Convert name: string | null → string
      const pickedFiles = rawPicked.map(file => ({
        name: file.name ?? 'unnamed',
        uri: file.uri,
        type: file.type,
      }));

      const [first, ...rest] = pickedFiles;

      const copyResults = await keepLocalCopy({
        files: [
          {
            uri: first.uri,
            fileName: first.name,
          },
          ...rest.map(file => ({
            uri: file.uri,
            fileName: file.name,
          })),
        ],
        destination: 'documentDirectory',
      });

      const stored = copyResults
        .map((result, index) => {
          if (result.status !== 'success') return null;
          return {
            name: pickedFiles[index].name,
            localUri: result.localUri,
            type: pickedFiles[index].type,
          };
        })
        .filter(Boolean) as StoredFile[];

      setFiles(stored);
    } catch (err) {
      Alert.alert('Error', 'File selection or copy failed.');
    }
  };

  const handlePreview = async (uri: string, mimeType?: string) => {
    try {
      await viewDocument({ uri, mimeType });
    } catch (err) {
      Alert.alert('Preview Error', 'Could not preview this document.');
    }
  };

  const handleDiscardAll = () => setFiles([]);

  return (
    <View style={styles.container}>
      {files.length ? (
        <>
          <Text style={styles.label}>Uploaded Files:</Text>
          <ScrollView style={styles.fileList}>
            {files.map((file, index) => (
              <View key={index} style={styles.fileItem}>
                <Text style={styles.fileName}>{file.name}</Text>
                <TouchableOpacity
                  style={styles.previewButton}
                  onPress={() => handlePreview(file.localUri, file.type)}
                >
                  <Text style={styles.previewText}>Preview</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
          <TouchableOpacity
            style={[styles.button, styles.discardButton]}
            onPress={handleDiscardAll}
          >
            <Text style={styles.buttonText}>Discard All</Text>
          </TouchableOpacity>
        </>
      ) : (
        <TouchableOpacity style={styles.button} onPress={handlePickFiles}>
          <Text style={styles.buttonText}>Upload Documents</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default FileSelector;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 10,
    fontSize: 16,
  },
  fileList: {
    maxHeight: 300,
    marginBottom: 20,
  },
  fileItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 6,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  fileName: {
    flex: 1,
    marginRight: 10,
    color: '#111827',
  },
  previewButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  previewText: {
    color: '#fff',
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#2563eb',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  discardButton: {
    backgroundColor: '#dc2626',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
