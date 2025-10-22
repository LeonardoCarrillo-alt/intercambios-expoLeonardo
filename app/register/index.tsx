import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform 
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../context/AuthContext';

export default function RegisterScreen() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmEmail: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { signUp } = useAuth();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    if (!formData.email || !formData.password || !formData.confirmPassword) {
      Alert.alert('Error', 'Por favor completa todos los campos obligatorios');
      return false;
    }

    if (!formData.email.includes('@')) {
      Alert.alert('Error', 'Por favor ingresa un email válido');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return false;
    }

    if (formData.password.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    const result = await signUp(formData.email, formData.password);
    setIsLoading(false);

    if (result.success) {
      Alert.alert(
        '¡Registro exitoso!', 
        'Tu cuenta ha sido creada correctamente',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/login')
          }
        ]
      );
    } else {
      let errorMessage = 'Error al registrar usuario';
      
      // Mensajes de error más específicos
      if (result.error?.includes('auth/email-already-in-use')) {
        errorMessage = 'Este email ya está registrado';
      } else if (result.error?.includes('auth/invalid-email')) {
        errorMessage = 'El formato del email no es válido';
      } else if (result.error?.includes('auth/weak-password')) {
        errorMessage = 'La contraseña es demasiado débil';
      } else if (result.error) {
        errorMessage = result.error;
      }
      
      Alert.alert('Error', errorMessage);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Crear Cuenta</Text>
        <Text style={styles.subtitle}>Regístrate para comenzar</Text>

        {/* Email */}
        <TextInput
          style={styles.input}
          placeholder="Email *"
          value={formData.email}
          onChangeText={(value) => handleInputChange('email', value)}
          autoCapitalize="none"
          keyboardType="email-address"
          editable={!isLoading}
        />

        {/* Contraseña */}
        <TextInput
          style={styles.input}
          placeholder="Contraseña *"
          value={formData.password}
          onChangeText={(value) => handleInputChange('password', value)}
          secureTextEntry={!showPassword}
          editable={!isLoading}
        />

        {/* Confirmar Contraseña e Email */}
        <TextInput
          style={styles.input}
          placeholder="Confirmar Contraseña *"
          value={formData.confirmPassword}
          onChangeText={(value) => handleInputChange('confirmPassword', value)}
          secureTextEntry={!showPassword}
          editable={!isLoading}
        />

        <TextInput
          style={styles.input}
          placeholder="Confirmar Email *"
          value={formData.confirmEmail}
          onChangeText={(value) => handleInputChange('confirmEmail', value)}
          autoCapitalize="none"
          keyboardType="email-address"
          editable={!isLoading}
        />

        {/* Mostrar/Ocultar contraseña */}
        <TouchableOpacity 
          style={styles.showPasswordButton}
          onPress={() => setShowPassword(!showPassword)}
          disabled={isLoading}
        >
          <Text style={styles.showPasswordText}>
            {showPassword ? '👁️ Ocultar' : '👁️ Mostrar'} contraseña
          </Text>
        </TouchableOpacity>

        {/* Botón de registro */}
        <TouchableOpacity 
          style={[styles.button, isLoading && styles.buttonDisabled]} 
          onPress={handleRegister}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>Crear Cuenta</Text>
          )}
        </TouchableOpacity>

        {/* Enlaces */}
        <View style={styles.linksContainer}>
          <TouchableOpacity 
            onPress={() => router.push('/login')}
            disabled={isLoading}
          >
            <Text style={styles.link}>¿Ya tienes cuenta? Inicia sesión</Text>
          </TouchableOpacity>
        </View>

        {/* Información de requisitos */}
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>* Campos obligatorios</Text>
          <Text style={styles.infoText}>La contraseña debe tener al menos 6 caracteres</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    color: '#666',
  },
  nameContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  halfInput: {
    width: '48%',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    marginBottom: 15,
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  showPasswordButton: {
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  showPasswordText: {
    color: '#007AFF',
    fontSize: 14,
  },
  button: {
    backgroundColor: '#34C759',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  linksContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  link: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500',
  },
  infoContainer: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  infoText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
});