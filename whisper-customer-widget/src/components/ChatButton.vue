<template>
  <div class="whisper-chat-button-container">
    <!-- 主聊天按钮 -->
    <button 
      :class="buttonClasses"
      @click="toggleChat"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
      type="button"
      :aria-label="ariaLabel"
    >
      <!-- 按钮背景渐变 -->
      <div class="whisper-chat-button-background"></div>
      
      <!-- 按钮内容 -->
      <div class="whisper-chat-button-content">
        <!-- 聊天图标 -->
        <div class="whisper-chat-button-icon">
          <transition name="icon-rotate" mode="out-in">
            <svg 
              v-if="!isOpen" 
              key="chat"
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              <circle cx="9" cy="10" r="1"/>
              <circle cx="15" cy="10" r="1"/>
            </svg>
            <svg 
              v-else 
              key="close"
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </transition>
        </div>

        <!-- 脉冲动画（连接中状态） -->
        <div 
          v-if="isConnecting" 
          class="whisper-chat-button-pulse"
        ></div>
      </div>

      <!-- 未读消息徽章 -->
      <transition name="badge-bounce">
        <div 
          v-if="unreadCount > 0 && !isOpen" 
          class="whisper-chat-badge"
        >
          {{ unreadCount > 99 ? '99+' : unreadCount }}
        </div>
      </transition>

      <!-- 在线状态指示器 -->
      <div 
        v-if="showStatusIndicator"
        :class="statusIndicatorClasses"
      ></div>
    </button>

    <!-- 悬停提示卡片 -->
    <transition name="tooltip-slide">
      <div 
        v-if="showTooltip" 
        :class="tooltipClasses"
      >
        <div class="whisper-chat-tooltip-content">
          <div class="whisper-chat-tooltip-title">{{ tooltipTitle }}</div>
          <div v-if="tooltipSubtitle" class="whisper-chat-tooltip-subtitle">{{ tooltipSubtitle }}</div>
        </div>
        <div class="whisper-chat-tooltip-arrow"></div>
      </div>
    </transition>
  </div>
</template>

<script>
import { ref, computed, inject, onMounted, onUnmounted } from 'vue'

