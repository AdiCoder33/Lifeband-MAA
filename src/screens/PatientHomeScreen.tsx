import React, {useMemo, useState} from 'react';
import {ScrollView, StyleSheet, Text, View, Dimensions, TouchableOpacity, Alert} from 'react-native';
import {
  VictoryArea,
  VictoryAxis,
  VictoryChart,
  VictoryGroup,
  VictoryLine,
  VictoryTheme,
} from 'victory-native';
import ScreenBackground from '../components/ScreenBackground';
import AppHeader from '../components/AppHeader';
import ReadingTile from '../components/ReadingTile';
import {useAuth} from '../context/AuthContext';
import {useAppStore} from '../store/useAppStore';
import {usePatientReadings} from '../hooks/usePatientReadings';
import {palette, radii, spacing} from '../theme';

const now = Date.now();
const hour = 60 * 60 * 1000;
const screenWidth = Dimensions.get('window').width;
const chartWidth = screenWidth - 80; // Account for padding and margins

const demoHeartTrend = new Array(6).fill(0).map((_, index) => ({
  x: new Date(now - (5 - index) * hour),
  y: 72 + index * 3 - (index % 2 === 0 ? 2 : 0),
}));

const demoSpO2Trend = new Array(6).fill(0).map((_, index) => ({
  x: new Date(now - (5 - index) * hour),
  y: 96 + (index % 3 === 0 ? 1 : 0),
}));

const demoBloodPressure = new Array(6).fill(0).map((_, index) => ({
  x: new Date(now - (5 - index) * hour),
  systolic: 120 + (index % 2 === 0 ? 2 : -2),
  diastolic: 78 + (index % 2 === 0 ? -1 : 1),
}));

const demoBabyMovement = new Array(6).fill(0).map((_, index) => ({
  x: new Date(now - (5 - index) * hour),
  y: 30 + index * 2,
}));

