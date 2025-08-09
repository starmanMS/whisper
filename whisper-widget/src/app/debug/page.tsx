'use client'

import { useState, useRef, useEffect } from 'react'

export default function WebSocketDebugPage() {
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected')
  const [messages, setMessages] = useState<string[]>([])
  const [wsUrl, setWsUrl] = useState('ws://localhost:8080/websocket/chat/customer/guest')
  const [testMessage, setTestMessage] = useState('{"type":"system","content":"test","timestamp":"' + new Date().toISOString() + '"}')
  const wsRef = useRef<WebSocket | null>(null)

  const addMessage = (message: string) => {
    setMessages(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const testDirectConnection = () => {
    addMessage('开始测试直接WebSocket连接...')
    setConnectionStatus('connecting')

    try {
      const ws = new WebSocket(wsUrl)
      wsRef.current = ws

      ws.onopen = () => {
        addMessage('✅ WebSocket连接成功建立')
        setConnectionStatus('connected')
      }

      ws.onmessage = (event) => {
        addMessage(`📨 收到消息: ${event.data}`)
      }

      ws.onclose = (event) => {
        addMessage(`❌ 连接关闭: 代码=${event.code}, 原因=${event.reason || '无'}`)
        setConnectionStatus('disconnected')
      }

      ws.onerror = (error) => {
        addMessage(`🚨 WebSocket错误: ${error}`)
        setConnectionStatus('error')
      }

    } catch (error) {
      addMessage(`🚨 创建WebSocket失败: ${error}`)
      setConnectionStatus('error')
    }
  }

  const sendTestMessage = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send(testMessage)
        addMessage(`📤 发送消息: ${testMessage}`)
      } catch (error) {
        addMessage(`🚨 发送消息失败: ${error}`)
      }
    } else {
      addMessage('❌ WebSocket未连接，无法发送消息')
    }
  }

  const disconnect = () => {
    if (wsRef.current) {
      wsRef.current.close(1000, '用户主动断开')
      wsRef.current = null
    }
  }

  const testBackendHealth = async () => {
    addMessage('开始测试后端健康状态...')
    
    try {
      // 测试HTTP API
      const response = await fetch('http://localhost:8080/api/chat/health')
      if (response.ok) {
        const data = await response.json()
        addMessage(`✅ HTTP API正常: ${JSON.stringify(data)}`)
      } else {
        addMessage(`❌ HTTP API异常: ${response.status} ${response.statusText}`)
      }
    } catch (error) {
      addMessage(`🚨 HTTP API测试失败: ${error}`)
    }

    // 测试WebSocket端点可达性
    try {
      const testWs = new WebSocket('ws://localhost:8080/websocket/chat/test/debug')
      
      const timeout = setTimeout(() => {
        testWs.close()
        addMessage('❌ WebSocket端点测试超时')
      }, 5000)

      testWs.onopen = () => {
        clearTimeout(timeout)
        addMessage('✅ WebSocket端点可达')
        testWs.close()
      }

      testWs.onerror = () => {
        clearTimeout(timeout)
        addMessage('❌ WebSocket端点不可达')
      }

    } catch (error) {
      addMessage(`🚨 WebSocket端点测试失败: ${error}`)
    }
  }

  const clearMessages = () => {
    setMessages([])
  }

  useEffect(() => {
    return () => {
      disconnect()
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
          WebSocket 连接调试工具
        </h1>

        {/* 连接状态 */}
        <div className={`mb-6 p-4 rounded-lg border ${getStatusColor()}`}>
          <h2 className="font-semibold mb-2">连接状态</h2>
          <p>当前状态: <span className="font-mono">{connectionStatus}</span></p>
        </div>

        {/* 配置区域 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">连接配置</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              WebSocket URL:
            </label>
            <input
              type="text"
              value={wsUrl}
              onChange={(e) => setWsUrl(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="ws://localhost:8080/websocket/chat/customer/guest"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              测试消息:
            </label>
            <textarea
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>

          <div className="flex gap-4 flex-wrap">
            <button
              onClick={testBackendHealth}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
            >
              测试后端健康
            </button>
            
            <button
              onClick={testDirectConnection}
              disabled={connectionStatus === 'connecting'}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {connectionStatus === 'connecting' ? '连接中...' : '连接WebSocket'}
            </button>
            
            <button
              onClick={sendTestMessage}
              disabled={connectionStatus !== 'connected'}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              发送测试消息
            </button>
            
            <button
              onClick={disconnect}
              disabled={connectionStatus === 'disconnected'}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              断开连接
            </button>
            
            <button
              onClick={clearMessages}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              清除日志
            </button>
          </div>
        </div>

        {/* 日志区域 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">调试日志</h2>
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

        {/* 诊断信息 */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">诊断检查清单</h3>
          <ul className="text-yellow-700 space-y-1 text-sm">
            <li>✓ 确保后端服务运行在 http://localhost:8080</li>
            <li>✓ 确保WebSocket端点 /websocket/chat/&#123;userType&#125;/&#123;userId&#125; 已注册</li>
            <li>✓ 检查防火墙是否阻止WebSocket连接</li>
            <li>✓ 验证浏览器是否支持WebSocket</li>
            <li>✓ 检查网络代理设置</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
