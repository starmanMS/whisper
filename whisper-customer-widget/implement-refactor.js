#!/usr/bin/env node

/**
 * Whisper Chat Widget - LiveChat 风格重构实施脚本
 * 
 * 此脚本将帮助您将新重构的组件集成到现有项目中
 * 
 * 使用方法：
 * node implement-refactor.js
 */

const fs = require('fs');
const path = require('path');

// 配置
const CONFIG = {
  // 组件文件映射
  components: [
    {
      old: 'src/components/ChatButton.vue',
      new: 'src/components/ChatButton-new.vue',
      backup: 'src/components/ChatButton-backup.vue'
    },
    {
      old: 'src/components/ChatDialog.vue',
      new: 'src/components/ChatDialog-new.vue',
      backup: 'src/components/ChatDialog-backup.vue'
    },
    {
      old: 'src/components/MessageList.vue',
      new: 'src/components/MessageList-new.vue',
      backup: 'src/components/MessageList-backup.vue'
    },
    {
      old: 'src/components/MessageInput.vue',
      new: 'src/components/MessageInput-new.vue',
      backup: 'src/components/MessageInput-backup.vue'
    }
  ],
  
  // 需要创建的新文件
  newFiles: [
    {
      path: 'src/styles/design-system.css',
      content: `/* Whisper Chat Widget - 设计系统变量 */
:root {
  /* 主色调 */
  --whisper-primary-50: #eff6ff;
  --whisper-primary-100: #dbeafe;
  --whisper-primary-200: #bfdbfe;
  --whisper-primary-300: #93c5fd;
  --whisper-primary-400: #60a5fa;
  --whisper-primary-500: #3b82f6;
  --whisper-primary-600: #2563eb;
  --whisper-primary-700: #1d4ed8;
  --whisper-primary-800: #1e40af;
  --whisper-primary-900: #1e3a8a;

  /* 中性色 */
  --whisper-gray-50: #f9fafb;
  --whisper-gray-100: #f3f4f6;
  --whisper-gray-200: #e5e7eb;
  --whisper-gray-300: #d1d5db;
  --whisper-gray-400: #9ca3af;
  --whisper-gray-500: #6b7280;
  --whisper-gray-600: #4b5563;
  --whisper-gray-700: #374151;
  --whisper-gray-800: #1f2937;
  --whisper-gray-900: #111827;

  /* 功能色 */
  --whisper-success-500: #10b981;
  --whisper-warning-500: #f59e0b;
  --whisper-error-500: #ef4444;

  /* 阴影 */
  --whisper-shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --whisper-shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --whisper-shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
  --whisper-shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1);

  /* 圆角 */
  --whisper-radius-sm: 0.375rem;
  --whisper-radius-md: 0.5rem;
  --whisper-radius-lg: 0.75rem;
  --whisper-radius-xl: 1rem;
  --whisper-radius-full: 9999px;

  /* 间距 */
  --whisper-spacing-xs: 0.25rem;
  --whisper-spacing-sm: 0.5rem;
  --whisper-spacing-md: 0.75rem;
  --whisper-spacing-lg: 1rem;
  --whisper-spacing-xl: 1.5rem;
  --whisper-spacing-2xl: 2rem;

  /* 字体 */
  --whisper-font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
  --whisper-font-size-xs: 0.75rem;
  --whisper-font-size-sm: 0.875rem;
  --whisper-font-size-base: 1rem;
  --whisper-font-size-lg: 1.125rem;
  --whisper-font-size-xl: 1.25rem;
  --whisper-font-weight-normal: 400;
  --whisper-font-weight-medium: 500;
  --whisper-font-weight-semibold: 600;
  --whisper-font-weight-bold: 700;
}

/* 全局重置 */
.whisper-chat-widget * {
  box-sizing: border-box;
}

/* 动画定义 */
@keyframes whisper-spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes whisper-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes whisper-bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-25%); }
}

@keyframes whisper-fade-in {
  0% { opacity: 0; }
  100% { opacity: 1; }
}

@keyframes whisper-slide-up {
  0% { transform: translateY(100%); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}

@keyframes whisper-scale-in {
  0% { transform: scale(0.8); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}`
    }
  ]
};

// 工具函数
function log(message, type = 'info') {
  const colors = {
    info: '\x1b[36m',    // 青色
    success: '\x1b[32m', // 绿色
    warning: '\x1b[33m', // 黄色
    error: '\x1b[31m',   // 红色
    reset: '\x1b[0m'     // 重置
  };
  
  console.log(`${colors[type]}${message}${colors.reset}`);
}

function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (error) {
    return false;
  }
}

function createBackup(filePath, backupPath) {
  try {
    if (fileExists(filePath)) {
      fs.copyFileSync(filePath, backupPath);
      log(`✅ 已备份: ${filePath} -> ${backupPath}`, 'success');
      return true;
    }
    return false;
  } catch (error) {
    log(`❌ 备份失败: ${error.message}`, 'error');
    return false;
  }
}

