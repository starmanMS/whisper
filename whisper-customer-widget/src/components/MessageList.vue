<template>
  <div class="whisper-chat-messages" ref="messagesContainer">
    <!-- 加载更多指示器 -->
    <div 
      v-if="isLoading" 
      class="whisper-chat-loading"
    >
      <div class="whisper-chat-spinner"></div>
      <span>加载历史消息...</span>
    </div>

    <!-- 消息列表 -->
    <div class="whisper-chat-messages-list">
      <!-- 欢迎消息 -->
      <div 
        v-if="messages.length === 0 && !isLoading" 
        class="whisper-chat-welcome"
      >
        <div class="whisper-chat-welcome-avatar">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
        </div>
        <div class="whisper-chat-welcome-content">
          <div class="whisper-chat-welcome-title">欢迎使用在线客服</div>
          <div class="whisper-chat-welcome-subtitle">我们将尽快为您提供帮助</div>
        </div>
      </div>

      <!-- 消息项 -->
      <div
        v-for="(message, index) in messages"
        :key="message.id"
        :class="getMessageClasses(message, index)"
      >
        <!-- 时间分隔线 -->
        <div 
          v-if="shouldShowTimeDivider(message, index)"
          class="whisper-chat-time-divider"
        >
          {{ formatMessageTime(message.timestamp) }}
        </div>

        <!-- 消息内容 -->
        <div class="whisper-chat-message-wrapper">
          <!-- 头像（仅客服消息显示） -->
          <div 
            v-if="message.sender === 'agent'" 
            class="whisper-chat-message-avatar"
          >
            <img 
              v-if="message.senderAvatar" 
              :src="message.senderAvatar" 
              :alt="message.senderName"
              class="whisper-chat-avatar-image"
            >
            <div v-else class="whisper-chat-avatar-placeholder">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </div>
          </div>

          <!-- 消息气泡 -->
          <div class="whisper-chat-message-bubble">
            <!-- 发送者名称（仅客服消息显示） -->
            <div 
              v-if="message.sender === 'agent' && message.senderName" 
              class="whisper-chat-sender-name"
            >
              {{ message.senderName }}
            </div>

            <!-- 消息内容 -->
            <div class="whisper-chat-message-content">
              <!-- 文本消息 -->
              <div 
                v-if="message.type === 'text'" 
                class="whisper-chat-text-content"
                v-html="formatTextContent(message.content)"
              ></div>

              <!-- 图片消息 -->
              <div 
                v-else-if="message.type === 'image'" 
                class="whisper-chat-image-content"
                @click="previewImage(message.content)"
              >
                <img 
                  :src="message.content" 
                  :alt="'图片消息'"
                  class="whisper-chat-image"
                  @load="scrollToBottom"
                >
                <div class="whisper-chat-image-overlay">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                  </svg>
                </div>
              </div>

              <!-- 文件消息 -->
              <div 
                v-else-if="message.type === 'file'" 
                class="whisper-chat-file-content"
                @click="downloadFile(message.content, message.fileName)"
              >
                <div class="whisper-chat-file-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                  </svg>
                </div>
                <div class="whisper-chat-file-info">
                  <div class="whisper-chat-file-name">{{ message.fileName }}</div>
                  <div class="whisper-chat-file-size">{{ formatFileSize(message.fileSize) }}</div>
                </div>
                <div class="whisper-chat-file-download">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z"/>
                  </svg>
                </div>
              </div>

              <!-- 系统消息 -->
              <div 
                v-else-if="message.type === 'system'" 
                class="whisper-chat-system-content"
              >
                {{ message.content }}
              </div>
            </div>

            <!-- 消息元信息 -->
            <div class="whisper-chat-message-meta">
              <span class="whisper-chat-message-time">
                {{ formatTime(message.timestamp) }}
              </span>
              
              <!-- 消息状态（仅用户消息显示） -->
              <div 
                v-if="message.sender === 'customer'" 
                class="whisper-chat-message-status"
              >
                <div 
                  v-if="message.status === 'sending'" 
                  class="whisper-chat-status-sending"
                >
                  <div class="whisper-chat-spinner-small"></div>
                </div>
                <div 
                  v-else-if="message.status === 'sent'" 
                  class="whisper-chat-status-sent"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z"/>
                  </svg>
                </div>
                <div 
                  v-else-if="message.status === 'delivered'" 
                  class="whisper-chat-status-delivered"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18,7L16.59,5.59L10.25,11.93L11.66,13.34L18,7M22.24,5.59L11.66,16.17L7.48,12L6.07,13.41L11.66,19L23.66,7L22.24,5.59Z"/>
                  </svg>
                </div>
                <div 
                  v-else-if="message.status === 'read'" 
                  class="whisper-chat-status-read"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18,7L16.59,5.59L10.25,11.93L11.66,13.34L18,7M22.24,5.59L11.66,16.17L7.48,12L6.07,13.41L11.66,19L23.66,7L22.24,5.59Z"/>
                  </svg>
                </div>
                <div 
                  v-else-if="message.status === 'failed'" 
                  class="whisper-chat-status-failed"
                  @click="$emit('message-action', { action: 'retry', message })"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12,2C17.5,2 22,6.5 22,12C22,17.5 17.5,22 12,22C6.5,22 2,17.5 2,12C2,6.5 6.5,2 12,2M12,4C7.58,4 4,7.58 4,12C4,16.42 7.58,20 12,20C16.42,20 20,16.42 20,12C20,7.58 16.42,4 12,4M13,17H11V15H13V17M13,13H11V7H13V13Z"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 正在输入指示器 -->
    <div 
      v-if="isTyping" 
      class="whisper-chat-typing"
    >
      <div class="whisper-chat-typing-avatar">
        <div class="whisper-chat-avatar-placeholder">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
        </div>
      </div>
      <div class="whisper-chat-typing-bubble">
        <div class="whisper-chat-typing-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, nextTick, onMounted, onUpdated, watch } from 'vue'

