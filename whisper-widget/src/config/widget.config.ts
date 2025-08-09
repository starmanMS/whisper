/**
 * 客服Widget配置文件
 * 包含默认主题、API配置、功能开关等设置
 */

// 默认主题配置
export const DEFAULT_THEME = {
  primary: '#3b82f6',
  secondary: '#f1f5f9',
  background: '#ffffff',
  text: '#1f2937',
  textSecondary: '#6b7280',
  border: '#e5e7eb',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444'
} as const

// Whisper主题配置（符合用户偏好）
export const WHISPER_THEME = {
  primary: '#4f46e5', // 深紫色，专业商务风格
  secondary: '#f8fafc', // 浅灰背景
  background: '#ffffff',
  text: '#0f172a',
  textSecondary: '#64748b',
  border: '#e2e8f0',
  success: '#059669',
  warning: '#d97706',
  error: '#dc2626'
} as const

// API配置
export const API_CONFIG = {
  // 开发环境
  development: {
    baseUrl: 'http://localhost:8080/api/chat',
    websocketUrl: 'ws://localhost:8080',
    timeout: 10000
  },
  // 生产环境
  production: {
    baseUrl: '/api/chat',
    websocketUrl: typeof window !== 'undefined'
      ? `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}`
      : 'ws://localhost:8080',
    timeout: 15000
  }
} as const

// Widget默认配置
export const WIDGET_CONFIG = {
  // 基础设置
  defaultOpen: false,
  position: 'bottom-right' as const,

  // 消息设置
  maxMessages: 100 as number,
  messageTimeout: 30000,
  typingTimeout: 3000,
  
  // 连接设置
  reconnectAttempts: 5,
  reconnectInterval: 3000,
  heartbeatInterval: 30000,
  
  // 文件上传设置
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedFileTypes: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ],
  
  // 动画设置
  animations: {
    duration: 300,
    easing: 'easeOut',
    stagger: 50
  },
  
  // 文本设置
  messages: {
    welcome: '您好！欢迎使用Whisper智能客服系统，我是您的专属客服助手。有什么可以帮助您的吗？',
    placeholder: '请输入您的问题...',
    connecting: '正在连接客服...',
    reconnecting: '连接断开，正在重新连接...',
    offline: '客服暂时离线，请稍后再试',
    error: '发送失败，请重试',
    fileUploadError: '文件上传失败',
    fileSizeError: '文件大小超出限制',
    fileTypeError: '不支持的文件类型'
  },
  
  // 快捷回复
  quickReplies: [
    '我想了解产品信息',
    '我遇到了技术问题',
    '我想咨询价格',
    '我需要售后服务',
    '我要投诉建议',
    '其他问题'
  ]
} as const

// 响应式断点
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
} as const

// Widget尺寸配置
export const WIDGET_SIZES = {
  // 聊天窗口尺寸
  chat: {
    width: {
      mobile: 'calc(100vw - 2rem)',
      desktop: '384px' // w-96
    },
    height: {
      mobile: 'calc(100vh - 8rem)',
      desktop: '512px' // h-96 + header
    },
    maxHeight: '80vh'
  },
  
  // 浮动按钮尺寸
  button: {
    size: '56px', // w-14 h-14
    iconSize: '24px'
  },
  
  // 消息气泡最大宽度
  message: {
    maxWidth: '85%'
  }
} as const

// 功能开关
export const FEATURE_FLAGS = {
  // 基础功能
  enableWebSocket: true,
  enableFileUpload: true,
  enableEmoji: true,
  enableQuickReplies: true,
  enableTypingIndicator: true,
  
  // 高级功能
  enableVoiceMessage: false,
  enableVideoCall: false,
  enableScreenShare: false,
  enableChatHistory: true,
  enableMessageSearch: false,
  
  // 分析功能
  enableAnalytics: false,
  enableErrorTracking: true,
  enablePerformanceMonitoring: false
} as const

// 获取当前环境配置
export function getApiConfig() {
  const env = process.env.NODE_ENV || 'development'
  return API_CONFIG[env as keyof typeof API_CONFIG] || API_CONFIG.development
}

// 获取主题配置
export function getThemeConfig(themeName: 'default' | 'whisper' = 'whisper') {
  switch (themeName) {
    case 'whisper':
      return WHISPER_THEME
    case 'default':
    default:
      return DEFAULT_THEME
  }
}

// 合并用户配置
export function mergeConfig<T extends Record<string, any>>(
  defaultConfig: T,
  userConfig: Partial<T> = {}
): T {
  return {
    ...defaultConfig,
    ...userConfig
  }
}

// 验证配置
export function validateConfig(config: any): boolean {
  // 基础验证
  if (!config) return false
  
  // 验证主题配置
  if (config.theme) {
    const requiredThemeKeys = ['primary', 'secondary', 'background']
    for (const key of requiredThemeKeys) {
      if (!config.theme[key]) {
        console.warn(`Missing theme property: ${key}`)
        return false
      }
    }
  }
  
  // 验证API配置
  if (config.apiBaseUrl && typeof config.apiBaseUrl !== 'string') {
    console.warn('apiBaseUrl must be a string')
    return false
  }
  
  if (config.websocketUrl && typeof config.websocketUrl !== 'string') {
    console.warn('websocketUrl must be a string')
    return false
  }
  
  return true
}

// 导出类型定义
export type ThemeConfig = typeof DEFAULT_THEME
export type WidgetConfig = typeof WIDGET_CONFIG
export type ApiConfig = typeof API_CONFIG.development
export type FeatureFlags = typeof FEATURE_FLAGS
