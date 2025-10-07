import React, { useState } from 'react';
import { Redirect } from 'expo-router';
import LoginPage from './login';

export default function HomeRedirect() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  
  const handleLoginSuccess = (username) => {
    setUser(username);
    setIsLoggedIn(true);
  };
  if (!isLoggedIn){
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }
   return <Redirect href="/(drawer)/(tabs)" />;
}
