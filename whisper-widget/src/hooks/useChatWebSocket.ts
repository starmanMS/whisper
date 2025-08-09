'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

// WebSocket消息类型定义
export interface WebSocketMessage {
  type: 'message' | 'typing' | 'status' | 'error' | 'system'
  content: string
  messageId?: string
  timestamp: string
  sender?: 'user' | 'agent' | 'system'
  sessionId?: string
  conversationId?: number
  messageType?: string
  senderName?: string
}

// 消息类型映射
export type WebSocketMessageType = 'message' | 'typing' | 'status' | 'error' | 'system'
export type ChatMessageType = 'user' | 'agent' | 'system'

// 消息类型转换函数
export function mapWebSocketMessageType(wsType: WebSocketMessageType, sender?: string): ChatMessageType {
  if (wsType === 'message') {
    return sender === 'user' ? 'user' : 'agent'
  }
  return 'system'
}

// WebSocket连接状态
export type ConnectionState = 'connecting' | 'connected' | 'disconnected' | 'error'

// ChatWidget连接状态类型
export type ChatConnectionState = 'connecting' | 'connected' | 'disconnected'

// 连接状态转换函数
export function mapConnectionState(wsState: ConnectionState): ChatConnectionState {
  if (wsState === 'error') {
    return 'disconnected'
  }
  return wsState as ChatConnectionState
}

// WebSocket配置
export interface WebSocketConfig {
  reconnectAttempts?: number
  reconnectInterval?: number
  heartbeatInterval?: number
  messageTimeout?: number
}

/**
 * 聊天WebSocket Hook
 * 提供与后端whisper-customer模块的WebSocket实时通信功能
 */
