'use client'

import { useState, useCallback } from 'react'

// API响应类型定义
export interface ChatApiResponse {
  code: number
  msg: string
  data?: {
    messageId: number
    conversationId: number
    senderType: string
    senderId: number
    senderName: string
    messageType: string
    content: string
    sendTime: string
    isRead: string
  }
}

// 聊天会话初始化响应
export interface ChatSessionResponse {
  code: number
  msg: string
  data?: {
    customerId: number
    customerNo: string
    customerName: string
    conversationId: number
    sessionId: string
    status: string
    agentId?: number
    ipAddress: string
    ipLocation: string
    welcomeMessage: string
  }
}

// 聊天历史响应
export interface ChatHistoryResponse {
  code: number
  msg: string
  data?: {
    messages: Array<{
      id: string
      content: string
      type: 'user' | 'agent' | 'system'
      timestamp: string
    }>
    hasMore: boolean
    nextCursor?: string
  }
}

// 辅助函数：检查API响应是否成功
function isApiSuccess(response: any): boolean {
  return response && response.code === 200
}

/**
 * 聊天API Hook
 * 提供与后端whisper-customer模块的HTTP API交互功能
 */
export function useChatApi(baseUrl: string = '/api/chat') {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)

  // 通用API请求函数
  const apiRequest = useCallback(async <T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> => {
    const url = `${baseUrl}${endpoint}`
    const defaultHeaders = {
      'Content-Type': 'application/json',
      ...(sessionId && { 'X-Session-Id': sessionId })
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '网络请求失败'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [baseUrl, sessionId])

  // 初始化聊天会话
  const initializeSession = useCallback(async (userInfo?: {
    customerId?: string
    customerName?: string
    email?: string
    phone?: string
    sessionId?: string
  }): Promise<ChatSessionResponse> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await apiRequest<ChatSessionResponse>('/init', {
        method: 'POST',
        body: JSON.stringify({
          customerId: userInfo?.customerId,
          customerName: userInfo?.customerName,
          email: userInfo?.email,
          phone: userInfo?.phone,
          sessionId: userInfo?.sessionId
        })
      })

      if (isApiSuccess(response) && response.data?.sessionId) {
        setSessionId(response.data.sessionId)
      }

      return response
    } catch (err) {
      console.error('初始化会话失败:', err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [apiRequest])

  // 发送消息
  const sendMessage = useCallback(async (
    content: string,
    messageType: 'text' | 'image' | 'file' = 'text',
    conversationId?: number,
    customerId?: number,
    customerName?: string
  ): Promise<ChatApiResponse> => {
    if (!content.trim()) {
      throw new Error('消息内容不能为空')
    }

    if (!conversationId) {
      throw new Error('会话ID不能为空')
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await apiRequest<ChatApiResponse>('/sendMessage', {
        method: 'POST',
        body: JSON.stringify({
          conversationId,
          customerId,
          customerName: customerName || '访客',
          messageType,
          content: content.trim()
        })
      })

      return response
    } catch (err) {
      console.error('发送消息失败:', err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [apiRequest])

  // 获取聊天历史
  const getChatHistory = useCallback(async (
    conversationId: number,
    pageNum: number = 1,
    pageSize: number = 20
  ): Promise<ChatHistoryResponse> => {
    if (!conversationId) {
      throw new Error('会话ID不能为空')
    }

    setIsLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        pageNum: pageNum.toString(),
        pageSize: pageSize.toString()
      })

      const response = await apiRequest<ChatHistoryResponse>(`/messages/${conversationId}?${params}`)
      return response
    } catch (err) {
      console.error('获取聊天历史失败:', err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [apiRequest])

  // 结束会话
  const endSession = useCallback(async (): Promise<{ success: boolean }> => {
    if (!sessionId) {
      return { success: true }
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await apiRequest<{ success: boolean }>('/end', {
        method: 'POST',
        body: JSON.stringify({
          sessionId,
          timestamp: new Date().toISOString()
        })
      })

      if (response.success) {
        setSessionId(null)
      }

      return response
    } catch (err) {
      console.error('结束会话失败:', err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [apiRequest, sessionId])

  // 上传文件
  const uploadFile = useCallback(async (
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<{ success: boolean; fileUrl?: string; fileId?: string }> => {
    if (!sessionId) {
      throw new Error('会话未初始化')
    }

    setIsLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('sessionId', sessionId)

      const xhr = new XMLHttpRequest()
      
      return new Promise((resolve, reject) => {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable && onProgress) {
            const progress = (e.loaded / e.total) * 100
            onProgress(progress)
          }
        })

        xhr.addEventListener('load', () => {
          if (xhr.status === 200) {
            try {
              const response = JSON.parse(xhr.responseText)
              resolve(response)
            } catch (err) {
              reject(new Error('响应解析失败'))
            }
          } else {
            reject(new Error(`上传失败: ${xhr.statusText}`))
          }
        })

        xhr.addEventListener('error', () => {
          reject(new Error('网络错误'))
        })

        xhr.open('POST', `${baseUrl}/upload`)
        xhr.setRequestHeader('X-Session-Id', sessionId)
        xhr.send(formData)
      })
    } catch (err) {
      console.error('文件上传失败:', err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [baseUrl, sessionId])

  // 获取客服状态
  const getAgentStatus = useCallback(async (): Promise<{
    online: boolean
    queuePosition?: number
    estimatedWaitTime?: number
  }> => {
    try {
      const response = await apiRequest<{
        success: boolean
        data: {
          online: boolean
          queuePosition?: number
          estimatedWaitTime?: number
        }
      }>('/agent-status')

      return response.data
    } catch (err) {
      console.error('获取客服状态失败:', err)
      return { online: false }
    }
  }, [apiRequest])

  // 清除错误
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    // 状态
    isLoading,
    error,
    sessionId,
    
    // 方法
    initializeSession,
    sendMessage,
    getChatHistory,
    endSession,
    uploadFile,
    getAgentStatus,
    clearError
  }
}
