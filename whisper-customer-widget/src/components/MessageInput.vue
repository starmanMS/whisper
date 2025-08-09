<template>
  <div class="whisper-chat-input-container">
    <!-- 文件预览区域 -->
    <div 
      v-if="selectedFile" 
      class="whisper-chat-file-preview"
    >
      <div class="whisper-chat-file-preview-content">
        <!-- 图片预览 -->
        <div 
          v-if="isImageFile(selectedFile)" 
          class="whisper-chat-image-preview"
        >
          <img 
            :src="filePreviewUrl" 
            alt="图片预览"
            class="whisper-chat-preview-image"
          >
        </div>
        
        <!-- 文件信息 -->
        <div 
          v-else 
          class="whisper-chat-file-preview-info"
        >
          <div class="whisper-chat-file-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
            </svg>
          </div>
          <div class="whisper-chat-file-details">
            <div class="whisper-chat-file-name">{{ selectedFile.name }}</div>
            <div class="whisper-chat-file-size">{{ formatFileSize(selectedFile.size) }}</div>
          </div>
        </div>
        
        <!-- 移除按钮 -->
        <button 
          class="whisper-chat-file-remove"
          @click="removeFile"
          :aria-label="'移除文件'"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- 输入区域 -->
    <div class="whisper-chat-input-wrapper">
      <!-- 附件按钮 -->
      <button 
        class="whisper-chat-attach-button"
        @click="triggerFileInput"
        :disabled="disabled || isUploading"
        :aria-label="'上传文件'"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66L9.64 16.2a2 2 0 0 1-2.83-2.83l8.49-8.4"/>
        </svg>
      </button>

      <!-- 文本输入框 -->
      <div class="whisper-chat-input-field">
        <textarea
          ref="textInput"
          v-model="messageText"
          :placeholder="placeholder"
          :disabled="disabled"
          class="whisper-chat-text-input"
          @keydown="handleKeyDown"
          @input="handleInput"
          @paste="handlePaste"
          rows="1"
        ></textarea>
        
        <!-- 输入框占位符动画 -->
        <div 
          v-if="!messageText && !disabled" 
          class="whisper-chat-input-placeholder"
        >
          {{ placeholder }}
        </div>
      </div>

      <!-- 表情符号按钮 -->
      <button 
        class="whisper-chat-emoji-button"
        @click="toggleEmojiPicker"
        :disabled="disabled"
        :aria-label="'选择表情符号'"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
          <line x1="9" y1="9" x2="9.01" y2="9"/>
          <line x1="15" y1="9" x2="15.01" y2="9"/>
        </svg>
      </button>

      <!-- 发送按钮 -->
      <button 
        class="whisper-chat-send-button"
        @click="sendMessage"
        :disabled="!canSend"
        :aria-label="'发送消息'"
      >
        <div v-if="isSending" class="whisper-chat-spinner-small"></div>
        <svg 
          v-else 
          width="20" 
          height="20" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          stroke-width="2"
        >
          <line x1="22" y1="2" x2="11" y2="13"/>
          <polygon points="22,2 15,22 11,13 2,9 22,2"/>
        </svg>
      </button>
    </div>

    <!-- 表情符号选择器 -->
    <div 
      v-if="showEmojiPicker" 
      class="whisper-chat-emoji-picker"
    >
      <div class="whisper-chat-emoji-header">
        <span class="whisper-chat-emoji-title">选择表情符号</span>
        <button 
          class="whisper-chat-emoji-close"
          @click="closeEmojiPicker"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
          </svg>
        </button>
      </div>
      <div class="whisper-chat-emoji-grid">
        <button
          v-for="emoji in emojiList"
          :key="emoji"
          class="whisper-chat-emoji-item"
          @click="insertEmoji(emoji)"
        >
          {{ emoji }}
        </button>
      </div>
    </div>

    <!-- 隐藏的文件输入 -->
    <input
      ref="fileInput"
      type="file"
      class="hidden"
      accept="image/*,.pdf,.doc,.docx,.txt"
      @change="handleFileSelect"
    >
  </div>
</template>

<script>
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'

