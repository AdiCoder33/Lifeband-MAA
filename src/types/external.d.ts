declare module 'react-native-qrcode-scanner' {
  import {Component, ReactNode} from 'react';
  import {ViewProps, StyleProp, ViewStyle} from 'react-native';
  import {RNCameraProps} from 'react-native-camera';

  export interface Event {
    data: string;
  }

  export interface QRCodeScannerProps extends ViewProps {
    onRead: (event: Event) => void;
    topContent?: ReactNode;
    bottomContent?: ReactNode;
    flashMode?: 'auto' | 'on' | 'off' | 'torch';
    showMarker?: boolean;
    reactivate?: boolean;
    reactivateTimeout?: number;
    fadeIn?: boolean;
    cameraStyle?: StyleProp<ViewStyle>;
    containerStyle?: StyleProp<ViewStyle>;
    cameraProps?: Partial<RNCameraProps>;
  }

  export default class QRCodeScanner extends Component<QRCodeScannerProps> {}
}
