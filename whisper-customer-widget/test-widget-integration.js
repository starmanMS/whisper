/**
 * Whisper Chat Widget 集成测试脚本
 * 用于测试Widget与后端API的完整集成
 */

class WidgetIntegrationTest {
    constructor() {
        this.baseUrl = 'http://localhost:8080';
        this.testResults = [];
        this.conversationId = null;
        this.customerId = null;
        this.sessionId = null;
    }

    // 日志输出
    log(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const logMessage = `[${timestamp}] ${message}`;
        
        console.log(`%c${logMessage}`, this.getLogStyle(type));
        
        this.testResults.push({
            timestamp,
            message,
            type
        });
    }

    getLogStyle(type) {
        const styles = {
            info: 'color: #17a2b8;',
            success: 'color: #28a745; font-weight: bold;',
            error: 'color: #dc3545; font-weight: bold;',
            warning: 'color: #ffc107; font-weight: bold;'
        };
        return styles[type] || styles.info;
    }

    // HTTP请求工具
    async request(url, options = {}) {
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        this.log(`发送请求: ${config.method || 'GET'} ${url}`);
        
        try {
            const response = await fetch(url, config);
            const data = await response.json();
            
            if (response.ok && data.code === 200) {
                this.log(`请求成功: ${data.msg || '操作成功'}`, 'success');
                return data;
            } else {
                this.log(`请求失败: ${data.msg || '未知错误'}`, 'error');
                throw new Error(data.msg || `HTTP ${response.status}`);
            }
        } catch (error) {
            this.log(`请求异常: ${error.message}`, 'error');
            throw error;
        }
    }

    // 测试1: 后端连接测试
    async testBackendConnection() {
        this.log('=== 测试1: 后端连接测试 ===');
        
        try {
            const response = await this.request(`${this.baseUrl}/api/chat/test`);
            this.log('后端连接测试通过', 'success');
            return true;
        } catch (error) {
            this.log('后端连接测试失败', 'error');
            return false;
        }
    }

    // 测试2: 聊天初始化测试
    async testChatInitialization() {
        this.log('=== 测试2: 聊天初始化测试 ===');
        
        const initData = {
            customerId: '',
            customerName: '集成测试用户',
            phone: '13800138000',
            email: 'test@example.com'
        };

        try {
            const response = await this.request(`${this.baseUrl}/api/chat/init`, {
                method: 'POST',
                body: JSON.stringify(initData)
            });

            if (response.data) {
                this.conversationId = response.data.conversationId;
                this.customerId = response.data.customerId;
                this.sessionId = response.data.sessionId;
                
                this.log(`初始化成功 - 会话ID: ${this.conversationId}, 客户ID: ${this.customerId}`, 'success');
                this.log(`IP地址: ${response.data.ipAddress}, 位置: ${response.data.ipLocation}`, 'info');
                return true;
            } else {
                this.log('初始化响应数据为空', 'error');
                return false;
            }
        } catch (error) {
            this.log('聊天初始化失败', 'error');
            return false;
        }
    }

    // 测试3: 消息发送测试
    async testMessageSending() {
        this.log('=== 测试3: 消息发送测试 ===');
        
        if (!this.conversationId || !this.customerId) {
            this.log('缺少会话信息，跳过消息发送测试', 'warning');
            return false;
        }

        const messageData = {
            conversationId: this.conversationId,
            customerId: this.customerId,
            customerName: '集成测试用户',
            messageType: 'text',
            content: `这是一条集成测试消息 - ${new Date().toLocaleTimeString()}`
        };

        try {
            const response = await this.request(`${this.baseUrl}/api/chat/sendMessage`, {
                method: 'POST',
                body: JSON.stringify(messageData)
            });

            if (response.data) {
                this.log(`消息发送成功 - 消息ID: ${response.data.messageId}`, 'success');
                return true;
            } else {
                this.log('消息发送响应数据为空', 'error');
                return false;
            }
        } catch (error) {
            this.log('消息发送失败', 'error');
            return false;
        }
    }

    // 测试4: 消息历史获取测试
    async testMessageHistory() {
        this.log('=== 测试4: 消息历史获取测试 ===');
        
        if (!this.conversationId) {
            this.log('缺少会话ID，跳过消息历史测试', 'warning');
            return false;
        }

        try {
            const response = await this.request(
                `${this.baseUrl}/api/chat/messages/${this.conversationId}?pageNum=1&pageSize=10`
            );

            if (response.data && Array.isArray(response.data)) {
                this.log(`获取消息历史成功 - 共 ${response.data.length} 条消息`, 'success');
                return true;
            } else {
                this.log('消息历史响应格式错误', 'error');
                return false;
            }
        } catch (error) {
            this.log('获取消息历史失败', 'error');
            return false;
        }
    }

