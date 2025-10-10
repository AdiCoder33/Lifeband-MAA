import React from 'react';
import {StatusBar, StyleSheet} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import AppNavigator from './src/navigation/AppNavigator';
import AppProviders from './src/providers/AppProviders';

const App: React.FC = () => {
  return (
    <GestureHandlerRootView style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#E8F0FE" />
      <AppProviders>
        <AppNavigator />
      </AppProviders>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#E8F0FE',
  },
});

export default App;
