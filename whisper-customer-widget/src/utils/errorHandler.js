/**
 * 错误类型枚举
 */
export const ErrorType = {
  NETWORK: 'network',
  WEBSOCKET: 'websocket',
  API: 'api',
  VALIDATION: 'validation',
  TIMEOUT: 'timeout',
  PERMISSION: 'permission',
  UNKNOWN: 'unknown'
}

/**
 * 错误级别枚举
 */
export const ErrorLevel = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
}

/**
 * 自定义错误类
 */
export class WhisperError extends Error {
  constructor(message, type = ErrorType.UNKNOWN, level = ErrorLevel.MEDIUM, details = {}) {
    super(message)
    this.name = 'WhisperError'
    this.type = type
    this.level = level
    this.details = details
    this.timestamp = new Date().toISOString()
    this.id = this.generateErrorId()
  }

  generateErrorId() {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      message: this.message,
      type: this.type,
      level: this.level,
      details: this.details,
      timestamp: this.timestamp,
      stack: this.stack
    }
  }
}

/**
 * 统一错误处理器
 */
export class ErrorHandler {
  constructor() {
    this.errorListeners = []
    this.errorHistory = []
    this.maxHistorySize = 100
  }

  /**
   * 处理错误
   */
  handle(error, context = '') {
    let whisperError

    // 转换为WhisperError
    if (error instanceof WhisperError) {
      whisperError = error
    } else {
      whisperError = this.convertToWhisperError(error, context)
    }

    // 记录错误
    this.logError(whisperError, context)

    // 添加到历史记录
    this.addToHistory(whisperError)

    // 通知监听器
    this.notifyListeners(whisperError, context)

    // 根据错误类型和级别决定处理方式
    this.processError(whisperError, context)

    return whisperError
  }

  /**
   * 转换为WhisperError
   */
  convertToWhisperError(error, context) {
    let type = ErrorType.UNKNOWN
    let level = ErrorLevel.MEDIUM
    let message = error.message || '未知错误'

    // 根据错误特征判断类型
    if (error.name === 'NetworkError' || message.includes('fetch')) {
      type = ErrorType.NETWORK
      level = ErrorLevel.HIGH
    } else if (error.name === 'TypeError' && message.includes('WebSocket')) {
      type = ErrorType.WEBSOCKET
      level = ErrorLevel.HIGH
    } else if (message.includes('timeout') || message.includes('超时')) {
      type = ErrorType.TIMEOUT
      level = ErrorLevel.MEDIUM
    } else if (message.includes('validation') || message.includes('验证')) {
      type = ErrorType.VALIDATION
      level = ErrorLevel.LOW
    } else if (message.includes('permission') || message.includes('权限')) {
      type = ErrorType.PERMISSION
      level = ErrorLevel.HIGH
    } else if (message.includes('API') || message.includes('HTTP')) {
      type = ErrorType.API
      level = ErrorLevel.MEDIUM
    }

    return new WhisperError(message, type, level, {
      originalError: error,
      context,
      userAgent: navigator.userAgent,
      url: window.location.href
    })
  }

  /**
   * 记录错误日志
   */
  logError(error, context) {
    const logLevel = this.getLogLevel(error.level)
    const logMessage = `[${error.type.toUpperCase()}] ${error.message}`
    const logDetails = {
      id: error.id,
      context,
      details: error.details,
      timestamp: error.timestamp
    }

    switch (logLevel) {
      case 'error':
        console.error(logMessage, logDetails)
        break
      case 'warn':
        console.warn(logMessage, logDetails)
        break
      case 'info':
        console.info(logMessage, logDetails)
        break
      default:
        console.log(logMessage, logDetails)
    }
  }

  /**
   * 获取日志级别
   */
  getLogLevel(errorLevel) {
    switch (errorLevel) {
      case ErrorLevel.CRITICAL:
      case ErrorLevel.HIGH:
        return 'error'
      case ErrorLevel.MEDIUM:
        return 'warn'
      case ErrorLevel.LOW:
        return 'info'
      default:
        return 'log'
    }
  }

