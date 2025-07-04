import { PermissionsAndroid, Platform } from 'react-native';

export interface PermissionStatus {
  microphone: boolean;
  storage: boolean;
  camera: boolean;
}

class PermissionManager {
  static async checkAllPermissions(): Promise<PermissionStatus> {
    if (Platform.OS === 'android') {
      return this.checkAndroidPermissions();
    }
    // iOS would use react-native-permissions here
    return {
      microphone: false,
      storage: false,
      camera: false,
    };
  }

  private static async checkAndroidPermissions(): Promise<PermissionStatus> {
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
          audioMediaPermission && imageMediaPermission && videoMediaPermission;
      } else {
        const readPermission = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        );
        const writePermission = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        );
        storagePermission = readPermission && writePermission;
      }

      return {
        microphone: microphonePermission,
        storage: storagePermission,
        camera: cameraPermission,
      };
    } catch (err) {
      console.warn('Error checking permissions:', err);
      return {
        microphone: false,
        storage: false,
        camera: false,
      };
    }
  }

  static async requestAllPermissions(): Promise<PermissionStatus> {
    if (Platform.OS === 'android') {
      return this.requestAndroidPermissions();
    }
    // iOS would use react-native-permissions here
    return {
      microphone: false,
      storage: false,
      camera: false,
    };
  }

  private static async requestAndroidPermissions(): Promise<PermissionStatus> {
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

      return {
        microphone: microphoneGranted === PermissionsAndroid.RESULTS.GRANTED,
        storage: storageGranted,
        camera: cameraGranted === PermissionsAndroid.RESULTS.GRANTED,
      };
    } catch (err) {
      console.warn('Android permission error:', err);
      return {
        microphone: false,
        storage: false,
        camera: false,
      };
    }
  }
}

export default PermissionManager;
