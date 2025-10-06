import { useState } from "react";
import { View, TouchableOpacity, Image, Text, TextInput, StyleSheet, Alert } from "react-native";

export const Header = ({ user, onLogout }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    if (username === "admin" && password === "1234") {
      setIsLoggedIn(true);
      Alert.alert("Éxito", "Inicio de sesión exitoso");
    } else {
      Alert.alert("Error", "Usuario o contraseña incorrectos");
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername("");
    setPassword("");
    if (onLogout) onLogout();
  };

  if (isLoggedIn) {
    return (
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Text style={styles.heroTitle}>Bienvenido, {username}</Text>
          <Text style={styles.heroSubtitle}>
            Docente de ISC y desarrollador de software full-stack.
          </Text>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.header}>
      <Text style={styles.loginTitle}>Iniciar Sesión</Text>
      
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Usuario"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
        
        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
        />
        
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Ingresar</Text>
        </TouchableOpacity>

        <Text style={styles.demoText}>
          Demo: usuario: "admin" / contraseña: "1234"
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: { 
    marginBottom: 24,
    padding: 16,
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  loginTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 20,
    textAlign: "center",
  },
  form: {
    gap: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#ffffff",
  },
  loginButton: {
    backgroundColor: "#3b82f6",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  loginButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  logoutButton: {
    backgroundColor: "#ef4444",
    padding: 10,
    borderRadius: 6,
    alignItems: "center",
    marginTop: 12,
    alignSelf: "flex-start",
  },
  logoutButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "500",
  },
  userInfo: {
    alignItems: "center",
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#0f172a",
    marginTop: 4,
    textAlign: "center",
  },
  heroSubtitle: { 
    marginTop: 10, 
    color: "#475569", 
    lineHeight: 20,
    textAlign: "center",
  },
  demoText: {
    fontSize: 12,
    color: "#64748b",
    textAlign: "center",
    marginTop: 8,
    fontStyle: "italic",
  },
});