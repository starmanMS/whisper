'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Wifi, WifiOff, AlertCircle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { type ChatConnectionState } from '@/hooks/useChatWebSocket'

interface ConnectionStatusProps {
  status: ChatConnectionState
  reconnectAttempts?: number
  maxReconnectAttempts?: number
  className?: string
}

/**
 * WebSocket连接状态指示器组件
 */
export function ConnectionStatus({ 
  status, 
  reconnectAttempts = 0, 
  maxReconnectAttempts = 5,
  className 
}: ConnectionStatusProps) {
  const getStatusInfo = () => {
    switch (status) {
      case 'connected':
        return {
          icon: <Wifi size={14} className="text-green-500" />,
          text: '已连接',
          color: 'text-green-500',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200'
        }
      case 'connecting':
        return {
          icon: <Loader2 size={14} className="text-blue-500 animate-spin" />,
          text: reconnectAttempts > 0 ? `重连中 (${reconnectAttempts}/${maxReconnectAttempts})` : '连接中',
          color: 'text-blue-500',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200'
        }
      case 'disconnected':
        return {
          icon: <WifiOff size={14} className="text-red-500" />,
          text: reconnectAttempts >= maxReconnectAttempts ? '连接失败' : '已断开',
          color: 'text-red-500',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200'
        }
      default:
        return {
          icon: <AlertCircle size={14} className="text-gray-500" />,
          text: '未知状态',
          color: 'text-gray-500',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200'
        }
    }
  }

  const statusInfo = getStatusInfo()

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        'inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium border',
        statusInfo.bgColor,
        statusInfo.borderColor,
        statusInfo.color,
        className
      )}
    >
      <motion.div
        animate={status === 'connecting' ? { rotate: 360 } : {}}
        transition={{ duration: 1, repeat: status === 'connecting' ? Infinity : 0, ease: 'linear' }}
      >
        {statusInfo.icon}
      </motion.div>
      <span>{statusInfo.text}</span>
    </motion.div>
  )
}

/**
 * 简化的连接状态点指示器
 */
export function ConnectionDot({ 
  status, 
  className 
}: { 
  status: ChatConnectionState
  className?: string 
}) {
  const getColor = () => {
    switch (status) {
      case 'connected':
        return 'bg-green-500'
      case 'connecting':
        return 'bg-blue-500'
      case 'disconnected':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  return (
    <motion.div
      className={cn(
        'w-2 h-2 rounded-full',
        getColor(),
        className
      )}
      animate={status === 'connecting' ? { opacity: [1, 0.3, 1] } : {}}
      transition={{ duration: 1, repeat: status === 'connecting' ? Infinity : 0 }}
    />
  )
}
