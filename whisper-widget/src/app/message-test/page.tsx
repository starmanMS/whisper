'use client'

import { useState } from 'react'

export default function MessageTestPage() {
  const [testResults, setTestResults] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [sessionData, setSessionData] = useState<any>(null)

  const addResult = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    const timestamp = new Date().toLocaleTimeString()
    const emoji = { info: 'ℹ️', success: '✅', error: '❌' }[type]
    setTestResults(prev => [...prev, `${timestamp} ${emoji} ${message}`])
  }

  const testInitSession = async () => {
    addResult('开始测试会话初始化...')
    
    try {
      const response = await fetch('http://localhost:8080/api/chat/init', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerName: '测试用户',
          email: 'test@example.com'
        })
      })

      const data = await response.json()
      addResult(`会话初始化响应: ${JSON.stringify(data)}`)

      if (data.code === 200 && data.data) {
        setSessionData(data.data)
        addResult('会话初始化成功', 'success')
        addResult(`会话ID: ${data.data.conversationId}`)
        addResult(`客户ID: ${data.data.customerId}`)
        return data.data
      } else {
        addResult('会话初始化失败', 'error')
        return null
      }
    } catch (error) {
      addResult(`会话初始化异常: ${error}`, 'error')
      return null
    }
  }

  const testSendMessage = async (sessionData?: any) => {
    if (!sessionData) {
      addResult('没有会话数据，无法发送消息', 'error')
      return
    }

    addResult('开始测试消息发送...')
    
    const testMessage = {
      conversationId: sessionData.conversationId,
      customerId: sessionData.customerId,
      customerName: sessionData.customerName,
      messageType: 'text',
      content: `测试消息 - ${new Date().toLocaleTimeString()}`
    }

    addResult(`发送消息数据: ${JSON.stringify(testMessage)}`)

    try {
      const response = await fetch('http://localhost:8080/api/chat/sendMessage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testMessage)
      })

      const data = await response.json()
      addResult(`消息发送响应: ${JSON.stringify(data)}`)

      if (data.code === 200) {
        addResult('消息发送成功！', 'success')
        addResult(`消息ID: ${data.data?.messageId}`)
        
        // 测试获取消息历史
        await testGetMessages(sessionData.conversationId)
      } else {
        addResult(`消息发送失败: ${data.msg}`, 'error')
      }
    } catch (error) {
      addResult(`消息发送异常: ${error}`, 'error')
    }
  }

  const testGetMessages = async (conversationId: number) => {
    addResult('开始测试获取消息历史...')
    
    try {
      const response = await fetch(`http://localhost:8080/api/chat/messages/${conversationId}?pageNum=1&pageSize=10`)
      const data = await response.json()
      
      addResult(`消息历史响应: ${JSON.stringify(data)}`)
      
      if (data.code === 200 && data.data?.list) {
        addResult(`获取到 ${data.data.list.length} 条消息`, 'success')
        data.data.list.forEach((msg: any, index: number) => {
          addResult(`消息${index + 1}: ${msg.content} (${msg.sendTime})`)
        })
      } else {
        addResult('获取消息历史失败', 'error')
      }
    } catch (error) {
      addResult(`获取消息历史异常: ${error}`, 'error')
    }
  }

  const testFullFlow = async () => {
    setIsLoading(true)
    setTestResults([])
    
    try {
      // 1. 初始化会话
      const session = await testInitSession()
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      if (session) {
        // 2. 发送消息
        await testSendMessage(session)
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // 3. 再发送一条消息
        await testSendMessage(session)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const testDatabaseQuery = async () => {
    if (!sessionData?.conversationId) {
      addResult('没有会话数据，无法查询数据库', 'error')
      return
    }

    addResult('开始测试数据库查询...')
    
    try {
      const response = await fetch(`http://localhost:8080/api/chat/messages/${sessionData.conversationId}?pageNum=1&pageSize=20`)
      const data = await response.json()
      
      if (data.code === 200) {
        addResult(`数据库中共有 ${data.data?.total || 0} 条消息`, 'success')
        if (data.data?.list && data.data.list.length > 0) {
          addResult('最近的消息:')
          data.data.list.slice(0, 5).forEach((msg: any) => {
            addResult(`- ${msg.senderName}: ${msg.content} (${msg.sendTime})`)
          })
        }
      } else {
        addResult('数据库查询失败', 'error')
      }
    } catch (error) {
      addResult(`数据库查询异常: ${error}`, 'error')
    }
  }

  const clearResults = () => {
    setTestResults([])
    setSessionData(null)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          消息发送功能测试
        </h1>

        {/* 会话信息 */}
        {sessionData && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-800 mb-2">当前会话信息</h3>
            <div className="text-blue-700 text-sm">
              <p>会话ID: {sessionData.conversationId}</p>
              <p>客户ID: {sessionData.customerId}</p>
              <p>客户名: {sessionData.customerName}</p>
            </div>
          </div>
        )}

        {/* 控制按钮 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">测试控制</h2>
          <div className="flex gap-4 flex-wrap">
            <button
              onClick={testFullFlow}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? '测试中...' : '完整流程测试'}
            </button>
            
            <button
              onClick={testInitSession}
              disabled={isLoading}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              初始化会话
            </button>
            
            <button
              onClick={() => testSendMessage(sessionData)}
              disabled={isLoading || !sessionData}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
            >
              发送消息
            </button>
            
            <button
              onClick={testDatabaseQuery}
              disabled={isLoading || !sessionData}
              className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50"
            >
              查询数据库
            </button>
            
            <button
              onClick={clearResults}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              清除结果
            </button>
          </div>
        </div>

        {/* 测试结果 */}
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

        {/* 说明 */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">测试说明</h3>
          <ul className="text-yellow-700 space-y-1 text-sm">
            <li>• 完整流程测试：初始化会话 → 发送消息 → 验证数据库保存</li>
            <li>• 检查消息是否正确保存到 cs_message 表</li>
            <li>• 验证会话关联和消息统计更新</li>
            <li>• 确认API响应格式和错误处理</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
