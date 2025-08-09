/**
 * Whisper Chat Widget 消息发送诊断脚本
 * 在浏览器控制台运行此脚本来诊断消息发送问题
 */

class MessageSendingDiagnostic {
    constructor() {
        this.results = [];
        this.errors = [];
    }

    log(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = { timestamp, message, type };
        
        this.results.push(logEntry);
        
        const styles = {
            info: 'color: #17a2b8;',
            success: 'color: #28a745; font-weight: bold;',
            error: 'color: #dc3545; font-weight: bold;',
            warning: 'color: #ffc107; font-weight: bold;'
        };
        
        console.log(`%c[${timestamp}] ${message}`, styles[type] || styles.info);
    }

    // 检查1: Widget是否正确加载
    checkWidgetLoading() {
        this.log('=== 检查1: Widget加载状态 ===');
        
        if (typeof window.WhisperChat === 'undefined') {
            this.log('❌ WhisperChat对象未找到', 'error');
            this.errors.push('Widget脚本未正确加载');
            return false;
        }
        
        this.log('✅ WhisperChat对象已加载', 'success');
        
        // 检查必要的方法
        const requiredMethods = ['init', 'destroy'];
        for (const method of requiredMethods) {
            if (typeof window.WhisperChat[method] !== 'function') {
                this.log(`❌ 缺少方法: ${method}`, 'error');
                this.errors.push(`缺少必要方法: ${method}`);
                return false;
            }
        }
        
        this.log('✅ 必要方法检查通过', 'success');
        return true;
    }

    // 检查2: DOM元素是否存在
    checkDOMElements() {
        this.log('=== 检查2: DOM元素状态 ===');
        
        const elements = {
            'Widget容器': '.whisper-chat-widget',
            '聊天按钮': '.whisper-chat-button',
            '聊天对话框': '.whisper-chat-dialog',
            '消息输入框': '.whisper-chat-text-input',
            '发送按钮': '.whisper-chat-send-button'
        };
        
        let allFound = true;
        
        for (const [name, selector] of Object.entries(elements)) {
            const element = document.querySelector(selector);
            if (element) {
                this.log(`✅ ${name}: 已找到`, 'success');
                
                // 检查元素状态
                if (element.disabled) {
                    this.log(`⚠️ ${name}: 已禁用`, 'warning');
                }
                if (element.style.display === 'none') {
                    this.log(`⚠️ ${name}: 已隐藏`, 'warning');
                }
            } else {
                this.log(`❌ ${name}: 未找到`, 'error');
                this.errors.push(`DOM元素未找到: ${name}`);
                allFound = false;
            }
        }
        
        return allFound;
    }

    // 检查3: 事件绑定
    checkEventBindings() {
        this.log('=== 检查3: 事件绑定状态 ===');
        
        const sendButton = document.querySelector('.whisper-chat-send-button');
        if (!sendButton) {
            this.log('❌ 发送按钮未找到，无法检查事件绑定', 'error');
            return false;
        }
        
        // 检查点击事件监听器
        const listeners = getEventListeners ? getEventListeners(sendButton) : null;
        if (listeners && listeners.click && listeners.click.length > 0) {
            this.log('✅ 发送按钮有点击事件监听器', 'success');
        } else {
            this.log('⚠️ 无法检测事件监听器（可能是Vue事件绑定）', 'warning');
        }
        
        // 尝试模拟点击
        try {
            this.log('测试发送按钮点击响应...');
            const originalClick = sendButton.onclick;
            let clickHandled = false;
            
            // 临时添加点击监听器
            const testHandler = () => {
                clickHandled = true;
                this.log('✅ 点击事件被处理', 'success');
            };
            
            sendButton.addEventListener('click', testHandler);
            sendButton.click();
            sendButton.removeEventListener('click', testHandler);
            
            if (!clickHandled) {
                this.log('⚠️ 点击事件可能未被正确处理', 'warning');
            }
            
        } catch (error) {
            this.log(`❌ 点击测试失败: ${error.message}`, 'error');
            this.errors.push(`点击事件测试失败: ${error.message}`);
        }
        
        return true;
    }

    // 检查4: API连接
    async checkAPIConnection() {
        this.log('=== 检查4: API连接状态 ===');
        
        const apiUrl = 'http://localhost:8080';
        
        try {
            const response = await fetch(`${apiUrl}/api/chat/test`);
            const data = await response.json();
            
            if (response.ok && data.code === 200) {
                this.log('✅ API连接正常', 'success');
                return true;
            } else {
                this.log(`❌ API响应异常: ${data.msg}`, 'error');
                this.errors.push(`API响应异常: ${data.msg}`);
                return false;
            }
        } catch (error) {
            this.log(`❌ API连接失败: ${error.message}`, 'error');
            this.errors.push(`API连接失败: ${error.message}`);
            return false;
        }
    }

