'use client'

import React from 'react'
import { X, Minimize2, Wifi, WifiOff, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

import { type ChatConnectionState } from '@/hooks/useChatWebSocket'
import { ConnectionStatus, ConnectionDot } from './ConnectionStatus'

export interface ChatHeaderProps {
  onMinimize: () => void
  onClose: () => void
  connectionStatus: ChatConnectionState
  isMinimized?: boolean
  theme: {
    primary: string
    secondary: string
    background: string
  }
  title?: string
  subtitle?: string
  className?: string
}

/**
 * 聊天窗口头部组件
 * 包含标题、连接状态、最小化和关闭按钮
 */
export function ChatHeader({
  onMinimize,
  onClose,
  connectionStatus,
  isMinimized = false,
  theme,
  title = '智能客服',
  subtitle = '我们将竭诚为您服务',
  className
}: ChatHeaderProps) {
  // 获取连接状态信息
  const getConnectionInfo = () => {
    switch (connectionStatus) {
      case 'connected':
        return {
          icon: <Wifi size={14} className="text-green-500" />,
          text: '在线',
          color: 'text-green-500'
        }
      case 'connecting':
        return {
          icon: <div className="w-3 h-3 border border-yellow-500 border-t-transparent rounded-full animate-spin" />,
          text: '连接中',
          color: 'text-yellow-500'
        }
      case 'disconnected':
        return {
          icon: <WifiOff size={14} className="text-red-500" />,
          text: '离线',
          color: 'text-red-500'
        }
      default:
        return {
          icon: <AlertCircle size={14} className="text-gray-500" />,
          text: '未知',
          color: 'text-gray-500'
        }
    }
  }

  const connectionInfo = getConnectionInfo()

  return (
    <div 
      className={cn(
        'flex items-center justify-between p-4 border-b border-gray-200',
        className
      )}
      style={{ backgroundColor: theme.primary }}
    >
      {/* 左侧：头像和信息 */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* 客服头像 */}
        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
          <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
            <span className="text-xs font-medium" style={{ color: theme.primary }}>
              客
            </span>
          </div>
        </div>

        {/* 标题和状态信息 */}
        {!isMinimized && (
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-white font-medium text-sm truncate">
                {title}
              </h3>
              {/* 连接状态指示器 */}
              <div className="flex items-center gap-1">
                {connectionInfo.icon}
              </div>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-white/80 text-xs truncate">
                {subtitle}
              </p>
              <ConnectionStatus
                status={connectionStatus}
                className="bg-white/10 border-white/20 text-white text-xs"
              />
            </div>
          </div>
        )}
      </div>

      {/* 右侧：操作按钮 */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {/* 最小化按钮 */}
        {!isMinimized && (
          <button
            onClick={onMinimize}
            className="w-8 h-8 flex items-center justify-center rounded-md text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            title="最小化"
          >
            <Minimize2 size={16} />
          </button>
        )}

        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-md text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          title="关闭"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  )
}

/**
 * 简化版头部组件（用于最小化状态）
 */
export function ChatHeaderMinimized({
  onRestore,
  onClose,
  connectionStatus,
  theme,
  className
}: {
  onRestore: () => void
  onClose: () => void
  connectionStatus: ChatConnectionState
  theme: { primary: string; secondary: string; background: string }
  className?: string
}) {
  const connectionInfo = (() => {
    switch (connectionStatus) {
      case 'connected':
        return { color: 'bg-green-500' }
      case 'connecting':
        return { color: 'bg-yellow-500' }
      case 'disconnected':
        return { color: 'bg-red-500' }
      default:
        return { color: 'bg-gray-500' }
    }
  })()

  return (
    <div 
      className={cn(
        'flex items-center justify-between p-2 rounded-lg cursor-pointer',
        className
      )}
      style={{ backgroundColor: theme.primary }}
      onClick={onRestore}
    >
      {/* 客服头像和状态指示器 */}
      <div className="relative">
        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
          <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
            <span className="text-xs font-medium" style={{ color: theme.primary }}>
              客
            </span>
          </div>
        </div>
        {/* 连接状态指示点 */}
        <div 
          className={cn('absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white', connectionInfo.color)}
        />
      </div>

      {/* 关闭按钮 */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          onClose()
        }}
        className="w-6 h-6 flex items-center justify-center rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
        title="关闭"
      >
        <X size={12} />
      </button>
    </div>
  )
}

/**
 * 头部加载骨架屏组件
 */
export function ChatHeaderSkeleton() {
  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-100 animate-pulse">
      <div className="flex items-center gap-3 flex-1">
        <div className="w-10 h-10 bg-gray-200 rounded-full" />
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-20 mb-1" />
          <div className="h-3 bg-gray-200 rounded w-16" />
        </div>
      </div>
      <div className="flex items-center gap-1">
        <div className="w-8 h-8 bg-gray-200 rounded-md" />
        <div className="w-8 h-8 bg-gray-200 rounded-md" />
      </div>
    </div>
  )
}
