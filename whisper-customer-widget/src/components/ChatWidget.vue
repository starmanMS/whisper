<template>
  <div 
    v-if="isVisible"
    :class="widgetClasses"
  >
    <!-- 聊天按钮 -->
    <ChatButton
      :is-open="isDialogOpen"
      :unread-count="unreadCount"
      :position="position"
      :theme="theme"
      :is-connected="isConnected"
      :is-connecting="isConnecting"
      @toggle="toggleDialog"
    />
    
    <!-- 聊天对话框 -->
    <ChatDialog
      :is-open="isDialogOpen"
      :position="position"
      :theme="theme"
      :is-mobile="isMobile"
      @close="closeDialog"
      @minimize="minimizeDialog"
    />
  </div>
</template>

<script>
import { ref, computed, provide, onMounted, onUnmounted } from 'vue'
import { useChat } from '../composables/useChat.js'
import ChatButton from './ChatButton.vue'
import ChatDialog from './ChatDialog.vue'

export default {
  name: 'ChatWidget',
  components: {
    ChatButton,
    ChatDialog
  },
  props: {
    config: {
      type: Object,
      required: true
    }
  },
  setup(props) {
    // 状态管理
    const isVisible = ref(false)
    const isDialogOpen = ref(false)
    const isMobile = ref(false)
    
    // 使用聊天功能
    const chat = useChat()
    
    // 提供聊天实例给子组件
    provide('chat', chat)
    
    // 计算属性
    const widgetClasses = computed(() => [
      'whisper-chat-widget',
      `whisper-chat-widget--${props.config.theme}`,
      `whisper-chat-widget--${props.config.position}`,
      {
        'whisper-chat-widget--mobile': isMobile.value
      }
    ])
    
    const position = computed(() => props.config.position || 'bottom-right')
    const theme = computed(() => props.config.theme || 'light')
    const unreadCount = computed(() => chat.chatState.unreadCount)
    const isConnected = computed(() => chat.isConnected.value)
    const isConnecting = computed(() => chat.isConnecting.value)
    
    // 方法
    async function initialize() {
      try {
        console.log('Initializing chat widget with config:', props.config)
        
        // 检测移动设备
        detectMobile()
        
        // 初始化聊天功能
        await chat.initialize(props.config)
        
        // 显示Widget
        isVisible.value = true
        
        console.log('Chat widget initialized successfully')
      } catch (error) {
        console.error('Failed to initialize chat widget:', error)
        // 即使初始化失败也显示Widget，允许用户重试
        isVisible.value = true
      }
    }
    
    function detectMobile() {
      isMobile.value = window.innerWidth < 768
    }
    
    function toggleDialog() {
      if (isDialogOpen.value) {
        closeDialog()
      } else {
        openDialog()
      }
    }
    
    function openDialog() {
      isDialogOpen.value = true
      
      // 打开对话框时标记消息为已读
      if (chat.chatState.isInitialized) {
        chat.openChat()
      }
    }
    
    function closeDialog() {
      isDialogOpen.value = false
      
      if (chat.chatState.isInitialized) {
        chat.closeChat()
      }
    }
    
    function minimizeDialog() {
      isDialogOpen.value = false
    }
    
    function destroy() {
      isVisible.value = false
      isDialogOpen.value = false
      
      if (chat.chatState.isInitialized) {
        chat.destroy()
      }
    }
    
    function setTheme(newTheme) {
      if (chat.config.value) {
        chat.config.value.theme = newTheme
      }
    }
    
    function setPosition(newPosition) {
      if (chat.config.value) {
        chat.config.value.position = newPosition
      }
    }
    
    // 窗口大小变化监听
    function handleResize() {
      detectMobile()
    }
    
    // 键盘事件监听
    function handleKeyDown(event) {
      // ESC键关闭对话框
      if (event.key === 'Escape' && isDialogOpen.value) {
        closeDialog()
      }
    }
    
    // 页面可见性变化监听
    function handleVisibilityChange() {
      if (document.hidden) {
        // 页面隐藏时暂停某些功能
        console.log('Page hidden')
      } else {
        // 页面显示时恢复功能
        console.log('Page visible')
        if (isDialogOpen.value && chat.chatState.isInitialized) {
          chat.markMessagesAsRead()
        }
      }
    }
    
    // 组件挂载
    onMounted(() => {
      // 添加事件监听器
      window.addEventListener('resize', handleResize)
      window.addEventListener('keydown', handleKeyDown)
      document.addEventListener('visibilitychange', handleVisibilityChange)
      
      // 初始化Widget
      initialize()
    })
    
    // 组件卸载
    onUnmounted(() => {
      // 移除事件监听器
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      
      // 销毁聊天功能
      destroy()
    })
    
    // 暴露方法给外部调用
    const publicMethods = {
      initialize,
      destroy,
      openDialog,
      closeDialog,
      setTheme,
      setPosition,
      getState: () => ({
        isVisible: isVisible.value,
        isDialogOpen: isDialogOpen.value,
        isConnected: isConnected.value,
        unreadCount: unreadCount.value,
        chatState: chat.chatState
      })
    }
    
    // 将方法暴露到全局（用于外部调用）
    if (typeof window !== 'undefined') {
      window.whisperChatWidget = publicMethods
    }
    
    return {
      isVisible,
      isDialogOpen,
      isMobile,
      widgetClasses,
      position,
      theme,
      unreadCount,
      isConnected,
      isConnecting,
      toggleDialog,
      openDialog,
      closeDialog,
      minimizeDialog,
      ...publicMethods
    }
  }
}
</script>

<style>
/* 全局样式，确保Widget不受宿主页面样式影响 */
.whisper-chat-widget {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
  font-size: 14px;
  line-height: 1.5;
  color: #374151;
  box-sizing: border-box;
}

.whisper-chat-widget *,
.whisper-chat-widget *::before,
.whisper-chat-widget *::after {
  box-sizing: border-box;
}

.whisper-chat-widget button {
  font-family: inherit;
  font-size: inherit;
  line-height: inherit;
  margin: 0;
  padding: 0;
  border: none;
  background: none;
  cursor: pointer;
  outline: none;
}

.whisper-chat-widget input,
.whisper-chat-widget textarea {
  font-family: inherit;
  font-size: inherit;
  line-height: inherit;
  margin: 0;
  padding: 0;
  border: none;
  background: none;
  outline: none;
}

.whisper-chat-widget img {
  max-width: 100%;
  height: auto;
  border: none;
}

.whisper-chat-widget a {
  color: inherit;
  text-decoration: none;
}

.whisper-chat-widget a:hover {
  text-decoration: underline;
}

/* 主题样式 */
.whisper-chat-widget--dark {
  color: #f3f4f6;
}

/* 移动端样式 */
.whisper-chat-widget--mobile {
  /* 移动端特定样式 */
}

/* 确保Widget在最顶层 */
.whisper-chat-widget {
  position: relative;
  z-index: 2147483647; /* 最大z-index值 */
}

/* 防止与宿主页面样式冲突 */
.whisper-chat-widget .whisper-chat-button,
.whisper-chat-widget .whisper-chat-dialog {
  all: initial;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
}

/* 滚动条样式 */
.whisper-chat-widget ::-webkit-scrollbar {
  width: 6px;
}

.whisper-chat-widget ::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.whisper-chat-widget ::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.whisper-chat-widget ::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 暗色主题滚动条 */
.whisper-chat-widget--dark ::-webkit-scrollbar-track {
  background: #374151;
}

.whisper-chat-widget--dark ::-webkit-scrollbar-thumb {
  background: #6b7280;
}

.whisper-chat-widget--dark ::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}
</style>
