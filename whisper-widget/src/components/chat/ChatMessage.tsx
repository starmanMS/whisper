'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Check, CheckCheck, AlertCircle, Bot, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Message } from './ChatWidget'
import { messageVariants, typingIndicatorVariants, typingDotVariants } from '@/config/animations'
import { useResponsive } from '@/hooks/useResponsive'

export interface ChatMessageProps {
  message: Message
  theme: {
    primary: string
    secondary: string
    background: string
  }
}

/**
 * 聊天消息组件
 * 支持用户消息、客服消息、系统消息的不同样式展示
 */
export function ChatMessage({ message, theme }: ChatMessageProps) {
  const isUser = message.type === 'user'
  const isAgent = message.type === 'agent'
  const isSystem = message.type === 'system'

  // 响应式Hook
  const { isMobile, getMessageMaxWidth, getFontSize } = useResponsive()

  // 格式化时间
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // 获取消息状态图标
  const getStatusIcon = () => {
    if (!isUser || !message.status) return null

    switch (message.status) {
      case 'sending':
        return <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin" />
      case 'sent':
        return <Check size={12} className="text-green-500" />
      case 'failed':
        return <AlertCircle size={12} className="text-red-500" />
      default:
        return null
    }
  }

  // 获取头像
  const getAvatar = () => {
    if (isUser) {
      return (
        <div 
          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
          style={{ backgroundColor: theme.primary }}
        >
          <User size={16} />
        </div>
      )
    }

    if (isAgent) {
      return (
        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
          <Bot size={16} className="text-gray-600" />
        </div>
      )
    }

    return null
  }

  // 系统消息样式
  if (isSystem) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex justify-center"
      >
        <div className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full max-w-xs text-center">
          {message.content}
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      variants={messageVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      custom={isUser}
      className={cn(
        'flex gap-2',
        isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
      )}
      style={{ maxWidth: getMessageMaxWidth() }}
    >
      {/* 头像 */}
      <div className="flex-shrink-0">
        {getAvatar()}
      </div>

      {/* 消息内容 */}
      <div className={cn('flex flex-col', isUser ? 'items-end' : 'items-start')}>
        {/* 消息气泡 */}
        <div
          className={cn(
            'px-3 py-2 rounded-lg break-words',
            isMobile ? 'max-w-[280px]' : 'max-w-xs',
            isUser
              ? 'text-white rounded-br-sm'
              : 'bg-white border border-gray-200 rounded-bl-sm text-gray-800'
          )}
          style={{
            backgroundColor: isUser ? theme.primary : undefined
          }}
        >
          <div className={cn(
            'leading-relaxed whitespace-pre-wrap',
            getFontSize()
          )}>
            {message.content}
          </div>
        </div>

        {/* 时间和状态 */}
        <div className={cn(
          'flex items-center gap-1 mt-1 text-xs text-gray-500',
          isUser ? 'flex-row-reverse' : ''
        )}>
          <span>{formatTime(message.timestamp)}</span>
          {getStatusIcon()}
        </div>
      </div>
    </motion.div>
  )
}

/**
 * 消息加载骨架屏组件
 */
export function ChatMessageSkeleton({ isUser = false }: { isUser?: boolean }) {
  return (
    <div className={cn(
      'flex gap-2 max-w-[85%] animate-pulse',
      isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
    )}>
      {/* 头像骨架 */}
      <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0" />
      
      {/* 消息骨架 */}
      <div className={cn('flex flex-col', isUser ? 'items-end' : 'items-start')}>
        <div className={cn(
          'px-3 py-2 rounded-lg',
          isUser ? 'bg-gray-300 rounded-br-sm' : 'bg-gray-200 rounded-bl-sm'
        )}>
          <div className="space-y-1">
            <div className="h-3 bg-gray-300 rounded w-20" />
            <div className="h-3 bg-gray-300 rounded w-16" />
          </div>
        </div>
        <div className="h-2 bg-gray-200 rounded w-12 mt-1" />
      </div>
    </div>
  )
}

/**
 * 打字指示器组件
 */
export function TypingIndicator({ theme }: { theme: { primary: string; secondary: string; background: string } }) {
  return (
    <motion.div
      variants={typingIndicatorVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="flex gap-2 max-w-[85%] mr-auto"
    >
      {/* 客服头像 */}
      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
        <Bot size={16} className="text-gray-600" />
      </div>

      {/* 打字动画 */}
      <div className="bg-white border border-gray-200 rounded-lg rounded-bl-sm px-3 py-2">
        <div className="flex space-x-1">
          <motion.div
            className="w-2 h-2 bg-gray-400 rounded-full"
            variants={typingDotVariants}
            initial="initial"
            animate="animate"
            style={{ animationDelay: '0s' }}
          />
          <motion.div
            className="w-2 h-2 bg-gray-400 rounded-full"
            variants={typingDotVariants}
            initial="initial"
            animate="animate"
            style={{ animationDelay: '0.1s' }}
          />
          <motion.div
            className="w-2 h-2 bg-gray-400 rounded-full"
            variants={typingDotVariants}
            initial="initial"
            animate="animate"
            style={{ animationDelay: '0.2s' }}
          />
        </div>
      </div>
    </motion.div>
  )
}