  /**
   * 添加到错误历史
   */
  addToHistory(error) {
    this.errorHistory.unshift(error)
    if (this.errorHistory.length > this.maxHistorySize) {
      this.errorHistory = this.errorHistory.slice(0, this.maxHistorySize)
    }
  }

  /**
   * 通知错误监听器
   */
  notifyListeners(error, context) {
    this.errorListeners.forEach(listener => {
      try {
        listener(error, context)
      } catch (listenerError) {
        console.error('Error in error listener:', listenerError)
      }
    })
  }

  /**
   * 处理错误
   */
  processError(error, context) {
    // 根据错误类型显示用户友好的提示
    switch (error.type) {
      case ErrorType.NETWORK:
        this.showNetworkError(error)
        break
      case ErrorType.WEBSOCKET:
        this.showWebSocketError(error)
        break
      case ErrorType.API:
        this.showApiError(error)
        break
      case ErrorType.VALIDATION:
        this.showValidationError(error)
        break
      case ErrorType.TIMEOUT:
        this.showTimeoutError(error)
        break
      case ErrorType.PERMISSION:
        this.showPermissionError(error)
        break
      default:
        this.showGenericError(error)
    }
  }

  /**
   * 显示网络错误
   */
  showNetworkError(error) {
    this.showUserMessage('网络连接异常，请检查网络设置后重试', 'error')
  }

  /**
   * 显示WebSocket错误
   */
  showWebSocketError(error) {
    this.showUserMessage('实时连接中断，正在尝试重新连接...', 'warning')
  }

  /**
   * 显示API错误
   */
  showApiError(error) {
    this.showUserMessage('服务暂时不可用，请稍后重试', 'error')
  }

  /**
   * 显示验证错误
   */
  showValidationError(error) {
    this.showUserMessage(error.message, 'warning')
  }

  /**
   * 显示超时错误
   */
  showTimeoutError(error) {
    this.showUserMessage('请求超时，请检查网络连接', 'warning')
  }

  /**
   * 显示权限错误
   */
  showPermissionError(error) {
    this.showUserMessage('权限不足，请联系管理员', 'error')
  }

  /**
   * 显示通用错误
   */
  showGenericError(error) {
    this.showUserMessage('操作失败，请稍后重试', 'error')
  }

  /**
   * 显示用户消息
   */
  showUserMessage(message, type = 'info') {
    // 这里可以集成具体的UI提示组件
    console.log(`[${type.toUpperCase()}] ${message}`)
    
    // 可以触发全局事件让UI组件监听
    window.dispatchEvent(new CustomEvent('whisper-error-message', {
      detail: { message, type }
    }))
  }

  /**
   * 添加错误监听器
   */
  addListener(listener) {
    this.errorListeners.push(listener)
  }

  /**
   * 移除错误监听器
   */
  removeListener(listener) {
    const index = this.errorListeners.indexOf(listener)
    if (index > -1) {
      this.errorListeners.splice(index, 1)
    }
  }

  /**
   * 获取错误历史
   */
  getErrorHistory() {
    return [...this.errorHistory]
  }

  /**
   * 清除错误历史
   */
  clearHistory() {
    this.errorHistory = []
  }

  /**
   * 获取错误统计
   */
  getErrorStats() {
    const stats = {}
    this.errorHistory.forEach(error => {
      const key = `${error.type}_${error.level}`
      stats[key] = (stats[key] || 0) + 1
    })
    return stats
  }
}

// 创建全局错误处理器实例
export const globalErrorHandler = new ErrorHandler()

// 全局错误捕获
window.addEventListener('error', (event) => {
  globalErrorHandler.handle(event.error, 'Global Error')
})

window.addEventListener('unhandledrejection', (event) => {
  globalErrorHandler.handle(event.reason, 'Unhandled Promise Rejection')
})

// 导出便捷函数
export const handleError = (error, context) => globalErrorHandler.handle(error, context)
export const createError = (message, type, level, details) => new WhisperError(message, type, level, details)
