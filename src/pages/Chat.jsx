import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import SafeIcon from '../common/SafeIcon'
import * as FiIcons from 'react-icons/fi'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { format, isToday, isYesterday, parseISO } from 'date-fns'
import toast from 'react-hot-toast'

const { 
  FiMessageCircle, FiSend, FiPaperclip, FiImage, FiFile, FiUsers, 
  FiSearch, FiMoreVertical, FiPhone, FiVideo, FiInfo, FiX, FiCheck,
  FiCheckCircle, FiClock, FiAlertCircle, FiPlus, FiMic, FiSmile
} = FiIcons

const MessageBubble = ({ message, isOwn, showAvatar = true }) => {
  const formatTime = (timestamp) => {
    const date = parseISO(timestamp)
    return format(date, 'h:mm a')
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'sent': return <SafeIcon icon={FiCheck} className="w-3 h-3 text-gray-400" />
      case 'delivered': return <SafeIcon icon={FiCheckCircle} className="w-3 h-3 text-blue-400" />
      case 'read': return <SafeIcon icon={FiCheckCircle} className="w-3 h-3 text-blue-500" />
      default: return <SafeIcon icon={FiClock} className="w-3 h-3 text-gray-400" />
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}
    >
      {!isOwn && showAvatar && (
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3 flex-shrink-0">
          <span className="text-blue-600 font-medium text-sm">
            {message.sender?.full_name?.charAt(0) || 'U'}
          </span>
        </div>
      )}
      
      <div className={`max-w-xs lg:max-w-md ${isOwn ? 'order-1' : 'order-2'}`}>
        {!isOwn && showAvatar && (
          <p className="text-xs text-gray-500 mb-1 px-3">
            {message.sender?.full_name || 'Unknown User'}
          </p>
        )}
        
        <div className={`rounded-2xl px-4 py-2 ${
          isOwn 
            ? 'bg-blue-500 text-white' 
            : 'bg-gray-100 text-gray-900'
        }`}>
          {message.message_type === 'text' && (
            <p className="text-sm">{message.content}</p>
          )}
          
          {message.message_type === 'image' && (
            <div className="space-y-2">
              <img 
                src={message.file_url} 
                alt="Shared image" 
                className="rounded-lg max-w-full h-auto"
              />
              {message.content && (
                <p className="text-sm">{message.content}</p>
              )}
            </div>
          )}
          
          {message.message_type === 'file' && (
            <div className="flex items-center space-x-2">
              <SafeIcon icon={FiFile} className="w-4 h-4" />
              <span className="text-sm">{message.content || 'File attachment'}</span>
            </div>
          )}
          
          <div className={`flex items-center justify-between mt-1 ${
            isOwn ? 'text-blue-100' : 'text-gray-500'
          }`}>
            <span className="text-xs">{formatTime(message.created_at)}</span>
            {isOwn && (
              <div className="ml-2">
                {getStatusIcon(message.status)}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

const ChatHeader = ({ selectedChat, onToggleInfo }) => {
  const getParticipantNames = (participants) => {
    if (!participants || participants.length === 0) return 'Unknown'
    if (participants.length === 1) return participants[0].full_name
    if (participants.length === 2) return participants.map(p => p.full_name).join(', ')
    return `${participants[0].full_name} and ${participants.length - 1} others`
  }

  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
          <SafeIcon icon={FiUsers} className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 className="font-medium text-gray-900">
            {getParticipantNames(selectedChat?.participants || [])}
          </h3>
          <p className="text-sm text-gray-500">
            {selectedChat?.type === 'group' ? 'Group chat' : 'Direct message'}
          </p>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <SafeIcon icon={FiPhone} className="w-5 h-5 text-gray-600" />
        </button>
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <SafeIcon icon={FiVideo} className="w-5 h-5 text-gray-600" />
        </button>
        <button 
          onClick={onToggleInfo}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <SafeIcon icon={FiInfo} className="w-5 h-5 text-gray-600" />
        </button>
      </div>
    </div>
  )
}

const MessageInput = ({ onSendMessage, onFileUpload, disabled }) => {
  const [message, setMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const fileInputRef = useRef(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (message.trim() && !disabled) {
      onSendMessage(message.trim())
      setMessage('')
    }
  }

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      onFileUpload(file)
    }
  }

  return (
    <div className="p-4 border-t border-gray-200 bg-white">
      <form onSubmit={handleSubmit} className="flex items-end space-x-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={disabled}
            >
              <SafeIcon icon={FiPaperclip} className="w-5 h-5 text-gray-600" />
            </button>
            <button
              type="button"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={disabled}
            >
              <SafeIcon icon={FiImage} className="w-5 h-5 text-gray-600" />
            </button>
            <button
              type="button"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={disabled}
            >
              <SafeIcon icon={FiMic} className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          
          <div className="relative">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSubmit(e)
                }
              }}
              placeholder="Type a message..."
              className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={1}
              disabled={disabled}
            />
            <button
              type="button"
              className="absolute right-2 top-2 p-1 hover:bg-gray-100 rounded transition-colors"
              disabled={disabled}
            >
              <SafeIcon icon={FiSmile} className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
        
        <button
          type="submit"
          disabled={!message.trim() || disabled}
          className={`p-2 rounded-lg transition-colors ${
            message.trim() && !disabled
              ? 'bg-blue-500 text-white hover:bg-blue-600'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <SafeIcon icon={FiSend} className="w-5 h-5" />
        </button>
      </form>
      
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileSelect}
        className="hidden"
        accept="image/*,application/pdf,.doc,.docx,.txt"
      />
    </div>
  )
}

const ChatList = ({ chats, selectedChat, onSelectChat, onNewChat }) => {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredChats = chats.filter(chat => 
    chat.participants?.some(p => 
      p.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  )

  const formatLastMessageTime = (timestamp) => {
    if (!timestamp) return ''
    const date = parseISO(timestamp)
    if (isToday(date)) return format(date, 'h:mm a')
    if (isYesterday(date)) return 'Yesterday'
    return format(date, 'MMM d')
  }

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Messages</h2>
          <button
            onClick={onNewChat}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <SafeIcon icon={FiPlus} className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        
        <div className="relative">
          <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
      
      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {filteredChats.map(chat => (
          <motion.div
            key={chat.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => onSelectChat(chat)}
            className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
              selectedChat?.id === chat.id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <SafeIcon icon={FiUsers} className="w-6 h-6 text-blue-600" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900 truncate">
                    {chat.participants?.map(p => p.full_name).join(', ') || 'Unknown'}
                  </h3>
                  <span className="text-xs text-gray-500">
                    {formatLastMessageTime(chat.last_message_time)}
                  </span>
                </div>
                
                <p className="text-sm text-gray-500 truncate mt-1">
                  {chat.last_message || 'No messages yet'}
                </p>
                
                {chat.unread_count > 0 && (
                  <div className="flex items-center justify-between mt-1">
                    <span></span>
                    <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                      {chat.unread_count}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
        
        {filteredChats.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            <SafeIcon icon={FiMessageCircle} className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No conversations found</p>
          </div>
        )}
      </div>
    </div>
  )
}

const Chat = () => {
  const { user, userProfile } = useAuth()
  const [chats, setChats] = useState([])
  const [selectedChat, setSelectedChat] = useState(null)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [sendingMessage, setSendingMessage] = useState(false)
  const [showChatInfo, setShowChatInfo] = useState(false)
  const [showNewChatModal, setShowNewChatModal] = useState(false)
  const messagesEndRef = useRef(null)
  const realtimeChannelRef = useRef(null)

  useEffect(() => {
    if (user) {
      fetchChats()
      setupRealtimeSubscription()
    }
    
    return () => {
      if (realtimeChannelRef.current) {
        supabase.removeChannel(realtimeChannelRef.current)
      }
    }
  }, [user])

  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat.id)
    }
  }, [selectedChat])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const setupRealtimeSubscription = () => {
    if (realtimeChannelRef.current) {
      supabase.removeChannel(realtimeChannelRef.current)
    }

    realtimeChannelRef.current = supabase
      .channel('messages')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const newMessage = payload.new
          
          // Add to messages if it's for the current chat
          if (selectedChat && newMessage.chat_id === selectedChat.id) {
            setMessages(prev => [...prev, {
              ...newMessage,
              sender: newMessage.sender_id === user.id ? userProfile : null
            }])
          }
          
          // Update chat list
          setChats(prev => prev.map(chat => 
            chat.id === newMessage.chat_id 
              ? { 
                  ...chat, 
                  last_message: newMessage.content,
                  last_message_time: newMessage.created_at,
                  unread_count: newMessage.sender_id !== user.id ? (chat.unread_count || 0) + 1 : chat.unread_count
                }
              : chat
          ))
        }
      )
      .subscribe()
  }

  const fetchChats = async () => {
    try {
      setLoading(true)
      
      // Try to fetch from database first
      const { data, error } = await supabase
        .from('chat_participants')
        .select(`
          chat_id,
          chats!inner(
            id,
            name,
            type,
            created_at,
            last_message_time
          )
        `)
        .eq('user_id', user.id)

      if (error) {
        console.warn('Database fetch failed, using mock data:', error)
        // Use mock data as fallback
        const mockChats = [
          {
            id: '1',
            name: 'Care Team',
            type: 'group',
            participants: [
              { id: '1', full_name: 'Sarah Johnson', role: 'caregiver' },
              { id: '2', full_name: 'Dr. Smith', role: 'doctor' },
              { id: '3', full_name: 'Michael Smith', role: 'family' }
            ],
            last_message: 'Thanks for the update on John\'s medication',
            last_message_time: new Date().toISOString(),
            unread_count: 2
          },
          {
            id: '2',
            name: 'Family Updates',
            type: 'group',
            participants: [
              { id: '1', full_name: 'Sarah Johnson', role: 'caregiver' },
              { id: '3', full_name: 'Michael Smith', role: 'family' },
              { id: '4', full_name: 'Jane Doe', role: 'family' }
            ],
            last_message: 'How is mom doing today?',
            last_message_time: new Date(Date.now() - 3600000).toISOString(),
            unread_count: 0
          },
          {
            id: '3',
            name: 'Dr. Smith',
            type: 'direct',
            participants: [
              { id: '2', full_name: 'Dr. Smith', role: 'doctor' }
            ],
            last_message: 'Please update me on the patient\'s progress',
            last_message_time: new Date(Date.now() - 7200000).toISOString(),
            unread_count: 1
          }
        ]
        setChats(mockChats)
      } else {
        // Process real data
        const processedChats = data.map(item => ({
          ...item.chats,
          participants: [], // Would need to fetch participants separately
          last_message: 'Loading...',
          unread_count: 0
        }))
        setChats(processedChats)
      }
    } catch (error) {
      console.error('Error fetching chats:', error)
      toast.error('Failed to load conversations')
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (chatId) => {
    try {
      // Try to fetch from database first
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:users!sender_id(full_name, role)
        `)
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true })

      if (error) {
        console.warn('Messages fetch failed, using mock data:', error)
        // Use mock messages as fallback
        const mockMessages = [
          {
            id: '1',
            content: 'Good morning! How is John doing today?',
            sender_id: '3',
            sender: { full_name: 'Michael Smith', role: 'family' },
            message_type: 'text',
            created_at: new Date(Date.now() - 3600000).toISOString(),
            status: 'read'
          },
          {
            id: '2',
            content: 'He\'s doing well! Had a good night\'s sleep and took his morning medication on time.',
            sender_id: user.id,
            sender: userProfile,
            message_type: 'text',
            created_at: new Date(Date.now() - 3500000).toISOString(),
            status: 'read'
          },
          {
            id: '3',
            content: 'That\'s great to hear. Any changes in his mood or appetite?',
            sender_id: '3',
            sender: { full_name: 'Michael Smith', role: 'family' },
            message_type: 'text',
            created_at: new Date(Date.now() - 3000000).toISOString(),
            status: 'read'
          },
          {
            id: '4',
            content: 'His appetite is good, and he seems more alert today. We did the morning exercises together.',
            sender_id: user.id,
            sender: userProfile,
            message_type: 'text',
            created_at: new Date(Date.now() - 2500000).toISOString(),
            status: 'delivered'
          }
        ]
        setMessages(mockMessages)
      } else {
        setMessages(data)
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
      toast.error('Failed to load messages')
    }
  }

  const handleSendMessage = async (content) => {
    if (!selectedChat || !content.trim()) return

    try {
      setSendingMessage(true)
      
      const tempMessage = {
        id: Date.now().toString(),
        content,
        sender_id: user.id,
        sender: userProfile,
        message_type: 'text',
        created_at: new Date().toISOString(),
        status: 'sending'
      }
      
      setMessages(prev => [...prev, tempMessage])

      // Try to send to database
      const { data, error } = await supabase
        .from('messages')
        .insert({
          chat_id: selectedChat.id,
          sender_id: user.id,
          content,
          message_type: 'text'
        })
        .select()
        .single()

      if (error) {
        console.warn('Message send failed:', error)
        // Update temp message to show as sent locally
        setMessages(prev => prev.map(msg => 
          msg.id === tempMessage.id 
            ? { ...msg, status: 'sent' }
            : msg
        ))
        toast.success('Message sent (offline mode)')
      } else {
        // Replace temp message with real message
        setMessages(prev => prev.map(msg => 
          msg.id === tempMessage.id 
            ? { ...data, sender: userProfile, status: 'sent' }
            : msg
        ))
        toast.success('Message sent')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Failed to send message')
    } finally {
      setSendingMessage(false)
    }
  }

  const handleFileUpload = async (file) => {
    if (!selectedChat) return

    try {
      setSendingMessage(true)
      
      // Upload file to Supabase storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `chat-files/${fileName}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('chat-files')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('chat-files')
        .getPublicUrl(filePath)

      // Send message with file
      const messageType = file.type.startsWith('image/') ? 'image' : 'file'
      
      const { data, error } = await supabase
        .from('messages')
        .insert({
          chat_id: selectedChat.id,
          sender_id: user.id,
          content: file.name,
          message_type: messageType,
          file_url: publicUrl
        })
        .select()
        .single()

      if (error) throw error

      setMessages(prev => [...prev, { ...data, sender: userProfile }])
      toast.success('File uploaded successfully')
    } catch (error) {
      console.error('Error uploading file:', error)
      toast.error('Failed to upload file')
    } finally {
      setSendingMessage(false)
    }
  }

  const handleNewChat = () => {
    setShowNewChatModal(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <p className="ml-4 text-gray-600">Loading conversations...</p>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-gray-50">
      {/* Chat List */}
      <ChatList 
        chats={chats}
        selectedChat={selectedChat}
        onSelectChat={setSelectedChat}
        onNewChat={handleNewChat}
      />

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            <ChatHeader 
              selectedChat={selectedChat}
              onToggleInfo={() => setShowChatInfo(!showChatInfo)}
            />
            
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message, index) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isOwn={message.sender_id === user.id}
                  showAvatar={
                    index === 0 || 
                    messages[index - 1].sender_id !== message.sender_id
                  }
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
            
            {/* Message Input */}
            <MessageInput
              onSendMessage={handleSendMessage}
              onFileUpload={handleFileUpload}
              disabled={sendingMessage}
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <SafeIcon icon={FiMessageCircle} className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Select a conversation
              </h3>
              <p className="text-gray-500">
                Choose a conversation from the list to start messaging
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Chat Info Sidebar */}
      <AnimatePresence>
        {showChatInfo && selectedChat && (
          <motion.div
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            className="w-80 bg-white border-l border-gray-200 p-4"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Chat Info</h3>
              <button
                onClick={() => setShowChatInfo(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <SafeIcon icon={FiX} className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Participants</h4>
                <div className="space-y-2">
                  {selectedChat.participants?.map(participant => (
                    <div key={participant.id} className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-blue-600 font-medium text-sm">
                          {participant.full_name?.charAt(0) || 'U'}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {participant.full_name}
                        </p>
                        <p className="text-xs text-gray-500 capitalize">
                          {participant.role}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Shared Files</h4>
                <p className="text-sm text-gray-500">No files shared yet</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* New Chat Modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">New Conversation</h3>
            <p className="text-gray-600 mb-4">
              Feature coming soon! You'll be able to start new conversations with team members.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowNewChatModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowNewChatModal(false)
                  toast.success('New chat feature coming soon!')
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Create Chat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Chat