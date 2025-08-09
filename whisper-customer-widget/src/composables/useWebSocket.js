import { ref, reactive, onUnmounted } from 'vue'

/**
 * WebSocket 连接管理 Composable
 */
export function useWebSocket() {
  const isConnected = ref(false)
  const isConnecting = ref(false)
  const connectionError = ref(null)
  const lastHeartbeat = ref(null)
  
  let ws = null
  let heartbeatTimer = null
  let reconnectTimer = null
  let reconnectAttempts = 0
  const maxReconnectAttempts = 5
  const heartbeatInterval = 30000 // 30秒心跳
  const reconnectDelay = 3000 // 3秒重连延迟

  // 事件监听器
  const listeners = reactive({
    message: [],
    open: [],
    close: [],
    error: []
  })

  /**
   * 连接WebSocket
   */
  function connect(url, customerId) {
    if (isConnecting.value || isConnected.value) {
      return Promise.resolve()
    }

    return new Promise((resolve, reject) => {
      try {
        isConnecting.value = true
        connectionError.value = null

        const wsUrl = `${url}/chat/customer/${customerId}`
        console.log('Connecting to WebSocket:', wsUrl)
        
        ws = new WebSocket(wsUrl)

        ws.onopen = (event) => {
          console.log('WebSocket connected')
          isConnected.value = true
          isConnecting.value = false
          reconnectAttempts = 0
          
          // 启动心跳
          startHeartbeat()
          
          // 触发open事件监听器
          listeners.open.forEach(callback => callback(event))
          
          resolve()
        }

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            console.log('WebSocket message received:', data)
            
            // 处理心跳响应
            if (data.type === 'heartbeat') {
              lastHeartbeat.value = new Date()
              return
            }
            
            // 触发message事件监听器
            listeners.message.forEach(callback => callback(data))
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error)
          }
        }

        ws.onclose = (event) => {
          console.log('WebSocket disconnected:', event.code, event.reason)
          isConnected.value = false
          isConnecting.value = false
          
          // 停止心跳
          stopHeartbeat()
          
          // 触发close事件监听器
          listeners.close.forEach(callback => callback(event))
          
          // 自动重连（非正常关闭）
          if (event.code !== 1000 && reconnectAttempts < maxReconnectAttempts) {
            scheduleReconnect(url, customerId)
          }
        }

        ws.onerror = (event) => {
          console.error('WebSocket error:', event)
          connectionError.value = 'WebSocket连接错误'
          isConnecting.value = false
          
          // 触发error事件监听器
          listeners.error.forEach(callback => callback(event))
          
          reject(new Error('WebSocket连接失败'))
        }

      } catch (error) {
        console.error('Failed to create WebSocket:', error)
        isConnecting.value = false
        connectionError.value = error.message
        reject(error)
      }
    })
  }

  /**
   * 断开连接
   */
  function disconnect() {
    if (ws) {
      stopHeartbeat()
      clearReconnectTimer()
      ws.close(1000, 'User disconnected')
      ws = null
    }
    isConnected.value = false
    isConnecting.value = false
  }

  /**
   * 发送消息
   */
  function send(data) {
    if (!isConnected.value || !ws) {
      throw new Error('WebSocket未连接')
    }

    try {
      const message = typeof data === 'string' ? data : JSON.stringify(data)
      ws.send(message)
      console.log('WebSocket message sent:', data)
    } catch (error) {
      console.error('Failed to send WebSocket message:', error)
      throw error
    }
  }

  /**
   * 发送聊天消息
   */
  function sendChatMessage(conversationId, content, messageType = 'text', senderName = '') {
    const message = {
      type: 'message',
      conversationId,
      content,
      messageType,
      senderName,
      timestamp: new Date().toISOString()
    }
    send(message)
  }

  /**
   * 发送已读回执
   */
  function sendReadReceipt(messageId) {
    const message = {
      type: 'read',
      messageId,
      timestamp: new Date().toISOString()
    }
    send(message)
  }

  /**
   * 启动心跳
   */
  function startHeartbeat() {
    stopHeartbeat()
    heartbeatTimer = setInterval(() => {
      if (isConnected.value) {
        send({
          type: 'heartbeat',
          timestamp: new Date().toISOString()
        })
      }
    }, heartbeatInterval)
  }

  /**
   * 停止心跳
   */
  function stopHeartbeat() {
    if (heartbeatTimer) {
      clearInterval(heartbeatTimer)
      heartbeatTimer = null
    }
  }

  /**
   * 安排重连
   */
  function scheduleReconnect(url, customerId) {
    clearReconnectTimer()
    reconnectAttempts++
    
    console.log(`Scheduling reconnect attempt ${reconnectAttempts}/${maxReconnectAttempts}`)
    
    reconnectTimer = setTimeout(() => {
      if (reconnectAttempts <= maxReconnectAttempts) {
        connect(url, customerId).catch(error => {
          console.error('Reconnect failed:', error)
        })
      }
    }, reconnectDelay * reconnectAttempts) // 递增延迟
  }

  /**
   * 清除重连定时器
   */
  function clearReconnectTimer() {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer)
      reconnectTimer = null
    }
  }

  /**
   * 添加事件监听器
   */
  function on(event, callback) {
    if (listeners[event]) {
      listeners[event].push(callback)
    }
  }

  /**
   * 移除事件监听器
   */
  function off(event, callback) {
    if (listeners[event]) {
      const index = listeners[event].indexOf(callback)
      if (index > -1) {
        listeners[event].splice(index, 1)
      }
    }
  }

  /**
   * 获取连接状态
   */
  function getConnectionState() {
    return {
      isConnected: isConnected.value,
      isConnecting: isConnecting.value,
      error: connectionError.value,
      reconnectAttempts,
      lastHeartbeat: lastHeartbeat.value
    }
  }

  // 组件卸载时清理
  onUnmounted(() => {
    disconnect()
  })

  return {
    // 状态
    isConnected,
    isConnecting,
    connectionError,
    lastHeartbeat,
    
    // 方法
    connect,
    disconnect,
    send,
    sendChatMessage,
    sendReadReceipt,
    on,
    off,
    getConnectionState
  }
}
