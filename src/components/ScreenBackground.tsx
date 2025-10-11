import React from 'react';
import {SafeAreaView, StyleSheet, View, ViewProps} from 'react-native';
import {palette} from '../theme';

type ScreenBackgroundProps = ViewProps & {
  children: React.ReactNode;
};

export const ScreenBackground: React.FC<ScreenBackgroundProps> = ({
  style,
  children,
  ...rest
}) => {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.gradient} />
      <View {...rest} style={[styles.content, style]}>
        {children}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: palette.background,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: palette.background,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
  },
  content: {
    flex: 1,
  },
});

export default ScreenBackground;
