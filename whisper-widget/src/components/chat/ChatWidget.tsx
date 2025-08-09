'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send, Minimize2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ChatMessage } from './ChatMessage'
import { ChatInput } from './ChatInput'
import { ChatHeader } from './ChatHeader'
import { useChatWebSocket, mapWebSocketMessageType, mapConnectionState, type ChatConnectionState } from '@/hooks/useChatWebSocket'
import { useChatApi } from '@/hooks/useChatApi'
import { getThemeConfig, getApiConfig, WIDGET_CONFIG, mergeConfig, type WidgetConfig } from '@/config/widget.config'
import { generateMessageId, formatTime, sanitizeMessage } from '@/utils/chat.utils'
import {
  chatWindowVariants,
  floatingButtonVariants,
  messageListVariants,
  headerVariants,
  inputVariants
} from '@/config/animations'
import { useResponsive } from '@/hooks/useResponsive'
import { DebugPanel } from './DebugPanel'

export interface Message {
  id: string
  content: string
  type: 'user' | 'agent' | 'system'
  timestamp: Date
  status?: 'sending' | 'sent' | 'failed'
}

export interface ChatWidgetProps {
  /** 客服系统API基础URL */
  apiBaseUrl?: string
  /** WebSocket连接URL */
  websocketUrl?: string
  /** 主题颜色配置 */
  theme?: {
    primary?: string
    secondary?: string
    background?: string
  }
  /** 初始化配置 */
  config?: Partial<typeof WIDGET_CONFIG> & {
    // 向后兼容的简化配置
    welcomeMessage?: string
    placeholder?: string
  }
  /** 自定义样式类名 */
  className?: string
  /** 是否默认打开 */
  defaultOpen?: boolean
}

/**
 * 客服聊天Widget主组件
 * 提供完整的聊天功能，包括消息发送、接收、WebSocket实时通信等
 */
