import { ref, reactive, computed, nextTick, type Ref, type ComputedRef } from 'vue'
import { ChatApi, utils } from '@/utils/api'
import { useWebSocket } from './useWebSocket'
import { handleError, createError, ErrorType, ErrorLevel } from '@/utils/errorHandler'
import type {
  WidgetConfig,
  ChatStateData,
  Message,
  MessageType,
  MessageStatus,
  ChatState,
  SenderType,
  OperationLocks,
  UseChatReturn,
  ChatInitRequest,
  ChatInitResponse,
  SendMessageRequest,
  WebSocketMessage,
  SystemMessage
} from '@/types'

/**
 * 聊天状态枚举
 */
const ChatState = {
  IDLE: 'idle' as const,
  INITIALIZING: 'initializing' as const,
  CONNECTING: 'connecting' as const,
  CONNECTED: 'connected' as const,
  CHATTING: 'chatting' as const,
  ENDED: 'ended' as const,
  DISCONNECTED: 'disconnected' as const,
  ERROR: 'error' as const
} as const

/**
 * 消息状态枚举
 */
const MessageStatus = {
  SENDING: 'sending' as const,
  SENT: 'sent' as const,
  DELIVERED: 'delivered' as const,
  READ: 'read' as const,
  FAILED: 'failed' as const
} as const

/**
 * 消息类型枚举
 */
const MessageType = {
  TEXT: 'text' as const,
  IMAGE: 'image' as const,
  FILE: 'file' as const,
  VOICE: 'voice' as const,
  VIDEO: 'video' as const,
  SYSTEM: 'system' as const
} as const

/**
 * 发送者类型枚举
 */
const SenderType = {
  CUSTOMER: '1' as const,
  AGENT: '2' as const,
  ROBOT: '3' as const,
  SYSTEM: '4' as const
} as const

/**
 * 聊天功能 Composable
 */
