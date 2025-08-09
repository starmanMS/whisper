'use client'

import { useState } from 'react'

export default function GuestNameTestPage() {
  const [testResults, setTestResults] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [generatedNames, setGeneratedNames] = useState<{
    smart: string[]
    simple: string[]
    personalized: string[]
  }>({ smart: [], simple: [], personalized: [] })

  const addResult = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    const timestamp = new Date().toLocaleTimeString()
    const emoji = { info: 'ℹ️', success: '✅', error: '❌' }[type]
    setTestResults(prev => [...prev, `${timestamp} ${emoji} ${message}`])
  }

  const testSingleGeneration = async (type: 'smart' | 'simple' | 'personalized') => {
    addResult(`测试${type}类型访客名称生成...`)
    
    try {
      const response = await fetch(`http://localhost:8080/api/chat/generateGuestName?type=${type}`)
      const data = await response.json()
      
      if (data.code === 200 && data.data?.guestName) {
        addResult(`${type}类型生成成功: ${data.data.guestName}`, 'success')
        return data.data.guestName
      } else {
        addResult(`${type}类型生成失败: ${data.msg}`, 'error')
        return null
      }
    } catch (error) {
      addResult(`${type}类型生成异常: ${error}`, 'error')
      return null
    }
  }

  const testBatchGeneration = async (count: number = 10) => {
    addResult(`测试批量生成${count}个访客名称...`)
    
    try {
      const response = await fetch(`http://localhost:8080/api/chat/generateGuestNames?count=${count}`)
      const data = await response.json()
      
      if (data.code === 200 && data.data) {
        addResult(`批量生成成功，共${count}个名称`, 'success')
        setGeneratedNames({
          smart: data.data.smart || [],
          simple: data.data.simple || [],
          personalized: data.data.personalized || []
        })
        
        // 显示生成的名称样例
        addResult(`智能名称样例: ${data.data.smart?.slice(0, 3).join(', ')}`)
        addResult(`简化名称样例: ${data.data.simple?.slice(0, 3).join(', ')}`)
        addResult(`个性化名称样例: ${data.data.personalized?.slice(0, 3).join(', ')}`)
        
        return data.data
      } else {
        addResult(`批量生成失败: ${data.msg}`, 'error')
        return null
      }
    } catch (error) {
      addResult(`批量生成异常: ${error}`, 'error')
      return null
    }
  }

  const testNameUniqueness = () => {
    addResult('分析名称唯一性...')
    
    const allNames = [
      ...generatedNames.smart,
      ...generatedNames.simple,
      ...generatedNames.personalized
    ]
    
    const uniqueNames = new Set(allNames)
    const uniqueRate = (uniqueNames.size / allNames.length * 100).toFixed(1)
    
    addResult(`总名称数: ${allNames.length}`)
    addResult(`唯一名称数: ${uniqueNames.size}`)
    addResult(`唯一率: ${uniqueRate}%`, uniqueRate === '100.0' ? 'success' : 'info')
    
    // 检查重复名称
    const duplicates = allNames.filter((name, index) => allNames.indexOf(name) !== index)
    if (duplicates.length > 0) {
      addResult(`发现重复名称: ${[...new Set(duplicates)].join(', ')}`, 'error')
    } else {
      addResult('未发现重复名称', 'success')
    }
  }

  const testNameFormat = () => {
    addResult('分析名称格式...')
    
    const formatTests = [
      {
        type: 'smart',
        names: generatedNames.smart,
        pattern: /^访客\d{4}[A-Z]\d$/,
        description: '访客+时间(4位)+字母+数字'
      },
      {
        type: 'simple',
        names: generatedNames.simple,
        pattern: /^访客\d{4}_\d{2}$/,
        description: '访客+日期(4位)+下划线+序号(2位)'
      },
      {
        type: 'personalized',
        names: generatedNames.personalized,
        pattern: /^[晨午晚夜]客\d{4}[A-Z0-9]$/,
        description: '时段客+时间(4位)+字符'
      }
    ]
    
    formatTests.forEach(test => {
      const validCount = test.names.filter(name => test.pattern.test(name)).length
      const validRate = (validCount / test.names.length * 100).toFixed(1)
      
      addResult(`${test.type}类型格式验证: ${validCount}/${test.names.length} (${validRate}%)`, 
        validRate === '100.0' ? 'success' : 'error')
      addResult(`  格式规则: ${test.description}`)
      
      // 显示不符合格式的名称
      const invalidNames = test.names.filter(name => !test.pattern.test(name))
      if (invalidNames.length > 0) {
        addResult(`  不符合格式: ${invalidNames.join(', ')}`, 'error')
      }
    })
  }

  const runFullTest = async () => {
    setIsLoading(true)
    setTestResults([])
    setGeneratedNames({ smart: [], simple: [], personalized: [] })
    
    try {
      addResult('开始访客名称生成功能全面测试...')
      
      // 1. 测试单个生成
      await testSingleGeneration('smart')
      await testSingleGeneration('simple')
      await testSingleGeneration('personalized')
      
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // 2. 测试批量生成
      await testBatchGeneration(10)
      
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // 3. 分析唯一性
      testNameUniqueness()
      
      // 4. 分析格式
      testNameFormat()
      
      addResult('测试完成！', 'success')
      
    } finally {
      setIsLoading(false)
    }
  }

  const clearResults = () => {
    setTestResults([])
    setGeneratedNames({ smart: [], simple: [], personalized: [] })
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          智能访客名称生成测试
        </h1>

        {/* 控制面板 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">测试控制</h2>
          <div className="flex gap-4 flex-wrap">
            <button
              onClick={runFullTest}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? '测试中...' : '完整功能测试'}
            </button>
            
            <button
              onClick={() => testSingleGeneration('smart')}
              disabled={isLoading}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              智能名称生成
            </button>
            
            <button
              onClick={() => testSingleGeneration('simple')}
              disabled={isLoading}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
            >
              简化名称生成
            </button>
            
            <button
              onClick={() => testSingleGeneration('personalized')}
              disabled={isLoading}
              className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50"
            >
              个性化名称生成
            </button>
            
            <button
              onClick={() => testBatchGeneration(15)}
              disabled={isLoading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              批量生成测试
            </button>
            
            <button
              onClick={clearResults}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              清除结果
            </button>
          </div>
        </div>

        {/* 生成的名称展示 */}
        {(generatedNames.smart.length > 0 || generatedNames.simple.length > 0 || generatedNames.personalized.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="text-lg font-semibold text-green-600 mb-3">智能名称 ({generatedNames.smart.length})</h3>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {generatedNames.smart.map((name, index) => (
                  <div key={index} className="text-sm bg-green-50 px-2 py-1 rounded">
                    {name}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="text-lg font-semibold text-purple-600 mb-3">简化名称 ({generatedNames.simple.length})</h3>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {generatedNames.simple.map((name, index) => (
                  <div key={index} className="text-sm bg-purple-50 px-2 py-1 rounded">
                    {name}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="text-lg font-semibold text-orange-600 mb-3">个性化名称 ({generatedNames.personalized.length})</h3>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {generatedNames.personalized.map((name, index) => (
                  <div key={index} className="text-sm bg-orange-50 px-2 py-1 rounded">
                    {name}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 测试日志 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">测试日志</h2>
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

        {/* 功能说明 */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">访客名称生成规则</h3>
          <div className="text-blue-700 text-sm space-y-2">
            <div><strong>智能名称:</strong> 访客 + 时间(HHmm) + 随机字母 + 随机数字 (如: 访客1428A3)</div>
            <div><strong>简化名称:</strong> 访客 + 日期(MMdd) + 下划线 + 序号 (如: 访客0809_01)</div>
            <div><strong>个性化名称:</strong> 时段前缀 + 时间(mmss) + 随机字符 (如: 晨客2156C)</div>
            <div className="mt-2">
              <strong>时段前缀规则:</strong> 06-12时=晨客, 12-18时=午客, 18-22时=晚客, 22-06时=夜客
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
