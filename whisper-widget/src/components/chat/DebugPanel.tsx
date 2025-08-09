'use client'

import React from 'react'
import { type ChatConnectionState } from '@/hooks/useChatWebSocket'

interface DebugPanelProps {
  isOpen: boolean
  sessionData: any
  connectionState: ChatConnectionState
  isConnected: boolean
  userId: string
  websocketUrl: string
}

/**
 * 调试面板组件 - 仅在开发环境显示
 */
export function DebugPanel({
  isOpen,
  sessionData,
  connectionState,
  isConnected,
  userId,
  websocketUrl
}: DebugPanelProps) {
  // 只在开发环境显示
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="fixed top-4 left-4 z-50 bg-black/80 text-white p-4 rounded-lg text-xs font-mono max-w-sm">
      <div className="text-yellow-400 font-bold mb-2">🐛 WebSocket Debug</div>
      
      <div className="space-y-1">
        <div>
          <span className="text-gray-400">Widget Open:</span>{' '}
          <span className={isOpen ? 'text-green-400' : 'text-red-400'}>
            {isOpen ? '✅ true' : '❌ false'}
          </span>
        </div>
        
        <div>
          <span className="text-gray-400">Session Data:</span>{' '}
          <span className={sessionData ? 'text-green-400' : 'text-red-400'}>
            {sessionData ? '✅ exists' : '❌ null'}
          </span>
        </div>
        
        <div>
          <span className="text-gray-400">Connection State:</span>{' '}
          <span className={
            connectionState === 'connected' ? 'text-green-400' :
            connectionState === 'connecting' ? 'text-yellow-400' :
            'text-red-400'
          }>
            {connectionState}
          </span>
        </div>
        
        <div>
          <span className="text-gray-400">Is Connected:</span>{' '}
          <span className={isConnected ? 'text-green-400' : 'text-red-400'}>
            {isConnected ? '✅ true' : '❌ false'}
          </span>
        </div>
        
        <div>
          <span className="text-gray-400">User ID:</span>{' '}
          <span className="text-blue-400">{userId}</span>
        </div>
        
        <div>
          <span className="text-gray-400">WebSocket URL:</span>{' '}
          <span className="text-blue-400 break-all">{websocketUrl}</span>
        </div>
        
        {sessionData && (
          <div>
            <span className="text-gray-400">Conversation ID:</span>{' '}
            <span className="text-green-400">{sessionData.conversationId}</span>
          </div>
        )}
      </div>
      
      <div className="mt-2 pt-2 border-t border-gray-600 text-gray-400 text-xs">
        Expected: Widget Open + Session Data → WebSocket Connected
      </div>
    </div>
  )
}
