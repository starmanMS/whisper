'use client'

import { useState, useEffect } from 'react'
import { BREAKPOINTS } from '@/config/widget.config'

// 屏幕尺寸类型
export type ScreenSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'

// 设备类型
export type DeviceType = 'mobile' | 'tablet' | 'desktop'

/**
 * 响应式Hook
 * 提供屏幕尺寸检测、设备类型判断等功能
 */
export function useResponsive() {
  const [screenSize, setScreenSize] = useState<ScreenSize>('lg')
  const [deviceType, setDeviceType] = useState<DeviceType>('desktop')
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768
  })
  const [isClient, setIsClient] = useState(false)

  // 获取当前屏幕尺寸
  const getCurrentScreenSize = (width: number): ScreenSize => {
    if (width >= BREAKPOINTS['2xl']) return '2xl'
    if (width >= BREAKPOINTS.xl) return 'xl'
    if (width >= BREAKPOINTS.lg) return 'lg'
    if (width >= BREAKPOINTS.md) return 'md'
    if (width >= BREAKPOINTS.sm) return 'sm'
    return 'xs'
  }

  // 获取设备类型
  const getDeviceType = (width: number): DeviceType => {
    if (width < BREAKPOINTS.md) return 'mobile'
    if (width < BREAKPOINTS.lg) return 'tablet'
    return 'desktop'
  }

  // 更新尺寸信息
  const updateSize = () => {
    if (typeof window !== 'undefined') {
      const width = window.innerWidth
      const height = window.innerHeight
      
      setWindowSize({ width, height })
      setScreenSize(getCurrentScreenSize(width))
      setDeviceType(getDeviceType(width))
    }
  }

  useEffect(() => {
    // 标记为客户端
    setIsClient(true)

    // 初始化
    updateSize()

    // 监听窗口大小变化
    const handleResize = () => {
      updateSize()
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize)

      // 清理事件监听器
      return () => {
        window.removeEventListener('resize', handleResize)
      }
    }
  }, [])

  // 检查是否为指定屏幕尺寸或更大
  const isScreenSizeOrLarger = (size: ScreenSize): boolean => {
    const sizeOrder: ScreenSize[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl']
    const currentIndex = sizeOrder.indexOf(screenSize)
    const targetIndex = sizeOrder.indexOf(size)
    return currentIndex >= targetIndex
  }

  // 检查是否为指定屏幕尺寸或更小
  const isScreenSizeOrSmaller = (size: ScreenSize): boolean => {
    const sizeOrder: ScreenSize[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl']
    const currentIndex = sizeOrder.indexOf(screenSize)
    const targetIndex = sizeOrder.indexOf(size)
    return currentIndex <= targetIndex
  }

  // 检查是否为移动设备
  const isMobile = deviceType === 'mobile'
  
  // 检查是否为平板设备
  const isTablet = deviceType === 'tablet'
  
  // 检查是否为桌面设备
  const isDesktop = deviceType === 'desktop'

  // 检查是否为小屏设备（手机和平板）
  const isSmallScreen = deviceType === 'mobile' || deviceType === 'tablet'

  // 获取聊天窗口的响应式样式
  const getChatWindowStyles = () => {
    if (isMobile) {
      return {
        position: 'fixed' as const,
        top: '1rem',
        left: '1rem',
        right: '1rem',
        bottom: '1rem',
        width: 'auto',
        height: 'auto',
        maxWidth: 'none',
        maxHeight: 'none'
      }
    }

    if (isTablet) {
      return {
        position: 'fixed' as const,
        bottom: '1rem',
        right: '1rem',
        width: '400px',
        height: '500px',
        maxWidth: 'calc(100vw - 2rem)',
        maxHeight: 'calc(100vh - 2rem)'
      }
    }

    // 桌面设备
    return {
      position: 'fixed' as const,
      bottom: '1rem',
      right: '1rem',
      width: '384px',
      height: '512px',
      maxWidth: 'none',
      maxHeight: 'none'
    }
  }

  // 获取浮动按钮的响应式样式
  const getFloatingButtonStyles = () => {
    if (isMobile) {
      return {
        position: 'fixed' as const,
        bottom: '1rem',
        right: '1rem',
        width: '56px',
        height: '56px'
      }
    }

    return {
      position: 'fixed' as const,
      bottom: '1rem',
      right: '1rem',
      width: '56px',
      height: '56px'
    }
  }

  // 获取消息气泡的最大宽度
  const getMessageMaxWidth = () => {
    if (isMobile) return '90%'
    if (isTablet) return '85%'
    return '80%'
  }

  // 获取字体大小
  const getFontSize = () => {
    if (isMobile) return 'text-sm'
    return 'text-base'
  }

  // 获取间距大小
  const getSpacing = () => {
    if (isMobile) return 'p-3'
    return 'p-4'
  }

  // 检查是否支持触摸
  const isTouchDevice = () => {
    if (typeof window === 'undefined') return false
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0
  }

  // 检查是否为横屏
  const isLandscape = windowSize.width > windowSize.height

  // 检查是否为竖屏
  const isPortrait = windowSize.height > windowSize.width

  // 获取安全区域内边距（用于处理刘海屏等）
  const getSafeAreaInsets = () => {
    if (typeof window === 'undefined') return { top: 0, bottom: 0, left: 0, right: 0 }
    
    const style = getComputedStyle(document.documentElement)
    return {
      top: parseInt(style.getPropertyValue('--safe-area-inset-top') || '0'),
      bottom: parseInt(style.getPropertyValue('--safe-area-inset-bottom') || '0'),
      left: parseInt(style.getPropertyValue('--safe-area-inset-left') || '0'),
      right: parseInt(style.getPropertyValue('--safe-area-inset-right') || '0')
    }
  }

  return {
    // 基础信息
    screenSize,
    deviceType,
    windowSize,
    
    // 设备类型检查
    isMobile,
    isTablet,
    isDesktop,
    isSmallScreen,
    
    // 屏幕尺寸检查
    isScreenSizeOrLarger,
    isScreenSizeOrSmaller,
    
    // 方向检查
    isLandscape,
    isPortrait,
    
    // 触摸支持
    isTouchDevice: isTouchDevice(),
    
    // 样式获取函数
    getChatWindowStyles,
    getFloatingButtonStyles,
    getMessageMaxWidth,
    getFontSize,
    getSpacing,
    getSafeAreaInsets,
    
    // 断点检查
    breakpoints: {
      xs: screenSize === 'xs',
      sm: screenSize === 'sm',
      md: screenSize === 'md',
      lg: screenSize === 'lg',
      xl: screenSize === 'xl',
      '2xl': screenSize === '2xl'
    }
  }
}

/**
 * 媒体查询Hook
 * 用于检查特定的媒体查询条件
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia(query)
    setMatches(mediaQuery.matches)

    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [query])

  return matches
}

/**
 * 视口尺寸Hook
 * 提供视口宽度和高度信息
 */
export function useViewport() {
  const [viewport, setViewport] = useState({
    width: 0,
    height: 0
  })

  useEffect(() => {
    const updateViewport = () => {
      if (typeof window !== 'undefined') {
        setViewport({
          width: window.innerWidth,
          height: window.innerHeight
        })
      }
    }

    updateViewport()
    window.addEventListener('resize', updateViewport)
    
    return () => {
      window.removeEventListener('resize', updateViewport)
    }
  }, [])

  return viewport
}
