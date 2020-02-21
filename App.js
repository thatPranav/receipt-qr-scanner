import React, {Component} from 'react';

import {
  StyleSheet,
  View,
  Text,
  Platform,
  TouchableOpacity,
  Linking,
  PermissionsAndroid,
  Alert,
} from 'react-native';

import {CameraKitCameraScreen} from 'react-native-camera-kit';
import RNFetchBlob from 'rn-fetch-blob';

export async function request_storage_runtime_permission() {
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      {
        title: 'ReactNativeCode Storage Permission',
        message:
          'ReactNativeCode App needs access to your storage to download Photos.',
      },
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      Alert.alert('Storage Permission Granted.');
    } else {
      Alert.alert('Storage Permission Not Granted');
    }
  } catch (err) {
    console.warn(err);
  }
}

class App extends Component {
  async componentDidMount() {
    await request_storage_runtime_permission();
  }

  constructor() {
    super();

    this.state = {
      QR_Code_Value: '',

      Start_Scanner: false,
    };
  }

  openLinkInBrowser = QR_Code => {
    // Linking.openURL(this.state.QR_Code_Value);

    var date = new Date();
    var image_URL = QR_Code;
    const {config, fs} = RNFetchBlob;
    let PictureDir = fs.dirs.PictureDir;
    let options = {
      fileCache: true,
      addAndroidDownloads: {
        useDownloadManager: true,
        notification: true,
        path: PictureDir + '/image_' + '.png',
        description: 'Image',
      },
    };
    config(options)
      .fetch('GET', image_URL)
      .then(res => {
        Alert.alert('Image Downloaded Successfully.');
      });
  };
  onQRCodeScanDone = QR_Code => {
    this.setState({QR_Code_Value: QR_Code});
    this.setState({Start_Scanner: false});

    this.openLinkInBrowser(QR_Code);
  };

  openQRCodeScanner = () => {
    var that = this;

    if (Platform.OS === 'android') {
      async function requestCameraPermission() {
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.CAMERA,
            {
              title: 'Camera App Permission',
              message: 'Camera App needs access to your camera ',
            },
          );
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            that.setState({QR_Code_Value: ''});
            that.setState({Start_Scanner: true});
          } else {
            alert('CAMERA permission denied');
          }
        } catch (err) {
          alert('Camera permission err', err);
          console.warn(err);
        }
      }
      requestCameraPermission();
    } else {
      that.setState({QR_Code_Value: ''});
      that.setState({Start_Scanner: true});
    }
  };
  render() {
    if (!this.state.Start_Scanner) {
      return (
        <View style={styles.MainContainer}>
          <Text style={{fontSize: 22, textAlign: 'center'}}>
            Scan QR for reciept
          </Text>

          <Text style={styles.QR_text}>
            {this.state.QR_Code_Value
              ? 'Scanned QR Code: ' + this.state.QR_Code_Value
              : ''}
          </Text>

          {this.state.QR_Code_Value.includes('http') ? (
            <TouchableOpacity
              onPress={this.openLink_in_browser}
              style={styles.button}>
              <Text style={{color: '#FFF', fontSize: 14}}>
                Download Receipt
              </Text>
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity
            onPress={this.openQRCodeScanner}
            style={styles.button}>
            <Text style={{color: '#FFF', fontSize: 14}}>Open QR Scanner</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return (
      <View style={{flex: 1}}>
        <CameraKitCameraScreen
          showFrame={true}
          scanBarcode={true}
          laserColor={'#FF3D00'}
          frameColor={'#00C853'}
          colorForScannerFrame={'black'}
          onReadCode={event =>
            this.onQRCodeScanDone(event.nativeEvent.codeStringValue)
          }
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  MainContainer: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 20 : 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  QR_text: {
    color: '#000',
    fontSize: 19,
    padding: 8,
    marginTop: 12,
  },
  button: {
    backgroundColor: '#2979FF',
    alignItems: 'center',
    padding: 12,
    width: 300,
    marginTop: 14,
  },
});

export default App;