export default {
  name: 'MessageList',
  props: {
    messages: {
      type: Array,
      default: () => []
    },
    isLoading: {
      type: Boolean,
      default: false
    },
    isTyping: {
      type: Boolean,
      default: false
    },
    theme: {
      type: String,
      default: 'light',
      validator: (value) => ['light', 'dark'].includes(value)
    }
  },
  emits: ['load-more', 'message-action'],
  setup(props, { emit }) {
    const messagesContainer = ref(null)

    // 方法
    const getMessageClasses = (message, index) => [
      'whisper-chat-message',
      `whisper-chat-message--${message.sender}`,
      `whisper-chat-message--${message.type}`,
      {
        'whisper-chat-message--temp': message.status === 'sending',
        'whisper-chat-message--failed': message.status === 'failed',
        'whisper-chat-message--consecutive': isConsecutiveMessage(message, index)
      }
    ]

    const isConsecutiveMessage = (message, index) => {
      if (index === 0) return false
      const prevMessage = props.messages[index - 1]
      return prevMessage.sender === message.sender && 
             (message.timestamp - prevMessage.timestamp) < 60000 // 1分钟内
    }

    const shouldShowTimeDivider = (message, index) => {
      if (index === 0) return true
      const prevMessage = props.messages[index - 1]
      const timeDiff = message.timestamp - prevMessage.timestamp
      return timeDiff > 300000 // 5分钟
    }

    const formatMessageTime = (timestamp) => {
      const date = new Date(timestamp)
      const now = new Date()
      const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24))
      
      if (diffDays === 0) {
        return '今天'
      } else if (diffDays === 1) {
        return '昨天'
      } else if (diffDays < 7) {
        return `${diffDays}天前`
      } else {
        return date.toLocaleDateString()
      }
    }

    const formatTime = (timestamp) => {
      return new Date(timestamp).toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    const formatTextContent = (content) => {
      // 简单的链接检测和转换
      return content.replace(
        /(https?:\/\/[^\s]+)/g,
        '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
      )
    }

    const formatFileSize = (bytes) => {
      if (bytes === 0) return '0 B'
      const k = 1024
      const sizes = ['B', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    const scrollToBottom = () => {
      nextTick(() => {
        if (messagesContainer.value) {
          messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
        }
      })
    }

    const previewImage = (imageUrl) => {
      // 创建图片预览模态框
      const modal = document.createElement('div')
      modal.className = 'whisper-image-preview-modal'
      modal.innerHTML = `
        <div class="whisper-image-preview-backdrop">
          <img src="${imageUrl}" class="whisper-image-preview" alt="图片预览">
          <button class="whisper-image-preview-close">×</button>
        </div>
      `
      
      document.body.appendChild(modal)
      
      // 点击关闭
      modal.addEventListener('click', () => {
        document.body.removeChild(modal)
      })
    }

    const downloadFile = (fileUrl, fileName) => {
      const link = document.createElement('a')
      link.href = fileUrl
      link.download = fileName
      link.click()
    }

    // 监听消息变化，自动滚动到底部
    watch(() => props.messages.length, () => {
      scrollToBottom()
    })

    // 监听正在输入状态
    watch(() => props.isTyping, () => {
      if (props.isTyping) {
        scrollToBottom()
      }
    })

    onMounted(() => {
      scrollToBottom()
    })

    return {
      messagesContainer,
      getMessageClasses,
      shouldShowTimeDivider,
      formatMessageTime,
      formatTime,
      formatTextContent,
      formatFileSize,
      scrollToBottom,
      previewImage,
      downloadFile
    }
  }
}
</script>

<style scoped>
/* 消息容器 */
.whisper-chat-messages {
  flex: 1 !important;
  overflow-y: auto !important;
  padding: 16px !important;
  scroll-behavior: smooth !important;
}

/* 自定义滚动条 */
.whisper-chat-messages::-webkit-scrollbar {
  width: 4px !important;
}

.whisper-chat-messages::-webkit-scrollbar-track {
  background: transparent !important;
}

.whisper-chat-messages::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2) !important;
  border-radius: 2px !important;
}