export function ChatWidget({
  apiBaseUrl,
  websocketUrl,
  theme = {},
  config = {},
  className,
  defaultOpen = false
}: ChatWidgetProps) {
  // 获取默认配置
  const apiConfig = getApiConfig()
  const defaultTheme = getThemeConfig('whisper')

  // 深度合并配置，特别处理嵌套对象和向后兼容
  const widgetConfig = {
    ...WIDGET_CONFIG,
    ...config,
    messages: {
      ...WIDGET_CONFIG.messages,
      ...(config?.messages || {}),
      // 向后兼容：支持直接在config中设置welcomeMessage和placeholder
      ...(config?.welcomeMessage && { welcome: config.welcomeMessage }),
      ...(config?.placeholder && { placeholder: config.placeholder })
    },
    animations: {
      ...WIDGET_CONFIG.animations,
      ...(config?.animations || {})
    }
  }

  // 合并配置
  const finalApiBaseUrl = apiBaseUrl || apiConfig.baseUrl
  const finalWebsocketUrl = websocketUrl || apiConfig.websocketUrl
  // 状态管理
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<ChatConnectionState>('disconnected')
  const [sessionData, setSessionData] = useState<{
    customerId?: number
    customerNo?: string
    customerName?: string
    conversationId?: number
    sessionId?: string
  } | null>(null)
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  // 响应式Hook
  const {
    isMobile,
    isTablet,
    isDesktop,
    getChatWindowStyles,
    getFloatingButtonStyles,
    getMessageMaxWidth,
    getFontSize,
    getSpacing
  } = useResponsive()

  // 自定义Hooks
  const { sendMessage: sendApiMessage, isLoading, initializeSession } = useChatApi(finalApiBaseUrl)
  // 生成稳定的用户ID
  const [userId] = useState(() => {
    // 尝试从localStorage获取，如果没有则生成新的
    const stored = typeof window !== 'undefined' ? localStorage.getItem('whisper-widget-user-id') : null
    if (stored) return stored

    const newId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    if (typeof window !== 'undefined') {
      localStorage.setItem('whisper-widget-user-id', newId)
    }
    return newId
  })

  // 访客名称状态
  const [guestName, setGuestName] = useState<string>('访客')

  // 计算WebSocket用户标识符
  const wsUserId = sessionData?.customerNo || userId

  const {
    sendMessage: sendWebSocketMessage,
    isConnected,
    lastMessage,
    connectionState
  } = useChatWebSocket(
    finalWebsocketUrl,
    isOpen && !!sessionData, // 有会话数据时才启用WebSocket
    {},
    'customer',
    wsUserId
  )

  // 主题样式
  const themeStyles = {
    ...defaultTheme,
    ...theme
  }

  // 生成访客名称
  const generateGuestName = async (type: 'smart' | 'simple' | 'personalized' = 'smart') => {
    try {
      const response = await fetch(`${apiBaseUrl}/generateGuestName?type=${type}`)
      const data = await response.json()

      console.log('🎭 访客名称API响应:', data)

      if (data.code === 200 && data.data?.guestName) {
        console.log('✅ 生成访客名称成功:', data.data.guestName)
        return data.data.guestName
      } else {
        console.warn('⚠️ 访客名称生成失败，使用默认名称')
        console.warn('响应数据:', data)
        return '访客'
      }
    } catch (error) {
      console.error('❌ 访客名称生成异常:', error)
      return '访客'
    }
  }

  // 初始化会话和欢迎消息
  useEffect(() => {
    if (isOpen && !sessionData) {
      console.log('开始初始化会话...')

      // 异步初始化流程
      const initializeChat = async () => {
        try {
          // 1. 生成智能访客名称
          const generatedGuestName = await generateGuestName('smart')
          setGuestName(generatedGuestName)
          console.log('🎭 使用访客名称:', generatedGuestName)

          // 2. 立即设置基础会话数据，确保WebSocket可以连接
          const basicSessionData = {
            customerId: 1,
            customerName: generatedGuestName,
            conversationId: 1,
            sessionId: userId
          }
          setSessionData(basicSessionData)

          // 3. 先添加默认欢迎消息
          const welcomeMsg: Message = {
            id: generateMessageId('welcome'),
            content: widgetConfig.messages.welcome,
            type: 'agent',
            timestamp: new Date()
          }
          setMessages([welcomeMsg])

          // 4. 尝试从后端获取真实的会话数据
          const response = await initializeSession({
            customerName: generatedGuestName,
            email: `${userId}@guest.local`, // 使用临时邮箱格式
            // 不传递customerId，让后端自动生成
          })

          console.log('会话初始化响应:', response)
          if (response.code === 200 && response.data) {
            // 更新为真实的会话数据
            setSessionData({
              customerId: response.data.customerId,
              customerNo: response.data.customerNo,
              customerName: response.data.customerName, // 使用后端返回的名称（应该是生成的访客名称）
              conversationId: response.data.conversationId,
              sessionId: response.data.sessionId
            })

            // 如果后端返回了欢迎消息，替换默认消息
            if (response.data.welcomeMessage && response.data.welcomeMessage !== widgetConfig.messages.welcome) {
              const backendWelcomeMsg: Message = {
                id: generateMessageId('backend-welcome'),
                content: response.data.welcomeMessage,
                type: 'agent',
                timestamp: new Date()
              }
              setMessages([backendWelcomeMsg])
            }
          }
        } catch (error) {
          console.error('初始化会话失败，使用基础会话数据:', error)
          // 保持基础会话数据，WebSocket仍然可以工作
        }
      }

      // 执行异步初始化
      initializeChat()
    }
  }, [isOpen, sessionData, widgetConfig.messages.welcome, userId])

  // 处理WebSocket消息
  useEffect(() => {
    if (lastMessage) {
      const newMessage: Message = {
        id: generateMessageId('ws'),
        content: lastMessage.content,
        type: mapWebSocketMessageType(lastMessage.type, lastMessage.sender),
        timestamp: new Date()
      }
      setMessages(prev => [...prev, newMessage])
    }
  }, [lastMessage])

  // 更新连接状态
  useEffect(() => {
    setConnectionStatus(mapConnectionState(connectionState))
  }, [connectionState])

  // 自动滚动到底部
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  // 发送消息处理
  const handleSendMessage = async (content: string) => {
    console.log('🚀 开始发送消息:', content)

    if (!content.trim()) {
      console.log('❌ 消息内容为空')
      return
    }

    // 清理和验证消息内容
    const sanitizedContent = sanitizeMessage(content.trim())
    if (!sanitizedContent) {
      console.log('❌ 消息内容验证失败')
      return
    }

    console.log('✅ 消息内容验证通过:', sanitizedContent)

    const userMessage: Message = {
      id: generateMessageId('user'),
      content: sanitizedContent,
      type: 'user',
      timestamp: new Date(),
      status: 'sending'
    }

    // 添加用户消息到列表
    console.log('📝 添加用户消息到UI:', userMessage)
    setMessages(prev => [...prev, userMessage])

    try {
      if (!sessionData?.conversationId) {
        throw new Error('会话未初始化')
      }

      console.log('发送消息:', {
        content: sanitizedContent,
        conversationId: sessionData.conversationId,
        customerId: sessionData.customerId,
        customerName: sessionData.customerName,
        isConnected
      })

      // 优先通过HTTP API发送消息以确保数据库持久化
      console.log('📡 调用HTTP API发送消息...')
      const response = await sendApiMessage(
        sanitizedContent,
        'text',
        sessionData.conversationId,
        sessionData.customerId,
        sessionData.customerName
      )

      console.log('📡 HTTP API响应:', response)
      console.log('📡 响应代码:', response?.code)
      console.log('📡 响应消息:', response?.msg)
      console.log('📡 响应数据:', response?.data)

      if (response && response.code === 200) {
        console.log('HTTP API发送成功:', response)
        // 更新消息状态为已发送
        setMessages(prev =>
          prev.map(msg =>
            msg.id === userMessage.id
              ? { ...msg, status: 'sent' }
              : msg
          )
        )

        // 如果WebSocket也连接了，通过WebSocket发送以提供实时性
        if (isConnected) {
          try {
            await sendWebSocketMessage(
              sanitizedContent,
              'message',
              sessionData.conversationId,
              sessionData.customerName
            )
            console.log('WebSocket发送成功')
          } catch (wsError) {
            console.warn('WebSocket发送失败，但HTTP API已成功:', wsError)
          }
        }
      } else {
        throw new Error('HTTP API发送失败')
      }
    } catch (error) {
      console.error('发送消息失败:', error)
      // 更新消息状态为失败
      setMessages(prev =>
        prev.map(msg =>
          msg.id === userMessage.id
            ? { ...msg, status: 'failed' }
            : msg
        )
      )
    }
  }

  // 切换聊天窗口
  const toggleChat = () => {
    setIsOpen(!isOpen)
    if (isMinimized) {
      setIsMinimized(false)
    }
  }

  // 最小化聊天窗口
  const minimizeChat = () => {
    setIsMinimized(true)
  }

  // 关闭聊天窗口
  const closeChat = () => {
    setIsOpen(false)
    setIsMinimized(false)
  }

  // 获取响应式样式
  const chatWindowStyles = getChatWindowStyles()
  const floatingButtonStyles = getFloatingButtonStyles()

  return (
    <>
      {/* 调试面板 - 仅开发环境 */}
      <DebugPanel
        isOpen={isOpen}
        sessionData={sessionData}
        connectionState={mapConnectionState(connectionState)}
        isConnected={isConnected}
        userId={userId}
        websocketUrl={finalWebsocketUrl}
      />

      <div className={cn('z-50', className)} style={isOpen ? chatWindowStyles : floatingButtonStyles}>
      {/* 聊天窗口 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={chatWindowVariants}
            initial="hidden"
            animate={isMinimized ? "minimized" : "visible"}
            exit="exit"
            className={cn(
              'bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden flex flex-col',
              isMobile ? 'w-full h-full' : 'w-80 h-96',
              isMinimized && 'pointer-events-none'
            )}
            style={{
              backgroundColor: themeStyles.background,
              ...(isMobile ? { width: '100%', height: '100%' } : {})
            }}
          >
            {/* 聊天头部 */}
            <motion.div
              variants={headerVariants}
              initial="hidden"
              animate="visible"
            >
              <ChatHeader
                onMinimize={minimizeChat}
                onClose={closeChat}
                connectionStatus={connectionStatus}
                isMinimized={isMinimized}
                theme={themeStyles}
              />
            </motion.div>

            {/* 消息列表 */}
            {!isMinimized && (
              <motion.div
                ref={chatContainerRef}
                className={cn(
                  'flex-1 overflow-y-auto space-y-3',
                  getSpacing()
                )}
                style={{ backgroundColor: themeStyles.secondary }}
                variants={messageListVariants}
                initial="hidden"
                animate="visible"
              >
                {messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    theme={themeStyles}
                  />
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gray-200 rounded-lg px-3 py-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </motion.div>
            )}

            {/* 输入框 */}
            {!isMinimized && (
              <motion.div
                variants={inputVariants}
                initial="hidden"
                animate="visible"
              >
                <ChatInput
                  onSendMessage={handleSendMessage}
                  placeholder={widgetConfig.messages.placeholder}
                  disabled={isLoading}
                  theme={themeStyles}
                  maxLength={500}
                />
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 浮动按钮 */}
      {!isOpen && (
        <motion.button
          variants={floatingButtonVariants}
          initial="hidden"
          animate="visible"
          whileHover="hover"
          whileTap="tap"
          onClick={toggleChat}
          className={cn(
            'rounded-full shadow-lg flex items-center justify-center text-white hover:shadow-xl transition-shadow',
            isMobile ? 'w-12 h-12' : 'w-14 h-14'
          )}
          style={{ backgroundColor: themeStyles.primary }}
        >
          <MessageCircle size={isMobile ? 20 : 24} />
        </motion.button>
      )}
      </div>
    </>
  )
}
