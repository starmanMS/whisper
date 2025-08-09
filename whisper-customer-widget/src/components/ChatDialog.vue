<template>
  <div class="whisper-chat-dialog-container">
    <!-- 对话框主体 -->
    <div 
      :class="dialogClasses"
      @click.stop
    >
      <!-- 对话框头部 -->
      <div class="whisper-chat-header">
        <!-- 左侧信息 -->
        <div class="whisper-chat-header-info">
          <!-- 头像 -->
          <div class="whisper-chat-avatar">
            <img 
              v-if="agentAvatar" 
              :src="agentAvatar" 
              :alt="agentName"
              class="whisper-chat-avatar-image"
            >
            <div v-else class="whisper-chat-avatar-placeholder">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </div>
          </div>
          
          <!-- 文本信息 -->
          <div class="whisper-chat-header-text">
            <div class="whisper-chat-title">{{ displayTitle }}</div>
            <div class="whisper-chat-status">{{ displayStatus }}</div>
          </div>
        </div>

        <!-- 右侧操作 -->
        <div class="whisper-chat-header-actions">
          <!-- 最小化按钮 -->
          <button 
            class="whisper-chat-action-button"
            @click="$emit('minimize')"
            :aria-label="'最小化聊天'"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </button>
          
          <!-- 关闭按钮 -->
          <button 
            class="whisper-chat-action-button"
            @click="$emit('close')"
            :aria-label="'关闭聊天'"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- 连接状态横幅 -->
      <div 
        v-if="showConnectionBanner" 
        class="whisper-chat-connection-banner"
      >
        <div v-if="isConnecting" class="whisper-chat-connecting">
          <div class="whisper-chat-connecting-content">
            <div class="whisper-chat-spinner-small"></div>
            <span>正在连接客服...</span>
          </div>
        </div>
        <div v-else-if="!isConnected" class="whisper-chat-disconnected">
          <span>连接已断开</span>
          <button 
            class="whisper-chat-reconnect-button"
            @click="$emit('reconnect')"
          >
            重新连接
          </button>
        </div>
      </div>

      <!-- 消息列表区域 -->
      <div class="whisper-chat-messages-container">
        <MessageList
          :messages="messages"
          :is-loading="isLoading"
          :theme="theme"
          @load-more="$emit('load-more')"
          @message-action="$emit('message-action', $event)"
        />
      </div>

      <!-- 消息输入区域 -->
      <div class="whisper-chat-input-container">
        <MessageInput
          :disabled="!isConnected"
          :theme="theme"
          :placeholder="inputPlaceholder"
          @send-message="$emit('send-message', $event)"
          @send-file="$emit('send-file', $event)"
          @typing="$emit('typing', $event)"
        />
      </div>

      <!-- 满意度评价（可选） -->
      <div 
        v-if="showSatisfactionRating" 
        class="whisper-chat-satisfaction"
      >
        <div class="whisper-chat-satisfaction-title">请为本次服务评分</div>
        <div class="whisper-chat-satisfaction-stars">
          <button
            v-for="star in 5"
            :key="star"
            :class="[
              'whisper-chat-star',
              { 'whisper-chat-star--active': star <= satisfactionRating }
            ]"
            @click="setSatisfactionRating(star)"
          >
            ⭐
          </button>
        </div>
        <div class="whisper-chat-satisfaction-actions">
          <button 
            class="whisper-chat-skip-button"
            @click="skipSatisfactionRating"
          >
            跳过
          </button>
          <button 
            class="whisper-chat-submit-button"
            :disabled="satisfactionRating === 0"
            @click="submitSatisfactionRating"
          >
            提交
          </button>
        </div>
      </div>
    </div>

    <!-- 对话框遮罩（移动端） -->
    <div 
      v-if="isMobile" 
      class="whisper-chat-dialog-backdrop"
      @click="$emit('close')"
    ></div>
  </div>
</template>

<script>
import { ref, computed, inject, onMounted, onUnmounted } from 'vue'
import MessageList from './MessageList.vue'
import MessageInput from './MessageInput.vue'