.whisper-chat-messages::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3) !important;
}

/* 加载指示器 */
.whisper-chat-loading {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 8px !important;
  padding: 16px !important;
  color: #6b7280 !important;
  font-size: 14px !important;
}

.whisper-chat-spinner {
  width: 16px !important;
  height: 16px !important;
  border: 2px solid #e5e7eb !important;
  border-top-color: #3b82f6 !important;
  border-radius: 50% !important;
  animation: spin 1s linear infinite !important;
}

/* 消息列表 */
.whisper-chat-messages-list {
  display: flex !important;
  flex-direction: column !important;
  gap: 16px !important;
}

/* 欢迎消息 */
.whisper-chat-welcome {
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  text-align: center !important;
  padding: 32px 16px !important;
  color: #6b7280 !important;
}

.whisper-chat-welcome-avatar {
  width: 64px !important;
  height: 64px !important;
  background: #f3f4f6 !important;
  border-radius: 50% !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  margin-bottom: 16px !important;
  color: #9ca3af !important;
}

.whisper-chat-welcome-title {
  font-size: 18px !important;
  font-weight: 600 !important;
  color: #374151 !important;
  margin-bottom: 8px !important;
}

.whisper-chat-welcome-subtitle {
  font-size: 14px !important;
  color: #6b7280 !important;
}

/* 时间分隔线 */
.whisper-chat-time-divider {
  text-align: center !important;
  font-size: 12px !important;
  color: #9ca3af !important;
  margin: 16px 0 !important;
  position: relative !important;
}

.whisper-chat-time-divider::before {
  content: '' !important;
  position: absolute !important;
  top: 50% !important;
  left: 0 !important;
  right: 0 !important;
  height: 1px !important;
  background: #e5e7eb !important;
  z-index: 0 !important;
}

.whisper-chat-time-divider span {
  background: #f9fafb !important;
  padding: 0 12px !important;
  position: relative !important;
  z-index: 1 !important;
}

/* 消息项 */
.whisper-chat-message {
  display: flex !important;
  flex-direction: column !important;
}

.whisper-chat-message-wrapper {
  display: flex !important;
  gap: 8px !important;
  align-items: flex-end !important;
}

/* 消息对齐 */
.whisper-chat-message--customer .whisper-chat-message-wrapper {
  justify-content: flex-end !important;
}

.whisper-chat-message--agent .whisper-chat-message-wrapper {
  justify-content: flex-start !important;
}

.whisper-chat-message--system {
  align-items: center !important;
}

/* 消息头像 */
.whisper-chat-message-avatar {
  width: 32px !important;
  height: 32px !important;
  border-radius: 50% !important;
  background: #f3f4f6 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  overflow: hidden !important;
  flex-shrink: 0 !important;
}

.whisper-chat-avatar-image {
  width: 100% !important;
  height: 100% !important;
  object-fit: cover !important;
}

.whisper-chat-avatar-placeholder {
  color: #9ca3af !important;
}

/* 连续消息隐藏头像 */
.whisper-chat-message--consecutive .whisper-chat-message-avatar {
  visibility: hidden !important;
}

/* 消息气泡 */
.whisper-chat-message-bubble {
  max-width: 280px !important;
  border-radius: 16px !important;
  padding: 12px 16px !important;
  position: relative !important;
  word-wrap: break-word !important;
  overflow-wrap: break-word !important;
}

