import { ChatWidget } from '@/components/chat/ChatWidget'
import { ClientOnly } from '@/components/ClientOnly'
import { ErrorBoundary } from '@/components/ErrorBoundary'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* 页面头部 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Whisper 客服系统</h1>
              <span className="ml-3 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                Widget 演示
              </span>
            </div>
            <nav className="flex space-x-8">
              <a href="#" className="text-gray-500 hover:text-gray-900 transition-colors">
                产品介绍
              </a>
              <a href="#" className="text-gray-500 hover:text-gray-900 transition-colors">
                技术文档
              </a>
              <a href="#" className="text-gray-500 hover:text-gray-900 transition-colors">
                联系我们
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* 主要内容区域 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            智能客服 Widget 演示
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            基于若依框架开发的现代化客服系统，支持实时聊天、WebSocket通信、
            响应式设计等特性。点击右下角的聊天按钮开始体验。
          </p>
        </div>

        {/* 功能特性展示 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">实时聊天</h3>
            <p className="text-gray-600">
              支持WebSocket实时通信，消息即时送达，提供流畅的聊天体验。
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">响应式设计</h3>
            <p className="text-gray-600">
              适配各种设备屏幕，在桌面端、平板和手机上都有良好的显示效果。
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">动画效果</h3>
            <p className="text-gray-600">
              使用Framer Motion实现流畅的动画效果，提升用户交互体验。
            </p>
          </div>
        </div>

        {/* 技术栈介绍 */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">技术栈</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold text-lg">React</span>
              </div>
              <p className="text-sm text-gray-600">前端框架</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-black rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-white font-bold text-lg">Next.js</span>
              </div>
              <p className="text-sm text-gray-600">全栈框架</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-cyan-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-cyan-600 font-bold text-lg">Tailwind</span>
              </div>
              <p className="text-sm text-gray-600">CSS框架</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-pink-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-pink-600 font-bold text-lg">Framer</span>
              </div>
              <p className="text-sm text-gray-600">动画库</p>
            </div>
          </div>
        </div>
      </main>

      {/* 客服Widget */}
      <ErrorBoundary>
        <ClientOnly fallback={
          <div className="fixed bottom-4 right-4 z-50">
            <div className="w-14 h-14 rounded-full bg-gray-300 animate-pulse flex items-center justify-center">
              <div className="w-6 h-6 bg-gray-400 rounded"></div>
            </div>
          </div>
        }>
          <ChatWidget
            apiBaseUrl="http://localhost:8080/api/chat"
            websocketUrl="ws://localhost:8080"
            theme={{
              primary: '#4f46e5', // 使用Whisper主题色
              secondary: '#f8fafc',
              background: '#ffffff'
            }}
            config={{
              // 简化配置方式（向后兼容）
              welcomeMessage: '您好！欢迎使用Whisper智能客服系统，我是您的专属客服助手。有什么可以帮助您的吗？',
              placeholder: '请输入您的问题...',
              maxMessages: 100,

              // 或者使用完整配置方式
              messages: {
                welcome: '您好！欢迎使用Whisper智能客服系统，我是您的专属客服助手。有什么可以帮助您的吗？',
                placeholder: '请输入您的问题...',
                connecting: '正在连接客服...',
                offline: '客服暂时离线，请稍后再试'
              },

              // 连接设置
              reconnectAttempts: 3,
              reconnectInterval: 2000
            }}
          />
        </ClientOnly>
      </ErrorBoundary>
    </div>
  )
}
