'use client'

import { useState, useRef, useEffect } from 'react'

export default function WebSocketTestPage() {
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected')
  const [messages, setMessages] = useState<string[]>([])
  const [connectionAttempts, setConnectionAttempts] = useState(0)
  const [lastError, setLastError] = useState<string>('')
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const addMessage = (message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') => {
    const timestamp = new Date().toLocaleTimeString()
    const emoji = {
      info: 'ℹ️',
      success: '✅',
      error: '❌',
      warning: '⚠️'
    }[type]
    setMessages(prev => [...prev, `${timestamp} ${emoji} ${message}`])
  }

  const testConnection = () => {
    if (wsRef.current) {
      wsRef.current.close()
    }

    setConnectionAttempts(prev => prev + 1)
    const attempt = connectionAttempts + 1
    
    addMessage(`开始第${attempt}次连接测试...`, 'info')
    setConnectionStatus('connecting')
    setLastError('')

    const userId = `test_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
    const wsUrl = `ws://localhost:8080/websocket/chat/customer/${userId}`
    
    addMessage(`连接URL: ${wsUrl}`, 'info')

    try {
      const ws = new WebSocket(wsUrl)
      wsRef.current = ws

      // 连接超时检测
      const connectionTimeout = setTimeout(() => {
        if (ws.readyState === WebSocket.CONNECTING) {
          addMessage('连接超时 (10秒)', 'error')
          ws.close()
          setConnectionStatus('error')
          setLastError('连接超时')
        }
      }, 10000)

      ws.onopen = () => {
        clearTimeout(connectionTimeout)
        addMessage('WebSocket连接成功建立！', 'success')
        setConnectionStatus('connected')
        
        // 发送测试消息
        const testMessage = {
          type: 'system',
          content: 'connection_test',
          timestamp: new Date().toISOString()
        }
        
        try {
          ws.send(JSON.stringify(testMessage))
          addMessage(`发送测试消息: ${JSON.stringify(testMessage)}`, 'info')
        } catch (error) {
          addMessage(`发送消息失败: ${error}`, 'error')
        }
      }

      ws.onmessage = (event) => {
        addMessage(`收到消息: ${event.data}`, 'success')
      }

      ws.onclose = (event) => {
        clearTimeout(connectionTimeout)
        const reason = event.reason || '无原因'
        addMessage(`连接关闭: 代码=${event.code}, 原因=${reason}`, 'warning')
        setConnectionStatus('disconnected')
        
        if (event.code === 1006) {
          setLastError('异常关闭 (1006) - 可能是服务器问题')
          addMessage('检测到1006错误 - 这通常表示服务器端异常关闭连接', 'error')
        }
      }

      ws.onerror = (error) => {
        clearTimeout(connectionTimeout)
        addMessage(`WebSocket错误: ${error}`, 'error')
        addMessage(`readyState: ${ws.readyState} (0=CONNECTING, 1=OPEN, 2=CLOSING, 3=CLOSED)`, 'info')
        setConnectionStatus('error')
        setLastError('连接错误')
      }

    } catch (error) {
      addMessage(`创建WebSocket失败: ${error}`, 'error')
      setConnectionStatus('error')
      setLastError(`创建失败: ${error}`)
    }
  }

  const autoReconnectTest = () => {
    addMessage('开始自动重连测试...', 'info')
    
    const reconnect = () => {
      if (connectionAttempts < 5) {
        testConnection()
        reconnectTimeoutRef.current = setTimeout(reconnect, 3000)
      } else {
        addMessage('自动重连测试完成', 'info')
      }
    }
    
    reconnect()
  }

  const stopTest = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
    
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
    
    setConnectionStatus('disconnected')
    addMessage('测试已停止', 'info')
  }

  const clearMessages = () => {
    setMessages([])
    setConnectionAttempts(0)
    setLastError('')
  }

  const testBackendHealth = async () => {
    addMessage('测试后端健康状态...', 'info')
    
    try {
      const response = await fetch('http://localhost:8080/api/websocket/health')
      if (response.ok) {
        const data = await response.json()
        addMessage(`后端健康检查成功: ${JSON.stringify(data)}`, 'success')
      } else {
        addMessage(`后端健康检查失败: ${response.status}`, 'error')
      }
    } catch (error) {
      addMessage(`后端健康检查异常: ${error}`, 'error')
    }
  }

  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [])

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'text-green-600 bg-green-50 border-green-200'
      case 'connecting': return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'error': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          WebSocket 连接诊断工具
        </h1>

        {/* 状态面板 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className={`p-4 rounded-lg border ${getStatusColor()}`}>
            <h3 className="font-semibold">连接状态</h3>
            <p className="text-lg">{connectionStatus}</p>
          </div>
          
          <div className="p-4 rounded-lg border border-gray-200 bg-white">
            <h3 className="font-semibold text-gray-700">连接尝试</h3>
            <p className="text-lg text-gray-900">{connectionAttempts}</p>
          </div>
          
          <div className="p-4 rounded-lg border border-gray-200 bg-white">
            <h3 className="font-semibold text-gray-700">最后错误</h3>
            <p className="text-sm text-red-600">{lastError || '无'}</p>
          </div>
        </div>

        {/* 控制按钮 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">测试控制</h2>
          <div className="flex gap-4 flex-wrap">
            <button
              onClick={testBackendHealth}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
            >
              检查后端健康
            </button>
            
            <button
              onClick={testConnection}
              disabled={connectionStatus === 'connecting'}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              单次连接测试
            </button>
            
            <button
              onClick={autoReconnectTest}
              disabled={connectionStatus === 'connecting'}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              自动重连测试
            </button>
            
            <button
              onClick={stopTest}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              停止测试
            </button>
            
            <button
              onClick={clearMessages}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              清除日志
            </button>
          </div>
        </div>

        {/* 日志显示 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">测试日志</h2>
          <div className="bg-gray-900 text-green-400 p-4 rounded-md font-mono text-sm max-h-96 overflow-y-auto">
            {messages.length === 0 ? (
              <div className="text-gray-500">点击上方按钮开始测试...</div>
            ) : (
              messages.map((message, index) => (
                <div key={index} className="mb-1">
                  {message}
                </div>
              ))
            )}
          </div>
        </div>

        {/* 诊断建议 */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">诊断建议</h3>
          <ul className="text-yellow-700 space-y-1 text-sm">
            <li>• 如果连接立即失败(1006)，检查后端WebSocket处理器</li>
            <li>• 如果连接超时，检查防火墙和网络设置</li>
            <li>• 如果后端健康检查失败，确保whisper-customer服务运行</li>
            <li>• 观察连接建立到关闭的时间间隔</li>
            <li>• 检查后端日志中的WebSocket相关错误</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
