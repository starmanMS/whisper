package com.whisper.customer.websocket;

import java.io.IOException;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArraySet;
import javax.websocket.OnClose;
import javax.websocket.OnError;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;
import javax.websocket.Session;
import javax.websocket.server.PathParam;
import javax.websocket.server.ServerEndpoint;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import com.alibaba.fastjson2.JSON;
import com.alibaba.fastjson2.JSONObject;
import com.whisper.common.utils.spring.SpringUtils;
import com.whisper.customer.domain.CsMessage;
import com.whisper.customer.service.ICsMessageService;
import com.whisper.customer.service.ICsConversationService;

/**
 * WebSocket处理器 - 客服聊天
 * 
 * @author whisper
 */
@ServerEndpoint("/websocket/chat/{userType}/{userId}")
@Component
public class ChatWebSocketHandler
{
    private static final Logger log = LoggerFactory.getLogger(ChatWebSocketHandler.class);

    /** 静态变量，用来记录当前在线连接数 */
    private static int onlineCount = 0;

    /** concurrent包的线程安全Set，用来存放每个客户端对应的WebSocket对象 */
    private static final CopyOnWriteArraySet<ChatWebSocketHandler> webSocketSet = new CopyOnWriteArraySet<ChatWebSocketHandler>();

    /** 与某个客户端的连接会话，需要通过它来给客户端发送数据 */
    private Session session;

    /** 用户类型：customer-客户，agent-客服 */
    private String userType;

    /** 用户ID */
    private String userId;

    /** 用户连接映射 */
    private static ConcurrentHashMap<String, ChatWebSocketHandler> userConnections = new ConcurrentHashMap<>();

    /**
     * 连接建立成功调用的方法
     */
    @OnOpen
    public void onOpen(Session session, @PathParam("userType") String userType, @PathParam("userId") String userId)
    {
        this.session = session;
        this.userType = userType;
        this.userId = userId;
        
        // 加入set中
        webSocketSet.add(this);
        
        // 添加到用户连接映射
        String userKey = userType + "_" + userId;
        userConnections.put(userKey, this);
        
        // 在线数加1
        addOnlineCount();
        
        log.info("用户{}连接WebSocket成功，当前在线人数为：{}", userKey, getOnlineCount());
        
        try {
            sendMessage(JSON.toJSONString(new WebSocketMessage("system", "连接成功", null)));
        } catch (IOException e) {
            log.error("WebSocket IO异常", e);
        }
    }

    /**
     * 连接关闭调用的方法
     */
    @OnClose
    public void onClose()
    {
        // 从set中删除
        webSocketSet.remove(this);
        
        // 从用户连接映射中删除
        String userKey = userType + "_" + userId;
        userConnections.remove(userKey);
        
        // 在线数减1
        subOnlineCount();
        
        log.info("用户{}断开WebSocket连接，当前在线人数为：{}", userKey, getOnlineCount());
    }

    /**
     * 收到客户端消息后调用的方法
     *
     * @param message 客户端发送过来的消息
     */
    @OnMessage
    public void onMessage(String message, Session session)
    {
        log.info("收到来自用户{}的消息：{}", userType + "_" + userId, message);
        
        try {
            JSONObject messageObj = JSON.parseObject(message);
            String type = messageObj.getString("type");
            
            if ("message".equals(type)) {
                // 处理聊天消息
                handleChatMessage(messageObj);
            } else if ("heartbeat".equals(type)) {
                // 处理心跳消息
                handleHeartbeat();
            } else if ("read".equals(type)) {
                // 处理消息已读
                handleMessageRead(messageObj);
            }
        } catch (Exception e) {
            log.error("处理WebSocket消息异常", e);
        }
    }

    /**
     * 发生错误时调用
     */
    @OnError
    public void onError(Session session, Throwable error)
    {
        log.error("用户{}的WebSocket发生错误", userType + "_" + userId, error);
    }

    /**
     * 实现服务器主动推送
     */
    public void sendMessage(String message) throws IOException
    {
        this.session.getBasicRemote().sendText(message);
    }

