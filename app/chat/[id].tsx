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
  Alert,
  Modal
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import dayjs from 'dayjs';
import { useAuth } from 'app/context/AuthContext';
import { useChat } from 'app/context/ChatContext';

export default function ChatScreen() {
  const { id } = useLocalSearchParams();
  const [messageText, setMessageText] = useState('');
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerAmount, setOfferAmount] = useState('');
  const { chats, messages, sendMessage, setCurrentChat, acceptOffer, rejectOffer } = useChat();
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

  const handleSendOffer = async () => {
    if (!offerAmount.trim() || isNaN(Number(offerAmount))) {
      Alert.alert('Error', 'Por favor ingresa un monto válido');
      return;
    }

    try {
      const amount = Number(offerAmount);
      await sendMessage(
        `Oferta de Bs ${amount}`,
        'offer',
        amount
      );
      setShowOfferModal(false);
      setOfferAmount('');
    } catch (error) {
      Alert.alert('Error', 'No se pudo enviar la oferta');
    }
  };

  const handleAcceptOffer = async (messageId: string) => {
    Alert.alert(
      'Aceptar Oferta',
      '¿Estás seguro de que quieres aceptar esta oferta? El producto será reservado.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Aceptar', 
          onPress: async () => {
            try {
              await acceptOffer(messageId);
              Alert.alert('Éxito', 'Oferta aceptada. El producto ha sido reservado.');
            } catch (error) {
              Alert.alert('Error', 'No se pudo aceptar la oferta');
            }
          }
        },
      ]
    );
  };

  const handleRejectOffer = async (messageId: string) => {
    Alert.alert(
      'Rechazar Oferta',
      '¿Estás seguro de que quieres rechazar esta oferta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Rechazar', 
          onPress: async () => {
            try {
              await rejectOffer(messageId);
              Alert.alert('Oferta rechazada');
            } catch (error) {
              Alert.alert('Error', 'No se pudo rechazar la oferta');
            }
          }
        },
      ]
    );
  };

  const isSeller = currentChat?.itemId && currentChat?.participants?.[0]?.userId === user?.uid;

  const renderMessage = ({ item }: { item: any }) => {
    const isMyMessage = item.senderId === user?.uid;
    const isOffer = item.type === 'offer';
    
    return (
      <View style={[
        styles.messageContainer,
        isMyMessage ? styles.myMessage : styles.otherMessage,
        isOffer && styles.offerMessage
      ]}>
        <Text style={styles.senderName}>
          {isMyMessage ? 'Tú' : item.senderName}
        </Text>
        
        {isOffer ? (
          <View style={styles.offerContainer}>
            <Text style={styles.offerText}>💰 Oferta</Text>
            <Text style={styles.offerAmount}>Bs {item.offerAmount}</Text>
            <Text style={styles.offerMessageText}>{item.text}</Text>
            
            {/* Mostrar estado de la oferta */}
            {item.offerStatus && (
              <View style={[
                styles.offerStatus,
                item.offerStatus === 'accepted' ? styles.offerAccepted : 
                item.offerStatus === 'rejected' ? styles.offerRejected : styles.offerPending
              ]}>
                <Text style={styles.offerStatusText}>
                  {item.offerStatus === 'accepted' ? '✅ Aceptada' : 
                   item.offerStatus === 'rejected' ? '❌ Rechazada' : '⏳ Pendiente'}
                </Text>
              </View>
            )}
            
            {/* Botones para aceptar/rechazar (solo para el vendedor) */}
            {!isMyMessage && isSeller && item.offerStatus === 'pending' && (
              <View style={styles.offerActions}>
                <TouchableOpacity 
                  style={styles.acceptButton}
                  onPress={() => handleAcceptOffer(item.id)}
                >
                  <Text style={styles.acceptButtonText}>Aceptar</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.rejectButton}
                  onPress={() => handleRejectOffer(item.id)}
                >
                  <Text style={styles.rejectButtonText}>Rechazar</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ) : (
          <Text style={styles.messageText}>{item.text}</Text>
        )}
        
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
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>
            {currentChat?.participants?.find(p => p.userId !== user?.uid)?.name || 'Chat'}
          </Text>
          {currentChat?.itemTitle && (
            <Text style={styles.itemTitle} numberOfLines={1}>
              {currentChat.itemTitle}
            </Text>
          )}
        </View>
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
        <TouchableOpacity 
          style={styles.offerButton}
          onPress={() => setShowOfferModal(true)}
        >
          <Text style={styles.offerButtonText}>💰 Oferta</Text>
        </TouchableOpacity>
        
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

      {/* Modal para enviar oferta */}
      <Modal
        visible={showOfferModal}
        animationType="slide"
        transparent
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Hacer Oferta</Text>
            <Text style={styles.modalSubtitle}>
              Ingresa el monto que deseas ofertar por "{currentChat?.itemTitle}"
            </Text>
            
            <View style={styles.offerInputContainer}>
              <Text style={styles.currencySymbol}>Bs</Text>
              <TextInput
                style={styles.offerInput}
                value={offerAmount}
                onChangeText={setOfferAmount}
                placeholder="0.00"
                keyboardType="numeric"
                autoFocus
              />
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowOfferModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.sendOfferButton,
                  (!offerAmount.trim() || isNaN(Number(offerAmount))) && styles.sendOfferButtonDisabled
                ]}
                onPress={handleSendOffer}
                disabled={!offerAmount.trim() || isNaN(Number(offerAmount))}
              >
                <Text style={styles.sendOfferButtonText}>Enviar Oferta</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  headerInfo: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  itemTitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
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
  offerMessage: {
    backgroundColor: '#fff3cd',
    borderWidth: 2,
    borderColor: '#ffeaa7',
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
  offerContainer: {
    alignItems: 'center',
  },
  offerText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#e67e22',
    marginBottom: 4,
  },
  offerAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#e67e22',
    marginBottom: 4,
  },
  offerMessageText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  offerStatus: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  offerPending: {
    backgroundColor: '#fff3cd',
  },
  offerAccepted: {
    backgroundColor: '#d4edda',
  },
  offerRejected: {
    backgroundColor: '#f8d7da',
  },
  offerStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  offerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  acceptButton: {
    backgroundColor: '#28a745',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  rejectButton: {
    backgroundColor: '#dc3545',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  rejectButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
    backgroundColor: '#fff',
    gap: 8,
  },
  offerButton: {
    backgroundColor: '#e67e22',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  offerButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    margin: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  offerInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#3b82f6',
    borderRadius: 12,
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 8,
  },
  offerInput: {
    flex: 1,
    fontSize: 18,
    paddingVertical: 12,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#6c757d',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  sendOfferButton: {
    flex: 1,
    backgroundColor: '#e67e22',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  sendOfferButtonDisabled: {
    backgroundColor: '#ccc',
  },
  sendOfferButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});