/* 用户消息气泡 */
.whisper-chat-message--customer .whisper-chat-message-bubble {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%) !important;
  color: white !important;
  border-bottom-right-radius: 4px !important;
}

/* 客服消息气泡 */
.whisper-chat-message--agent .whisper-chat-message-bubble {
  background: white !important;
  color: #374151 !important;
  border: 1px solid #e5e7eb !important;
  border-bottom-left-radius: 4px !important;
}

/* 系统消息气泡 */
.whisper-chat-message--system .whisper-chat-message-bubble {
  background: #fef3c7 !important;
  color: #92400e !important;
  border: 1px solid #fde68a !important;
  text-align: center !important;
  font-size: 13px !important;
  max-width: 200px !important;
  margin: 0 auto !important;
}

/* 发送者名称 */
.whisper-chat-sender-name {
  font-size: 12px !important;
  font-weight: 600 !important;
  color: #6b7280 !important;
  margin-bottom: 4px !important;
}

/* 消息内容 */
.whisper-chat-message-content {
  margin-bottom: 4px !important;
}

.whisper-chat-text-content {
  line-height: 1.5 !important;
  font-size: 14px !important;
}

.whisper-chat-text-content a {
  color: inherit !important;
  text-decoration: underline !important;
}

/* 图片消息 */
.whisper-chat-image-content {
  position: relative !important;
  cursor: pointer !important;
  border-radius: 12px !important;
  overflow: hidden !important;
  max-width: 200px !important;
}

.whisper-chat-image {
  width: 100% !important;
  height: auto !important;
  display: block !important;
  border-radius: 12px !important;
}

.whisper-chat-image-overlay {
  position: absolute !important;
  top: 8px !important;
  right: 8px !important;
  width: 32px !important;
  height: 32px !important;
  background: rgba(0, 0, 0, 0.5) !important;
  border-radius: 50% !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  color: white !important;
  opacity: 0 !important;
  transition: opacity 0.2s ease !important;
}

.whisper-chat-image-content:hover .whisper-chat-image-overlay {
  opacity: 1 !important;
}

/* 文件消息 */
.whisper-chat-file-content {
  display: flex !important;
  align-items: center !important;
  gap: 12px !important;
  padding: 12px !important;
  background: #f9fafb !important;
  border-radius: 12px !important;
  cursor: pointer !important;
  transition: background-color 0.2s ease !important;
  min-width: 200px !important;
}

.whisper-chat-file-content:hover {
  background: #f3f4f6 !important;
}

.whisper-chat-message--customer .whisper-chat-file-content {
  background: rgba(255, 255, 255, 0.2) !important;
  color: white !important;
}

.whisper-chat-message--customer .whisper-chat-file-content:hover {
  background: rgba(255, 255, 255, 0.3) !important;
}

.whisper-chat-file-icon {
  width: 40px !important;
  height: 40px !important;
  background: #e5e7eb !important;
  border-radius: 8px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  color: #6b7280 !important;
  flex-shrink: 0 !important;
}

.whisper-chat-message--customer .whisper-chat-file-icon {
  background: rgba(255, 255, 255, 0.2) !important;
  color: white !important;
}

.whisper-chat-file-info {
  flex: 1 !important;
  min-width: 0 !important;
}

.whisper-chat-file-name {
  font-weight: 500 !important;
  font-size: 14px !important;
  margin-bottom: 2px !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  white-space: nowrap !important;
}

.whisper-chat-file-size {
  font-size: 12px !important;
  color: #6b7280 !important;
}

.whisper-chat-message--customer .whisper-chat-file-size {
  color: rgba(255, 255, 255, 0.8) !important;
}

.whisper-chat-file-download {
  color: #6b7280 !important;
}

.whisper-chat-message--customer .whisper-chat-file-download {
  color: white !important;
}

/* 消息元信息 */
.whisper-chat-message-meta {
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  font-size: 11px !important;
  margin-top: 4px !important;
}

.whisper-chat-message-time {
  opacity: 0.7 !important;
}

.whisper-chat-message-status {
  display: flex !important;
  align-items: center !important;
  gap: 4px !important;
}

/* 消息状态图标 */
.whisper-chat-status-sending .whisper-chat-spinner-small {
  width: 12px !important;
  height: 12px !important;
  border: 1px solid rgba(255, 255, 255, 0.5) !important;
  border-top-color: white !important;
  border-radius: 50% !important;
  animation: spin 1s linear infinite !important;
}

