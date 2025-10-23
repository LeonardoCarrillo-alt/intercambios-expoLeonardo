import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  StyleSheet, 
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import dayjs from 'dayjs';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';

export default function ChatScreen() {
  const { id } = useLocalSearchParams();
  const [messageText, setMessageText] = useState('');
  const { chats, messages, sendMessage, setCurrentChat } = useChat();
  const { user } = useAuth();
  const flatListRef = useRef<FlatList>(null);

  const currentChat = chats.find(chat => chat.id === id);

  useEffect(() => {
    if (id && currentChat) {
      setCurrentChat(currentChat);
    }
  }, [id, currentChat]);

  const handleSendMessage = async () => {
    if (!messageText.trim()) return;

    try {
      await sendMessage(messageText.trim());
      setMessageText('');
    } catch (error) {
      Alert.alert('Error', 'No se pudo enviar el mensaje');
    }
  };

  const renderMessage = ({ item }: { item: any }) => {
    const isMyMessage = item.senderId === user?.uid;
    
    return (
      <View style={[
        styles.messageContainer,
        isMyMessage ? styles.myMessage : styles.otherMessage
      ]}>
        <Text style={styles.senderName}>
          {isMyMessage ? 'Tú' : item.senderName}
        </Text>
        <Text style={styles.messageText}>{item.text}</Text>
        <Text style={styles.messageTime}>
          {dayjs(item.timestamp?.toDate()).format('HH:mm')}
        </Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {currentChat?.participants?.find(p => p.userId !== user?.uid)?.name || 'Chat'}
        </Text>
        <View style={{ width: 30 }} />
      </View>

      {/* Lista de mensajes */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id || Math.random().toString()}
        renderItem={renderMessage}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContainer}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
      />

      {/* Input de mensaje */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={messageText}
          onChangeText={setMessageText}
          placeholder="Escribe un mensaje..."
          multiline
          maxLength={500}
        />
        <TouchableOpacity 
          style={[
            styles.sendButton, 
            !messageText.trim() && styles.sendButtonDisabled
          ]} 
          onPress={handleSendMessage}
          disabled={!messageText.trim()}
        >
          <Text style={styles.sendButtonText}>Enviar</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  backButton: {
    fontSize: 20,
    color: '#3b82f6',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  messagesList: {
    flex: 1,
  },
  messagesContainer: {
    padding: 16,
  },
  messageContainer: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#3b82f6',
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#f1f5f9',
  },
  senderName: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    color: '#666',
  },
  messageText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  messageTime: {
    fontSize: 10,
    color: '#999',
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
    backgroundColor: '#fff',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});