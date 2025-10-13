import React from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import ScreenBackground from '../../components/ScreenBackground';
import {palette, spacing} from '../../theme';

const FamilyPlanningScreen: React.FC = () => {
  return (
    <ScreenBackground>
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>👨‍👩‍👧‍👦 Family Planning</Text>
          <Text style={styles.subtitle}>Family planning counseling and resources</Text>
          <Text style={styles.description}>
            This screen will contain family planning education, 
            counseling resources, and contraception information.
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

export default FamilyPlanningScreen;