export default {
  name: 'ChatDialog',
  components: {
    MessageList,
    MessageInput
  },
  props: {
    isOpen: {
      type: Boolean,
      default: false
    },
    position: {
      type: String,
      default: 'bottom-right',
      validator: (value) => ['bottom-right', 'bottom-left'].includes(value)
    },
    theme: {
      type: String,
      default: 'light',
      validator: (value) => ['light', 'dark'].includes(value)
    },
    isConnected: {
      type: Boolean,
      default: true
    },
    isConnecting: {
      type: Boolean,
      default: false
    },
    messages: {
      type: Array,
      default: () => []
    },
    isLoading: {
      type: Boolean,
      default: false
    },
    agentName: {
      type: String,
      default: '客服'
    },
    agentAvatar: {
      type: String,
      default: ''
    },
    companyName: {
      type: String,
      default: 'Whisper'
    },
    showSatisfactionRating: {
      type: Boolean,
      default: false
    }
  },
  emits: [
    'close', 
    'minimize', 
    'reconnect', 
    'load-more', 
    'message-action', 
    'send-message', 
    'send-file', 
    'typing',
    'satisfaction-rating'
  ],
  setup(props, { emit }) {
    const satisfactionRating = ref(0)
    const isMobile = ref(false)

    // 计算属性
    const dialogClasses = computed(() => [
      'whisper-chat-dialog',
      `whisper-chat-dialog--${props.position}`,
      `whisper-chat-dialog--${props.theme}`,
      {
        'whisper-chat-dialog--mobile': isMobile.value,
        'whisper-chat-dialog--open': props.isOpen
      }
    ])

    const showConnectionBanner = computed(() => {
      return props.isConnecting || !props.isConnected
    })

    const displayTitle = computed(() => {
      if (props.isConnecting) {
        return '正在连接...'
      }
      if (!props.isConnected) {
        return '连接已断开'
      }
      return props.companyName
    })

    const displayStatus = computed(() => {
      if (props.isConnecting) {
        return '请稍候'
      }
      if (!props.isConnected) {
        return '离线'
      }
      return `${props.agentName} 在线`
    })

    const inputPlaceholder = computed(() => {
      if (!props.isConnected) {
        return '请等待连接恢复...'
      }
      return '输入消息...'
    })

    // 方法
    const checkMobile = () => {
      isMobile.value = window.innerWidth <= 768
    }

    const setSatisfactionRating = (rating) => {
      satisfactionRating.value = rating
    }

    const skipSatisfactionRating = () => {
      emit('satisfaction-rating', { rating: 0, skipped: true })
    }

    const submitSatisfactionRating = () => {
      emit('satisfaction-rating', { rating: satisfactionRating.value, skipped: false })
    }

    // 生命周期
    onMounted(() => {
      checkMobile()
      window.addEventListener('resize', checkMobile)
    })

    onUnmounted(() => {
      window.removeEventListener('resize', checkMobile)
    })

    return {
      satisfactionRating,
      isMobile,
      dialogClasses,
      showConnectionBanner,
      displayTitle,
      displayStatus,
      inputPlaceholder,
      setSatisfactionRating,
      skipSatisfactionRating,
      submitSatisfactionRating
    }
  }
}
</script>

<style scoped>
/* 对话框容器 */
.whisper-chat-dialog-container {
  position: fixed !important;
  z-index: 9998 !important;
  pointer-events: none !important;
}

/* 对话框主体 */
.whisper-chat-dialog {
  position: fixed !important;
  width: 380px !important;
  height: 600px !important;
  background: white !important;
  border-radius: 16px !important;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25) !important;
  display: flex !important;
  flex-direction: column !important;
  overflow: hidden !important;
  pointer-events: auto !important;
  transform-origin: bottom right !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  backdrop-filter: blur(10px) !important;
}

/* 位置样式 */
.whisper-chat-dialog--bottom-right {
  bottom: 100px !important;
  right: 24px !important;
  transform-origin: bottom right !important;
}

.whisper-chat-dialog--bottom-left {
  bottom: 100px !important;
  left: 24px !important;
  transform-origin: bottom left !important;
}

/* 主题样式 */
.whisper-chat-dialog--dark {
  background: #1f2937 !important;
  color: white !important;
}

/* 移动端样式 */
.whisper-chat-dialog--mobile {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  width: 100% !important;
  height: 100% !important;
  border-radius: 0 !important;
  transform-origin: center !important;
}

/* 打开状态 */
.whisper-chat-dialog--open {
  transform: scale(1) !important;
  opacity: 1 !important;
}

/* 关闭状态 */
.whisper-chat-dialog:not(.whisper-chat-dialog--open) {
  transform: scale(0.8) !important;
  opacity: 0 !important;
  pointer-events: none !important;
}

/* 对话框头部 */
.whisper-chat-header {
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  padding: 20px 24px !important;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%) !important;
  color: white !important;
  border-top-left-radius: 16px !important;
  border-top-right-radius: 16px !important;
}

