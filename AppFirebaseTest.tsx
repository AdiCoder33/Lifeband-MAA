import React from 'react';
import {SafeAreaView, StyleSheet} from 'react-native';
import FirebaseTestScreen from './src/screens/FirebaseTestScreen';

const App: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <FirebaseTestScreen />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;