    /**
     * 处理聊天消息
     */
    private void handleChatMessage(JSONObject messageObj)
    {
        try {
            Long conversationId = messageObj.getLong("conversationId");
            String content = messageObj.getString("content");
            String messageType = messageObj.getString("messageType");
            String senderName = messageObj.getString("senderName");
            
            // 保存消息到数据库
            ICsMessageService messageService = SpringUtils.getBean(ICsMessageService.class);
            CsMessage message = messageService.sendMessage(
                conversationId, 
                userType.equals("customer") ? "1" : "2", 
                Long.valueOf(userId), 
                senderName, 
                messageType, 
                content
            );
            
            if (message != null) {
                // 构造WebSocket消息
                WebSocketMessage wsMessage = new WebSocketMessage("message", "消息发送成功", message);
                
                // 发送给发送者确认
                sendMessage(JSON.toJSONString(wsMessage));
                
                // 转发给对方
                forwardMessageToTarget(conversationId, message);
            }
        } catch (Exception e) {
            log.error("处理聊天消息异常", e);
        }
    }

    /**
     * 处理心跳消息
     */
    private void handleHeartbeat()
    {
        try {
            sendMessage(JSON.toJSONString(new WebSocketMessage("heartbeat", "pong", null)));
        } catch (IOException e) {
            log.error("发送心跳响应异常", e);
        }
    }

    /**
     * 处理消息已读
     */
    private void handleMessageRead(JSONObject messageObj)
    {
        try {
            Long messageId = messageObj.getLong("messageId");
            
            // 标记消息为已读
            ICsMessageService messageService = SpringUtils.getBean(ICsMessageService.class);
            messageService.markMessageAsRead(messageId);
            
            // 通知发送者消息已读
            // TODO: 实现已读回执逻辑
            
        } catch (Exception e) {
            log.error("处理消息已读异常", e);
        }
    }

    /**
     * 转发消息给目标用户
     */
    private void forwardMessageToTarget(Long conversationId, CsMessage message)
    {
        try {
            // 获取会话信息，确定目标用户
            ICsConversationService conversationService = SpringUtils.getBean(ICsConversationService.class);
            // TODO: 根据会话信息确定目标用户并转发消息
            
        } catch (Exception e) {
            log.error("转发消息异常", e);
        }
    }

    /**
     * 群发自定义消息
     */
    public static void sendInfo(String message, @PathParam("userId") String userId) throws IOException
    {
        log.info("推送消息到用户{}，推送内容：{}", userId, message);
        
        for (ChatWebSocketHandler item : webSocketSet) {
            try {
                // 这里可以设定只推送给这个userId的，为null则全部推送
                if (userId == null) {
                    item.sendMessage(message);
                } else if (item.userId.equals(userId)) {
                    item.sendMessage(message);
                }
            } catch (IOException e) {
                continue;
            }
        }
    }

    /**
     * 发送消息给指定用户
     */
    public static void sendMessageToUser(String userType, String userId, String message)
    {
        String userKey = userType + "_" + userId;
        ChatWebSocketHandler handler = userConnections.get(userKey);
        if (handler != null) {
            try {
                handler.sendMessage(message);
            } catch (IOException e) {
                log.error("发送消息给用户{}失败", userKey, e);
            }
        }
    }

    /**
     * 获取在线用户数
     */
    public static synchronized int getOnlineCount()
    {
        return onlineCount;
    }

    /**
     * 在线数加1
     */
    public static synchronized void addOnlineCount()
    {
        ChatWebSocketHandler.onlineCount++;
    }

    /**
     * 在线数减1
     */
    public static synchronized void subOnlineCount()
    {
        ChatWebSocketHandler.onlineCount--;
    }

    /**
     * WebSocket消息实体
     */
    public static class WebSocketMessage
    {
        private String type;
        private String message;
        private Object data;

        public WebSocketMessage(String type, String message, Object data)
        {
            this.type = type;
            this.message = message;
            this.data = data;
        }

        // getters and setters
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        public Object getData() { return data; }
        public void setData(Object data) { this.data = data; }
    }
}
