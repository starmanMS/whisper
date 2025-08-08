package com.whisper.customer.controller;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.whisper.common.core.domain.AjaxResult;
import com.whisper.common.utils.StringUtils;
import com.whisper.customer.domain.CsCustomer;
import com.whisper.customer.domain.CsConversation;
import com.whisper.customer.domain.CsMessage;
import com.whisper.customer.service.ICsCustomerService;
import com.whisper.customer.service.ICsConversationService;
import com.whisper.customer.service.ICsMessageService;

/**
 * 客服聊天API接口 - 供前台Widget使用
 * 
 * @author whisper
 */
@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ChatApiController
{
    @Autowired
    private ICsCustomerService csCustomerService;

    @Autowired
    private ICsConversationService csConversationService;

    @Autowired
    private ICsMessageService csMessageService;

    /**
     * 初始化客户会话
     */
    @PostMapping("/init")
    public AjaxResult initChat(@RequestBody InitChatRequest request)
    {
        try {
            // 1. 查找或创建客户
            CsCustomer customer = null;
            if (StringUtils.isNotEmpty(request.getCustomerId())) {
                customer = csCustomerService.selectCsCustomerByCustomerNo(request.getCustomerId());
            }
            
            if (customer == null) {
                // 创建新客户
                customer = new CsCustomer();
                customer.setCustomerNo(StringUtils.isNotEmpty(request.getCustomerId()) ? 
                                     request.getCustomerId() : csCustomerService.generateCustomerNo());
                customer.setCustomerName(StringUtils.isNotEmpty(request.getCustomerName()) ? 
                                       request.getCustomerName() : "访客");
                customer.setPhone(request.getPhone());
                customer.setEmail(request.getEmail());
                customer.setSource("widget");
                customer.setCreateBy("system");
                csCustomerService.insertCsCustomer(customer);
            } else {
                // 更新客户最后联系时间
                csCustomerService.updateLastContactTime(customer.getCustomerId());
            }

            // 2. 查找或创建会话
            CsConversation conversation = null;
            if (StringUtils.isNotEmpty(request.getSessionId())) {
                conversation = csConversationService.selectCsConversationBySessionId(request.getSessionId());
            }
            
            if (conversation == null || !"1".equals(conversation.getStatus())) {
                // 创建新会话
                conversation = csConversationService.createConversation(
                    customer.getCustomerId(), 
                    "web", 
                    "1"
                );
                
                // 尝试自动分配客服
                Long agentId = csConversationService.autoAssignConversation(conversation.getConversationId());
                if (agentId != null) {
                    conversation.setAgentId(agentId);
                    conversation.setStatus("1"); // 进行中
                }
            }

            // 3. 返回初始化结果
            InitChatResponse response = new InitChatResponse();
            response.setCustomerId(customer.getCustomerId());
            response.setCustomerNo(customer.getCustomerNo());
            response.setCustomerName(customer.getCustomerName());
            response.setConversationId(conversation.getConversationId());
            response.setSessionId(conversation.getSessionId());
            response.setStatus(conversation.getStatus());
            response.setAgentId(conversation.getAgentId());

            return AjaxResult.success(response);
        } catch (Exception e) {
            return AjaxResult.error("初始化聊天失败：" + e.getMessage());
        }
    }

    /**
     * 发送消息
     */
    @PostMapping("/sendMessage")
    public AjaxResult sendMessage(@RequestBody SendMessageRequest request)
    {
        try {
            CsMessage message = csMessageService.sendMessage(
                request.getConversationId(),
                "1", // 客户发送
                request.getCustomerId(),
                request.getCustomerName(),
                request.getMessageType(),
                request.getContent()
            );

            if (message != null) {
                // 更新会话消息统计
                csConversationService.updateConversationStats(request.getConversationId());
                
                return AjaxResult.success(message);
            } else {
                return AjaxResult.error("发送消息失败");
            }
        } catch (Exception e) {
            return AjaxResult.error("发送消息异常：" + e.getMessage());
        }
    }

    /**
     * 获取会话消息历史
     */
    @GetMapping("/messages/{conversationId}")
    public AjaxResult getMessages(@PathVariable Long conversationId,
                                 @RequestParam(defaultValue = "1") Integer pageNum,
                                 @RequestParam(defaultValue = "20") Integer pageSize)
    {
        try {
            List<CsMessage> messages = csMessageService.selectCsMessageByConversationIdWithPage(
                conversationId, pageNum, pageSize);
            return AjaxResult.success(messages);
        } catch (Exception e) {
            return AjaxResult.error("获取消息历史失败：" + e.getMessage());
        }
    }

    /**
     * 标记消息为已读
     */
    @PostMapping("/markRead")
    public AjaxResult markMessagesAsRead(@RequestParam Long conversationId)
    {
        try {
            // 标记客服发送的消息为已读
            int result = csMessageService.markMessagesAsReadByConversation(conversationId, "2");
            return AjaxResult.success("标记了 " + result + " 条消息为已读");
        } catch (Exception e) {
            return AjaxResult.error("标记消息已读失败：" + e.getMessage());
        }
    }

    /**
     * 结束会话
     */
    @PostMapping("/endConversation/{conversationId}")
    public AjaxResult endConversation(@PathVariable Long conversationId)
    {
        try {
            int result = csConversationService.endConversation(conversationId);
            return AjaxResult.success("会话已结束");
        } catch (Exception e) {
            return AjaxResult.error("结束会话失败：" + e.getMessage());
        }
    }

    /**
     * 设置满意度评价
     */
    @PostMapping("/satisfaction")
    public AjaxResult setSatisfaction(@RequestParam Long conversationId, @RequestParam String satisfaction)
    {
        try {
            int result = csConversationService.updateConversationSatisfaction(conversationId, satisfaction);
            return AjaxResult.success("满意度评价已提交");
        } catch (Exception e) {
            return AjaxResult.error("提交满意度评价失败：" + e.getMessage());
        }
    }

    /**
     * 获取未读消息数量
     */
    @GetMapping("/unreadCount/{conversationId}")
    public AjaxResult getUnreadCount(@PathVariable Long conversationId)
    {
        try {
            // 获取客服发送的未读消息数量
            int count = csMessageService.countUnreadMessagesByConversation(conversationId, "2");
            return AjaxResult.success().put("count", count);
        } catch (Exception e) {
            return AjaxResult.error("获取未读消息数量失败：" + e.getMessage());
        }
    }

    /**
     * 初始化聊天请求
     */
    public static class InitChatRequest
    {
        private String customerId;
        private String customerName;
        private String phone;
        private String email;
        private String sessionId;

        // getters and setters
        public String getCustomerId() { return customerId; }
        public void setCustomerId(String customerId) { this.customerId = customerId; }
        public String getCustomerName() { return customerName; }
        public void setCustomerName(String customerName) { this.customerName = customerName; }
        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getSessionId() { return sessionId; }
        public void setSessionId(String sessionId) { this.sessionId = sessionId; }
    }

    /**
     * 初始化聊天响应
     */
    public static class InitChatResponse
    {
        private Long customerId;
        private String customerNo;
        private String customerName;
        private Long conversationId;
        private String sessionId;
        private String status;
        private Long agentId;

        // getters and setters
        public Long getCustomerId() { return customerId; }
        public void setCustomerId(Long customerId) { this.customerId = customerId; }
        public String getCustomerNo() { return customerNo; }
        public void setCustomerNo(String customerNo) { this.customerNo = customerNo; }
        public String getCustomerName() { return customerName; }
        public void setCustomerName(String customerName) { this.customerName = customerName; }
        public Long getConversationId() { return conversationId; }
        public void setConversationId(Long conversationId) { this.conversationId = conversationId; }
        public String getSessionId() { return sessionId; }
        public void setSessionId(String sessionId) { this.sessionId = sessionId; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public Long getAgentId() { return agentId; }
        public void setAgentId(Long agentId) { this.agentId = agentId; }
    }

    /**
     * 发送消息请求
     */
    public static class SendMessageRequest
    {
        private Long conversationId;
        private Long customerId;
        private String customerName;
        private String messageType;
        private String content;

        // getters and setters
        public Long getConversationId() { return conversationId; }
        public void setConversationId(Long conversationId) { this.conversationId = conversationId; }
        public Long getCustomerId() { return customerId; }
        public void setCustomerId(Long customerId) { this.customerId = customerId; }
        public String getCustomerName() { return customerName; }
        public void setCustomerName(String customerName) { this.customerName = customerName; }
        public String getMessageType() { return messageType; }
        public void setMessageType(String messageType) { this.messageType = messageType; }
        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
    }
}
