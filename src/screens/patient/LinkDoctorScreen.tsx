import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';
import {RNCamera} from 'react-native-camera';
import ScreenBackground from '../../components/ScreenBackground';
import {useAuth} from '../../context/AuthContext';
import DoctorPatientLinkService from '../../services/firebase/DoctorPatientLinkService';
import {LinkedDoctor, MonthlyReportSummary} from '../../types/models';
import {palette, radii, spacing} from '../../theme';

type InvitePayload = {
  inviteId: string;
  code: string;
};

const parseInvitePayload = (raw: string): InvitePayload => {
  const value = raw?.trim();
  if (!value) {
    throw new Error('QR code was empty. Please try again.');
  }

  // Preferred format: inviteId|CODE
  if (value.includes('|')) {
    const [inviteId, code] = value.split('|');
    if (inviteId && code) {
      return {inviteId: inviteId.trim(), code: code.trim()};
    }
  }

  // JSON fallback
  if (value.startsWith('{')) {
    try {
      const parsed = JSON.parse(value);
      if (parsed.inviteId && parsed.code) {
        return {
          inviteId: String(parsed.inviteId),
          code: String(parsed.code),
        };
      }
    } catch (error) {
      // ignore json parse failure
    }
  }

  // URL query fallback lifeband://doctor-invite?inviteId=...&code=...
  if (value.includes('inviteId=') && value.includes('code=')) {
    const searchParams = value.split('?')[1] ?? value;
    const params = searchParams.split('&');
    const paramMap = new Map<string, string>();
    params.forEach(param => {
      const [key, val] = param.split('=');
      if (key && val) {
        paramMap.set(key, decodeURIComponent(val));
      }
    });

    const inviteId = paramMap.get('inviteId');
    const code = paramMap.get('code');
    if (inviteId && code) {
      return {inviteId, code};
    }
  }

  throw new Error('Unsupported QR code format. Please request a new doctor QR.');
};

