'use client'

import { useState } from 'react'

export default function TestPage() {
  const [testResults, setTestResults] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const testHealthCheck = async () => {
    try {
      addResult('开始测试健康检查接口...')
      const response = await fetch('http://localhost:8080/api/chat/health')
      const data = await response.json()
      addResult(`健康检查结果: ${JSON.stringify(data)}`)
    } catch (error) {
      addResult(`健康检查失败: ${error}`)
    }
  }

  const testInitChat = async () => {
    try {
      addResult('开始测试初始化聊天接口...')
      const response = await fetch('http://localhost:8080/api/chat/init', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerName: '测试用户',
          email: 'test@example.com',
          phone: '13800138000'
        })
      })
      const data = await response.json()
      addResult(`初始化聊天结果: ${JSON.stringify(data)}`)
      
      // 如果初始化成功，测试发送消息
      if (data.success && data.data?.conversationId) {
        await testSendMessage(data.data.conversationId, data.data.customerId, data.data.customerName)
      }
    } catch (error) {
      addResult(`初始化聊天失败: ${error}`)
    }
  }

  const testSendMessage = async (conversationId: number, customerId: number, customerName: string) => {
    try {
      addResult('开始测试发送消息接口...')
      const response = await fetch('http://localhost:8080/api/chat/sendMessage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId,
          customerId,
          customerName,
          messageType: 'text',
          content: '这是一条测试消息'
        })
      })
      const data = await response.json()
      addResult(`发送消息结果: ${JSON.stringify(data)}`)
      
      // 如果发送成功，测试获取消息历史
      if (data.success) {
        await testGetMessages(conversationId)
      }
    } catch (error) {
      addResult(`发送消息失败: ${error}`)
    }
  }

  const testGetMessages = async (conversationId: number) => {
    try {
      addResult('开始测试获取消息历史接口...')
      const response = await fetch(`http://localhost:8080/api/chat/messages/${conversationId}?pageNum=1&pageSize=10`)
      const data = await response.json()
      addResult(`获取消息历史结果: ${JSON.stringify(data)}`)
    } catch (error) {
      addResult(`获取消息历史失败: ${error}`)
    }
  }

  const testWebSocket = () => {
    try {
      addResult('开始测试WebSocket连接...')
      const ws = new WebSocket('ws://localhost:8080/websocket/chat/customer/test123')
      
      ws.onopen = () => {
        addResult('WebSocket连接成功')
        
        // 发送测试消息
        const testMessage = {
          type: 'message',
          conversationId: 1,
          content: 'WebSocket测试消息',
          messageType: 'text',
          senderName: '测试用户'
        }
        ws.send(JSON.stringify(testMessage))
        addResult(`发送WebSocket消息: ${JSON.stringify(testMessage)}`)
      }
      
      ws.onmessage = (event) => {
        addResult(`收到WebSocket消息: ${event.data}`)
      }
      
      ws.onerror = (error) => {
        addResult(`WebSocket错误: ${error}`)
      }
      
      ws.onclose = () => {
        addResult('WebSocket连接关闭')
      }
      
      // 10秒后关闭连接
      setTimeout(() => {
        ws.close()
      }, 10000)
      
    } catch (error) {
      addResult(`WebSocket测试失败: ${error}`)
    }
  }

  const runAllTests = async () => {
    setIsLoading(true)
    setTestResults([])
    
    await testHealthCheck()
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    await testInitChat()
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    testWebSocket()
    
    setIsLoading(false)
  }

  const clearResults = () => {
    setTestResults([])
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Whisper 客服系统 API 测试页面
        </h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">测试控制</h2>
          <div className="flex gap-4 flex-wrap">
            <button
              onClick={runAllTests}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? '测试中...' : '运行所有测试'}
            </button>
            
            <button
              onClick={testHealthCheck}
              disabled={isLoading}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              健康检查
            </button>
            
            <button
              onClick={testInitChat}
              disabled={isLoading}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
            >
              初始化聊天
            </button>
            
            <button
              onClick={testWebSocket}
              disabled={isLoading}
              className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50"
            >
              WebSocket测试
            </button>
            
            <button
              onClick={clearResults}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              清除结果
            </button>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">测试结果</h2>
          <div className="bg-gray-900 text-green-400 p-4 rounded-md font-mono text-sm max-h-96 overflow-y-auto">
            {testResults.length === 0 ? (
              <div className="text-gray-500">点击上方按钮开始测试...</div>
            ) : (
              testResults.map((result, index) => (
                <div key={index} className="mb-1">
                  {result}
                </div>
              ))
            )}
          </div>
        </div>
        
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">测试说明</h3>
          <ul className="text-yellow-700 space-y-1 text-sm">
            <li>• 确保后端服务已启动在 http://localhost:8080</li>
            <li>• 确保数据库连接正常</li>
            <li>• 测试将验证所有主要API接口的功能</li>
            <li>• WebSocket测试会保持10秒连接</li>
            <li>• 如果测试失败，请检查控制台错误信息</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
