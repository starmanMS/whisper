package com.whisper.customer.service;

import java.util.List;
import com.whisper.customer.domain.CsConversation;

/**
 * 会话管理表 服务层
 * 
 * @author whisper
 */
public interface ICsConversationService
{
    /**
     * 查询会话管理
     * 
     * @param conversationId 会话管理主键
     * @return 会话管理
     */
    public CsConversation selectCsConversationByConversationId(Long conversationId);

    /**
     * 根据会话标识查询会话信息
     * 
     * @param sessionId 会话标识
     * @return 会话信息
     */
    public CsConversation selectCsConversationBySessionId(String sessionId);

    /**
     * 查询会话管理列表
     * 
     * @param csConversation 会话管理
     * @return 会话管理集合
     */
    public List<CsConversation> selectCsConversationList(CsConversation csConversation);

    /**
     * 根据客户ID查询会话列表
     * 
     * @param customerId 客户ID
     * @return 会话管理集合
     */
    public List<CsConversation> selectCsConversationByCustomerId(Long customerId);

    /**
     * 根据客服ID查询会话列表
     * 
     * @param agentId 客服ID
     * @return 会话管理集合
     */
    public List<CsConversation> selectCsConversationByAgentId(Long agentId);

    /**
     * 查询待分配的会话列表
     * 
     * @return 会话管理集合
     */
    public List<CsConversation> selectPendingConversations();

    /**
     * 查询进行中的会话列表
     * 
     * @param agentId 客服ID
     * @return 会话管理集合
     */
    public List<CsConversation> selectActiveConversationsByAgentId(Long agentId);

    /**
     * 新增会话管理
     * 
     * @param csConversation 会话管理
     * @return 结果
     */
    public int insertCsConversation(CsConversation csConversation);

    /**
     * 修改会话管理
     * 
     * @param csConversation 会话管理
     * @return 结果
     */
    public int updateCsConversation(CsConversation csConversation);

    /**
     * 批量删除会话管理
     * 
     * @param conversationIds 需要删除的会话管理主键集合
     * @return 结果
     */
    public int deleteCsConversationByConversationIds(Long[] conversationIds);

    /**
     * 删除会话管理信息
     * 
     * @param conversationId 会话管理主键
     * @return 结果
     */
    public int deleteCsConversationByConversationId(Long conversationId);

    /**
     * 创建新会话
     * 
     * @param customerId 客户ID
     * @param channel 渠道
     * @param conversationType 会话类型
     * @return 会话信息
     */
    public CsConversation createConversation(Long customerId, String channel, String conversationType);

    /**
     * 分配会话给客服
     * 
     * @param conversationId 会话ID
     * @param agentId 客服ID
     * @return 结果
     */
    public int assignConversationToAgent(Long conversationId, Long agentId);

    /**
     * 自动分配会话
     * 
     * @param conversationId 会话ID
     * @return 分配的客服ID
     */
    public Long autoAssignConversation(Long conversationId);

    /**
     * 更新会话状态
     * 
     * @param conversationId 会话ID
     * @param status 状态
     * @return 结果
     */
    public int updateConversationStatus(Long conversationId, String status);

    /**
     * 结束会话
     * 
     * @param conversationId 会话ID
     * @return 结果
     */
    public int endConversation(Long conversationId);

    /**
     * 转接会话
     * 
     * @param conversationId 会话ID
     * @param fromAgentId 原客服ID
     * @param toAgentId 目标客服ID
     * @return 结果
     */
    public int transferConversation(Long conversationId, Long fromAgentId, Long toAgentId);

    /**
     * 更新会话消息统计
     * 
     * @param conversationId 会话ID
     * @return 结果
     */
    public int updateConversationStats(Long conversationId);

    /**
     * 设置会话满意度
     * 
     * @param conversationId 会话ID
     * @param satisfaction 满意度
     * @return 结果
     */
    public int updateConversationSatisfaction(Long conversationId, String satisfaction);

    /**
     * 统计客服当前活跃会话数
     * 
     * @param agentId 客服ID
     * @return 活跃会话数
     */
    public int countActiveConversationsByAgentId(Long agentId);

    /**
     * 统计今日会话总数
     * 
     * @return 今日会话总数
     */
    public int countTodayConversations();

    /**
     * 统计待分配会话数
     * 
     * @return 待分配会话数
     */
    public int countPendingConversations();

    /**
     * 根据渠道统计会话数
     * 
     * @param channel 渠道
     * @return 会话数
     */
    public int countConversationsByChannel(String channel);

    /**
     * 生成会话标识
     * 
     * @return 会话标识
     */
    public String generateSessionId();
}
