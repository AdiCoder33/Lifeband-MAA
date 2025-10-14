import { useState, useEffect } from 'react';
import firestore from '@react-native-firebase/firestore';

// Simple connectivity test
export const testFirestoreConnection = async () => {
  try {
    console.log('Testing Firestore connection...');
    
    // Try to read from a simple collection
    const testDoc = await firestore()
      .collection('test')
      .doc('connection')
      .get();
    
    console.log('Firestore connection test successful');
    return { success: true, message: 'Connected' };
    
  } catch (error: any) {
    console.error('Firestore connection test failed:', error);
    return { 
      success: false, 
      message: error.message,
      code: error.code 
    };
  }
};

// Hook to check Firestore connectivity
export const useFirestoreConnection = () => {
  const [connected, setConnected] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    testFirestoreConnection().then(result => {
      setConnected(result.success);
      if (!result.success) {
        setError(result.message);
      }
    });
  }, []);

  return { connected, error };
};