export default {
  name: 'MessageInput',
  props: {
    disabled: {
      type: Boolean,
      default: false
    },
    placeholder: {
      type: String,
      default: '输入消息...'
    },
    theme: {
      type: String,
      default: 'light',
      validator: (value) => ['light', 'dark'].includes(value)
    },
    maxFileSize: {
      type: Number,
      default: 10 * 1024 * 1024 // 10MB
    }
  },
  emits: ['send-message', 'send-file', 'typing'],
  setup(props, { emit }) {
    const textInput = ref(null)
    const fileInput = ref(null)
    const messageText = ref('')
    const selectedFile = ref(null)
    const filePreviewUrl = ref('')
    const showEmojiPicker = ref(false)
    const isSending = ref(false)
    const isUploading = ref(false)
    const typingTimer = ref(null)

    // 表情符号列表
    const emojiList = [
      '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣',
      '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰',
      '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜',
      '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏',
      '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣',
      '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠',
      '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨',
      '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥',
      '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧',
      '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐',
      '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑',
      '🤠', '😈', '👿', '👹', '👺', '🤡', '💩', '👻',
      '💀', '☠️', '👽', '👾', '🤖', '🎃', '😺', '😸',
      '😹', '😻', '😼', '😽', '🙀', '😿', '😾', '👋',
      '🤚', '🖐️', '✋', '🖖', '👌', '🤏', '✌️', '🤞',
      '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇',
      '☝️', '👍', '👎', '👊', '✊', '🤛', '🤜', '👏',
      '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💅', '🤳'
    ]

    // 计算属性
    const canSend = computed(() => {
      return !props.disabled && !isSending.value && (messageText.value.trim() || selectedFile.value)
    })

    // 方法
    const handleKeyDown = (event) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault()
        sendMessage()
      }
    }

    const handleInput = () => {
      autoResizeTextarea()
      handleTyping()
    }

    const handleTyping = () => {
      clearTimeout(typingTimer.value)
      emit('typing', { isTyping: true })
      
      typingTimer.value = setTimeout(() => {
        emit('typing', { isTyping: false })
      }, 1000)
    }

    const autoResizeTextarea = () => {
      nextTick(() => {
        if (textInput.value) {
          textInput.value.style.height = 'auto'
          textInput.value.style.height = Math.min(textInput.value.scrollHeight, 120) + 'px'
        }
      })
    }

    const sendMessage = async () => {
      if (!canSend.value) return

      isSending.value = true
      
      try {
        if (selectedFile.value) {
          await sendFileMessage()
        } else {
          await sendTextMessage()
        }
      } finally {
        isSending.value = false
      }
    }

    const sendTextMessage = async () => {
      const text = messageText.value.trim()
      if (!text) return

      emit('send-message', {
        type: 'text',
        content: text,
        timestamp: Date.now()
      })

      messageText.value = ''
      autoResizeTextarea()
    }

    const sendFileMessage = async () => {
      if (!selectedFile.value) return

      isUploading.value = true
      
      try {
        emit('send-file', {
          file: selectedFile.value,
          type: isImageFile(selectedFile.value) ? 'image' : 'file',
          timestamp: Date.now()
        })

        removeFile()
      } finally {
        isUploading.value = false
      }
    }

    const triggerFileInput = () => {
      fileInput.value?.click()
    }

    const handleFileSelect = (event) => {
      const file = event.target.files[0]
      if (!file) return

      if (file.size > props.maxFileSize) {
        alert(`文件大小不能超过 ${formatFileSize(props.maxFileSize)}`)
        return
      }

      selectedFile.value = file
      
      if (isImageFile(file)) {
        filePreviewUrl.value = URL.createObjectURL(file)
      }

      // 清空文件输入
      event.target.value = ''
    }

    const handlePaste = (event) => {
      const items = event.clipboardData?.items
      if (!items) return

      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        if (item.type.indexOf('image') !== -1) {
          event.preventDefault()
          const file = item.getAsFile()
          if (file) {
            selectedFile.value = file
            filePreviewUrl.value = URL.createObjectURL(file)
          }
          break
        }
      }
    }

    const removeFile = () => {
      if (filePreviewUrl.value) {
        URL.revokeObjectURL(filePreviewUrl.value)
      }
      selectedFile.value = null
      filePreviewUrl.value = ''
    }

    const isImageFile = (file) => {
      return file.type.startsWith('image/')
    }

    const formatFileSize = (bytes) => {
      if (bytes === 0) return '0 B'
      const k = 1024
      const sizes = ['B', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    const toggleEmojiPicker = () => {
      showEmojiPicker.value = !showEmojiPicker.value
    }

    const closeEmojiPicker = () => {
      showEmojiPicker.value = false
    }

    const insertEmoji = (emoji) => {
      const cursorPos = textInput.value?.selectionStart || 0
      const textBefore = messageText.value.substring(0, cursorPos)
      const textAfter = messageText.value.substring(cursorPos)
      
      messageText.value = textBefore + emoji + textAfter
      
      nextTick(() => {
        const newPos = cursorPos + emoji.length
        textInput.value?.setSelectionRange(newPos, newPos)
        textInput.value?.focus()
      })
      
      closeEmojiPicker()
    }

    // 生命周期
    onMounted(() => {
      autoResizeTextarea()
    })

    onUnmounted(() => {
      clearTimeout(typingTimer.value)
      if (filePreviewUrl.value) {
        URL.revokeObjectURL(filePreviewUrl.value)
      }
    })

    return {
      textInput,
      fileInput,
      messageText,
      selectedFile,
      filePreviewUrl,
      showEmojiPicker,
      isSending,
      isUploading,
      emojiList,
      canSend,
      handleKeyDown,
      handleInput,
      sendMessage,
      triggerFileInput,
      handleFileSelect,
      handlePaste,
      removeFile,
      isImageFile,
      formatFileSize,
      toggleEmojiPicker,
      closeEmojiPicker,
      insertEmoji
    }
  }
}
</script>

