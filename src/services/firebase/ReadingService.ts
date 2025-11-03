import firestore from '@react-native-firebase/firestore';
import {Collections, FirebaseFirestore} from './config';
import {ReadingPayload} from '../../types/models';

const readingsCollection = () =>
  FirebaseFirestore().collection(Collections.HEALTH_READINGS);

class ReadingService {
  static async upsertReadings(readings: ReadingPayload[]): Promise<void> {
    if (!readings.length) {
      return;
    }

    const batch = FirebaseFirestore().batch();

    readings.forEach(reading => {
      const docRef = reading.id
        ? readingsCollection().doc(reading.id)
        : readingsCollection().doc();

      batch.set(
        docRef,
        {
          ...reading,
          uploaded: true,
          syncedAt: new Date().toISOString(),
        },
        {merge: true},
      );
    });

    await batch.commit();
  }
}

export default ReadingService;
