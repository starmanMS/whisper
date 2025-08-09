/**
 * 聊天相关工具函数
 */

import { Message } from '@/components/chat/ChatWidget'

// 消息ID生成器
export function generateMessageId(prefix: string = 'msg'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// 格式化时间
export function formatTime(date: Date): string {
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 格式化日期
export function formatDate(date: Date): string {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  
  const diffTime = today.getTime() - messageDate.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) {
    return '今天'
  } else if (diffDays === 1) {
    return '昨天'
  } else if (diffDays <= 7) {
    return `${diffDays}天前`
  } else {
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }
}

// 格式化完整时间
export function formatFullTime(date: Date): string {
  const dateStr = formatDate(date)
  const timeStr = formatTime(date)
  return `${dateStr} ${timeStr}`
}

// 检查是否为同一天
export function isSameDay(date1: Date, date2: Date): boolean {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate()
}

// 消息分组（按日期）
export function groupMessagesByDate(messages: Message[]): Array<{
  date: string
  messages: Message[]
}> {
  const groups: { [key: string]: Message[] } = {}
  
  messages.forEach(message => {
    const dateKey = formatDate(message.timestamp)
    if (!groups[dateKey]) {
      groups[dateKey] = []
    }
    groups[dateKey].push(message)
  })
  
  return Object.entries(groups).map(([date, messages]) => ({
    date,
    messages
  }))
}

// 文本处理
export function sanitizeMessage(content: string): string {
  // 移除危险的HTML标签
  return content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .trim()
}

// 检测URL
export function detectUrls(text: string): Array<{
  url: string
  start: number
  end: number
}> {
  const urlRegex = /(https?:\/\/[^\s]+)/g
  const urls: Array<{ url: string; start: number; end: number }> = []
  let match
  
  while ((match = urlRegex.exec(text)) !== null) {
    urls.push({
      url: match[1],
      start: match.index,
      end: match.index + match[1].length
    })
  }
  
  return urls
}

// 将文本中的URL转换为链接
export function linkifyText(text: string): string {
  const urls = detectUrls(text)
  if (urls.length === 0) return text
  
  let result = text
  let offset = 0
  
  urls.forEach(({ url, start, end }) => {
    const before = result.substring(0, start + offset)
    const after = result.substring(end + offset)
    const link = `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">${url}</a>`
    
    result = before + link + after
    offset += link.length - url.length
  })
  
  return result
}

// 文件大小格式化
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 检查文件类型
export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/')
}

export function isDocumentFile(file: File): boolean {
  const documentTypes = [
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
  return documentTypes.includes(file.type)
}

// 获取文件图标
export function getFileIcon(file: File): string {
  if (isImageFile(file)) return '🖼️'
  if (file.type === 'application/pdf') return '📄'
  if (file.type.includes('word')) return '📝'
  if (file.type.includes('excel') || file.type.includes('sheet')) return '📊'
  if (file.type === 'text/plain') return '📃'
  return '📎'
}

// 防抖函数
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// 节流函数
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

// 滚动到底部
export function scrollToBottom(element: HTMLElement, smooth: boolean = true): void {
  element.scrollTo({
    top: element.scrollHeight,
    behavior: smooth ? 'smooth' : 'auto'
  })
}

// 检查是否滚动到底部
export function isScrolledToBottom(element: HTMLElement, threshold: number = 50): boolean {
  return element.scrollHeight - element.scrollTop - element.clientHeight < threshold
}

// 复制文本到剪贴板
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    } else {
      // 降级方案
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      
      const success = document.execCommand('copy')
      document.body.removeChild(textArea)
      return success
    }
  } catch (error) {
    console.error('复制失败:', error)
    return false
  }
}

// 生成随机颜色
export function generateAvatarColor(name: string): string {
  const colors = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b',
    '#8b5cf6', '#06b6d4', '#84cc16', '#f97316',
    '#ec4899', '#6366f1', '#14b8a6', '#eab308'
  ]
  
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  
  return colors[Math.abs(hash) % colors.length]
}

// 获取用户名首字母
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// 消息搜索
export function searchMessages(messages: Message[], query: string): Message[] {
  if (!query.trim()) return messages
  
  const searchTerm = query.toLowerCase()
  return messages.filter(message =>
    message.content.toLowerCase().includes(searchTerm)
  )
}

// 高亮搜索结果
export function highlightSearchTerm(text: string, searchTerm: string): string {
  if (!searchTerm.trim()) return text
  
  const regex = new RegExp(`(${searchTerm})`, 'gi')
  return text.replace(regex, '<mark class="bg-yellow-200">$1</mark>')
}
