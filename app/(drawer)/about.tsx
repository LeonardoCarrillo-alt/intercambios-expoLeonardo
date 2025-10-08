import {useMemo} from 'react';
import { FlatList, SafeAreaView, StyleSheet, Text, View } from 'react-native';

import { useThemeColors } from '../hooks/useThemeColors';
import type { ThemeColors } from '../theme/colors';

const teamMembers = ['Leonardo Carrillo', 'Pablo Acha', 'Diego Gomez'];

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      flex: 1,
      padding: 24,
      gap: 12,
    },
    title: {
      fontSize: 24,
      fontWeight: '600',
      color: colors.text,
    },
    subtitle: {
      fontSize: 16,
      color: colors.subtitle,
      marginBottom: 12,
    },
    listContent: {
      gap: 12,
    },
    memberCard: {
      padding: 16,
      borderRadius: 12,
      backgroundColor: colors.surface,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
    },
    memberName: {
      fontSize: 18,
      color: colors.text,
    },
  });

const AboutScreen = () => {
  const { colors } = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Equipo de desarrollo</Text>
        <Text style={styles.subtitle}>
          Estas son las personas que participaron en la creación de la app:
        </Text>
        <FlatList
          data={teamMembers}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <View style={styles.memberCard}>
              <Text style={styles.memberName}>{item}</Text>
            </View>
          )}
          contentContainerStyle={styles.listContent}
        />
      </View>
    </SafeAreaView>
  );
};

export default AboutScreen;
