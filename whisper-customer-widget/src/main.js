import { createApp } from 'vue'
import ChatWidget from './components/ChatWidget.vue'
import './style.css'

/**
 * Whisper Chat Widget
 * 智能客服聊天组件
 */
class WhisperChat {
  constructor() {
    this.app = null
    this.container = null
    this.isInitialized = false
    this.config = {
      apiUrl: '',
      websocketUrl: '',
      customerId: '',
      customerName: '',
      theme: 'light',
      position: 'bottom-right'
    }
  }

  /**
   * 初始化聊天Widget
   * @param {Object} options 配置选项
   */
  init(options = {}) {
    try {
      // 验证必需参数
      if (!options.apiUrl) {
        throw new Error('apiUrl is required')
      }
      if (!options.websocketUrl) {
        throw new Error('websocketUrl is required')
      }
      if (!options.customerId) {
        throw new Error('customerId is required')
      }

      // 合并配置
      this.config = {
        ...this.config,
        ...options
      }

      console.log('Initializing Whisper Chat Widget:', this.config)

      // 如果已经初始化，先销毁
      if (this.isInitialized) {
        this.destroy()
      }

      // 创建容器
      this.createContainer()

      // 创建Vue应用
      this.createApp()

      this.isInitialized = true
      console.log('Whisper Chat Widget initialized successfully')

      return this
    } catch (error) {
      console.error('Failed to initialize Whisper Chat Widget:', error)
      throw error
    }
  }

  /**
   * 创建Widget容器
   */
  createContainer() {
    // 检查是否已存在容器
    let existingContainer = document.getElementById('whisper-chat-widget')
    if (existingContainer) {
      existingContainer.remove()
    }

    // 创建新容器
    this.container = document.createElement('div')
    this.container.id = 'whisper-chat-widget'
    this.container.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 2147483647;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
    `

    // 添加到页面
    document.body.appendChild(this.container)
  }

  /**
   * 创建Vue应用
   */
  createApp() {
    this.app = createApp(ChatWidget, {
      config: this.config
    })

    // 挂载应用
    this.app.mount(this.container)
  }

  /**
   * 销毁Widget
   */
  destroy() {
    try {
      if (this.app) {
        this.app.unmount()
        this.app = null
      }

      if (this.container) {
        this.container.remove()
        this.container = null
      }

      this.isInitialized = false
      console.log('Whisper Chat Widget destroyed')
    } catch (error) {
      console.error('Failed to destroy Whisper Chat Widget:', error)
    }
  }

  /**
   * 打开聊天对话框
   */
  open() {
    if (window.whisperChatWidget?.openDialog) {
      window.whisperChatWidget.openDialog()
    }
  }

  /**
   * 关闭聊天对话框
   */
  close() {
    if (window.whisperChatWidget?.closeDialog) {
      window.whisperChatWidget.closeDialog()
    }
  }

  /**
   * 设置主题
   * @param {string} theme 主题名称 (light|dark)
   */
  setTheme(theme) {
    if (['light', 'dark'].includes(theme)) {
      this.config.theme = theme
      if (window.whisperChatWidget?.setTheme) {
        window.whisperChatWidget.setTheme(theme)
      }
    }
  }

  /**
   * 设置位置
   * @param {string} position 位置 (bottom-right|bottom-left)
   */
  setPosition(position) {
    if (['bottom-right', 'bottom-left'].includes(position)) {
      this.config.position = position
      if (window.whisperChatWidget?.setPosition) {
        window.whisperChatWidget.setPosition(position)
      }
    }
  }

  /**
   * 获取Widget状态
   */
  getState() {
    if (window.whisperChatWidget?.getState) {
      return window.whisperChatWidget.getState()
    }
    return {
      isInitialized: this.isInitialized,
      config: this.config
    }
  }

  /**
   * 更新配置
   * @param {Object} newConfig 新配置
   */
  updateConfig(newConfig) {
    this.config = {
      ...this.config,
      ...newConfig
    }

    // 如果已初始化，重新初始化
    if (this.isInitialized) {
      this.init(this.config)
    }
  }

  /**
   * 检查浏览器兼容性
   */
  static checkCompatibility() {
    const requirements = {
      WebSocket: typeof WebSocket !== 'undefined',
      Promise: typeof Promise !== 'undefined',
      fetch: typeof fetch !== 'undefined',
      localStorage: typeof localStorage !== 'undefined'
    }

    const incompatible = Object.entries(requirements)
      .filter(([, supported]) => !supported)
      .map(([feature]) => feature)

    if (incompatible.length > 0) {
      console.warn('Whisper Chat Widget: Browser compatibility issues detected:', incompatible)
      return false
    }

    return true
  }

  /**
   * 获取版本信息
   */
  static getVersion() {
    return '1.0.0'
  }
}

// 创建全局实例
const whisperChat = new WhisperChat()

// 暴露到全局
if (typeof window !== 'undefined') {
  window.WhisperChat = whisperChat
  
  // 兼容性检查
  if (!WhisperChat.checkCompatibility()) {
    console.error('Whisper Chat Widget: Browser not supported')
  }

  // 自动初始化（如果页面中有配置）
  document.addEventListener('DOMContentLoaded', () => {
    const configScript = document.querySelector('script[data-whisper-config]')
    if (configScript) {
      try {
        const config = JSON.parse(configScript.getAttribute('data-whisper-config'))
        whisperChat.init(config)
      } catch (error) {
        console.error('Failed to parse Whisper Chat Widget config:', error)
      }
    }
  })

  // 开发模式下的调试信息
  if (process.env.NODE_ENV === 'development') {
    console.log('Whisper Chat Widget loaded in development mode')
    console.log('Version:', WhisperChat.getVersion())
    console.log('Usage: WhisperChat.init({ apiUrl: "...", websocketUrl: "...", customerId: "..." })')
  }
}

// 导出类（用于模块化使用）
export default WhisperChat

// 导出实例（用于直接使用）
export { whisperChat }
