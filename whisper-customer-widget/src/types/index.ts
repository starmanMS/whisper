/**
 * Whisper Customer Widget TypeScript 类型定义
 */

// ============================================================================
// 基础类型
// ============================================================================

/**
 * 聊天状态枚举
 */
export enum ChatState {
  IDLE = 'idle',
  INITIALIZING = 'initializing',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  CHATTING = 'chatting',
  ENDED = 'ended',
  DISCONNECTED = 'disconnected',
  ERROR = 'error'
}

/**
 * 消息状态枚举
 */
export enum MessageStatus {
  SENDING = 'sending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed'
}

/**
 * 消息类型枚举
 */
export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  FILE = 'file',
  VOICE = 'voice',
  VIDEO = 'video',
  SYSTEM = 'system'
}

/**
 * 发送者类型枚举
 */
export enum SenderType {
  CUSTOMER = '1',
  AGENT = '2',
  ROBOT = '3',
  SYSTEM = '4'
}

/**
 * WebSocket连接状态枚举
 */
export enum ConnectionState {
  IDLE = 'idle',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  FAILED = 'failed',
  RECONNECTING = 'reconnecting'
}

/**
 * 错误类型枚举
 */
export enum ErrorType {
  NETWORK = 'network',
  WEBSOCKET = 'websocket',
  API = 'api',
  VALIDATION = 'validation',
  TIMEOUT = 'timeout',
  PERMISSION = 'permission',
  UNKNOWN = 'unknown'
}

/**
 * 错误级别枚举
 */
export enum ErrorLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// ============================================================================
// 配置类型
// ============================================================================

/**
 * Widget配置接口
 */
export interface WidgetConfig {
  /** API基础URL */
  apiUrl: string
  /** WebSocket URL */
  websocketUrl: string
  /** 客户ID */
  customerId: string
  /** 客户姓名 */
  customerName: string
  /** 主题 */
  theme?: 'light' | 'dark'
  /** 位置 */
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  /** 自动打开 */
  autoOpen?: boolean
  /** 显示欢迎消息 */
  showWelcome?: boolean
  /** 欢迎消息内容 */
  welcomeMessage?: string
  /** 最大文件大小 (MB) */
  maxFileSize?: number
  /** 允许的文件类型 */
  allowedFileTypes?: string[]
  /** 是否显示客服头像 */
  showAgentAvatar?: boolean
  /** 是否显示时间戳 */
  showTimestamp?: boolean
}

// ============================================================================
// 消息相关类型
// ============================================================================

/**
 * 消息接口
 */
export interface Message {
  /** 消息ID */
  id: string | number
  /** 会话ID */
  conversationId?: number
  /** 消息内容 */
  content: string
  /** 消息类型 */
  messageType: MessageType
  /** 发送者类型 */
  senderType: SenderType
  /** 发送者ID */
  senderId: string | number
  /** 发送者姓名 */
  senderName: string
  /** 发送时间 */
  sendTime: string
  /** 消息状态 */
  status?: MessageStatus
  /** 是否已读 */
  isRead?: boolean
  /** 阅读时间 */
  readTime?: string
  /** 文件URL */
  fileUrl?: string
  /** 文件名称 */
  fileName?: string
  /** 文件大小 */
  fileSize?: number
  /** 是否为临时消息 */
  isTemp?: boolean
  /** 错误信息 */
  error?: string
  /** 引用的消息ID */
  replyToId?: string | number
}

/**
 * 系统消息接口
 */
export interface SystemMessage extends Omit<Message, 'senderType' | 'senderId' | 'senderName'> {
  senderType: SenderType.SYSTEM
  senderId: 'system'
  senderName: 'System'
  messageType: MessageType.SYSTEM
}

/**
 * 发送消息请求接口
 */
export interface SendMessageRequest {
  /** 会话ID */
  conversationId: number
  /** 客户ID */
  customerId?: string | number
  /** 客户姓名 */
  customerName: string
  /** 消息类型 */
  messageType: MessageType
  /** 消息内容 */
  content: string
  /** 文件URL */
  fileUrl?: string
  /** 文件名称 */
  fileName?: string
  /** 文件大小 */
  fileSize?: number
}

// ============================================================================
// 会话相关类型
// ============================================================================

/**
 * 聊天状态接口
 */
export interface ChatStateData {
  /** 是否已初始化 */
  isInitialized: boolean
  /** 是否打开 */
  isOpen: boolean
  /** 会话ID */
  conversationId: number | null
  /** 客户ID */
  customerId: string | number | null
  /** 会话标识 */
  sessionId: string | null
  /** 客服ID */
  agentId: number | null
  /** 聊天状态 */
  status: ChatState
  /** 未读消息数 */
  unreadCount: number
  /** 最后活动时间 */
  lastActivity: string | null
  /** 初始化Promise */
  initializationPromise: Promise<void> | null
}

/**
 * 会话初始化请求接口
 */
export interface ChatInitRequest {
  /** 客户ID */
  customerId: string
  /** 客户姓名 */
  customerName: string
  /** 会话标识 */
  sessionId?: string
  /** 渠道 */
  channel?: string
}

/**
 * 会话初始化响应接口
 */
export interface ChatInitResponse {
  /** 会话ID */
  conversationId: number
  /** 会话标识 */
  sessionId: string
  /** 客户ID */
  customerId: number
  /** 客服ID */
  agentId?: number
  /** 状态 */
  status: string
}

