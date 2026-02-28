import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import API_CONFIG from '../../config/api';
import apiClient from '../../services/apiClient';

const ChatScreen = ({ route }) => {
  const { conversationId, otherUser } = route.params;
  const { user, token } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const flatListRef = useRef();

  useEffect(() => {
    if (!token) return;

    fetchMessages();
    // تم إلغاء Auto-refresh لتوفير bandwidth
    // المستخدم يمكنه إرسال رسالة لتحديث المحادثة
  }, [conversationId, token]);

  const fetchMessages = async () => {
    try {
      const response = await apiClient.get(API_CONFIG.ENDPOINTS.MESSAGE_THREAD(conversationId));
      setMessages(response.data?.messages || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    if (!token) {
      return;
    }

    try {
      await apiClient.post(API_CONFIG.ENDPOINTS.MESSAGES, {
        conversationId,
        message: newMessage,
      });

      setNewMessage('');
      fetchMessages();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const renderMessage = ({ item }) => {
    const isMyMessage = item.senderId === user?.id;
    return (
      <View
        style={[
          styles.messageContainer,
          isMyMessage ? styles.myMessage : styles.otherMessage,
        ]}>
        <Text style={styles.messageText}>{item.message}</Text>
        <Text style={styles.messageTime}>{item.createdAt}</Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}>
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="اكتب رسالة..."
          placeholderTextColor="#666"
          multiline
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendButtonText}>📤</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  messagesList: {
    padding: 15,
  },
  messageContainer: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#DC2626',
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
  },
  messageText: {
    color: '#fff',
    fontSize: 15,
    marginBottom: 4,
  },
  messageTime: {
    color: '#999',
    fontSize: 11,
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#333',
    backgroundColor: '#0a0a0a',
  },
  input: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    color: '#fff',
    fontSize: 15,
    maxHeight: 100,
  },
  sendButton: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#DC2626',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  sendButtonText: {
    fontSize: 20,
  },
});

export default ChatScreen;
