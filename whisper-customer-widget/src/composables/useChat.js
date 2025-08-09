import { ref, reactive, computed, nextTick } from 'vue'
import { ChatApi, utils } from '../utils/api.js'
import { useWebSocket } from './useWebSocket.js'

/**
 * 聊天功能 Composable
 */
export function useChat() {
  // 配置信息
  const config = ref({
    apiUrl: '',
    websocketUrl: '',
    customerId: '',
    customerName: '',
    theme: 'light',
    position: 'bottom-right'
  })

  // 聊天状态
  const chatState = reactive({
    isInitialized: false,
    isOpen: false,
    conversationId: null,
    sessionId: null,
    agentId: null,
    status: 'disconnected', // disconnected, connecting, connected, chatting
    unreadCount: 0
  })

  // 消息列表
  const messages = ref([])
  const isLoading = ref(false)
  const isSending = ref(false)
  const hasMoreMessages = ref(true)

  // API客户端
  let apiClient = null
  
  // WebSocket连接
  const {
    isConnected: wsConnected,
    isConnecting: wsConnecting,
    connectionError: wsError,
    connect: wsConnect,
    disconnect: wsDisconnect,
    sendChatMessage,
    sendReadReceipt,
    on: wsOn,
    off: wsOff
  } = useWebSocket()

  /**
   * 初始化聊天
   */
  async function initialize(options) {
    try {
      // 保存配置
      Object.assign(config.value, options)
      
      // 初始化API客户端
      apiClient = new ChatApi(config.value.apiUrl)
      
      // 初始化聊天会话
      const response = await apiClient.initChat({
        customerId: config.value.customerId,
        customerName: config.value.customerName,
        sessionId: chatState.sessionId
      })

      if (response.data) {
        chatState.conversationId = response.data.conversationId
        chatState.sessionId = response.data.sessionId
        chatState.agentId = response.data.agentId
        chatState.status = response.data.status === '1' ? 'chatting' : 'waiting'
      }

      // 连接WebSocket
      await connectWebSocket()
      
      // 加载历史消息
      await loadMessages()
      
      chatState.isInitialized = true
      console.log('Chat initialized successfully')
      
    } catch (error) {
      console.error('Failed to initialize chat:', error)
      throw error
    }
  }

  /**
   * 连接WebSocket
   */
  async function connectWebSocket() {
    try {
      await wsConnect(config.value.websocketUrl, config.value.customerId)
      
      // 监听消息
      wsOn('message', handleWebSocketMessage)
      wsOn('close', handleWebSocketClose)
      wsOn('error', handleWebSocketError)
      
      chatState.status = 'connected'
    } catch (error) {
      console.error('Failed to connect WebSocket:', error)
      chatState.status = 'disconnected'
      throw error
    }
  }

  /**
   * 处理WebSocket消息
   */
  function handleWebSocketMessage(data) {
    console.log('Received WebSocket message:', data)
    
    switch (data.type) {
      case 'message':
        if (data.data) {
          addMessage(data.data)
          // 如果聊天窗口未打开，增加未读计数
          if (!chatState.isOpen) {
            chatState.unreadCount++
          }
        }
        break
        
      case 'system':
        // 处理系统消息（如客服分配、状态变更等）
        if (data.message) {
          addSystemMessage(data.message)
        }
        break
        
      case 'status':
        // 处理状态更新
        if (data.status) {
          chatState.status = data.status
        }
        break
        
      default:
        console.log('Unknown message type:', data.type)
    }
  }

  /**
   * 处理WebSocket关闭
   */
  function handleWebSocketClose(event) {
    console.log('WebSocket closed:', event)
    chatState.status = 'disconnected'
  }

  /**
   * 处理WebSocket错误
   */
  function handleWebSocketError(event) {
    console.error('WebSocket error:', event)
    chatState.status = 'disconnected'
  }

  /**
   * 加载消息历史
   */
  async function loadMessages(pageNum = 1, pageSize = 20) {
    if (!chatState.conversationId || isLoading.value) {
      return
    }

    try {
      isLoading.value = true
      
      const response = await apiClient.getMessages(
        chatState.conversationId,
        pageNum,
        pageSize
      )

      if (response.data && Array.isArray(response.data)) {
        const newMessages = response.data.map(formatMessage)
        
        if (pageNum === 1) {
          messages.value = newMessages
        } else {
          messages.value.unshift(...newMessages)
        }
        
        hasMoreMessages.value = response.data.length === pageSize
        
        // 标记消息为已读
        if (chatState.isOpen) {
          markMessagesAsRead()
        }
      }
      
    } catch (error) {
      console.error('Failed to load messages:', error)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 发送消息
   */
  async function sendMessage(content, messageType = 'text', file = null) {
    if (!content.trim() && !file) {
      return
    }

    try {
      isSending.value = true
      
      // 创建临时消息
      const tempMessage = {
        id: utils.generateId(),
        content,
        messageType,
        senderType: '1', // 客户
        senderId: config.value.customerId,
        senderName: config.value.customerName,
        sendTime: new Date().toISOString(),
        status: 'sending',
        isTemp: true
      }

      // 添加到消息列表
      addMessage(tempMessage)

      let response
      
      if (file) {
        // 上传文件
        const uploadResponse = await apiClient.uploadFile(file)
        
        // 发送文件消息
        response = await apiClient.sendMessage({
          conversationId: chatState.conversationId,
          customerId: config.value.customerId,
          customerName: config.value.customerName,
          messageType,
          content: content || file.name,
          fileUrl: uploadResponse.data.url,
          fileName: file.name,
          fileSize: file.size
        })
      } else {
        // 发送文本消息
        response = await apiClient.sendMessage({
          conversationId: chatState.conversationId,
          customerId: config.value.customerId,
          customerName: config.value.customerName,
          messageType,
          content
        })
      }

      // 更新临时消息状态
      if (response.data) {
        updateMessage(tempMessage.id, {
          ...response.data,
          status: 'sent',
          isTemp: false
        })
        
        // 通过WebSocket发送消息
        if (wsConnected.value) {
          sendChatMessage(
            chatState.conversationId,
            content,
            messageType,
            config.value.customerName
          )
        }
      }
      
    } catch (error) {
      console.error('Failed to send message:', error)
      
      // 更新消息状态为失败
      const failedMessage = messages.value.find(m => m.id === tempMessage.id)
      if (failedMessage) {
        failedMessage.status = 'failed'
      }
      
      throw error
    } finally {
      isSending.value = false
    }
  }

  /**
   * 添加消息
   */
  function addMessage(message) {
    const formattedMessage = formatMessage(message)
    messages.value.push(formattedMessage)
    
    // 滚动到底部
    nextTick(() => {
      scrollToBottom()
    })
  }

  /**
   * 添加系统消息
   */
  function addSystemMessage(content) {
    const systemMessage = {
      id: utils.generateId(),
      content,
      messageType: 'system',
      senderType: '4', // 系统
      sendTime: new Date().toISOString(),
      status: 'sent'
    }
    addMessage(systemMessage)
  }

  /**
   * 更新消息
   */
  function updateMessage(messageId, updates) {
    const index = messages.value.findIndex(m => m.id === messageId)
    if (index > -1) {
      Object.assign(messages.value[index], updates)
    }
  }

  /**
   * 格式化消息
   */
  function formatMessage(message) {
    return {
      id: message.messageId || message.id,
      conversationId: message.conversationId,
      content: message.content,
      messageType: message.messageType || 'text',
      senderType: message.senderType,
      senderId: message.senderId,
      senderName: message.senderName,
      fileUrl: message.fileUrl,
      fileName: message.fileName,
      fileSize: message.fileSize,
      sendTime: message.sendTime,
      readTime: message.readTime,
      isRead: message.isRead === '1',
      isRecall: message.isRecall === '1',
      status: message.status || 'sent',
      isTemp: message.isTemp || false
    }
  }

  /**
   * 标记消息为已读
   */
  async function markMessagesAsRead() {
    if (!chatState.conversationId) {
      return
    }

    try {
      await apiClient.markMessagesAsRead(chatState.conversationId)
      chatState.unreadCount = 0
    } catch (error) {
      console.error('Failed to mark messages as read:', error)
    }
  }

  /**
   * 打开聊天窗口
   */
  function openChat() {
    chatState.isOpen = true
    chatState.unreadCount = 0
    
    // 标记消息为已读
    markMessagesAsRead()
    
    // 滚动到底部
    nextTick(() => {
      scrollToBottom()
    })
  }

  /**
   * 关闭聊天窗口
   */
  function closeChat() {
    chatState.isOpen = false
  }

  /**
   * 滚动到底部
   */
  function scrollToBottom() {
    const messageContainer = document.querySelector('.whisper-chat-messages')
    if (messageContainer) {
      messageContainer.scrollTop = messageContainer.scrollHeight
    }
  }

  /**
   * 结束会话
   */
  async function endConversation() {
    if (!chatState.conversationId) {
      return
    }

    try {
      await apiClient.endConversation(chatState.conversationId)
      chatState.status = 'ended'
      addSystemMessage('会话已结束')
    } catch (error) {
      console.error('Failed to end conversation:', error)
    }
  }

  /**
   * 设置满意度
   */
  async function setSatisfaction(rating) {
    if (!chatState.conversationId) {
      return
    }

    try {
      await apiClient.setSatisfaction(chatState.conversationId, rating)
      addSystemMessage(`感谢您的评价：${rating}星`)
    } catch (error) {
      console.error('Failed to set satisfaction:', error)
    }
  }

  /**
   * 销毁聊天
   */
  function destroy() {
    wsDisconnect()
    chatState.isInitialized = false
    chatState.isOpen = false
    messages.value = []
  }

  // 计算属性
  const isConnected = computed(() => wsConnected.value)
  const isConnecting = computed(() => wsConnecting.value)
  const connectionError = computed(() => wsError.value)
  const canSendMessage = computed(() => 
    chatState.isInitialized && 
    isConnected.value && 
    !isSending.value &&
    chatState.status !== 'ended'
  )

  return {
    // 状态
    config,
    chatState,
    messages,
    isLoading,
    isSending,
    hasMoreMessages,
    isConnected,
    isConnecting,
    connectionError,
    canSendMessage,
    
    // 方法
    initialize,
    sendMessage,
    loadMessages,
    openChat,
    closeChat,
    endConversation,
    setSatisfaction,
    markMessagesAsRead,
    destroy
  }
}
