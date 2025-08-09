import { ref, reactive, onUnmounted, type Ref } from 'vue'
import type {
  ConnectionState,
  WebSocketMessage,
  WebSocketEventListeners,
  WebSocketStateChangeEvent,
  UseWebSocketReturn
} from '@/types'

/**
 * WebSocket连接状态枚举
 */
const ConnectionState = {
  IDLE: 'idle' as const,
  CONNECTING: 'connecting' as const,
  CONNECTED: 'connected' as const,
  DISCONNECTED: 'disconnected' as const,
  FAILED: 'failed' as const,
  RECONNECTING: 'reconnecting' as const
} as const

/**
 * WebSocket 连接管理 Composable
 * @returns WebSocket管理对象
 */
export function useWebSocket(): UseWebSocketReturn {
  // 响应式状态
  const isConnected: Ref<boolean> = ref(false)
  const isConnecting: Ref<boolean> = ref(false)
  const connectionError: Ref<Error | null> = ref(null)
  const lastHeartbeat: Ref<Date | null> = ref(null)
  const connectionState: Ref<ConnectionState> = ref(ConnectionState.IDLE)

  // 内部变量
  let ws: WebSocket | null = null
  let heartbeatTimer: number | null = null
  let reconnectTimer: number | null = null
  let reconnectAttempts: number = 0
  let lastUrl: string = ''
  let lastCustomerId: string = ''

  // 常量配置
  const maxReconnectAttempts: number = 5
  const heartbeatInterval: number = 30000 // 30秒心跳
  const baseReconnectDelay: number = 1000 // 基础重连延迟1秒
  const maxReconnectDelay: number = 30000 // 最大重连延迟30秒
  const connectionTimeout: number = 10000 // 连接超时10秒

  // 事件监听器
  const listeners: WebSocketEventListeners = reactive({
    message: [],
    open: [],
    close: [],
    error: [],
    stateChange: []
  })

  /**
   * 状态转换函数
   */
  const setState = (newState: ConnectionState): void => {
    const oldState = connectionState.value
    connectionState.value = newState
    
    // 更新相关的响应式状态
    switch (newState) {
      case ConnectionState.CONNECTING:
        isConnecting.value = true
        isConnected.value = false
        connectionError.value = null
        break
      case ConnectionState.CONNECTED:
        isConnecting.value = false
        isConnected.value = true
        connectionError.value = null
        break
      case ConnectionState.DISCONNECTED:
      case ConnectionState.FAILED:
        isConnecting.value = false
        isConnected.value = false
        break
      case ConnectionState.RECONNECTING:
        isConnecting.value = true
        isConnected.value = false
        break
      default:
        isConnecting.value = false
        isConnected.value = false
    }
    
    // 触发状态变更事件
    const stateChangeEvent: WebSocketStateChangeEvent = {
      oldState,
      newState,
      error: connectionError.value
    }
    
    listeners.stateChange.forEach(callback => {
      try {
        callback(stateChangeEvent)
      } catch (error) {
        console.error('State change callback error:', error)
      }
    })
    
    console.log(`WebSocket state changed: ${oldState} -> ${newState}`)
  }

  /**
   * 构建WebSocket URL
   */
  const buildWebSocketUrl = (baseUrl: string, customerId: string): string => {
    try {
      // 清理基础URL，移除尾部斜杠
      let cleanUrl = baseUrl.replace(/\/+$/, '')
      
      // 确定协议
      let protocol = 'ws'
      if (cleanUrl.startsWith('https://')) {
        protocol = 'wss'
      } else if (cleanUrl.startsWith('http://')) {
        protocol = 'ws'
      }
      
      // 处理各种可能的URL格式
      if (cleanUrl.includes('/websocket/')) {
        // 如果URL中已经包含/websocket/路径，移除后面的部分
        cleanUrl = cleanUrl.replace(/\/websocket.*$/, '')
      } else if (cleanUrl.endsWith('/websocket')) {
        // 如果URL以/websocket结尾，移除它
        cleanUrl = cleanUrl.replace(/\/websocket$/, '')
      }
      
      // 构建WebSocket URL，确保协议正确
      const wsBaseUrl = cleanUrl.replace(/^https?:\/\//, `${protocol}://`)
      const encodedCustomerId = encodeURIComponent(customerId)
      const finalUrl = `${wsBaseUrl}/websocket/chat/customer/${encodedCustomerId}`

      console.log('WebSocket URL construction:', {
        input: baseUrl,
        cleaned: cleanUrl,
        protocol,
        final: finalUrl,
        customerId: encodedCustomerId
      })

      return finalUrl
    } catch (error) {
      console.error('Error building WebSocket URL:', error)
      throw new Error(`Invalid WebSocket URL configuration: ${(error as Error).message}`)
    }
  }

  /**
   * 添加事件监听器
   */
  const on = <K extends keyof WebSocketEventListeners>(
    event: K,
    callback: WebSocketEventListeners[K][0]
  ): void => {
    if (listeners[event]) {
      listeners[event].push(callback)
    }
  }

  /**
   * 移除事件监听器
   */
  const off = <K extends keyof WebSocketEventListeners>(
    event: K,
    callback: WebSocketEventListeners[K][0]
  ): void => {
    if (listeners[event]) {
      const index = listeners[event].indexOf(callback)
      if (index > -1) {
        listeners[event].splice(index, 1)
      }
    }
  }

  /**
   * 清理定时器
   */
  const clearTimers = (): void => {
    if (heartbeatTimer) {
      clearInterval(heartbeatTimer)
      heartbeatTimer = null
    }
    if (reconnectTimer) {
      clearTimeout(reconnectTimer)
      reconnectTimer = null
    }
  }

  /**
   * 清理WebSocket连接
   */
  const cleanup = (): void => {
    console.log('Cleaning up WebSocket connection')
    clearTimers()
    
    if (ws) {
      // 移除事件监听器，避免在清理过程中触发事件
      ws.onopen = null
      ws.onmessage = null
      ws.onclose = null
      ws.onerror = null
      
      // 如果连接还在，关闭它
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        try {
          ws.close(1000, 'Client cleanup')
        } catch (error) {
          console.warn('Error closing WebSocket:', error)
        }
      }
      
      ws = null
    }
    
    setState(ConnectionState.DISCONNECTED)
    lastHeartbeat.value = null
  }

  /**
   * 启动心跳
   */
  const startHeartbeat = (): void => {
    stopHeartbeat()
    
    heartbeatTimer = window.setInterval(() => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        try {
          const heartbeatMessage: WebSocketMessage = {
            type: 'heartbeat',
            timestamp: new Date().toISOString()
          }
          ws.send(JSON.stringify(heartbeatMessage))
          console.log('Heartbeat sent')
        } catch (error) {
          console.error('Failed to send heartbeat:', error)
        }
      }
    }, heartbeatInterval)
  }

  /**
   * 停止心跳
   */
  const stopHeartbeat = (): void => {
    if (heartbeatTimer) {
      clearInterval(heartbeatTimer)
      heartbeatTimer = null
    }
  }

  /**
   * 清除重连定时器
   */
  const clearReconnectTimer = (): void => {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer)
      reconnectTimer = null
    }
  }

  /**
   * 安排重连 - 使用指数退避算法
   */
  const scheduleReconnect = (url: string, customerId: string): void => {
    clearReconnectTimer()
    reconnectAttempts++

    if (reconnectAttempts > maxReconnectAttempts) {
      console.error(`Max reconnect attempts (${maxReconnectAttempts}) reached`)
      setState(ConnectionState.FAILED)
      connectionError.value = new Error('Maximum reconnection attempts exceeded')
      return
    }

    // 指数退避延迟：1s, 2s, 4s, 8s, 16s, 最大30s
    const delay = Math.min(baseReconnectDelay * Math.pow(2, reconnectAttempts - 1), maxReconnectDelay)
    
    console.log(`Scheduling reconnect attempt ${reconnectAttempts}/${maxReconnectAttempts} in ${delay}ms`)
    setState(ConnectionState.RECONNECTING)

    reconnectTimer = window.setTimeout(async () => {
      try {
        console.log(`Attempting reconnect ${reconnectAttempts}/${maxReconnectAttempts}`)
        await connect(url, customerId)
      } catch (error) {
        console.error(`Reconnect attempt ${reconnectAttempts} failed:`, error)
        // 如果还有重连机会，继续尝试
        if (reconnectAttempts < maxReconnectAttempts) {
          scheduleReconnect(url, customerId)
        } else {
          setState(ConnectionState.FAILED)
          connectionError.value = error as Error
        }
      }
    }, delay)
  }