export default {
  name: 'ChatButton',
  props: {
    isOpen: {
      type: Boolean,
      default: false
    },
    unreadCount: {
      type: Number,
      default: 0
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
    agentName: {
      type: String,
      default: '客服'
    },
    companyName: {
      type: String,
      default: 'Whisper'
    }
  },
  emits: ['toggle'],
  setup(props, { emit }) {
    const isHovered = ref(false)
    const showTooltip = ref(false)
    let tooltipTimer = null

    // 计算属性
    const buttonClasses = computed(() => [
      'whisper-chat-button',
      `whisper-chat-button--${props.position}`,
      `whisper-chat-button--${props.theme}`,
      {
        'whisper-chat-button--open': props.isOpen,
        'whisper-chat-button--hovered': isHovered.value,
        'whisper-chat-button--connecting': props.isConnecting,
        'whisper-chat-button--offline': !props.isConnected && !props.isConnecting
      }
    ])

    const tooltipClasses = computed(() => [
      'whisper-chat-tooltip',
      `whisper-chat-tooltip--${props.position}`,
      `whisper-chat-tooltip--${props.theme}`
    ])

    const statusIndicatorClasses = computed(() => [
      'whisper-chat-status-indicator',
      {
        'whisper-chat-status-indicator--online': props.isConnected && !props.isConnecting,
        'whisper-chat-status-indicator--connecting': props.isConnecting,
        'whisper-chat-status-indicator--offline': !props.isConnected && !props.isConnecting
      }
    ])

    const showStatusIndicator = computed(() => {
      return !props.isConnected || props.isConnecting
    })

    const ariaLabel = computed(() => {
      if (props.isOpen) {
        return '关闭聊天'
      }
      if (props.unreadCount > 0) {
        return `打开聊天，有 ${props.unreadCount} 条未读消息`
      }
      return '打开聊天'
    })

    const tooltipTitle = computed(() => {
      if (props.isConnecting) {
        return '正在连接...'
      }
      if (!props.isConnected) {
        return '客服离线'
      }
      if (props.unreadCount > 0) {
        return `${props.unreadCount} 条新消息`
      }
      return `与 ${props.companyName} 聊天`
    })

    const tooltipSubtitle = computed(() => {
      if (props.isConnecting) {
        return '请稍候'
      }
      if (!props.isConnected) {
        return '请留言，我们会尽快回复'
      }
      if (props.isConnected && !props.unreadCount) {
        return `${props.agentName} 在线为您服务`
      }
      return ''
    })

    // 方法
    const handleMouseEnter = () => {
      isHovered.value = true
      if (!props.isOpen) {
        clearTimeout(tooltipTimer)
        tooltipTimer = setTimeout(() => {
          showTooltip.value = true
        }, 500) // 延迟显示提示
      }
    }

    const handleMouseLeave = () => {
      isHovered.value = false
      clearTimeout(tooltipTimer)
      showTooltip.value = false
    }

    const toggleChat = () => {
      emit('toggle')
      showTooltip.value = false
    }

    // 生命周期
    onUnmounted(() => {
      clearTimeout(tooltipTimer)
    })

    return {
      isHovered,
      showTooltip,
      buttonClasses,
      tooltipClasses,
      statusIndicatorClasses,
      showStatusIndicator,
      ariaLabel,
      tooltipTitle,
      tooltipSubtitle,
      handleMouseEnter,
      handleMouseLeave,
      toggleChat
    }
  }
}
</script>

<style scoped>
/* 设计系统变量 */
:root {
  --whisper-primary-500: #3b82f6;
  --whisper-primary-600: #2563eb;
  --whisper-primary-700: #1d4ed8;
  --whisper-success-500: #10b981;
  --whisper-warning-500: #f59e0b;
  --whisper-error-500: #ef4444;
  --whisper-gray-50: #f9fafb;
  --whisper-gray-100: #f3f4f6;
  --whisper-gray-800: #1f2937;
  --whisper-gray-900: #111827;
  --whisper-shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -2px rgb(0 0 0 / 0.05);
  --whisper-shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 10px 10px -5px rgb(0 0 0 / 0.04);
}

/* 容器 */
.whisper-chat-button-container {
  position: fixed !important;
  z-index: 9999 !important;
  pointer-events: none !important;
}

/* 主按钮 */
.whisper-chat-button {
  position: relative !important;
  width: 60px !important;
  height: 60px !important;
  border-radius: 50% !important;
  border: none !important;
  cursor: pointer !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  pointer-events: auto !important;
  overflow: hidden !important;
  box-shadow: var(--whisper-shadow-lg) !important;
  backdrop-filter: blur(10px) !important;
}

/* 按钮背景 */
.whisper-chat-button-background {
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  background: linear-gradient(135deg, var(--whisper-primary-500) 0%, var(--whisper-primary-600) 100%) !important;
  transition: all 0.3s ease !important;
}

/* 按钮内容 */
.whisper-chat-button-content {
  position: relative !important;
  width: 100% !important;
  height: 100% !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  color: white !important;
  z-index: 1 !important;
}

/* 按钮图标 */
.whisper-chat-button-icon {
  transition: transform 0.3s ease !important;
}

/* 悬停效果 */
.whisper-chat-button:hover {
  transform: scale(1.05) !important;
  box-shadow: var(--whisper-shadow-xl) !important;
}

.whisper-chat-button:hover .whisper-chat-button-background {
  background: linear-gradient(135deg, var(--whisper-primary-600) 0%, var(--whisper-primary-700) 100%) !important;
}

.whisper-chat-button:hover .whisper-chat-button-icon {
  transform: scale(1.1) !important;
}

/* 位置样式 */
.whisper-chat-button--bottom-right {
  bottom: 24px !important;
  right: 24px !important;
}

.whisper-chat-button--bottom-left {
  bottom: 24px !important;
  left: 24px !important;
}

/* 主题样式 */
.whisper-chat-button--dark .whisper-chat-button-background {
  background: linear-gradient(135deg, var(--whisper-gray-800) 0%, var(--whisper-gray-900) 100%) !important;
}

.whisper-chat-button--dark:hover .whisper-chat-button-background {
  background: linear-gradient(135deg, var(--whisper-gray-700) 0%, var(--whisper-gray-800) 100%) !important;
}

/* 状态样式 */
.whisper-chat-button--open {
  transform: rotate(90deg) !important;
}

.whisper-chat-button--connecting .whisper-chat-button-background {
  background: linear-gradient(135deg, var(--whisper-warning-500) 0%, #f97316 100%) !important;
}

.whisper-chat-button--offline .whisper-chat-button-background {
  background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%) !important;
}

/* 脉冲动画 */
.whisper-chat-button-pulse {
  position: absolute !important;
  top: -2px !important;
  left: -2px !important;
  right: -2px !important;
  bottom: -2px !important;
  border-radius: 50% !important;
  background: rgba(255, 255, 255, 0.3) !important;
  animation: pulse-ring 2s infinite !important;
}

/* 未读消息徽章 */
.whisper-chat-badge {
  position: absolute !important;
  top: -6px !important;
  right: -6px !important;
  min-width: 20px !important;
  height: 20px !important;
  background: var(--whisper-error-500) !important;
  color: white !important;
  border-radius: 10px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  font-size: 11px !important;
  font-weight: 600 !important;
  padding: 0 6px !important;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3) !important;
  border: 2px solid white !important;
}

