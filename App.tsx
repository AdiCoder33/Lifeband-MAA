import React from 'react';
import {StyleSheet, StatusBar} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import AppNavigator from './src/navigation/AppNavigator';
import AppProviders from './src/providers/AppProviders';
import {palette} from './src/theme';

const App: React.FC = () => {
  return (
    <GestureHandlerRootView style={styles.root}>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor="transparent"
        translucent={true}
        hidden={false}
      />
      <AppProviders>
        <AppNavigator />
      </AppProviders>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.background,
  },
});

export default App;