export function useChatWebSocket(
  baseUrl: string,
  enabled: boolean = true,
  config: WebSocketConfig = {},
  userType: string = 'customer',
  userId: string = 'guest'
) {
  // 默认配置
  const defaultConfig = {
    reconnectAttempts: 5,
    reconnectInterval: 3000,
    heartbeatInterval: 30000,
    messageTimeout: 10000,
    ...config
  }

  // 状态管理
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected')
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null)
  const [messageHistory, setMessageHistory] = useState<WebSocketMessage[]>([])
  const [isTyping, setIsTyping] = useState(false)

  // Refs
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const heartbeatTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttemptsRef = useRef(0)
  const messageQueueRef = useRef<string[]>([])

  // 清理定时器
  const clearTimeouts = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
    if (heartbeatTimeoutRef.current) {
      clearTimeout(heartbeatTimeoutRef.current)
      heartbeatTimeoutRef.current = null
    }
  }, [])

  // 发送心跳
  const sendHeartbeat = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      try {
        const heartbeatMessage: WebSocketMessage = {
          type: 'system',
          content: 'ping',
          timestamp: new Date().toISOString()
        }
        wsRef.current.send(JSON.stringify(heartbeatMessage))
      } catch (error) {
        console.error('发送心跳失败:', error)
        // 心跳失败，可能连接已断开
        setConnectionState('disconnected')
        clearTimeouts()
      }
    } else {
      // 连接不可用，停止心跳
      clearTimeouts()
      setConnectionState('disconnected')
    }
  }, [])

  // 启动心跳
  const startHeartbeat = useCallback(() => {
    clearTimeouts()
    heartbeatTimeoutRef.current = setInterval(() => {
      // 检查连接状态
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        sendHeartbeat()
      } else {
        // 连接已断开，停止心跳
        clearTimeouts()
        setConnectionState('disconnected')
      }
    }, defaultConfig.heartbeatInterval)
  }, [sendHeartbeat, defaultConfig.heartbeatInterval, clearTimeouts])

  // 处理WebSocket消息
  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      const message: WebSocketMessage = JSON.parse(event.data)
      
      // 处理不同类型的消息
      switch (message.type) {
        case 'message':
          setLastMessage(message)
          setMessageHistory(prev => [...prev, message])
          break
          
        case 'typing':
          setIsTyping(message.content === 'start')
          break
          
        case 'status':
          // 处理状态消息（如客服上线/下线）
          console.log('状态更新:', message.content)
          break
          
        case 'system':
          if (message.content === 'pong') {
            // 心跳响应
            console.log('心跳响应正常')
          } else {
            setLastMessage(message)
          }
          break
          
        case 'error':
          console.error('WebSocket错误消息:', message.content)
          break
          
        default:
          console.warn('未知消息类型:', message.type)
      }
    } catch (error) {
      console.error('解析WebSocket消息失败:', error)
    }
  }, [])

  // 连接WebSocket
  const connect = useCallback(() => {
    if (!enabled || !baseUrl) {
      console.log('WebSocket连接被禁用或缺少baseUrl')
      return
    }

    // 如果已经连接或正在连接，则不重复连接
    if (wsRef.current?.readyState === WebSocket.CONNECTING ||
        wsRef.current?.readyState === WebSocket.OPEN) {
      console.log('WebSocket已连接或正在连接，跳过重复连接')
      return
    }

    // 清理旧连接
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }

    setConnectionState('connecting')

    try {
      // 构建WebSocket URL: ws://host:port/websocket/chat/{userType}/{userId}
      let wsUrl: string

      if (baseUrl.startsWith('ws://') || baseUrl.startsWith('wss://')) {
        // 如果baseUrl已经包含协议，直接使用
        wsUrl = `${baseUrl}/websocket/chat/${userType}/${userId}`
      } else {
        // 否则根据当前协议构建WebSocket URL
        const protocol = typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'wss:' : 'ws:'
        const cleanBaseUrl = baseUrl.replace(/^https?:\/\//, '')
        wsUrl = `${protocol}//${cleanBaseUrl}/websocket/chat/${userType}/${userId}`
      }

      console.log('连接WebSocket:', wsUrl)

      // 添加连接超时检测
      const connectionTimeout = setTimeout(() => {
        if (wsRef.current?.readyState === WebSocket.CONNECTING) {
          console.log('WebSocket连接超时')
          wsRef.current.close()
          setConnectionState('error')
        }
      }, 10000) // 10秒超时

      const ws = new WebSocket(wsUrl)
      wsRef.current = ws

      // 清除超时定时器
      ws.addEventListener('open', () => {
        clearTimeout(connectionTimeout)
      })

      ws.addEventListener('error', () => {
        clearTimeout(connectionTimeout)
      })

      ws.onopen = () => {
        console.log('WebSocket连接已建立')
        setConnectionState('connected')
        reconnectAttemptsRef.current = 0

        // 延迟启动心跳，避免连接刚建立就发送消息
        setTimeout(() => {
          if (wsRef.current?.readyState === WebSocket.OPEN) {
            startHeartbeat()
          }
        }, 1000)

        // 延迟发送队列中的消息，确保连接稳定
        setTimeout(() => {
          if (wsRef.current?.readyState === WebSocket.OPEN) {
            while (messageQueueRef.current.length > 0) {
              const queuedMessage = messageQueueRef.current.shift()
              if (queuedMessage) {
                try {
                  ws.send(queuedMessage)
                } catch (error) {
                  console.error('发送队列消息失败:', error)
                  break
                }
              }
            }
          }
        }, 500)
      }

      ws.onmessage = handleMessage

      ws.onclose = (event) => {
        console.log('WebSocket连接已关闭:', event.code, event.reason)
        setConnectionState('disconnected')
        clearTimeouts()

        // 判断是否需要重连
        const shouldReconnect = enabled &&
          event.code !== 1000 && // 不是正常关闭
          event.code !== 1001 && // 不是端点离开
          reconnectAttemptsRef.current < defaultConfig.reconnectAttempts

        if (shouldReconnect) {
          reconnectAttemptsRef.current++
          console.log(`尝试重连 (${reconnectAttemptsRef.current}/${defaultConfig.reconnectAttempts})`)

          // 使用指数退避策略
          const backoffDelay = Math.min(
            defaultConfig.reconnectInterval * Math.pow(2, reconnectAttemptsRef.current - 1),
            30000 // 最大30秒
          )

          reconnectTimeoutRef.current = setTimeout(() => {
            if (enabled) { // 再次检查是否仍需要连接
              connect()
            }
          }, backoffDelay)
        }
      }

      ws.onerror = (error) => {
        console.error('WebSocket错误:', error)
        console.error('WebSocket URL:', wsUrl)
        console.error('WebSocket readyState:', ws.readyState)
        console.error('错误详情:', {
          type: error.type,
          target: error.target,
          timeStamp: error.timeStamp
        })
        setConnectionState('error')
      }

    } catch (error) {
      console.error('创建WebSocket连接失败:', error)
      setConnectionState('error')
    }
  }, [enabled, baseUrl, userType, userId, handleMessage, startHeartbeat, clearTimeouts])

  // 断开连接
  const disconnect = useCallback(() => {
    clearTimeouts()
    
    if (wsRef.current) {
      wsRef.current.close(1000, '用户主动断开')
      wsRef.current = null
    }
    
    setConnectionState('disconnected')
    reconnectAttemptsRef.current = 0
  }, [clearTimeouts])

  // 发送消息
  const sendMessage = useCallback(async (
    content: string,
    type: 'message' | 'typing' = 'message',
    conversationId?: number,
    senderName?: string
  ): Promise<boolean> => {
    const message: any = {
      type,
      content,
      timestamp: new Date().toISOString(),
      sender: 'user'
    }

    // 如果是聊天消息，添加必要的字段
    if (type === 'message' && conversationId) {
      message.conversationId = conversationId
      message.messageType = 'text'
      message.senderName = senderName || '访客'
    }

    const messageStr = JSON.stringify(message)

    // 如果连接正常，直接发送
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send(messageStr)
        return true
      } catch (error) {
        console.error('发送WebSocket消息失败:', error)
        return false
      }
    }

    // 如果连接断开，将消息加入队列
    if (type === 'message') {
      messageQueueRef.current.push(messageStr)
      
      // 尝试重新连接
      if (connectionState === 'disconnected') {
        connect()
      }
    }

    return false
  }, [connectionState, connect])

  // 发送打字状态
  const sendTypingStatus = useCallback((isTyping: boolean) => {
    sendMessage(isTyping ? 'start' : 'stop', 'typing')
  }, [sendMessage])

  // 清除消息历史
  const clearMessageHistory = useCallback(() => {
    setMessageHistory([])
    setLastMessage(null)
  }, [])

  // 重新连接
  const reconnect = useCallback(() => {
    disconnect()
    setTimeout(() => {
      reconnectAttemptsRef.current = 0
      connect()
    }, 1000)
  }, [disconnect, connect])

  // 初始化连接
  useEffect(() => {
    console.log('WebSocket useEffect triggered:', { enabled, baseUrl, userType, userId })

    if (enabled && baseUrl && userType && userId) {
      console.log('✅ WebSocket连接条件满足，准备建立连接...')
      // 延迟连接，避免组件刚挂载就连接
      const timer = setTimeout(() => {
        // 直接调用connect函数，不依赖useCallback
        if (!wsRef.current || wsRef.current.readyState === WebSocket.CLOSED) {
          connect()
        }
      }, 1000) // 增加延迟时间到1秒

      return () => {
        clearTimeout(timer)
        // 清理连接
        if (wsRef.current) {
          wsRef.current.close()
          wsRef.current = null
        }
        setConnectionState('disconnected')
      }
    } else {
      console.log('❌ WebSocket连接条件不满足:', {
        enabled,
        baseUrl: !!baseUrl,
        userType: !!userType,
        userId: !!userId,
        details: { enabled, baseUrl, userType, userId }
      })
      // 清理连接
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }
      setConnectionState('disconnected')
    }
  }, [enabled, baseUrl, userType, userId, connect]) // 添加connect依赖

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      clearTimeouts()
      disconnect()
    }
  }, [clearTimeouts, disconnect])

  return {
    // 状态
    connectionState,
    isConnected: connectionState === 'connected',
    lastMessage,
    messageHistory,
    isTyping,
    
    // 方法
    sendMessage,
    sendTypingStatus,
    clearMessageHistory,
    reconnect,
    disconnect,
    
    // 连接信息
    reconnectAttempts: reconnectAttemptsRef.current,
    maxReconnectAttempts: defaultConfig.reconnectAttempts
  }
}