export const PatientHomeScreen: React.FC = () => {
  const {name, identifier} = useAuth();
  const selectedPatient = useAppStore(state => state.selectedPatientId);
  const readings = usePatientReadings(selectedPatient ?? identifier, {
    days: 7,
  });
  const latest = readings[0];
  const [isConnected, setIsConnected] = useState(true);
  const [medicineReminders, setMedicineReminders] = useState([
    {
      id: '1',
      name: 'Folic Acid',
      time: '9:00 AM daily',
      doctor: 'Dr. Sarah',
      taken: false,
    },
    {
      id: '2',
      name: 'Iron Supplements',
      time: '7:00 PM daily',
      doctor: 'ASHA Worker Maya',
      taken: false,
    },
  ]);

  const handleScanForBands = () => {
    Alert.alert(
      'Scanning for LifeBands...',
      'Looking for nearby LifeBand devices',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Connect to LifeBand-001',
          onPress: () => {
            setTimeout(() => {
              Alert.alert('🎉 Success!', 'Successfully connected to LifeBand-001!\n\nYour health monitoring is now active.');
              setIsConnected(true);
            }, 1000);
          },
        },
      ]
    );
  };

  const handleDisconnect = () => {
    Alert.alert(
      'Disconnect LifeBand',
      'Are you sure you want to disconnect your LifeBand?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: () => {
            setIsConnected(false);
            Alert.alert('⚠️ Disconnected', 'LifeBand has been disconnected.\n\nHealth monitoring is now paused.');
          },
        },
      ]
    );
  };

  const handleMedicineTaken = (medicineId: string) => {
    setMedicineReminders(prev =>
      prev.map(med =>
        med.id === medicineId ? {...med, taken: !med.taken} : med
      )
    );
    Alert.alert('Medicine Reminder', 'Marked as taken! Great job staying healthy! 💊');
  };

  const handleAppointmentReminder = (appointmentTitle: string) => {
    Alert.alert(
      'Reminder Set! 🔔',
      `You'll be reminded about your ${appointmentTitle} appointment 1 hour before.`,
      [{text: 'OK', style: 'default'}]
    );
  };

  const handleEmergencyCall = (name: string, number: string) => {
    Alert.alert(
      `Call ${name}?`,
      `Do you want to call ${number}?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Call Now',
          style: 'default',
          onPress: () => {
            Alert.alert('Calling...', `Connecting to ${name} at ${number}`);
          },
        },
      ]
    );
  };

  const summary = useMemo(
    () => ({
      heartRate: latest?.heartRate ?? null,
      spo2: latest?.spo2 ?? null,
      systolic: latest?.systolic ?? null,
      diastolic: latest?.diastolic ?? null,
      temperature: latest?.temperature ?? null,
      timestamp: latest?.timestamp,
      babyMovement: latest?.babyMovement ?? null,
      stressLevel: latest?.stressLevel ?? null,
    }),
    [latest],
  );

  const hasLiveData = readings.length > 0;

  const heartSeries = hasLiveData
    ? readings
        .slice(0, 12)
        .map(item => ({x: new Date(item.timestamp), y: item.heartRate}))
        .reverse()
    : demoHeartTrend;

  const spo2Series = hasLiveData
    ? readings
        .slice(0, 12)
        .map(item => ({x: new Date(item.timestamp), y: item.spo2}))
        .reverse()
    : demoSpO2Trend;

  const bloodPressureSeries = hasLiveData
    ? readings
        .slice(0, 12)
        .map(item => ({
          x: new Date(item.timestamp),
          systolic: item.systolic,
          diastolic: item.diastolic,
        }))
        .reverse()
    : demoBloodPressure;

  const babyMovementSeries = hasLiveData
    ? readings
        .slice(0, 12)
        .map(item => ({x: new Date(item.timestamp), y: item.babyMovement}))
        .reverse()
    : demoBabyMovement;

  const lastUpdated = summary.timestamp
    ? new Date(summary.timestamp).toLocaleString()
    : 'No readings yet';

  return (
    <ScreenBackground>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Pregnancy Tracking Section */}
        <View style={styles.pregnancySection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🤰 Pregnancy Journey</Text>
            <Text style={styles.sectionSubtitle}>Track your beautiful journey</Text>
          </View>
          <View style={styles.pregnancyStats}>
            <View style={styles.pregnancyStatCard}>
              <Text style={styles.pregnancyStatNumber}>28</Text>
              <Text style={styles.pregnancyStatLabel}>Weeks</Text>
              <Text style={styles.pregnancyStatSub}>2nd Trimester</Text>
            </View>
            <View style={styles.pregnancyStatCard}>
              <Text style={styles.pregnancyStatNumber}>84</Text>
              <Text style={styles.pregnancyStatLabel}>Days Left</Text>
              <Text style={styles.pregnancyStatSub}>Almost there!</Text>
            </View>
            <View style={styles.pregnancyStatCard}>
              <Text style={styles.pregnancyStatNumber}>12.5</Text>
              <Text style={styles.pregnancyStatLabel}>kg Gained</Text>
              <Text style={styles.pregnancyStatSub}>Healthy range</Text>
            </View>
          </View>
        </View>

        {/* Medicine Reminders Section */}
        <View style={styles.medicineSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>💊 Medicine Reminders</Text>
            <Text style={styles.sectionSubtitle}>Prescribed by your care team</Text>
          </View>
          <View style={styles.medicineList}>
            {medicineReminders.map((medicine) => (
              <View key={medicine.id} style={styles.medicineItem}>
                <View style={styles.medicineInfo}>
                  <Text style={styles.medicineName}>{medicine.name}</Text>
                  <Text style={styles.medicineTime}>Take at {medicine.time}</Text>
                  <Text style={styles.medicineDoctor}>Prescribed by {medicine.doctor}</Text>
                </View>
                <TouchableOpacity 
                  style={[
                    styles.takenButton, 
                    medicine.taken && {backgroundColor: palette.success, opacity: 0.7}
                  ]} 
                  onPress={() => handleMedicineTaken(medicine.id)}>
                  <Text style={styles.takenButtonText}>
                    {medicine.taken ? '✓ Taken' : 'Mark Taken'}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* Health Precautions Section */}
        <View style={styles.precautionsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>⚠️ Important Precautions</Text>
            <Text style={styles.sectionSubtitle}>Stay safe during pregnancy</Text>
          </View>
          <View style={styles.precautionsList}>
            <View style={styles.precautionItem}>
              <Text style={styles.precautionIcon}>🚫</Text>
              <View style={styles.precautionContent}>
                <Text style={styles.precautionTitle}>Avoid Heavy Lifting</Text>
                <Text style={styles.precautionDesc}>Limit lifting to 5kg or less</Text>
              </View>
            </View>
            <View style={styles.precautionItem}>
              <Text style={styles.precautionIcon}>💧</Text>
              <View style={styles.precautionContent}>
                <Text style={styles.precautionTitle}>Stay Hydrated</Text>
                <Text style={styles.precautionDesc}>Drink 8-10 glasses of water daily</Text>
              </View>
            </View>
            <View style={styles.precautionItem}>
              <Text style={styles.precautionIcon}>🚭</Text>
              <View style={styles.precautionContent}>
                <Text style={styles.precautionTitle}>No Smoking/Alcohol</Text>
                <Text style={styles.precautionDesc}>Completely avoid for baby's health</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Appointments & Check-ups Section */}
        <View style={styles.appointmentsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📅 Upcoming Appointments</Text>
            <Text style={styles.sectionSubtitle}>Don't miss important check-ups</Text>
          </View>
          <View style={styles.appointmentsList}>
            <View style={styles.appointmentItem}>
              <View style={styles.appointmentDate}>
                <Text style={styles.appointmentDay}>15</Text>
                <Text style={styles.appointmentMonth}>Oct</Text>
              </View>
              <View style={styles.appointmentInfo}>
                <Text style={styles.appointmentTitle}>Ultrasound Scan</Text>
                <Text style={styles.appointmentTime}>10:30 AM - Dr. Sarah</Text>
                <Text style={styles.appointmentLocation}>City Hospital</Text>
              </View>
              <TouchableOpacity 
                style={styles.reminderButton}
                onPress={() => handleAppointmentReminder('Ultrasound Scan')}>
                <Text style={styles.reminderButtonText}>🔔</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.appointmentItem}>
              <View style={styles.appointmentDate}>
                <Text style={styles.appointmentDay}>22</Text>
                <Text style={styles.appointmentMonth}>Oct</Text>
              </View>
              <View style={styles.appointmentInfo}>
                <Text style={styles.appointmentTitle}>Regular Check-up</Text>
                <Text style={styles.appointmentTime}>2:00 PM - ASHA Maya</Text>
                <Text style={styles.appointmentLocation}>Community Center</Text>
              </View>
              <TouchableOpacity 
                style={styles.reminderButton}
                onPress={() => handleAppointmentReminder('Regular Check-up')}>
                <Text style={styles.reminderButtonText}>🔔</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Emergency Contacts Section */}
        <View style={styles.emergencySection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🚨 Emergency Contacts</Text>
            <Text style={styles.sectionSubtitle}>Quick access when you need help</Text>
          </View>
          <View style={styles.emergencyContacts}>
            <TouchableOpacity 
              style={styles.emergencyContact}
              onPress={() => handleEmergencyCall('City Hospital', '+91 98765 43210')}>
              <Text style={styles.emergencyIcon}>🏥</Text>
              <View style={styles.emergencyInfo}>
                <Text style={styles.emergencyName}>City Hospital</Text>
                <Text style={styles.emergencyNumber}>+91 98765 43210</Text>
              </View>
              <Text style={styles.callIcon}>📞</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.emergencyContact}
              onPress={() => handleEmergencyCall('Dr. Sarah', '+91 87654 32109')}>
              <Text style={styles.emergencyIcon}>👩‍⚕️</Text>
              <View style={styles.emergencyInfo}>
                <Text style={styles.emergencyName}>Dr. Sarah (Gynecologist)</Text>
                <Text style={styles.emergencyNumber}>+91 87654 32109</Text>
              </View>
              <Text style={styles.callIcon}>📞</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.emergencyContact}
              onPress={() => handleEmergencyCall('Ambulance Service', '108')}>
              <Text style={styles.emergencyIcon}>🚑</Text>
              <View style={styles.emergencyInfo}>
                <Text style={styles.emergencyName}>Ambulance Service</Text>
                <Text style={styles.emergencyNumber}>108</Text>
              </View>
              <Text style={styles.callIcon}>📞</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.heroCard}>
          <View>
            <Text style={styles.heroLabel}>Last sync</Text>
            <Text style={styles.heroValue}>{lastUpdated}</Text>
          </View>
          <View style={styles.heroInsights}>
            <Text style={styles.heroBadge}>
              {hasLiveData ? 'Live data' : 'Demo data preview'}
            </Text>
            <Text style={styles.heroCopy}>
              {hasLiveData
                ? 'These metrics reflect your latest LifeBand sync.'
                : 'Connect your LifeBand to replace demo visuals with actual readings.'}
            </Text>
          </View>
        </View>

        <View style={styles.tilesRow}>
          <ReadingTile
            label="Heart Rate"
            value={summary.heartRate}
            unit="bpm"
            trend={hasLiveData ? 'steady' : 'up'}
          />
          <ReadingTile
            label="SpO2"
            value={summary.spo2}
            unit="%"
            trend={hasLiveData ? 'steady' : 'down'}
          />
        </View>
        <View style={styles.tilesRow}>
          <ReadingTile
            label="Blood Pressure"
            value={
              summary.systolic && summary.diastolic
                ? `${summary.systolic}/${summary.diastolic}`
                : null
            }
            unit="mmHg"
            trend={hasLiveData ? 'steady' : 'up'}
            variant="secondary"
          />
          <ReadingTile
            label="Temperature"
            value={summary.temperature}
            unit="°C"
            trend={hasLiveData ? 'steady' : 'up'}
            variant="secondary"
          />
        </View>
        <View style={styles.tilesRow}>
          <ReadingTile
            label="Baby's Movement"
            value={summary.babyMovement}
            unit="movements/hr"
            trend={hasLiveData ? 'steady' : 'up'}
          />
          <ReadingTile
            label="Mother's Stress Level"
            value={summary.stressLevel}
            unit="%"
            trend={hasLiveData ? 'steady' : 'down'}
          />
        </View>

        <View style={styles.chartRow}>
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>💓 Heart Rate Trend</Text>
            <Text style={styles.chartSubtitle}>Your baby's heartbeat rhythm</Text>
            <VictoryChart
              theme={VictoryTheme.material}
              height={180}
              width={chartWidth}
              padding={{top: 16, left: 50, right: 20, bottom: 45}}
              scale={{x: 'time'}}>
              <VictoryAxis
                tickFormat={(value: Date | string | number) =>
                  new Date(value).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                }
                style={{
                  tickLabels: {fontSize: 10, fill: palette.textSecondary},
                  grid: {stroke: palette.border, strokeWidth: 0.5},
                }}
              />
              <VictoryAxis
                dependentAxis
                tickFormat={(value: number) => `${value}`}
                style={{
                  tickLabels: {fontSize: 10, fill: palette.textSecondary},
                  grid: {stroke: palette.border, strokeWidth: 0.5},
                }}
              />
              <VictoryArea
                interpolation="monotoneX"
                style={{
                  data: {fill: palette.maternal.blush + '40', stroke: palette.primary, strokeWidth: 2},
                }}
                data={heartSeries}
              />
            </VictoryChart>
            {!hasLiveData ? (
              <Text style={styles.chartHint}>
                🔄 Demo preview - Connect LifeBand for real-time monitoring
              </Text>
            ) : null}
          </View>

          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>🫁 Oxygen & Blood Pressure</Text>
            <Text style={styles.chartSubtitle}>Your health vitals overview</Text>
            <View style={styles.chartLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, {backgroundColor: palette.maternal.mint}]} />
                <Text style={styles.legendText}>SpO2</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, {backgroundColor: palette.maternal.peach}]} />
                <Text style={styles.legendText}>Systolic</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, {backgroundColor: palette.primary}]} />
                <Text style={styles.legendText}>Diastolic</Text>
              </View>
            </View>
            <VictoryChart
              theme={VictoryTheme.material}
              height={180}
              width={chartWidth}
              padding={{top: 16, left: 50, right: 20, bottom: 45}}
              scale={{x: 'time'}}>
              <VictoryAxis
                tickFormat={(value: Date | string | number) =>
                  new Date(value).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                }
                style={{
                  tickLabels: {fontSize: 10, fill: palette.textSecondary},
                  grid: {stroke: palette.border, strokeWidth: 0.5},
                }}
              />
              <VictoryAxis
                dependentAxis
                tickFormat={(value: number) => `${value}`}
                style={{
                  tickLabels: {fontSize: 10, fill: palette.textSecondary},
                  grid: {stroke: palette.border, strokeWidth: 0.5},
                }}
              />
              <VictoryGroup>
                <VictoryLine
                  data={spo2Series}
                  style={{data: {stroke: palette.maternal.mint, strokeWidth: 2}}}
                  interpolation="monotoneX"
                />
                <VictoryLine
                  data={bloodPressureSeries.map(item => ({
                    x: item.x,
                    y: item.systolic,
                  }))}
                  style={{data: {stroke: palette.maternal.peach, strokeWidth: 2}}}
                />
                <VictoryLine
                  data={bloodPressureSeries.map(item => ({
                    x: item.x,
                    y: item.diastolic,
                  }))}
                  style={{data: {stroke: palette.primary, strokeWidth: 2}}}
                />
              </VictoryGroup>
            </VictoryChart>
            {!hasLiveData ? (
              <Text style={styles.chartHint}>
                Demo lines: SpO2 (green) and blood pressure (gold/red) preview.
              </Text>
            ) : null}
          </View>
        </View>

        <View style={styles.chartRow}>
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>🤰 Baby Movement Trend</Text>
            <Text style={styles.chartSubtitle}>Track your baby's activity over time</Text>
            <VictoryChart
              theme={VictoryTheme.material}
              height={180}
              width={chartWidth}
              padding={{top: 16, left: 50, right: 20, bottom: 45}}
              scale={{x: 'time'}}>
              <VictoryAxis
                dependentAxis
                style={{
                  axis: {stroke: palette.border},
                  grid: {stroke: palette.border, strokeDasharray: '4'},
                }}
              />
              <VictoryAxis
                style={{
                  axis: {stroke: palette.border},
                  grid: {stroke: 'transparent'},
                }}
              />
              <VictoryLine
                data={hasLiveData ? babyMovementSeries : demoBabyMovement}
                style={{data: {stroke: palette.primary, strokeWidth: 2}}}
              />
            </VictoryChart>
          </View>
        </View>

        <View style={styles.carePlanCard}>
          <Text style={styles.careTitle}>🤱 Your Pregnancy Care Plan</Text>
          <View style={styles.careRow}>
            <Text style={styles.careIcon}>💓</Text>
            <Text style={styles.careText}>
              Keep your LifeBand positioned comfortably for continuous baby monitoring.
            </Text>
          </View>
          <View style={styles.careRow}>
            <Text style={styles.careIcon}>📊</Text>
            <Text style={styles.careText}>
              Review your health trends daily to stay informed about your wellness journey.
            </Text>
          </View>
          <View style={styles.careRow}>
            <Text style={styles.careIcon}>👩‍⚕️</Text>
            <Text style={styles.careText}>
              Share this dashboard with your doctor and ASHA worker for comprehensive care.
            </Text>
          </View>
          <View style={styles.careRow}>
            <Text style={styles.careIcon}>🚨</Text>
            <Text style={styles.careText}>
              Contact your healthcare provider immediately if you notice any concerning changes.
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenBackground>
  );
};

const styles = StyleSheet.create({
  content: {
    padding: spacing.lg,
  },
  heroCard: {
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: radii.lg,
    backgroundColor: palette.surface,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    shadowColor: palette.shadow,
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  heroLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: palette.textSecondary,
  },
  heroValue: {
    marginTop: 4,
    fontWeight: '700',
    color: palette.textPrimary,
  },
  heroInsights: {
    flex: 1,
    marginLeft: spacing.lg,
  },
  heroBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
    backgroundColor: palette.maternal.mint,
    fontWeight: '700',
    color: palette.textPrimary,
  },
  heroCopy: {
    marginTop: spacing.xs,
    color: palette.textSecondary,
    fontSize: 13,
  },
  tilesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  chartRow: {
    flexDirection: 'column',
    marginTop: spacing.xl,
  },
  chartCard: {
    marginBottom: spacing.lg,
    padding: spacing.lg,
    borderRadius: radii.lg,
    backgroundColor: palette.surface,
    shadowColor: palette.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: palette.textPrimary,
    marginBottom: spacing.xs,
  },
  chartSubtitle: {
    fontSize: 12,
    color: palette.textSecondary,
    marginBottom: spacing.md,
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.xs,
  },
  legendText: {
    fontSize: 11,
    color: palette.textSecondary,
    fontWeight: '600',
  },
  chartHint: {
    marginTop: spacing.sm,
    fontSize: 12,
    color: palette.textSecondary,
  },
  carePlanCard: {
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
    padding: spacing.lg,
    borderRadius: radii.lg,
    backgroundColor: palette.maternal.cream,
    borderWidth: 1,
    borderColor: palette.border,
  },
  careTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: palette.textPrimary,
    marginBottom: spacing.sm,
  },
  careRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: spacing.sm,
  },
  careIcon: {
    fontSize: 18,
    marginRight: spacing.sm,
    marginTop: 2,
  },
  careText: {
    flex: 1,
    color: palette.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  // New styles for Band Connection and Medicine features
  connectionSection: {
    marginTop: spacing.lg,
    padding: spacing.lg,
    backgroundColor: palette.surface,
    borderRadius: radii.lg,
    shadowColor: palette.shadow,
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },
  connectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  connectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: palette.textPrimary,
  },
  scanButton: {
    backgroundColor: palette.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
  },
  scanButtonText: {
    color: palette.textOnPrimary,
    fontWeight: '600',
    fontSize: 14,
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.backgroundSoft,
    padding: spacing.md,
    borderRadius: radii.md,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: palette.success,
    marginRight: spacing.sm,
  },
  statusText: {
    flex: 1,
    color: palette.textPrimary,
    fontWeight: '500',
  },
  disconnectButton: {
    backgroundColor: palette.danger,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.sm,
  },
  disconnectButtonText: {
    color: palette.textOnPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  medicineSection: {
    marginTop: spacing.lg,
    padding: spacing.lg,
    backgroundColor: palette.surface,
    borderRadius: radii.lg,
    shadowColor: palette.shadow,
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },
  sectionHeader: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: palette.textPrimary,
    marginBottom: spacing.xs,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: palette.textSecondary,
    fontWeight: '500',
  },
  medicineList: {
    gap: spacing.md,
  },
  medicineItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: palette.backgroundSoft,
    padding: spacing.md,
    borderRadius: radii.md,
    borderLeftWidth: 4,
    borderLeftColor: palette.accent,
  },
  medicineInfo: {
    flex: 1,
  },
  medicineName: {
    fontSize: 16,
    fontWeight: '700',
    color: palette.textPrimary,
    marginBottom: spacing.xs,
  },
  medicineTime: {
    fontSize: 14,
    color: palette.textSecondary,
    marginBottom: 4,
  },
  medicineDoctor: {
    fontSize: 12,
    color: palette.textSecondary,
    fontStyle: 'italic',
  },
  takenButton: {
    backgroundColor: palette.success,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
  },
  takenButtonText: {
    color: palette.textOnPrimary,
    fontWeight: '600',
    fontSize: 14,
  },
  // Enhanced scan button styles
  connectionSubtitle: {
    fontSize: 14,
    color: palette.textSecondary,
    fontWeight: '500',
    marginTop: 2,
  },
  disconnectedContainer: {
    gap: spacing.md,
  },
  enhancedScanButton: {
    backgroundColor: palette.primary,
    borderRadius: radii.lg,
    padding: spacing.lg,
    shadowColor: palette.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  scanButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanIcon: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  scanTextContainer: {
    alignItems: 'center',
  },
  scanButtonTitle: {
    color: palette.textOnPrimary,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  scanButtonSubtitle: {
    color: palette.textOnPrimary,
    fontSize: 12,
    fontWeight: '500',
    opacity: 0.9,
    marginTop: 2,
  },
  // Pregnancy tracking styles
  pregnancySection: {
    marginTop: spacing.lg,
    padding: spacing.lg,
    backgroundColor: palette.maternal.blush,
    borderRadius: radii.lg,
    shadowColor: palette.shadow,
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },
  pregnancyStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  pregnancyStatCard: {
    flex: 1,
    backgroundColor: palette.surface,
    padding: spacing.md,
    borderRadius: radii.md,
    alignItems: 'center',
    shadowColor: palette.shadow,
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  pregnancyStatNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: palette.primary,
    marginBottom: spacing.xs,
  },
  pregnancyStatLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: palette.textPrimary,
    marginBottom: 2,
  },
  pregnancyStatSub: {
    fontSize: 10,
    color: palette.textSecondary,
    textAlign: 'center',
  },
  // Precautions styles
  precautionsSection: {
    marginTop: spacing.lg,
    padding: spacing.lg,
    backgroundColor: palette.surface,
    borderRadius: radii.lg,
    borderLeftWidth: 4,
    borderLeftColor: palette.warning,
    shadowColor: palette.shadow,
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },
  precautionsList: {
    gap: spacing.md,
  },
  precautionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.backgroundSoft,
    padding: spacing.md,
    borderRadius: radii.md,
  },
  precautionIcon: {
    fontSize: 20,
    marginRight: spacing.md,
    width: 30,
    textAlign: 'center',
  },
  precautionContent: {
    flex: 1,
  },
  precautionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: palette.textPrimary,
    marginBottom: 2,
  },
  precautionDesc: {
    fontSize: 13,
    color: palette.textSecondary,
    fontWeight: '500',
  },
  // Appointments styles
  appointmentsSection: {
    marginTop: spacing.lg,
    padding: spacing.lg,
    backgroundColor: palette.surface,
    borderRadius: radii.lg,
    shadowColor: palette.shadow,
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },
  appointmentsList: {
    gap: spacing.md,
  },
  appointmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.maternal.mint,
    padding: spacing.md,
    borderRadius: radii.md,
  },
  appointmentDate: {
    backgroundColor: palette.primary,
    padding: spacing.sm,
    borderRadius: radii.sm,
    alignItems: 'center',
    marginRight: spacing.md,
    minWidth: 50,
  },
  appointmentDay: {
    fontSize: 18,
    fontWeight: '800',
    color: palette.textOnPrimary,
  },
  appointmentMonth: {
    fontSize: 12,
    fontWeight: '600',
    color: palette.textOnPrimary,
  },
  appointmentInfo: {
    flex: 1,
  },
  appointmentTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: palette.textPrimary,
    marginBottom: 2,
  },
  appointmentTime: {
    fontSize: 14,
    color: palette.textSecondary,
    marginBottom: 2,
  },
  appointmentLocation: {
    fontSize: 12,
    color: palette.textSecondary,
    fontStyle: 'italic',
  },
  reminderButton: {
    backgroundColor: palette.accent,
    padding: spacing.sm,
    borderRadius: radii.sm,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reminderButtonText: {
    fontSize: 18,
  },
  // Emergency contacts styles
  emergencySection: {
    marginTop: spacing.lg,
    padding: spacing.lg,
    backgroundColor: palette.surface,
    borderRadius: radii.lg,
    borderLeftWidth: 4,
    borderLeftColor: palette.danger,
    shadowColor: palette.shadow,
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },
  emergencyContacts: {
    gap: spacing.sm,
  },
  emergencyContact: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.maternal.cream,
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: palette.border,
  },
  emergencyIcon: {
    fontSize: 24,
    marginRight: spacing.md,
    width: 30,
    textAlign: 'center',
  },
  emergencyInfo: {
    flex: 1,
  },
  emergencyName: {
    fontSize: 15,
    fontWeight: '700',
    color: palette.textPrimary,
    marginBottom: 2,
  },
  emergencyNumber: {
    fontSize: 14,
    color: palette.primary,
    fontWeight: '600',
  },
  callIcon: {
    fontSize: 20,
    color: palette.success,
  },
});

export default PatientHomeScreen;
