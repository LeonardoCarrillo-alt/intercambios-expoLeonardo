import React from 'react';
import { Drawer } from 'expo-router/drawer';

import { useThemeColors } from '../hooks/useThemeColors';

const DrawerLayout = () => {
  const { colors } = useThemeColors();

  return (
    <Drawer
      screenOptions={{
        headerTitleAlign: 'center',
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        drawerContentStyle: { backgroundColor: colors.drawerBackground },
        drawerActiveTintColor: colors.primary,
        drawerInactiveTintColor: colors.muted,
      }}
    >
      <Drawer.Screen
        name="(tabs)"
        options={{
          title: 'Inicio',
          drawerLabel: 'Inicio',
        }}
      />
      <Drawer.Screen
        name="about"
        options={{
          title: 'Sobre la app',
          drawerLabel: 'About',
        }}
      />
    </Drawer>
  );
};

export default DrawerLayout;
