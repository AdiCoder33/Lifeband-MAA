import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import ScreenBackground from '../../components/ScreenBackground';
import {useAuth} from '../../context/AuthContext';
import DoctorPatientLinkService from '../../services/firebase/DoctorPatientLinkService';
import {
  DoctorInvite,
  LinkedPatient,
  MonthlyReportSummary,
} from '../../types/models';
import {palette, radii, spacing} from '../../theme';

const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleString() : '—';

export const DoctorInviteScreen: React.FC = () => {
  const {user, name} = useAuth();
  const doctorId = user?.uid;
  const [loading, setLoading] = useState(true);
  const [creatingInvite, setCreatingInvite] = useState(false);
  const [invites, setInvites] = useState<DoctorInvite[]>([]);
  const [patients, setPatients] = useState<LinkedPatient[]>([]);
  const [reports, setReports] = useState<MonthlyReportSummary[]>([]);

  const doctorGreeting = useMemo(() => {
    if (!name) {
      return 'Your invites';
    }
    return `Dr. ${name.split(' ')[0]}'s invites`;
  }, [name]);

  const loadData = useCallback(async () => {
    if (!doctorId) {
      return;
    }

    try {
      setLoading(true);
      const [inviteList, linkedPatients, monthlyReports] = await Promise.all([
        DoctorPatientLinkService.listInvites(doctorId),
        DoctorPatientLinkService.getLinkedPatients(doctorId),
        DoctorPatientLinkService.getMonthlyReportsForDoctor(doctorId),
      ]);

      setInvites(inviteList);
      setPatients(linkedPatients);
      setReports(monthlyReports.slice(0, 10));
    } catch (error) {
      console.error('Failed to load doctor invite data:', error);
      Alert.alert(
        'Unable to load invites',
        'Please check your connection and try again.',
      );
    } finally {
      setLoading(false);
    }
  }, [doctorId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateInvite = async () => {
    if (!doctorId) {
      return;
    }
    try {
      setCreatingInvite(true);
      const invite = await DoctorPatientLinkService.createInvite(doctorId);
      setInvites(current => [invite, ...current]);
      Alert.alert(
        'Invite created',
        'Share this QR with your patient so they can link you as their doctor.',
      );
    } catch (error) {
      console.error('Failed to create invite', error);
      Alert.alert(
        'Could not create invite',
        'Please try again in a moment or check your network connection.',
      );
    } finally {
      setCreatingInvite(false);
    }
  };

  const handleShareInvite = async (invite: DoctorInvite) => {
    try {
      await Share.share({
        title: 'LifeBand doctor invite',
        message: `Scan this LifeBand QR code or enter manually:\nInvite ID: ${invite.id}\nCode: ${invite.code}`,
      });
    } catch (error) {
      console.error('Failed to share invite', error);
    }
  };

  const handleRevokeInvite = async (inviteId: string) => {
    Alert.alert(
      'Revoke invite?',
      'Patients will no longer be able to use this QR code. Continue?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Revoke',
          style: 'destructive',
          onPress: async () => {
            try {
              await DoctorPatientLinkService.revokeInvite(inviteId);
              loadData();
            } catch (error) {
              Alert.alert('Unable to revoke', 'Please try again later.');
            }
          },
        },
      ],
    );
  };

  const handleUnlinkPatient = async (linkId: string) => {
    Alert.alert(
      'Remove patient?',
      'They will no longer see your name or monthly reports.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await DoctorPatientLinkService.unlinkDoctor(linkId);
              loadData();
            } catch (error) {
              Alert.alert(
                'Unable to remove patient',
                'Please try again later.',
              );
            }
          },
        },
      ],
    );
  };

  const renderInvite = (invite: DoctorInvite) => {
    const qrValue = `${invite.id}|${invite.code}`;
    return (
      <View key={invite.id} style={styles.inviteCard}>
        <View style={styles.inviteHeader}>
          <Text style={styles.inviteTitle}>Invite ID: {invite.id}</Text>
          <Text style={styles.inviteMeta}>
            Created {formatDate(invite.createdAt)}
          </Text>
        </View>
        <View style={styles.inviteBody}>
          <View style={styles.qrWrapper}>
            <QRCode value={qrValue} size={140} />
          </View>
          <View style={styles.inviteDetails}>
            <Text style={styles.inviteCodeLabel}>Code</Text>
            <Text style={styles.inviteCode}>{invite.code}</Text>
            <Text style={styles.inviteMeta}>
              Expires {formatDate(invite.expiresAt)}
            </Text>
            <Text style={styles.inviteMeta}>
              Uses left: {invite.usesRemaining}
            </Text>
            <View style={styles.inviteActions}>
              <TouchableOpacity
                style={styles.shareButton}
                onPress={() => handleShareInvite(invite)}>
                <Text style={styles.shareLabel}>Share</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.revokeButton}
                onPress={() => handleRevokeInvite(invite.id)}>
                <Text style={styles.revokeLabel}>Revoke</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderPatient = (patient: LinkedPatient) => (
    <View key={patient.linkId} style={styles.patientCard}>
      <View style={styles.patientAvatar}>
        <Text style={styles.patientAvatarLabel}>
          {patient.patientName
            ?.split(' ')
            .map(part => part[0]?.toUpperCase() ?? '')
            .slice(0, 2)
            .join('') || 'PT'}
        </Text>
      </View>
      <View style={styles.patientInfo}>
        <Text style={styles.patientName}>{patient.patientName}</Text>
        {patient.village ? (
          <Text style={styles.patientMeta}>{patient.village}</Text>
        ) : null}
        {patient.lastReportSubmittedAt ? (
          <Text style={styles.patientMeta}>
            Last report {formatDate(patient.lastReportSubmittedAt)}
          </Text>
        ) : (
          <Text style={styles.patientMeta}>No report submitted yet</Text>
        )}
      </View>
      <TouchableOpacity
        style={styles.unlinkButton}
        onPress={() => handleUnlinkPatient(patient.linkId)}>
        <Text style={styles.unlinkLabel}>Remove</Text>
      </TouchableOpacity>
    </View>
  );

  const renderReport = (report: MonthlyReportSummary) => (
    <View key={report.id} style={styles.reportCard}>
      <View style={styles.reportHeader}>
        <Text style={styles.reportPatient}>Patient ID: {report.patientId}</Text>
        <Text style={styles.reportDate}>
          {new Date(report.createdAt).toLocaleDateString()}
        </Text>
      </View>
      <Text style={styles.reportPeriod}>
        Period {report.periodStart} → {report.periodEnd}
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
        <Text style={styles.title}>{doctorGreeting}</Text>
        <Text style={styles.subtitle}>
          Generate QR codes for patients to connect. Once linked, you can review
          readings and send monthly reports straight from LifeBand.
        </Text>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Active invites</Text>
            <TouchableOpacity
              onPress={handleCreateInvite}
              disabled={creatingInvite}
              style={[styles.primaryButton, creatingInvite && styles.disabled]}>
              {creatingInvite ? (
                <ActivityIndicator size="small" color={palette.textOnPrimary} />
              ) : (
                <Text style={styles.primaryLabel}>New invite</Text>
              )}
            </TouchableOpacity>
          </View>
          {loading ? (
            <View style={styles.loadingState}>
              <ActivityIndicator size="small" color={palette.primary} />
              <Text style={styles.loadingLabel}>Loading invites…</Text>
            </View>
          ) : invites.length ? (
            invites.map(renderInvite)
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No active invites</Text>
              <Text style={styles.emptyCopy}>
                Create a QR invite when you need to link with a new patient.
                Each invite can be reused for multiple patients until you revoke
                it or it expires.
              </Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Linked patients</Text>
            <TouchableOpacity onPress={loadData}>
              <Text style={styles.refreshLabel}>Refresh</Text>
            </TouchableOpacity>
          </View>
          {loading ? (
            <View style={styles.loadingState}>
              <ActivityIndicator size="small" color={palette.primary} />
              <Text style={styles.loadingLabel}>Loading patients…</Text>
            </View>
          ) : patients.length ? (
            patients.map(renderPatient)
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No patients linked yet</Text>
              <Text style={styles.emptyCopy}>
                Once a patient scans your QR, they will appear here and their
                readings will sync to your dashboard.
              </Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent monthly reports</Text>
          {reports.length ? (
            reports.map(renderReport)
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No reports submitted yet</Text>
              <Text style={styles.emptyCopy}>
                After reviewing a patient&apos;s readings, submit a monthly
                report from the patient detail screen to keep them informed.
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
    shadowRadius: 18,
    elevation: 5,
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
  primaryButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    backgroundColor: palette.primary,
  },
  primaryLabel: {
    color: palette.textOnPrimary,
    fontWeight: '700',
  },
  disabled: {
    opacity: 0.6,
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
  inviteCard: {
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginTop: spacing.md,
    backgroundColor: palette.surfaceSoft,
  },
  inviteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  inviteTitle: {
    fontWeight: '700',
    color: palette.textPrimary,
  },
  inviteMeta: {
    fontSize: 12,
    color: palette.textSecondary,
  },
  inviteBody: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  qrWrapper: {
    borderRadius: radii.md,
    padding: spacing.sm,
    backgroundColor: palette.surface,
  },
  inviteDetails: {
    flex: 1,
    gap: spacing.xs,
  },
  inviteCodeLabel: {
    fontSize: 12,
    color: palette.textSecondary,
    fontWeight: '600',
  },
  inviteCode: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1,
    color: palette.primary,
  },
  inviteActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  shareButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    backgroundColor: palette.primary,
    alignItems: 'center',
  },
  shareLabel: {
    color: palette.textOnPrimary,
    fontWeight: '600',
  },
  revokeButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: palette.danger,
    alignItems: 'center',
  },
  revokeLabel: {
    color: palette.danger,
    fontWeight: '600',
  },
  emptyState: {
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: radii.lg,
    backgroundColor: palette.surfaceSoft,
    padding: spacing.lg,
    marginTop: spacing.md,
  },
  emptyTitle: {
    fontWeight: '700',
    color: palette.textPrimary,
  },
  emptyCopy: {
    marginTop: spacing.xs,
    color: palette.textSecondary,
    fontSize: 13,
    lineHeight: 20,
  },
  refreshLabel: {
    color: palette.primary,
    fontWeight: '600',
  },
  patientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginTop: spacing.md,
    backgroundColor: palette.surfaceSoft,
  },
  patientAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  patientAvatarLabel: {
    color: palette.textOnPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  patientInfo: {
    flex: 1,
    gap: 4,
  },
  patientName: {
    fontWeight: '700',
    color: palette.textPrimary,
  },
  patientMeta: {
    color: palette.textSecondary,
    fontSize: 12,
  },
  unlinkButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: palette.danger,
  },
  unlinkLabel: {
    color: palette.danger,
    fontWeight: '600',
  },
  reportCard: {
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginTop: spacing.md,
    backgroundColor: palette.surfaceSoft,
    gap: spacing.xs,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reportPatient: {
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

export default DoctorInviteScreen;