// ============================================================================
// WebSocket相关类型
// ============================================================================

/**
 * WebSocket消息接口
 */
export interface WebSocketMessage {
  /** 消息类型 */
  type: 'message' | 'system' | 'status' | 'heartbeat' | 'pong' | 'error'
  /** 消息数据 */
  data?: any
  /** 消息内容 */
  message?: string
  /** 状态信息 */
  status?: string
  /** 错误信息 */
  error?: string
  /** 时间戳 */
  timestamp?: string
}

/**
 * WebSocket状态变更事件接口
 */
export interface WebSocketStateChangeEvent {
  /** 旧状态 */
  oldState: ConnectionState
  /** 新状态 */
  newState: ConnectionState
  /** 错误信息 */
  error?: Error | null
}

/**
 * WebSocket事件监听器类型
 */
export type WebSocketEventListener<T = any> = (data: T) => void

/**
 * WebSocket事件监听器映射
 */
export interface WebSocketEventListeners {
  message: WebSocketEventListener<WebSocketMessage>[]
  open: WebSocketEventListener<Event>[]
  close: WebSocketEventListener<CloseEvent>[]
  error: WebSocketEventListener<Event>[]
  stateChange: WebSocketEventListener<WebSocketStateChangeEvent>[]
}

// ============================================================================
// API相关类型
// ============================================================================

/**
 * API响应基础接口
 */
export interface ApiResponse<T = any> {
  /** 状态码 */
  code: number
  /** 消息 */
  msg: string
  /** 数据 */
  data: T
}

/**
 * 分页响应接口
 */
export interface PageResponse<T = any> {
  /** 数据列表 */
  rows: T[]
  /** 总数 */
  total: number
  /** 当前页 */
  pageNum: number
  /** 页大小 */
  pageSize: number
}

/**
 * 文件上传响应接口
 */
export interface FileUploadResponse {
  /** 文件URL */
  url: string
  /** 文件名 */
  fileName: string
  /** 文件大小 */
  fileSize: number
  /** 文件类型 */
  fileType: string
}

// ============================================================================
// 错误相关类型
// ============================================================================

/**
 * Whisper错误接口
 */
export interface WhisperErrorData {
  /** 错误ID */
  id: string
  /** 错误名称 */
  name: string
  /** 错误消息 */
  message: string
  /** 错误类型 */
  type: ErrorType
  /** 错误级别 */
  level: ErrorLevel
  /** 错误详情 */
  details: Record<string, any>
  /** 时间戳 */
  timestamp: string
  /** 堆栈信息 */
  stack?: string
}

/**
 * 错误监听器类型
 */
export type ErrorListener = (error: WhisperErrorData, context: string) => void

// ============================================================================
// 操作锁类型
// ============================================================================

/**
 * 操作锁接口
 */
export interface OperationLocks {
  /** 初始化锁 */
  initializing: boolean
  /** 发送消息锁 */
  sendingMessage: boolean
  /** 加载消息锁 */
  loadingMessages: boolean
}

// ============================================================================
// 组合式函数返回类型
// ============================================================================

/**
 * useWebSocket返回类型
 */
export interface UseWebSocketReturn {
  // 状态
  isConnected: Ref<boolean>
  isConnecting: Ref<boolean>
  connectionError: Ref<Error | null>
  lastHeartbeat: Ref<Date | null>
  connectionState: Ref<ConnectionState>
  
  // 方法
  connect: (url: string, customerId: string) => Promise<void>
  disconnect: () => void
  reconnect: () => Promise<void>
  send: (data: any) => void
  sendChatMessage: (conversationId: number, content: string, messageType: string, senderName: string) => void
  sendReadReceipt: (conversationId: number, messageId: string) => void
  on: (event: keyof WebSocketEventListeners, callback: WebSocketEventListener) => void
  off: (event: keyof WebSocketEventListeners, callback: WebSocketEventListener) => void
  getConnectionState: () => ConnectionState
  testConnection: (url: string) => Promise<boolean>
  checkServerAvailability: (url: string) => Promise<boolean>
  cleanup: () => void
}

/**
 * useChat返回类型
 */
export interface UseChatReturn {
  // 状态
  config: Ref<WidgetConfig>
  chatState: ChatStateData
  messages: Ref<Message[]>
  isLoading: Ref<boolean>
  isSending: Ref<boolean>
  hasMoreMessages: Ref<boolean>
  isConnected: ComputedRef<boolean>
  isConnecting: ComputedRef<boolean>
  connectionError: ComputedRef<Error | null>
  canSendMessage: ComputedRef<boolean>
  operationLocks: OperationLocks
  
  // 枚举
  ChatState: typeof ChatState
  MessageStatus: typeof MessageStatus
  
  // 方法
  initialize: (options: WidgetConfig) => Promise<void>
  sendMessage: (content: string, messageType?: MessageType, file?: File) => Promise<void>
  loadMessages: (pageNum?: number, pageSize?: number) => Promise<void>
  openChat: () => void
  closeChat: () => void
  endConversation: () => Promise<void>
  setSatisfaction: (rating: number, feedback?: string) => Promise<void>
  markMessagesAsRead: () => Promise<void>
  cleanup: () => void
  destroy: () => void
}

// ============================================================================
// Vue相关类型导入
// ============================================================================

import type { Ref, ComputedRef } from 'vue'
