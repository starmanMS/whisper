package com.whisper.customer.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.whisper.common.core.domain.AjaxResult;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * WebSocket测试控制器
 * 
 * @author whisper
 */
@RestController
@RequestMapping("/api/websocket")
public class WebSocketTestController
{
    private static final Logger log = LoggerFactory.getLogger(WebSocketTestController.class);

    /**
     * WebSocket健康检查
     */
    @GetMapping("/health")
    public AjaxResult health()
    {
        log.info("WebSocket健康检查请求");
        return AjaxResult.success("WebSocket服务正常运行");
    }

    /**
     * WebSocket配置信息
     */
    @GetMapping("/info")
    public AjaxResult info()
    {
        log.info("WebSocket配置信息请求");
        return AjaxResult.success()
            .put("endpoint", "/websocket/chat/{userType}/{userId}")
            .put("supportedProtocols", new String[]{"ws", "wss"})
            .put("maxConnections", 1000)
            .put("status", "active");
    }

    /**
     * WebSocket连接测试指南
     */
    @GetMapping("/test-guide")
    public AjaxResult testGuide()
    {
        return AjaxResult.success()
            .put("websocketUrl", "ws://localhost:8080/websocket/chat/customer/guest")
            .put("testSteps", new String[]{
                "1. 确保后端服务运行在8080端口",
                "2. 使用WebSocket客户端连接到指定URL",
                "3. 发送JSON格式的测试消息",
                "4. 检查连接状态和消息响应"
            })
            .put("sampleMessage", "{\"type\":\"system\",\"content\":\"test\",\"timestamp\":\"" + 
                java.time.Instant.now().toString() + "\"}");
    }
}