export const LinkDoctorScreen: React.FC = () => {
  const {user} = useAuth();
  const patientId = user?.uid;
  const [linkedDoctors, setLinkedDoctors] = useState<LinkedDoctor[]>([]);
  const [reports, setReports] = useState<MonthlyReportSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [manualInviteId, setManualInviteId] = useState('');
  const [manualCode, setManualCode] = useState('');
  const [processing, setProcessing] = useState(false);

  const careTeamTitle = useMemo(() => {
    if (!linkedDoctors.length) {
      return 'No doctors connected yet';
    }
    if (linkedDoctors.length === 1) {
      return '1 doctor connected';
    }
    return `${linkedDoctors.length} doctors connected`;
  }, [linkedDoctors.length]);

  const loadData = useCallback(async () => {
    if (!patientId) {
      return;
    }
    try {
      setLoading(true);
      const [doctors, monthlyReports] = await Promise.all([
        DoctorPatientLinkService.getLinkedDoctors(patientId),
        DoctorPatientLinkService.getMonthlyReportsForPatient(patientId),
      ]);

      setLinkedDoctors(doctors);
      setReports(monthlyReports.slice(0, 5));
    } catch (error) {
      console.error('Failed to load care team data:', error);
      Alert.alert(
        'Unable to load care team',
        'Please check your internet connection and try again.',
      );
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const resetManualFields = () => {
    setManualInviteId('');
    setManualCode('');
  };

  const redeemInvite = useCallback(
    async (payload: InvitePayload) => {
      if (!patientId) {
        Alert.alert('Unable to connect', 'Please sign in again to continue.');
        return;
      }

      try {
        setProcessing(true);
        await DoctorPatientLinkService.redeemInvite({
          inviteId: payload.inviteId,
          code: payload.code,
          patientId,
        });

        await loadData();
        Alert.alert(
          'Doctor connected',
          'Your doctor can now review your readings and submit monthly reports.',
        );
        resetManualFields();
      } catch (error: any) {
        Alert.alert(
          'Unable to connect',
          error?.message ?? 'Please verify the QR and try again.',
        );
      } finally {
        setProcessing(false);
        setScanning(false);
      }
    },
    [loadData, patientId],
  );

  const handleScanSuccess = (event: {data: string}) => {
    try {
      const payload = parseInvitePayload(event.data);
      redeemInvite(payload);
    } catch (error: any) {
      Alert.alert(
        'Scan failed',
        error?.message ?? 'We could not read this QR. Please try again.',
      );
    }
  };

  const handleManualLink = () => {
    if (!manualInviteId.trim() || !manualCode.trim()) {
      Alert.alert('Missing details', 'Please enter both Invite ID and Code.');
      return;
    }
    redeemInvite({
      inviteId: manualInviteId.trim(),
      code: manualCode.trim(),
    });
  };

  const handleRefresh = () => {
    loadData();
  };

  const renderDoctor = (doctor: LinkedDoctor) => (
    <View key={doctor.linkId} style={styles.doctorCard}>
      <View style={styles.doctorAvatar}>
        <Text style={styles.avatarText}>
          {doctor.name
            ?.split(' ')
            .map(part => part[0]?.toUpperCase() ?? '')
            .slice(0, 2)
            .join('') || 'DR'}
        </Text>
      </View>
      <View style={styles.doctorInfo}>
        <Text style={styles.doctorName}>
          {doctor.name ? `Dr. ${doctor.name}` : 'Doctor'}
        </Text>
        {doctor.specialization ? (
          <Text style={styles.doctorMeta}>{doctor.specialization}</Text>
        ) : null}
        {doctor.hospital ? (
          <Text style={styles.doctorMeta}>{doctor.hospital}</Text>
        ) : null}
        {doctor.latestReport ? (
          <Text style={styles.doctorReport}>
            Last report on{' '}
            {new Date(doctor.latestReport.createdAt).toLocaleDateString()}
          </Text>
        ) : (
          <Text style={styles.doctorReport}>
            Awaiting first monthly report from this doctor.
          </Text>
        )}
      </View>
    </View>
  );

  const renderReport = (report: MonthlyReportSummary) => (
    <View key={report.id} style={styles.reportCard}>
      <View style={styles.reportHeader}>
        <Text style={styles.reportDoctor}>
          {report.doctorName ? `Dr. ${report.doctorName}` : 'Doctor'}
        </Text>
        <Text style={styles.reportDate}>
          {new Date(report.createdAt).toLocaleDateString()}
        </Text>
      </View>
      <Text style={styles.reportPeriod}>
        Period: {report.periodStart} → {report.periodEnd}
      </Text>
      <Text style={styles.reportSummary}>{report.summary}</Text>
      {report.recommendations ? (
        <Text style={styles.reportRecommendations}>
          Recommendations: {report.recommendations}
        </Text>
      ) : null}
    </View>
  );

  return (
    <ScreenBackground>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Care Team Linking</Text>
        <Text style={styles.subtitle}>
          Scan your doctor&apos;s QR to allow them to review your readings and
          submit monthly pregnancy reports.
        </Text>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Connect with your doctor</Text>
            <TouchableOpacity
              onPress={() => setScanning(current => !current)}
              style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonLabel}>
                {scanning ? 'Close scanner' : 'Scan doctor QR'}
              </Text>
            </TouchableOpacity>
          </View>

          {scanning ? (
            <View style={styles.scannerContainer}>
              <QRCodeScanner
                onRead={handleScanSuccess}
                fadeIn
                reactivate={false}
                showMarker
                cameraStyle={styles.cameraPreview}
                containerStyle={styles.scanner}
                cameraProps={{
                  captureAudio: false,
                  type: RNCamera.Constants.Type.back,
                }}
                topContent={
                  <Text style={styles.scannerHint}>
                    Align the QR inside the square to connect with your doctor.
                  </Text>
                }
                bottomContent={
                  <TouchableOpacity
                    onPress={() => setScanning(false)}
                    style={styles.cancelScanButton}>
                    <Text style={styles.cancelScanLabel}>Cancel scan</Text>
                  </TouchableOpacity>
                }
              />
            </View>
          ) : null}

          <View style={styles.manualContainer}>
            <Text style={styles.manualLabel}>
              Prefer manual entry? Enter the Invite ID and code printed below
              the QR shared by your doctor.
            </Text>
            <View style={styles.manualRow}>
              <View style={styles.manualField}>
                <Text style={styles.inputLabel}>Invite ID</Text>
                <TextInput
                  value={manualInviteId}
                  onChangeText={setManualInviteId}
                  placeholder="e.g. INV123"
                  placeholderTextColor={palette.textSecondary}
                  autoCapitalize="characters"
                  style={styles.input}
                  editable={!processing}
                />
              </View>
              <View style={styles.manualField}>
                <Text style={styles.inputLabel}>Code</Text>
                <TextInput
                  value={manualCode}
                  onChangeText={setManualCode}
                  placeholder="e.g. 9X2F4P"
                  placeholderTextColor={palette.textSecondary}
                  autoCapitalize="characters"
                  style={styles.input}
                  editable={!processing}
                />
              </View>
            </View>
            <TouchableOpacity
              onPress={handleManualLink}
              disabled={processing}
              style={[styles.primaryButton, processing && styles.disabled]}>
              {processing ? (
                <ActivityIndicator color={palette.textOnPrimary} />
              ) : (
                <Text style={styles.primaryButtonLabel}>Connect doctor</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your care team</Text>
            <TouchableOpacity onPress={handleRefresh}>
              <Text style={styles.refreshLink}>Refresh</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.sectionSubtitle}>{careTeamTitle}</Text>

          {loading ? (
            <View style={styles.loadingState}>
              <ActivityIndicator size="small" color={palette.primary} />
              <Text style={styles.loadingLabel}>Loading care team...</Text>
            </View>
          ) : linkedDoctors.length ? (
            linkedDoctors.map(renderDoctor)
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No doctors linked yet</Text>
              <Text style={styles.emptyCopy}>
                Ask your doctor to open the LifeBand Doctor app, generate a QR,
                and scan it here to share your pregnancy data securely.
              </Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Monthly reports</Text>
            <Text style={styles.sectionSubtitle}>
              Doctors send a monthly summary once they review your readings.
            </Text>
          </View>
          {reports.length ? (
            reports.map(renderReport)
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No reports submitted yet</Text>
              <Text style={styles.emptyCopy}>
                Monthly reports will appear here after your doctor reviews your
                readings.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.xl,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: palette.textPrimary,
  },
  subtitle: {
    marginTop: spacing.xs,
    color: palette.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  section: {
    padding: spacing.lg,
    borderRadius: radii.xl,
    backgroundColor: palette.surface,
    shadowColor: palette.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: palette.textPrimary,
  },
  sectionSubtitle: {
    color: palette.textSecondary,
    fontSize: 13,
  },
  secondaryButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: palette.primary,
  },
  secondaryButtonLabel: {
    color: palette.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  scannerContainer: {
    borderRadius: radii.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: palette.primary,
    marginBottom: spacing.lg,
  },
  scanner: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: palette.background,
  },
  cameraPreview: {
    height: 280,
  },
  scannerHint: {
    color: palette.textOnDark,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  cancelScanButton: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    backgroundColor: palette.danger,
  },
  cancelScanLabel: {
    color: palette.textOnDark,
    fontWeight: '600',
  },
  manualContainer: {
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: radii.lg,
    padding: spacing.md,
    backgroundColor: palette.surfaceSoft,
  },
  manualLabel: {
    color: palette.textSecondary,
    fontSize: 13,
    marginBottom: spacing.md,
  },
  manualRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  manualField: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: palette.textSecondary,
    marginBottom: spacing.xs,
  },
  input: {
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: palette.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: palette.textPrimary,
    backgroundColor: palette.surface,
  },
  primaryButton: {
    marginTop: spacing.sm,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    backgroundColor: palette.primary,
    alignItems: 'center',
  },
  primaryButtonLabel: {
    color: palette.textOnPrimary,
    fontWeight: '700',
    fontSize: 15,
  },
  disabled: {
    opacity: 0.6,
  },
  refreshLink: {
    color: palette.primary,
    fontWeight: '600',
  },
  loadingState: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  loadingLabel: {
    color: palette.textSecondary,
    fontSize: 13,
  },
  doctorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: palette.surfaceSoft,
    borderWidth: 1,
    borderColor: palette.border,
  },
  doctorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    color: palette.textOnPrimary,
    fontWeight: '700',
    fontSize: 18,
  },
  doctorInfo: {
    flex: 1,
    gap: 4,
  },
  doctorName: {
    fontSize: 15,
    fontWeight: '700',
    color: palette.textPrimary,
  },
  doctorMeta: {
    color: palette.textSecondary,
    fontSize: 13,
  },
  doctorReport: {
    marginTop: spacing.xs,
    color: palette.textSecondary,
    fontSize: 12,
    fontStyle: 'italic',
  },
  emptyState: {
    marginTop: spacing.md,
    padding: spacing.lg,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.surfaceSoft,
  },
  emptyTitle: {
    fontWeight: '700',
    color: palette.textPrimary,
    fontSize: 14,
  },
  emptyCopy: {
    marginTop: spacing.xs,
    color: palette.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
  reportCard: {
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.surfaceSoft,
    gap: spacing.xs,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reportDoctor: {
    fontWeight: '700',
    color: palette.textPrimary,
  },
  reportDate: {
    color: palette.textSecondary,
    fontSize: 12,
  },
  reportPeriod: {
    color: palette.textSecondary,
    fontSize: 12,
  },
  reportSummary: {
    color: palette.textPrimary,
    fontSize: 13,
    lineHeight: 18,
  },
  reportRecommendations: {
    color: palette.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
});

export default LinkDoctorScreen;