<style scoped>
/* 输入容器 */
.whisper-chat-input-container {
  background: white !important;
  border-top: 1px solid #e5e7eb !important;
}

/* 文件预览区域 */
.whisper-chat-file-preview {
  padding: 16px 20px !important;
  border-bottom: 1px solid #e5e7eb !important;
  background: #f9fafb !important;
}

.whisper-chat-file-preview-content {
  display: flex !important;
  align-items: center !important;
  gap: 12px !important;
  background: white !important;
  border-radius: 12px !important;
  padding: 12px !important;
  position: relative !important;
  border: 1px solid #e5e7eb !important;
}

/* 图片预览 */
.whisper-chat-image-preview {
  flex-shrink: 0 !important;
}

.whisper-chat-preview-image {
  width: 60px !important;
  height: 60px !important;
  object-fit: cover !important;
  border-radius: 8px !important;
}

/* 文件预览信息 */
.whisper-chat-file-preview-info {
  display: flex !important;
  align-items: center !important;
  gap: 12px !important;
  flex: 1 !important;
}

.whisper-chat-file-icon {
  width: 48px !important;
  height: 48px !important;
  background: #f3f4f6 !important;
  border-radius: 8px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  color: #6b7280 !important;
  flex-shrink: 0 !important;
}

.whisper-chat-file-details {
  flex: 1 !important;
  min-width: 0 !important;
}

.whisper-chat-file-name {
  font-weight: 500 !important;
  font-size: 14px !important;
  color: #374151 !important;
  margin-bottom: 2px !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  white-space: nowrap !important;
}

.whisper-chat-file-size {
  font-size: 12px !important;
  color: #6b7280 !important;
}

/* 移除文件按钮 */
.whisper-chat-file-remove {
  position: absolute !important;
  top: -8px !important;
  right: -8px !important;
  width: 24px !important;
  height: 24px !important;
  background: #ef4444 !important;
  color: white !important;
  border: none !important;
  border-radius: 50% !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  cursor: pointer !important;
  transition: all 0.2s ease !important;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3) !important;
}

.whisper-chat-file-remove:hover {
  background: #dc2626 !important;
  transform: scale(1.1) !important;
}