.whisper-chat-status-sent,
.whisper-chat-status-delivered {
  color: rgba(255, 255, 255, 0.7) !important;
}

.whisper-chat-status-read {
  color: #10b981 !important;
}

.whisper-chat-status-failed {
  color: #ef4444 !important;
  cursor: pointer !important;
  transition: transform 0.2s ease !important;
}

.whisper-chat-status-failed:hover {
  transform: scale(1.1) !important;
}

/* 正在输入指示器 */
.whisper-chat-typing {
  display: flex !important;
  gap: 8px !important;
  align-items: flex-end !important;
  margin-top: 8px !important;
}

.whisper-chat-typing-avatar {
  width: 32px !important;
  height: 32px !important;
  border-radius: 50% !important;
  background: #f3f4f6 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  color: #9ca3af !important;
  flex-shrink: 0 !important;
}

.whisper-chat-typing-bubble {
  background: white !important;
  border: 1px solid #e5e7eb !important;
  border-radius: 16px !important;
  border-bottom-left-radius: 4px !important;
  padding: 12px 16px !important;
}

.whisper-chat-typing-dots {
  display: flex !important;
  gap: 4px !important;
}

.whisper-chat-typing-dots span {
  width: 6px !important;
  height: 6px !important;
  background: #9ca3af !important;
  border-radius: 50% !important;
  animation: typing-dot 1.4s infinite ease-in-out !important;
}

.whisper-chat-typing-dots span:nth-child(1) {
  animation-delay: -0.32s !important;
}

.whisper-chat-typing-dots span:nth-child(2) {
  animation-delay: -0.16s !important;
}

/* 临时和失败消息样式 */
.whisper-chat-message--temp {
  opacity: 0.7 !important;
}

.whisper-chat-message--failed {
  opacity: 0.5 !important;
}

.whisper-chat-message--failed .whisper-chat-message-bubble {
  border-color: #fca5a5 !important;
}

/* 图片预览模态框 */
:global(.whisper-image-preview-modal) {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  z-index: 10000 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  background: rgba(0, 0, 0, 0.8) !important;
}

:global(.whisper-image-preview-backdrop) {
  position: relative !important;
  max-width: 90vw !important;
  max-height: 90vh !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

:global(.whisper-image-preview) {
  max-width: 100% !important;
  max-height: 100% !important;
  object-fit: contain !important;
  border-radius: 8px !important;
}

:global(.whisper-image-preview-close) {
  position: absolute !important;
  top: -40px !important;
  right: 0 !important;
  width: 32px !important;
  height: 32px !important;
  background: rgba(255, 255, 255, 0.2) !important;
  border: none !important;
  border-radius: 50% !important;
  color: white !important;
  font-size: 20px !important;
  cursor: pointer !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  transition: background-color 0.2s ease !important;
}

:global(.whisper-image-preview-close:hover) {
  background: rgba(255, 255, 255, 0.3) !important;
}

/* 暗色主题适配 */
.whisper-chat-messages--dark {
  color: white !important;
}

.whisper-chat-messages--dark .whisper-chat-welcome-title {
  color: white !important;
}

.whisper-chat-messages--dark .whisper-chat-welcome-subtitle {
  color: #d1d5db !important;
}

.whisper-chat-messages--dark .whisper-chat-time-divider {
  color: #9ca3af !important;
}

.whisper-chat-messages--dark .whisper-chat-time-divider::before {
  background: #374151 !important;
}

.whisper-chat-messages--dark .whisper-chat-time-divider span {
  background: #111827 !important;
}

.whisper-chat-messages--dark .whisper-chat-message--agent .whisper-chat-message-bubble {
  background: #374151 !important;
  color: white !important;
  border-color: #4b5563 !important;
}

.whisper-chat-messages--dark .whisper-chat-sender-name {
  color: #d1d5db !important;
}

.whisper-chat-messages--dark .whisper-chat-typing-bubble {
  background: #374151 !important;
  border-color: #4b5563 !important;
}

/* 动画定义 */
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes typing-dot {
  0%, 80%, 100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

/* 移动端适配 */
@media (max-width: 768px) {
  .whisper-chat-messages {
    padding: 12px !important;
  }

  .whisper-chat-message-bubble {
    max-width: calc(100vw - 120px) !important;
  }

  .whisper-chat-welcome {
    padding: 24px 12px !important;
  }

  .whisper-chat-file-content {
    min-width: 180px !important;
  }
}
</style>