function replaceComponent(oldPath, newPath) {
  try {
    if (fileExists(newPath)) {
      fs.copyFileSync(newPath, oldPath);
      log(`✅ 已替换: ${oldPath}`, 'success');
      return true;
    } else {
      log(`❌ 新组件文件不存在: ${newPath}`, 'error');
      return false;
    }
  } catch (error) {
    log(`❌ 替换失败: ${error.message}`, 'error');
    return false;
  }
}

function createNewFile(filePath, content) {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(filePath, content, 'utf8');
    log(`✅ 已创建: ${filePath}`, 'success');
    return true;
  } catch (error) {
    log(`❌ 创建文件失败: ${error.message}`, 'error');
    return false;
  }
}

function updateMainJS() {
  const mainJSPath = 'src/main.js';
  
  try {
    if (!fileExists(mainJSPath)) {
      log(`❌ 主文件不存在: ${mainJSPath}`, 'error');
      return false;
    }
    
    let content = fs.readFileSync(mainJSPath, 'utf8');
    
    // 添加设计系统样式导入
    if (!content.includes('design-system.css')) {
      const importLine = "import './styles/design-system.css'\n";
      content = importLine + content;
      
      fs.writeFileSync(mainJSPath, content, 'utf8');
      log(`✅ 已更新 ${mainJSPath}，添加设计系统样式导入`, 'success');
    }
    
    return true;
  } catch (error) {
    log(`❌ 更新主文件失败: ${error.message}`, 'error');
    return false;
  }
}

// 主要实施函数
async function implementRefactor() {
  log('🚀 开始实施 Whisper Chat Widget LiveChat 风格重构...', 'info');
  log('', 'info');
  
  let successCount = 0;
  let totalTasks = CONFIG.components.length + CONFIG.newFiles.length + 1; // +1 for main.js update
  
  // 1. 备份和替换组件
  log('📦 第一步：备份原组件并替换为新组件', 'info');
  for (const component of CONFIG.components) {
    log(`处理组件: ${component.old}`, 'info');
    
    // 创建备份
    if (createBackup(component.old, component.backup)) {
      // 替换组件
      if (replaceComponent(component.old, component.new)) {
        successCount++;
      }
    }
  }
  
  log('', 'info');
  
  // 2. 创建新文件
  log('📁 第二步：创建新的样式文件', 'info');
  for (const file of CONFIG.newFiles) {
    if (createNewFile(file.path, file.content)) {
      successCount++;
    }
  }
  
  log('', 'info');
  
  // 3. 更新主文件
  log('🔧 第三步：更新主文件', 'info');
  if (updateMainJS()) {
    successCount++;
  }
  
  log('', 'info');
  
  // 4. 总结
  log('📊 实施结果总结:', 'info');
  log(`✅ 成功完成: ${successCount}/${totalTasks} 个任务`, successCount === totalTasks ? 'success' : 'warning');
  
  if (successCount === totalTasks) {
    log('', 'info');
    log('🎉 重构实施完成！', 'success');
    log('', 'info');
    log('📋 下一步操作建议:', 'info');
    log('1. 运行 npm run dev 启动开发服务器', 'info');
    log('2. 测试所有组件功能是否正常', 'info');
    log('3. 检查样式是否符合预期', 'info');
    log('4. 如有问题，可以从备份文件恢复', 'info');
    log('', 'info');
    log('🔄 恢复备份的命令:', 'info');
    CONFIG.components.forEach(component => {
      log(`   cp ${component.backup} ${component.old}`, 'info');
    });
  } else {
    log('', 'info');
    log('⚠️  部分任务未成功完成，请检查错误信息并手动处理', 'warning');
  }
}

// 检查环境
function checkEnvironment() {
  log('🔍 检查项目环境...', 'info');
  
  // 检查是否在正确的目录
  if (!fileExists('package.json')) {
    log('❌ 未找到 package.json，请确保在项目根目录运行此脚本', 'error');
    process.exit(1);
  }
  
  // 检查是否存在 src 目录
  if (!fileExists('src')) {
    log('❌ 未找到 src 目录，请确保项目结构正确', 'error');
    process.exit(1);
  }
  
  // 检查新组件文件是否存在
  let missingFiles = [];
  CONFIG.components.forEach(component => {
    if (!fileExists(component.new)) {
      missingFiles.push(component.new);
    }
  });
  
  if (missingFiles.length > 0) {
    log('❌ 以下新组件文件不存在:', 'error');
    missingFiles.forEach(file => log(`   ${file}`, 'error'));
    log('请确保已完成组件重构工作', 'error');
    process.exit(1);
  }
  
  log('✅ 环境检查通过', 'success');
  log('', 'info');
}

// 主程序入口
async function main() {
  try {
    checkEnvironment();
    await implementRefactor();
  } catch (error) {
    log(`❌ 执行过程中发生错误: ${error.message}`, 'error');
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = {
  implementRefactor,
  checkEnvironment,
  CONFIG
};
