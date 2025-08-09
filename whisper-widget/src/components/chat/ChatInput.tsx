'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Send, Paperclip, Smile } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ChatInputProps {
  onSendMessage: (message: string) => void
  placeholder?: string
  disabled?: boolean
  maxLength?: number
  theme: {
    primary: string
    secondary: string
    background: string
  }
  className?: string
}

/**
 * 聊天输入框组件
 * 支持文本输入、发送按钮、快捷键等功能
 */
export function ChatInput({
  onSendMessage,
  placeholder = '请输入您的问题...',
  disabled = false,
  maxLength = 500,
  theme,
  className
}: ChatInputProps) {
  const [message, setMessage] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // 自动调整文本框高度
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      const scrollHeight = textarea.scrollHeight
      const maxHeight = 120 // 最大高度约5行
      textarea.style.height = Math.min(scrollHeight, maxHeight) + 'px'
    }
  }

  // 监听消息变化，自动调整高度
  useEffect(() => {
    adjustTextareaHeight()
  }, [message])

  // 处理发送消息
  const handleSendMessage = () => {
    const trimmedMessage = message.trim()
    if (trimmedMessage && !disabled) {
      onSendMessage(trimmedMessage)
      setMessage('')
      // 重置文本框高度
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    }
  }

  // 处理键盘事件
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // 处理输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    if (value.length <= maxLength) {
      setMessage(value)
    }
  }

  // 处理粘贴事件
  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const pastedText = e.clipboardData.getData('text')
    const currentLength = message.length
    const availableLength = maxLength - currentLength
    
    if (pastedText.length > availableLength) {
      e.preventDefault()
      const truncatedText = pastedText.substring(0, availableLength)
      setMessage(prev => prev + truncatedText)
    }
  }

  // 快捷回复选项
  const quickReplies = [
    '我想了解产品信息',
    '我遇到了技术问题',
    '我想咨询价格',
    '我需要售后服务'
  ]

  const handleQuickReply = (reply: string) => {
    onSendMessage(reply)
  }

  return (
    <div className={cn('border-t border-gray-200 bg-white', className)}>
      {/* 快捷回复（可选） */}
      {message.length === 0 && (
        <div className="px-4 py-2 border-b border-gray-100">
          <div className="flex flex-wrap gap-1">
            {quickReplies.slice(0, 2).map((reply, index) => (
              <button
                key={index}
                onClick={() => handleQuickReply(reply)}
                disabled={disabled}
                className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {reply}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 输入区域 */}
      <div className="p-4">
        <div className={cn(
          'flex items-end gap-2 p-2 border rounded-lg transition-colors',
          isFocused ? 'border-blue-300 bg-blue-50/30' : 'border-gray-200 bg-gray-50'
        )}>
          {/* 附件按钮（预留） */}
          <button
            type="button"
            disabled={disabled}
            className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="附件"
          >
            <Paperclip size={18} />
          </button>

          {/* 文本输入框 */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={placeholder}
              disabled={disabled}
              rows={1}
              className={cn(
                'w-full resize-none border-0 bg-transparent text-sm',
                'placeholder:text-gray-400 focus:outline-none',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
              style={{ 
                minHeight: '20px',
                maxHeight: '120px'
              }}
            />
            
            {/* 字符计数 */}
            {message.length > maxLength * 0.8 && (
              <div className="absolute -bottom-5 right-0 text-xs text-gray-400">
                {message.length}/{maxLength}
              </div>
            )}
          </div>

          {/* 表情按钮（预留） */}
          <button
            type="button"
            disabled={disabled}
            className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="表情"
          >
            <Smile size={18} />
          </button>

          {/* 发送按钮 */}
          <button
            type="button"
            onClick={handleSendMessage}
            disabled={disabled || !message.trim()}
            className={cn(
              'flex-shrink-0 p-2 rounded-md transition-all',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              message.trim() && !disabled
                ? 'text-white shadow-sm hover:shadow-md transform hover:scale-105'
                : 'text-gray-400 bg-gray-100'
            )}
            style={{
              backgroundColor: message.trim() && !disabled ? theme.primary : undefined
            }}
            title="发送 (Enter)"
          >
            <Send size={16} />
          </button>
        </div>

        {/* 提示文本 */}
        <div className="mt-2 text-xs text-gray-400 text-center">
          按 Enter 发送，Shift + Enter 换行
        </div>
      </div>
    </div>
  )
}

/**
 * 输入框加载状态组件
 */
export function ChatInputSkeleton() {
  return (
    <div className="border-t border-gray-200 bg-white p-4">
      <div className="flex items-end gap-2 p-2 border border-gray-200 rounded-lg bg-gray-50">
        <div className="w-5 h-5 bg-gray-200 rounded animate-pulse" />
        <div className="flex-1 h-5 bg-gray-200 rounded animate-pulse" />
        <div className="w-5 h-5 bg-gray-200 rounded animate-pulse" />
        <div className="w-8 h-8 bg-gray-200 rounded-md animate-pulse" />
      </div>
    </div>
  )
}
