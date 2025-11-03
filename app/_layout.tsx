import React from 'react';
import { Stack } from 'expo-router';
import { AuthProvider } from './context/AuthContext';
import { ChatProvider } from './context/ChatContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <ChatProvider>
        <Stack>
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
        <Stack.Screen name="routes" options={{ 
            headerShown: true, 
            title: 'Ruta',
            presentation: 'modal' 
          }} />
          <Stack.Screen name="product/[id]" options={{ 
            headerShown: false,
            presentation: 'modal'
          }} />
        <Stack.Screen name="chat/[id]" options={{ headerShown: false }} />
      </Stack>
      </ChatProvider>
    </AuthProvider>
    
  );
}
