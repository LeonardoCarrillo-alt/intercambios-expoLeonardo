import React from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator 
} from 'react-native';
import { router } from 'expo-router';
import dayjs from 'dayjs';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';

export default function ChatsScreen() {
  const { chats, loading } = useChat();
  const { user } = useAuth();

  const getOtherParticipant = (chat: any) => {
    return chat.participants.find((p: any) => p.userId !== user?.uid);
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return '';
    return dayjs(timestamp.toDate()).format('HH:mm');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chats</Text>
      
      {chats.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No tienes chats aún</Text>
          <Text style={styles.emptySubtext}>
            Inicia un chat con otro usuario para comenzar
          </Text>
        </View>
      ) : (
        <FlatList
          data={chats}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const otherUser = getOtherParticipant(item);
            return (
              <TouchableOpacity 
                style={styles.chatItem}
                onPress={() => router.push(`/chat/${item.id}`)}
              >
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {otherUser?.name?.charAt(0) || 'U'}
                  </Text>
                </View>
                <View style={styles.chatInfo}>
                  <Text style={styles.chatName}>
                    {otherUser?.name || 'Usuario'}
                  </Text>
                  <Text style={styles.lastMessage} numberOfLines={1}>
                    {item.lastMessage || 'Inicia una conversación...'}
                  </Text>
                </View>
                <Text style={styles.time}>
                  {formatTime(item.lastMessageTime)}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  chatInfo: {
    flex: 1,
  },
  chatName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
  },
  time: {
    fontSize: 12,
    color: '#999',
  },
});