/* 输入区域 */
.whisper-chat-input-wrapper {
  display: flex !important;
  align-items: flex-end !important;
  gap: 8px !important;
  padding: 16px 20px !important;
}

/* 功能按钮 */
.whisper-chat-attach-button,
.whisper-chat-emoji-button {
  width: 40px !important;
  height: 40px !important;
  border: none !important;
  background: #f3f4f6 !important;
  color: #6b7280 !important;
  border-radius: 12px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  cursor: pointer !important;
  transition: all 0.2s ease !important;
  flex-shrink: 0 !important;
}

.whisper-chat-attach-button:hover,
.whisper-chat-emoji-button:hover {
  background: #e5e7eb !important;
  color: #374151 !important;
  transform: scale(1.05) !important;
}

.whisper-chat-attach-button:disabled,
.whisper-chat-emoji-button:disabled {
  opacity: 0.5 !important;
  cursor: not-allowed !important;
  transform: none !important;
}

/* 输入字段容器 */
.whisper-chat-input-field {
  flex: 1 !important;
  position: relative !important;
  background: #f9fafb !important;
  border: 1px solid #e5e7eb !important;
  border-radius: 12px !important;
  transition: all 0.2s ease !important;
}

.whisper-chat-input-field:focus-within {
  background: white !important;
  border-color: #3b82f6 !important;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
}

/* 文本输入框 */
.whisper-chat-text-input {
  width: 100% !important;
  min-height: 40px !important;
  max-height: 120px !important;
  padding: 10px 16px !important;
  border: none !important;
  background: transparent !important;
  color: #374151 !important;
  font-size: 14px !important;
  line-height: 1.5 !important;
  resize: none !important;
  outline: none !important;
  font-family: inherit !important;
}

.whisper-chat-text-input::placeholder {
  color: transparent !important;
}

.whisper-chat-text-input:disabled {
  color: #9ca3af !important;
  cursor: not-allowed !important;
}

/* 输入框占位符 */
.whisper-chat-input-placeholder {
  position: absolute !important;
  top: 10px !important;
  left: 16px !important;
  color: #9ca3af !important;
  font-size: 14px !important;
  pointer-events: none !important;
  transition: all 0.2s ease !important;
}

.whisper-chat-input-field:focus-within .whisper-chat-input-placeholder {
  transform: translateY(-8px) scale(0.85) !important;
  color: #3b82f6 !important;
}

/* 发送按钮 */
.whisper-chat-send-button {
  width: 40px !important;
  height: 40px !important;
  border: none !important;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%) !important;
  color: white !important;
  border-radius: 12px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  cursor: pointer !important;
  transition: all 0.2s ease !important;
  flex-shrink: 0 !important;
}

.whisper-chat-send-button:hover {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%) !important;
  transform: scale(1.05) !important;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3) !important;
}

.whisper-chat-send-button:disabled {
  background: #d1d5db !important;
  cursor: not-allowed !important;
  transform: none !important;
  box-shadow: none !important;
}

/* 发送按钮加载状态 */
.whisper-chat-spinner-small {
  width: 16px !important;
  height: 16px !important;
  border: 2px solid rgba(255, 255, 255, 0.3) !important;
  border-top-color: white !important;
  border-radius: 50% !important;
  animation: spin 1s linear infinite !important;
}

/* 表情符号选择器 */
.whisper-chat-emoji-picker {
  position: absolute !important;
  bottom: 100% !important;
  left: 20px !important;
  right: 20px !important;
  background: white !important;
  border: 1px solid #e5e7eb !important;
  border-radius: 16px !important;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
  z-index: 10 !important;
  max-height: 300px !important;
  overflow: hidden !important;
}

.whisper-chat-emoji-header {
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  padding: 16px 20px !important;
  border-bottom: 1px solid #e5e7eb !important;
  background: #f9fafb !important;
  border-top-left-radius: 16px !important;
  border-top-right-radius: 16px !important;
}

.whisper-chat-emoji-title {
  font-size: 14px !important;
  font-weight: 600 !important;
  color: #374151 !important;
}

.whisper-chat-emoji-close {
  width: 24px !important;
  height: 24px !important;
  border: none !important;
  background: none !important;
  color: #6b7280 !important;
  cursor: pointer !important;
  border-radius: 4px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  transition: all 0.2s ease !important;
}

