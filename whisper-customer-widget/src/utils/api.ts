import type {
  ApiResponse,
  ChatInitRequest,
  ChatInitResponse,
  SendMessageRequest,
  Message,
  FileUploadResponse,
  PageResponse
} from '@/types'

/**
 * HTTP请求配置接口
 */
interface RequestConfig extends RequestInit {
  timeout?: number
}

/**
 * API客户端类
 */
export class ChatApi {
  private baseUrl: string
  private defaultTimeout: number = 10000

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/+$/, '') // 移除尾部斜杠
  }

  /**
   * 发送HTTP请求
   */
  private async request<T = any>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`
    const timeout = config.timeout || this.defaultTimeout

    // 设置默认配置
    const requestConfig: RequestInit = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...config.headers
      },
      ...config
    }

    // 创建AbortController用于超时控制
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
      console.log(`API Request: ${requestConfig.method} ${url}`, {
        config: requestConfig,
        body: requestConfig.body
      })

      const response = await fetch(url, {
        ...requestConfig,
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data: ApiResponse<T> = await response.json()
      
      console.log(`API Response: ${requestConfig.method} ${url}`, data)

      // 检查业务状态码
      if (data.code !== 200) {
        throw new Error(data.msg || 'API request failed')
      }

      return data
    } catch (error) {
      clearTimeout(timeoutId)
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error(`Request timeout after ${timeout}ms`)
        }
        throw error
      }
      
      throw new Error('Unknown error occurred')
    }
  }

  /**
   * GET请求
   */
  private async get<T = any>(
    endpoint: string,
    params?: Record<string, any>,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    let url = endpoint
    
    if (params) {
      const searchParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value))
        }
      })
      
      if (searchParams.toString()) {
        url += `?${searchParams.toString()}`
      }
    }

    return this.request<T>(url, {
      method: 'GET',
      ...config
    })
  }

  /**
   * POST请求
   */
  private async post<T = any>(
    endpoint: string,
    data?: any,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      ...config
    })
  }

  /**
   * PUT请求
   */
  private async put<T = any>(
    endpoint: string,
    data?: any,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
      ...config
    })
  }

  /**
   * DELETE请求
   */
  private async delete<T = any>(
    endpoint: string,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
      ...config
    })
  }

  // ============================================================================
  // 聊天相关API
  // ============================================================================

  /**
   * 初始化聊天会话
   */
  async initChat(request: ChatInitRequest): Promise<ApiResponse<ChatInitResponse>> {
    return this.post<ChatInitResponse>('/api/chat/init', request)
  }

  /**
   * 发送消息
   */
  async sendMessage(request: SendMessageRequest): Promise<ApiResponse<Message>> {
    return this.post<Message>('/api/chat/sendMessage', request)
  }

  /**
   * 获取消息历史
   */
  async getMessages(
    conversationId: number,
    pageNum: number = 1,
    pageSize: number = 20
  ): Promise<ApiResponse<Message[]>> {
    return this.get<Message[]>(`/api/chat/messages/${conversationId}`, {
      pageNum,
      pageSize
    })
  }

  /**
   * 标记消息已读
   */
  async markMessagesAsRead(conversationId: number): Promise<ApiResponse<void>> {
    return this.post<void>('/api/chat/markRead', {
      conversationId
    })
  }

  /**
   * 结束会话
   */
  async endConversation(conversationId: number): Promise<ApiResponse<void>> {
    return this.post<void>(`/api/chat/endConversation/${conversationId}`)
  }

  /**
   * 设置满意度评价
   */
  async setSatisfaction(
    conversationId: number,
    rating: number,
    feedback?: string
  ): Promise<ApiResponse<void>> {
    return this.post<void>('/api/chat/satisfaction', {
      conversationId,
      rating,
      feedback
    })
  }

  /**
   * 上传文件
   */
  async uploadFile(file: File): Promise<ApiResponse<FileUploadResponse>> {
    const formData = new FormData()
    formData.append('file', file)

    return this.request<FileUploadResponse>('/api/chat/upload', {
      method: 'POST',
      body: formData,
      headers: {
        // 不设置Content-Type，让浏览器自动设置multipart/form-data边界
      }
    })
  }

  /**
   * 获取客服信息
   */
  async getAgentInfo(agentId: number): Promise<ApiResponse<any>> {
    return this.get(`/api/chat/agent/${agentId}`)
  }

  /**
   * 获取会话信息
   */
  async getConversationInfo(conversationId: number): Promise<ApiResponse<any>> {
    return this.get(`/api/chat/conversation/${conversationId}`)
  }

  /**
   * 检查服务状态
   */
  async checkHealth(): Promise<ApiResponse<{ status: string; timestamp: string }>> {
    return this.get('/api/health')
  }

  /**
   * 销毁API客户端
   */
  destroy(): void {
    // 清理资源，如果有的话
    console.log('ChatApi instance destroyed')
  }
}

// ============================================================================
// 工具函数
// ============================================================================

/**
 * 工具函数集合
 */
export const utils = {
  /**
   * 生成唯一ID
   */
  generateId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  },

  /**
   * 格式化文件大小
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  },

  /**
   * 格式化时间
   */
  formatTime(dateString: string): string {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    
    // 小于1分钟
    if (diff < 60000) {
      return '刚刚'
    }
    
    // 小于1小时
    if (diff < 3600000) {
      return `${Math.floor(diff / 60000)}分钟前`
    }
    
    // 小于24小时
    if (diff < 86400000) {
      return `${Math.floor(diff / 3600000)}小时前`
    }
    
    // 小于7天
    if (diff < 604800000) {
      return `${Math.floor(diff / 86400000)}天前`
    }
    
    // 超过7天显示具体日期
    return date.toLocaleDateString()
  },

  /**
   * 验证文件类型
   */
  validateFileType(file: File, allowedTypes: string[]): boolean {
    const fileType = file.type.toLowerCase()
    const fileName = file.name.toLowerCase()
    
    return allowedTypes.some(type => {
      if (type.includes('/')) {
        // MIME类型匹配
        return fileType === type || fileType.startsWith(type.replace('*', ''))
      } else {
        // 文件扩展名匹配
        return fileName.endsWith(`.${type}`)
      }
    })
  },

  /**
   * 验证文件大小
   */
  validateFileSize(file: File, maxSizeMB: number): boolean {
    const maxSizeBytes = maxSizeMB * 1024 * 1024
    return file.size <= maxSizeBytes
  },

  /**
   * 防抖函数
   */
  debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: number | null = null
    
    return (...args: Parameters<T>) => {
      if (timeout) {
        clearTimeout(timeout)
      }
      
      timeout = window.setTimeout(() => {
        func.apply(null, args)
      }, wait)
    }
  },

  /**
   * 节流函数
   */
  throttle<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let lastTime = 0
    
    return (...args: Parameters<T>) => {
      const now = Date.now()
      
      if (now - lastTime >= wait) {
        lastTime = now
        func.apply(null, args)
      }
    }
  },

  /**
   * 深拷贝对象
   */
  deepClone<T>(obj: T): T {
    if (obj === null || typeof obj !== 'object') {
      return obj
    }
    
    if (obj instanceof Date) {
      return new Date(obj.getTime()) as unknown as T
    }
    
    if (obj instanceof Array) {
      return obj.map(item => this.deepClone(item)) as unknown as T
    }
    
    if (typeof obj === 'object') {
      const cloned = {} as T
      Object.keys(obj).forEach(key => {
        (cloned as any)[key] = this.deepClone((obj as any)[key])
      })
      return cloned
    }
    
    return obj
  }
}