    // 测试5: Widget加载测试
    async testWidgetLoading() {
        this.log('=== 测试5: Widget加载测试 ===');
        
        try {
            // 检查WhisperChat对象是否存在
            if (typeof window.WhisperChat === 'undefined') {
                this.log('WhisperChat对象未找到', 'error');
                return false;
            }

            this.log('WhisperChat对象加载成功', 'success');
            
            // 检查必要的方法
            const requiredMethods = ['init', 'destroy'];
            for (const method of requiredMethods) {
                if (typeof window.WhisperChat[method] !== 'function') {
                    this.log(`缺少必要方法: ${method}`, 'error');
                    return false;
                }
            }

            this.log('Widget方法检查通过', 'success');
            return true;
        } catch (error) {
            this.log('Widget加载测试失败', 'error');
            return false;
        }
    }

    // 测试6: Widget初始化测试
    async testWidgetInitialization() {
        this.log('=== 测试6: Widget初始化测试 ===');
        
        try {
            const config = {
                apiUrl: this.baseUrl,
                websocketUrl: `ws://localhost:8080/websocket`,
                customerId: `test_${Date.now()}`,
                customerName: 'Widget测试用户',
                theme: 'light',
                position: 'bottom-right'
            };

            this.log('开始初始化Widget...');
            window.WhisperChat.init(config);
            
            // 等待初始化完成
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // 检查Widget是否出现在DOM中
            const chatButton = document.querySelector('.whisper-chat-button');
            if (chatButton) {
                this.log('Widget初始化成功，聊天按钮已出现', 'success');
                return true;
            } else {
                this.log('Widget初始化失败，未找到聊天按钮', 'error');
                return false;
            }
        } catch (error) {
            this.log(`Widget初始化异常: ${error.message}`, 'error');
            return false;
        }
    }

    // 运行所有测试
    async runAllTests() {
        this.log('🚀 开始运行Whisper Chat Widget集成测试');
        this.log('');

        const tests = [
            { name: '后端连接', fn: () => this.testBackendConnection() },
            { name: '聊天初始化', fn: () => this.testChatInitialization() },
            { name: '消息发送', fn: () => this.testMessageSending() },
            { name: '消息历史', fn: () => this.testMessageHistory() },
            { name: 'Widget加载', fn: () => this.testWidgetLoading() },
            { name: 'Widget初始化', fn: () => this.testWidgetInitialization() }
        ];

        const results = [];
        
        for (const test of tests) {
            try {
                const result = await test.fn();
                results.push({ name: test.name, success: result });
                this.log('');
            } catch (error) {
                results.push({ name: test.name, success: false, error: error.message });
                this.log('');
            }
        }

        // 输出测试总结
        this.log('📊 测试结果总结:');
        const successCount = results.filter(r => r.success).length;
        const totalCount = results.length;
        
        results.forEach(result => {
            const status = result.success ? '✅ 通过' : '❌ 失败';
            this.log(`  ${result.name}: ${status}`, result.success ? 'success' : 'error');
            if (result.error) {
                this.log(`    错误: ${result.error}`, 'error');
            }
        });

        this.log('');
        this.log(`总体结果: ${successCount}/${totalCount} 个测试通过`, 
                 successCount === totalCount ? 'success' : 'warning');

        if (successCount === totalCount) {
            this.log('🎉 所有测试通过！Widget集成正常工作', 'success');
        } else {
            this.log('⚠️ 部分测试失败，请检查相关配置和实现', 'warning');
        }

        return {
            success: successCount === totalCount,
            results,
            summary: {
                total: totalCount,
                passed: successCount,
                failed: totalCount - successCount
            }
        };
    }

    // 生成测试报告
    generateReport() {
        const report = {
            timestamp: new Date().toISOString(),
            testResults: this.testResults,
            summary: {
                total: this.testResults.length,
                success: this.testResults.filter(r => r.type === 'success').length,
                error: this.testResults.filter(r => r.type === 'error').length,
                warning: this.testResults.filter(r => r.type === 'warning').length
            }
        };

        console.log('📋 完整测试报告:', report);
        return report;
    }
}

// 导出测试类
window.WidgetIntegrationTest = WidgetIntegrationTest;

// 自动运行测试（如果页面加载完成）
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('🔧 Widget集成测试工具已加载');
        console.log('使用方法: const test = new WidgetIntegrationTest(); test.runAllTests();');
    });
} else {
    console.log('🔧 Widget集成测试工具已加载');
    console.log('使用方法: const test = new WidgetIntegrationTest(); test.runAllTests();');
}