.whisper-chat-emoji-close:hover {
  background: #e5e7eb !important;
  color: #374151 !important;
}

.whisper-chat-emoji-grid {
  display: grid !important;
  grid-template-columns: repeat(8, 1fr) !important;
  gap: 4px !important;
  padding: 16px !important;
  max-height: 200px !important;
  overflow-y: auto !important;
}

.whisper-chat-emoji-item {
  width: 32px !important;
  height: 32px !important;
  border: none !important;
  background: none !important;
  font-size: 18px !important;
  cursor: pointer !important;
  border-radius: 6px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  transition: all 0.2s ease !important;
}

.whisper-chat-emoji-item:hover {
  background: #f3f4f6 !important;
  transform: scale(1.2) !important;
}

/* 隐藏文件输入 */
.hidden {
  position: absolute !important;
  width: 1px !important;
  height: 1px !important;
  padding: 0 !important;
  margin: -1px !important;
  overflow: hidden !important;
  clip: rect(0, 0, 0, 0) !important;
  white-space: nowrap !important;
  border: 0 !important;
}

/* 暗色主题适配 */
.whisper-chat-input-container--dark {
  background: #1f2937 !important;
  border-top-color: #374151 !important;
}

.whisper-chat-input-container--dark .whisper-chat-file-preview {
  background: #111827 !important;
  border-bottom-color: #374151 !important;
}

.whisper-chat-input-container--dark .whisper-chat-file-preview-content {
  background: #374151 !important;
  border-color: #4b5563 !important;
}

.whisper-chat-input-container--dark .whisper-chat-file-name {
  color: white !important;
}

.whisper-chat-input-container--dark .whisper-chat-file-size {
  color: #d1d5db !important;
}

.whisper-chat-input-container--dark .whisper-chat-attach-button,
.whisper-chat-input-container--dark .whisper-chat-emoji-button {
  background: #374151 !important;
  color: #d1d5db !important;
}

.whisper-chat-input-container--dark .whisper-chat-attach-button:hover,
.whisper-chat-input-container--dark .whisper-chat-emoji-button:hover {
  background: #4b5563 !important;
  color: white !important;
}

.whisper-chat-input-container--dark .whisper-chat-input-field {
  background: #374151 !important;
  border-color: #4b5563 !important;
}

.whisper-chat-input-container--dark .whisper-chat-input-field:focus-within {
  background: #374151 !important;
  border-color: #3b82f6 !important;
}

.whisper-chat-input-container--dark .whisper-chat-text-input {
  color: white !important;
}

.whisper-chat-input-container--dark .whisper-chat-input-placeholder {
  color: #9ca3af !important;
}

.whisper-chat-input-container--dark .whisper-chat-emoji-picker {
  background: #374151 !important;
  border-color: #4b5563 !important;
}

.whisper-chat-input-container--dark .whisper-chat-emoji-header {
  background: #1f2937 !important;
  border-bottom-color: #4b5563 !important;
}

.whisper-chat-input-container--dark .whisper-chat-emoji-title {
  color: white !important;
}

.whisper-chat-input-container--dark .whisper-chat-emoji-close {
  color: #d1d5db !important;
}

.whisper-chat-input-container--dark .whisper-chat-emoji-close:hover {
  background: #4b5563 !important;
  color: white !important;
}

.whisper-chat-input-container--dark .whisper-chat-emoji-item:hover {
  background: #4b5563 !important;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .whisper-chat-input-wrapper {
    padding: 12px 16px !important;
    gap: 6px !important;
  }

  .whisper-chat-attach-button,
  .whisper-chat-emoji-button,
  .whisper-chat-send-button {
    width: 36px !important;
    height: 36px !important;
  }

  .whisper-chat-text-input {
    font-size: 16px !important; /* 防止 iOS 缩放 */
  }

  .whisper-chat-emoji-picker {
    left: 16px !important;
    right: 16px !important;
  }

  .whisper-chat-emoji-grid {
    grid-template-columns: repeat(6, 1fr) !important;
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