.whisper-chat-dialog--dark .whisper-chat-header {
  background: linear-gradient(135deg, #374151 0%, #1f2937 100%) !important;
}

.whisper-chat-header-info {
  display: flex !important;
  align-items: center !important;
  gap: 12px !important;
  flex: 1 !important;
  min-width: 0 !important;
}

/* 头像样式 */
.whisper-chat-avatar {
  width: 40px !important;
  height: 40px !important;
  border-radius: 50% !important;
  background: rgba(255, 255, 255, 0.2) !important;
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
  color: rgba(255, 255, 255, 0.8) !important;
}

/* 头部文本 */
.whisper-chat-header-text {
  flex: 1 !important;
  min-width: 0 !important;
}

.whisper-chat-title {
  font-size: 16px !important;
  font-weight: 600 !important;
  margin-bottom: 2px !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  white-space: nowrap !important;
}

.whisper-chat-status {
  font-size: 13px !important;
  opacity: 0.9 !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  white-space: nowrap !important;
}

/* 头部操作按钮 */
.whisper-chat-header-actions {
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
}

.whisper-chat-action-button {
  width: 32px !important;
  height: 32px !important;
  border: none !important;
  background: rgba(255, 255, 255, 0.1) !important;
  color: white !important;
  border-radius: 8px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  cursor: pointer !important;
  transition: all 0.2s ease !important;
}

.whisper-chat-action-button:hover {
  background: rgba(255, 255, 255, 0.2) !important;
  transform: scale(1.05) !important;
}

/* 连接状态横幅 */
.whisper-chat-connection-banner {
  padding: 12px 24px !important;
  background: #fef3c7 !important;
  border-bottom: 1px solid #fde68a !important;
  color: #92400e !important;
  font-size: 14px !important;
}

.whisper-chat-connecting,
.whisper-chat-disconnected {
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
}

.whisper-chat-connecting-content {
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
}

.whisper-chat-spinner-small {
  width: 16px !important;
  height: 16px !important;
  border: 2px solid #d97706 !important;
  border-top-color: transparent !important;
  border-radius: 50% !important;
  animation: spin 1s linear infinite !important;
}

.whisper-chat-reconnect-button {
  background: none !important;
  border: none !important;
  color: #d97706 !important;
  font-weight: 600 !important;
  cursor: pointer !important;
  padding: 4px 8px !important;
  border-radius: 4px !important;
  transition: background-color 0.2s ease !important;
}

.whisper-chat-reconnect-button:hover {
  background: rgba(217, 119, 6, 0.1) !important;
}

/* 消息容器 */
.whisper-chat-messages-container {
  flex: 1 !important;
  overflow: hidden !important;
  background: #f9fafb !important;
}

.whisper-chat-dialog--dark .whisper-chat-messages-container {
  background: #111827 !important;
}

/* 输入容器 */
.whisper-chat-input-container {
  border-top: 1px solid #e5e7eb !important;
  background: white !important;
}

.whisper-chat-dialog--dark .whisper-chat-input-container {
  border-top-color: #374151 !important;
  background: #1f2937 !important;
}

/* 满意度评价 */
.whisper-chat-satisfaction {
  padding: 20px 24px !important;
  border-top: 1px solid #e5e7eb !important;
  background: #f9fafb !important;
}

.whisper-chat-dialog--dark .whisper-chat-satisfaction {
  border-top-color: #374151 !important;
  background: #111827 !important;
}

.whisper-chat-satisfaction-title {
  font-size: 14px !important;
  font-weight: 600 !important;
  color: #374151 !important;
  margin-bottom: 12px !important;
}

.whisper-chat-dialog--dark .whisper-chat-satisfaction-title {
  color: white !important;
}

.whisper-chat-satisfaction-stars {
  display: flex !important;
  gap: 4px !important;
  margin-bottom: 16px !important;
}

.whisper-chat-star {
  background: none !important;
  border: none !important;
  font-size: 24px !important;
  cursor: pointer !important;
  transition: all 0.2s ease !important;
  filter: grayscale(100%) !important;
  opacity: 0.5 !important;
}

.whisper-chat-star:hover,
.whisper-chat-star--active {
  filter: grayscale(0%) !important;
  opacity: 1 !important;
  transform: scale(1.1) !important;
}

.whisper-chat-satisfaction-actions {
  display: flex !important;
  justify-content: flex-end !important;
  gap: 12px !important;
}

.whisper-chat-skip-button {
  background: none !important;
  border: none !important;
  color: #6b7280 !important;
  font-size: 14px !important;
  cursor: pointer !important;
  padding: 8px 16px !important;
  border-radius: 8px !important;
  transition: all 0.2s ease !important;
}

.whisper-chat-skip-button:hover {
  background: #f3f4f6 !important;
  color: #374151 !important;
}

.whisper-chat-submit-button {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%) !important;
  border: none !important;
  color: white !important;
  font-size: 14px !important;
  font-weight: 600 !important;
  cursor: pointer !important;
  padding: 8px 20px !important;
  border-radius: 8px !important;
  transition: all 0.2s ease !important;
}

.whisper-chat-submit-button:hover {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%) !important;
  transform: translateY(-1px) !important;
}

.whisper-chat-submit-button:disabled {
  background: #d1d5db !important;
  cursor: not-allowed !important;
  transform: none !important;
}

/* 移动端遮罩 */
.whisper-chat-dialog-backdrop {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  background: rgba(0, 0, 0, 0.5) !important;
  z-index: -1 !important;
  pointer-events: auto !important;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .whisper-chat-dialog:not(.whisper-chat-dialog--mobile) {
    width: calc(100vw - 40px) !important;
    height: 500px !important;
    max-width: 380px !important;
  }

  .whisper-chat-dialog--bottom-right {
    right: 20px !important;
    bottom: 80px !important;
  }

  .whisper-chat-dialog--bottom-left {
    left: 20px !important;
    bottom: 80px !important;
  }
}

/* 动画 */
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