/* 状态指示器 */
.whisper-chat-status-indicator {
  position: absolute !important;
  top: 4px !important;
  right: 4px !important;
  width: 12px !important;
  height: 12px !important;
  border-radius: 50% !important;
  border: 2px solid white !important;
}

.whisper-chat-status-indicator--online {
  background: var(--whisper-success-500) !important;
}

.whisper-chat-status-indicator--connecting {
  background: var(--whisper-warning-500) !important;
  animation: pulse-dot 1.5s infinite !important;
}

.whisper-chat-status-indicator--offline {
  background: #6b7280 !important;
}

/* 提示卡片 */
.whisper-chat-tooltip {
  position: absolute !important;
  bottom: 100% !important;
  margin-bottom: 12px !important;
  background: white !important;
  border-radius: 12px !important;
  box-shadow: var(--whisper-shadow-xl) !important;
  padding: 16px !important;
  min-width: 200px !important;
  max-width: 280px !important;
  pointer-events: none !important;
  z-index: 10 !important;
}

.whisper-chat-tooltip--bottom-right {
  right: 0 !important;
}

.whisper-chat-tooltip--bottom-left {
  left: 0 !important;
}

.whisper-chat-tooltip--dark {
  background: var(--whisper-gray-800) !important;
  color: white !important;
}

.whisper-chat-tooltip-content {
  text-align: left !important;
}

.whisper-chat-tooltip-title {
  font-size: 14px !important;
  font-weight: 600 !important;
  color: var(--whisper-gray-900) !important;
  margin-bottom: 4px !important;
}

.whisper-chat-tooltip--dark .whisper-chat-tooltip-title {
  color: white !important;
}

.whisper-chat-tooltip-subtitle {
  font-size: 12px !important;
  color: #6b7280 !important;
  line-height: 1.4 !important;
}

.whisper-chat-tooltip--dark .whisper-chat-tooltip-subtitle {
  color: #d1d5db !important;
}

.whisper-chat-tooltip-arrow {
  position: absolute !important;
  top: 100% !important;
  width: 0 !important;
  height: 0 !important;
  border-left: 8px solid transparent !important;
  border-right: 8px solid transparent !important;
  border-top: 8px solid white !important;
}

.whisper-chat-tooltip--bottom-right .whisper-chat-tooltip-arrow {
  right: 20px !important;
}

.whisper-chat-tooltip--bottom-left .whisper-chat-tooltip-arrow {
  left: 20px !important;
}

.whisper-chat-tooltip--dark .whisper-chat-tooltip-arrow {
  border-top-color: var(--whisper-gray-800) !important;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .whisper-chat-button {
    width: 56px !important;
    height: 56px !important;
  }

  .whisper-chat-button--bottom-right {
    bottom: 20px !important;
    right: 20px !important;
  }

  .whisper-chat-button--bottom-left {
    bottom: 20px !important;
    left: 20px !important;
  }

  .whisper-chat-tooltip {
    display: none !important;
  }
}

/* 动画定义 */
@keyframes pulse-ring {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(1.3);
    opacity: 0;
  }
}

@keyframes pulse-dot {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* Vue 过渡动画 */
.icon-rotate-enter-active,
.icon-rotate-leave-active {
  transition: all 0.3s ease;
}

.icon-rotate-enter-from {
  transform: rotate(-90deg);
  opacity: 0;
}

.icon-rotate-leave-to {
  transform: rotate(90deg);
  opacity: 0;
}

.badge-bounce-enter-active {
  animation: badge-bounce-in 0.5s ease;
}

.badge-bounce-leave-active {
  animation: badge-bounce-out 0.3s ease;
}

@keyframes badge-bounce-in {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes badge-bounce-out {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(0);
    opacity: 0;
  }
}

.tooltip-slide-enter-active,
.tooltip-slide-leave-active {
  transition: all 0.3s ease;
}

.tooltip-slide-enter-from,
.tooltip-slide-leave-to {
  transform: translateY(10px);
  opacity: 0;
}
</style>
