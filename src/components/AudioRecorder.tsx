import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  Platform,
} from 'react-native';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import RNFS from 'react-native-fs';
import { globalStyles } from '../styles/globalStyles';

const audioRecorderPlayer = new AudioRecorderPlayer();

const AudioRecorder = ({
  hasPermission,
  onRequestPermission,
}: {
  hasPermission: boolean;
  onRequestPermission: () => void;
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioPath, setAudioPath] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playTime, setPlayTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  useEffect(() => {
    return () => {
      if (isRecording) onStopRecord();
      if (isPlaying) onStopPlay();
    };
  }, []);

  const onStartRecord = async () => {
    if (!hasPermission) {
      Alert.alert(
        'Permission Required',
        'Please grant microphone permission first.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Grant Permission', onPress: onRequestPermission },
        ],
      );
      return;
    }

    try {
      const path = Platform.select({
        ios: 'hello.m4a',
        android: `${RNFS.DocumentDirectoryPath}/hello.mp4`,
      });

      const uri = await audioRecorderPlayer.startRecorder(path!);
      audioRecorderPlayer.addRecordBackListener(e =>
        console.log('Recording:', e),
      );
      setAudioPath(uri);
      setIsRecording(true);
      setRecordingTime(0);
    } catch (err) {
      console.error('Failed to start recording:', err);
      Alert.alert('Error', 'Failed to start recording');
    }
  };

  const onStopRecord = async () => {
    try {
      const result = await audioRecorderPlayer.stopRecorder();
      audioRecorderPlayer.removeRecordBackListener();
      setIsRecording(false);
      console.log('Recording saved to:', result);
    } catch (err) {
      console.error('Failed to stop recording:', err);
    }
  };

  const onStartPlay = async () => {
    if (!audioPath) return;

    try {
      await audioRecorderPlayer.startPlayer(audioPath);
      audioRecorderPlayer.addPlayBackListener(e => {
        setPlayTime(e.currentPosition);
        setDuration(e.duration);
        if (e.currentPosition >= e.duration) {
          onStopPlay();
        }
      });
      setIsPlaying(true);
    } catch (err) {
      console.error('Failed to play recording:', err);
    }
  };

  const onStopPlay = async () => {
    try {
      await audioRecorderPlayer.stopPlayer();
      audioRecorderPlayer.removePlayBackListener();
      setIsPlaying(false);
      setPlayTime(0);
    } catch (err) {
      console.error('Failed to stop playback:', err);
    }
  };

  const onRetake = async () => {
    if (isPlaying) await onStopPlay();
    if (isRecording) await onStopRecord();

    if (audioPath) {
      try {
        await RNFS.unlink(audioPath);
      } catch (err) {
        console.warn('Failed to delete recording:', err);
      }
    }

    setAudioPath(null);
    setPlayTime(0);
    setDuration(0);
    setRecordingTime(0);
    setIsRecording(false);
    setIsPlaying(false);
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  return (
    <ScrollView style={globalStyles.moduleContainer}>
      <Text style={globalStyles.moduleTitle}>Audio Recorder</Text>

      {!hasPermission ? (
        <View style={globalStyles.permissionWarning}>
          <Text style={globalStyles.warningText}>
            Microphone permission required
          </Text>
          <Text style={{ color: '#616161', marginBottom: 15 }}>
            You need to grant microphone permission to record audio.
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
          <View style={styles.statusContainer}>
            <Text style={styles.statusText}>
              {isRecording ? '🔴 Recording...' : 'Audio Recorder'}
            </Text>
            <Text style={styles.timeText}>
              {formatTime(isRecording ? recordingTime * 1000 : playTime)}{' '}
              {duration > 0 && !isRecording ? `/ ${formatTime(duration)}` : ''}
            </Text>
          </View>

          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={[
                styles.recordButton,
                isRecording && styles.recordingButton,
              ]}
              onPress={isRecording ? onStopRecord : onStartRecord}
            >
              <Text style={styles.recordButtonText}>
                {isRecording ? 'Stop Recording' : 'Start Recording'}
              </Text>
            </TouchableOpacity>
          </View>

          {audioPath && !isRecording && (
            <View style={globalStyles.fileInfo}>
              <Text style={globalStyles.fileText}>Recording saved to:</Text>
              <Text style={{ color: '#616161', fontFamily: 'monospace' }}>
                {audioPath}
              </Text>

              <View style={styles.audioPlayer}>
                <TouchableOpacity
                  style={[styles.playButton, isPlaying && styles.playingButton]}
                  onPress={isPlaying ? onStopPlay : onStartPlay}
                >
                  <Text style={styles.playButtonText}>
                    {isPlaying ? '⏸ Pause' : '▶️ Play'}
                  </Text>
                </TouchableOpacity>

                <Text style={styles.timeText}>
                  {formatTime(playTime)} / {formatTime(duration)}
                </Text>
              </View>

              <TouchableOpacity style={styles.retakeButton} onPress={onRetake}>
                <Text style={styles.retakeText}>🔄 Retake</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[globalStyles.button, { marginTop: 15 }]}
              >
                <Text style={globalStyles.buttonText}>Upload Recording</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  statusContainer: {
    alignItems: 'center',
    marginBottom: 25,
  },
  statusText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
    marginBottom: 5,
  },
  timeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6200ee',
    marginTop: 10,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  recordButton: {
    backgroundColor: '#6200ee',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    minWidth: 150,
  },
  recordingButton: {
    backgroundColor: '#d32f2f',
  },
  recordButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  playButton: {
    backgroundColor: '#03dac6',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    minWidth: 100,
  },
  playingButton: {
    backgroundColor: '#d32f2f',
  },
  playButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  audioPlayer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
  },
  retakeButton: {
    marginTop: 15,
    backgroundColor: '#eeeeee',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: 'center',
  },
  retakeText: {
    color: '#d32f2f',
    fontWeight: 'bold',
  },
});

export default AudioRecorder;
