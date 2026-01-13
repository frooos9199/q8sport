'use client';

import { useState } from 'react';
import Link from 'next/link';
import AuthWrapper from '@/components/AuthWrapper';
import { 
  MessageCircle, ArrowLeft, Search, Send, MoreVertical,
  Phone, Video, Info, Paperclip, Image, Smile,
  Check, CheckCheck, Clock
} from 'lucide-react';

export default function Messages() {
  const [selectedChat, setSelectedChat] = useState(1);
  const [newMessage, setNewMessage] = useState('');

  const chats = [
    {
      id: 1,
      name: 'أحمد الخليفي',
      lastMessage: 'السلام عليكم، هل القطعة ما زالت متوفرة؟',
      time: '12:30 ص',
      unread: 2,
      online: true,
      avatar: null,
      isTyping: false
    },
    {
      id: 2,
      name: 'فاطمة الصباح',
      lastMessage: 'شكراً لك، سأفكر في الأمر',
      time: 'أمس',
      unread: 0,
      online: false,
      avatar: null,
      isTyping: false
    },
    {
      id: 3,
      name: 'محمد الرشيد',
      lastMessage: 'متى يمكنني الاستلام؟',
      time: 'أمس',
      unread: 1,
      online: true,
      avatar: null,
      isTyping: true
    },
    {
      id: 4,
      name: 'سارة المطيري',
      lastMessage: 'تم إرسال الصور',
      time: 'الأحد',
      unread: 0,
      online: false,
      avatar: null,
      isTyping: false
    }
  ];

  const messages = [
    {
      id: 1,
      senderId: 2,
      senderName: 'أحمد الخليفي',
      content: 'السلام عليكم ورحمة الله وبركاته',
      time: '12:25 ص',
      status: 'delivered',
      type: 'text'
    },
    {
      id: 2,
      senderId: 1,
      senderName: 'أنت',
      content: 'وعليكم السلام ورحمة الله وبركاته، أهلاً وسهلاً بك',
      time: '12:26 ص',
      status: 'read',
      type: 'text'
    },
    {
      id: 3,
      senderId: 2,
      senderName: 'أحمد الخليفي',
      content: 'أريد أن أسألك عن محرك Ford Mustang V8 الذي عرضته للبيع',
      time: '12:27 ص',
      status: 'delivered',
      type: 'text'
    },
    {
      id: 4,
      senderId: 1,
      senderName: 'أنت',
      content: 'نعم، ما زال متوفراً. هل تريد تفاصيل إضافية؟',
      time: '12:28 ص',
      status: 'read',
      type: 'text'
    },
    {
      id: 5,
      senderId: 2,
      senderName: 'أحمد الخليفي',
      content: 'هل يمكنك إرسال صور إضافية للمحرك؟',
      time: '12:30 ص',
      status: 'delivered',
      type: 'text'
    }
  ];

  const currentUser = 1;
  const selectedChatData = chats.find(chat => chat.id === selectedChat);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // Here you would typically send the message to the server
      console.log('Sending message:', newMessage);
      setNewMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const renderMessageStatus = (status) => {
    switch (status) {
      case 'sent':
        return <Check className="h-4 w-4 text-gray-400" />;
      case 'delivered':
        return <CheckCheck className="h-4 w-4 text-gray-400" />;
      case 'read':
        return <CheckCheck className="h-4 w-4 text-blue-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <AuthWrapper requireAuth={true}>
      <div className="min-h-screen bg-gray-100">
        {/* Header */}
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <Link href="/profile" className="flex items-center text-gray-800 hover:text-gray-900 ml-4">
                  <ArrowLeft className="h-5 w-5 ml-1" />
                  العودة
                </Link>
                <MessageCircle className="h-8 w-8 text-blue-600 ml-3" />
                <h1 className="text-2xl font-bold text-gray-900">الرسائل</h1>
              </div>
            </div>
          </div>
        </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden" style={{ height: '600px' }}>
          <div className="flex h-full">
            {/* Sidebar - Chat List */}
            <div className="w-1/3 border-l border-gray-200 flex flex-col">
              {/* Search */}
              <div className="p-4 border-b border-gray-200">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-700 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="ابحث في المحادثات..."
                    className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-600 font-medium"
                  />
                </div>
              </div>

              {/* Chat List */}
              <div className="flex-1 overflow-y-auto">
                {chats.map((chat) => (
                  <div
                    key={chat.id}
                    onClick={() => setSelectedChat(chat.id)}
                    className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                      selectedChat === chat.id ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-medium">
                            {chat.name.charAt(0)}
                          </span>
                        </div>
                        {chat.online && (
                          <div className="absolute bottom-0 left-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {chat.name}
                          </h3>
                          <span className="text-xs text-gray-800">{chat.time}</span>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-sm text-gray-800 font-medium truncate">
                            {chat.isTyping ? (
                              <span className="text-blue-600 font-medium">يكتب...</span>
                            ) : (
                              chat.lastMessage
                            )}
                          </p>
                          {chat.unread > 0 && (
                            <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-blue-600 rounded-full">
                              {chat.unread}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col">
              {selectedChatData && (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-200 bg-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-medium">
                              {selectedChatData.name.charAt(0)}
                            </span>
                          </div>
                          {selectedChatData.online && (
                            <div className="absolute bottom-0 left-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
                          )}
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">
                            {selectedChatData.name}
                          </h3>
                          <p className="text-xs text-gray-500">
                            {selectedChatData.online ? 'متصل الآن' : 'غير متصل'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="p-2 text-gray-400 hover:text-gray-600" title="مكالمة صوتية">
                          <Phone className="h-5 w-5" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600" title="مكالمة فيديو">
                          <Video className="h-5 w-5" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600" title="معلومات">
                          <Info className="h-5 w-5" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600" title="المزيد">
                          <MoreVertical className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${
                            message.senderId === currentUser ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              message.senderId === currentUser
                                ? 'bg-blue-600 text-white'
                                : 'bg-white text-gray-900 shadow'
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <div
                              className={`flex items-center justify-end mt-1 space-x-1 ${
                                message.senderId === currentUser ? 'text-blue-100' : 'text-gray-500'
                              }`}
                            >
                              <span className="text-xs">{message.time}</span>
                              {message.senderId === currentUser && renderMessageStatus(message.status)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t border-gray-200 bg-white">
                    <div className="flex items-center space-x-3">
                      <button className="p-2 text-gray-400 hover:text-gray-600" title="إرفاق ملف">
                        <Paperclip className="h-5 w-5" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-gray-600" title="إرسال صورة">
                        <Image className="h-5 w-5" />
                      </button>
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="اكتب رسالتك..."
                          className="w-full px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent pl-12"
                        />
                        <button 
                          title="إضافة رمز تعبيري"
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                        >
                          <Smile className="h-5 w-5" />
                        </button>
                      </div>
                      <button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim()}
                        className={`p-2 rounded-full ${
                          newMessage.trim()
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        <Send className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      </div>
    </AuthWrapper>
  );
}
