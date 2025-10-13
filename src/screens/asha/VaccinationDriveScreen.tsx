import React from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import ScreenBackground from '../../components/ScreenBackground';
import {palette, spacing} from '../../theme';

const VaccinationDriveScreen: React.FC = () => {
  return (
    <ScreenBackground>
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>💉 Vaccination Drive</Text>
          <Text style={styles.subtitle}>Immunization campaigns and tracking</Text>
          <Text style={styles.description}>
            This screen will contain vaccination drive management, 
            immunization schedules, and campaign tracking features.
          </Text>
        </View>
      </ScrollView>
    </ScreenBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  content: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: palette.textPrimary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: palette.textSecondary,
    marginBottom: spacing.lg,
  },
  description: {
    fontSize: 14,
    color: palette.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default VaccinationDriveScreen;