    // 检查5: 聊天状态
    checkChatState() {
        this.log('=== 检查5: 聊天状态 ===');
        
        // 尝试访问Vue实例或聊天状态
        try {
            // 查找Vue实例
            const widgetElement = document.querySelector('.whisper-chat-widget');
            if (widgetElement && widgetElement.__vue__) {
                const vueInstance = widgetElement.__vue__;
                this.log('✅ 找到Vue实例', 'success');
                
                // 检查聊天状态
                if (vueInstance.chat) {
                    const chatState = vueInstance.chat.chatState;
                    this.log(`聊天状态: ${JSON.stringify(chatState, null, 2)}`, 'info');
                    
                    if (!chatState.isInitialized) {
                        this.log('⚠️ 聊天未初始化', 'warning');
                        this.errors.push('聊天未初始化');
                    }
                    
                    if (!chatState.conversationId) {
                        this.log('⚠️ 会话ID不存在', 'warning');
                        this.errors.push('会话ID不存在');
                    }
                    
                } else {
                    this.log('⚠️ 聊天实例未找到', 'warning');
                }
            } else {
                this.log('⚠️ Vue实例未找到', 'warning');
            }
        } catch (error) {
            this.log(`检查聊天状态时出错: ${error.message}`, 'warning');
        }
        
        return true;
    }

    // 检查6: 控制台错误
    checkConsoleErrors() {
        this.log('=== 检查6: 控制台错误 ===');
        
        // 这个检查需要手动观察控制台
        this.log('请手动检查浏览器控制台是否有以下类型的错误:', 'info');
        this.log('- JavaScript运行时错误', 'info');
        this.log('- 网络请求失败', 'info');
        this.log('- Vue组件错误', 'info');
        this.log('- API调用错误', 'info');
        
        return true;
    }

    // 运行完整诊断
    async runFullDiagnostic() {
        this.log('🔍 开始Whisper Chat Widget消息发送诊断');
        this.log('');
        
        const checks = [
            { name: 'Widget加载', fn: () => this.checkWidgetLoading() },
            { name: 'DOM元素', fn: () => this.checkDOMElements() },
            { name: '事件绑定', fn: () => this.checkEventBindings() },
            { name: 'API连接', fn: () => this.checkAPIConnection() },
            { name: '聊天状态', fn: () => this.checkChatState() },
            { name: '控制台错误', fn: () => this.checkConsoleErrors() }
        ];
        
        const results = [];
        
        for (const check of checks) {
            try {
                const result = await check.fn();
                results.push({ name: check.name, success: result });
                this.log('');
            } catch (error) {
                results.push({ name: check.name, success: false, error: error.message });
                this.log(`检查 ${check.name} 时出错: ${error.message}`, 'error');
                this.log('');
            }
        }
        
        // 输出诊断总结
        this.log('📊 诊断结果总结:');
        const successCount = results.filter(r => r.success).length;
        const totalCount = results.length;
        
        results.forEach(result => {
            const status = result.success ? '✅ 正常' : '❌ 异常';
            this.log(`  ${result.name}: ${status}`, result.success ? 'success' : 'error');
        });
        
        this.log('');
        this.log(`总体状态: ${successCount}/${totalCount} 项检查通过`, 
                 successCount === totalCount ? 'success' : 'warning');
        
        if (this.errors.length > 0) {
            this.log('');
            this.log('🚨 发现的问题:');
            this.errors.forEach((error, index) => {
                this.log(`${index + 1}. ${error}`, 'error');
            });
            
            this.log('');
            this.log('💡 建议的解决步骤:');
            this.log('1. 检查Widget脚本是否正确加载', 'info');
            this.log('2. 确认后端服务正在运行', 'info');
            this.log('3. 验证API路径配置是否正确', 'info');
            this.log('4. 检查浏览器控制台的详细错误信息', 'info');
            this.log('5. 尝试重新初始化Widget', 'info');
        } else {
            this.log('🎉 未发现明显问题，消息发送功能应该正常工作', 'success');
        }
        
        return {
            success: this.errors.length === 0,
            results,
            errors: this.errors,
            logs: this.results
        };
    }

    // 生成诊断报告
    generateReport() {
        const report = {
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href,
            errors: this.errors,
            logs: this.results
        };
        
        console.log('📋 完整诊断报告:', report);
        return report;
    }
}

// 导出诊断类
window.MessageSendingDiagnostic = MessageSendingDiagnostic;

// 提供快速诊断函数
window.diagnoseChatWidget = async function() {
    const diagnostic = new MessageSendingDiagnostic();
    return await diagnostic.runFullDiagnostic();
};

console.log('🔧 消息发送诊断工具已加载');
console.log('使用方法: diagnoseChatWidget() 或 new MessageSendingDiagnostic().runFullDiagnostic()');