export function useChat(): UseChatReturn {
  // 配置信息
  const config: Ref<WidgetConfig> = ref({
    apiUrl: '',
    websocketUrl: '',
    customerId: '',
    customerName: '',
    theme: 'light',
    position: 'bottom-right'
  })

  // 聊天状态
  const chatState: ChatStateData = reactive({
    isInitialized: false,
    isOpen: false,
    conversationId: null,
    customerId: null,
    sessionId: null,
    agentId: null,
    status: ChatState.DISCONNECTED,
    unreadCount: 0,
    lastActivity: null,
    initializationPromise: null
  })

  // 消息列表
  const messages: Ref<Message[]> = ref([])
  const isLoading: Ref<boolean> = ref(false)
  const isSending: Ref<boolean> = ref(false)
  const hasMoreMessages: Ref<boolean> = ref(true)
  
  // 操作锁，防止并发操作
  const operationLocks: OperationLocks = reactive({
    initializing: false,
    sendingMessage: false,
    loadingMessages: false
  })

  // API客户端
  let apiClient: ChatApi | null = null
  
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
    off: wsOff,
    testConnection,
    checkServerAvailability
  } = useWebSocket()

  /**
   * 初始化聊天 - 防止重复初始化
   */
  const initialize = async (options: WidgetConfig): Promise<void> => {
    // 如果已经在初始化中，返回现有的Promise
    if (operationLocks.initializing) {
      console.log('Initialization already in progress, waiting...')
      return chatState.initializationPromise || Promise.resolve()
    }

    // 如果已经初始化完成，直接返回
    if (chatState.isInitialized) {
      console.log('Chat already initialized')
      return Promise.resolve()
    }

    // 设置初始化锁
    operationLocks.initializing = true
    chatState.status = ChatState.INITIALIZING

    // 创建初始化Promise
    chatState.initializationPromise = (async (): Promise<void> => {
      try {
        console.log('Starting chat initialization...')
        
        // 保存配置
        Object.assign(config.value, options)
        
        // 验证必要配置
        if (!config.value.apiUrl || !config.value.websocketUrl) {
          throw createError(
            'Missing required configuration: apiUrl and websocketUrl are required',
            ErrorType.VALIDATION,
            ErrorLevel.HIGH
          )
        }
        
        // 初始化API客户端
        apiClient = new ChatApi(config.value.apiUrl)
        
        // 初始化聊天会话
        const initRequest: ChatInitRequest = {
          customerId: config.value.customerId,
          customerName: config.value.customerName,
          sessionId: chatState.sessionId || undefined
        }
        
        const response = await apiClient.initChat(initRequest)

        if (response.data) {
          const initData: ChatInitResponse = response.data
          
          // 原子性更新状态
          Object.assign(chatState, {
            conversationId: initData.conversationId,
            sessionId: initData.sessionId,
            agentId: initData.agentId,
            customerId: initData.customerId,
            status: initData.status === '1' ? ChatState.CHATTING : ChatState.CONNECTED,
            lastActivity: new Date().toISOString()
          })

          console.log('Chat initialized with state:', {
            conversationId: chatState.conversationId,
            customerId: chatState.customerId,
            sessionId: chatState.sessionId
          })
        }

        // 连接WebSocket
        await connectWebSocket()
        
        // 加载历史消息
        await loadMessages()
        
        // 标记初始化完成
        chatState.isInitialized = true
        chatState.status = ChatState.CONNECTED
        console.log('Chat initialized successfully')
        
      } catch (error) {
        console.error('Failed to initialize chat:', error)
        chatState.status = ChatState.ERROR
        
        // 使用统一错误处理
        const whisperError = handleError(error as Error, 'Chat Initialization')
        throw whisperError
      } finally {
        // 释放初始化锁
        operationLocks.initializing = false
        chatState.initializationPromise = null
      }
    })()

    return chatState.initializationPromise
  }

  /**
   * 连接WebSocket
   */
  const connectWebSocket = async (): Promise<void> => {
    try {
      console.log('useChat: Starting WebSocket connection...')
      console.log('useChat: WebSocket URL:', config.value.websocketUrl)
      console.log('useChat: Customer ID:', config.value.customerId)

      // 首先检查服务器是否可用
      if (checkServerAvailability) {
        console.log('useChat: Checking server availability...')
        await checkServerAvailability(config.value.websocketUrl)
        console.log('useChat: Server availability check passed')
      }

      // 尝试连接WebSocket
      await wsConnect(config.value.websocketUrl, config.value.customerId)
      console.log('useChat: WebSocket connected successfully')

      // 监听消息
      wsOn('message', handleWebSocketMessage)
      wsOn('close', handleWebSocketClose)
      wsOn('error', handleWebSocketError)

      chatState.status = ChatState.CONNECTED
      console.log('useChat: WebSocket event listeners registered')
    } catch (error) {
      console.error('useChat: Failed to connect WebSocket:', error)
      console.error('useChat: WebSocket config:', {
        url: config.value.websocketUrl,
        customerId: config.value.customerId
      })
      chatState.status = ChatState.DISCONNECTED
      throw error
    }
  }

  /**
   * 处理WebSocket消息
   */
  const handleWebSocketMessage = (data: WebSocketMessage): void => {
    console.log('Received WebSocket message:', data)
    
    switch (data.type) {
      case 'message':
        if (data.data) {
          addMessage(data.data as Message)
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
          chatState.status = data.status as ChatState
        }
        break
        
      default:
        console.log('Unknown message type:', data.type)
    }
  }

  /**
   * 处理WebSocket关闭
   */
  const handleWebSocketClose = (): void => {
    console.log('WebSocket connection closed')
    chatState.status = ChatState.DISCONNECTED
  }

  /**
   * 处理WebSocket错误
   */
  const handleWebSocketError = (error: Event): void => {
    console.error('WebSocket error:', error)
    chatState.status = ChatState.ERROR
  }
