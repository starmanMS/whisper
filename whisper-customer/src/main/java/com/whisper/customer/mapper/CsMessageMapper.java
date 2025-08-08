package com.whisper.customer.mapper;

import java.util.List;
import org.apache.ibatis.annotations.Param;
import com.whisper.customer.domain.CsMessage;

/**
 * 消息记录表 数据层
 * 
 * @author whisper
 */
public interface CsMessageMapper
{
    /**
     * 查询消息记录
     * 
     * @param messageId 消息记录主键
     * @return 消息记录
     */
    public CsMessage selectCsMessageByMessageId(Long messageId);

    /**
     * 查询消息记录列表
     * 
     * @param csMessage 消息记录
     * @return 消息记录集合
     */
    public List<CsMessage> selectCsMessageList(CsMessage csMessage);

    /**
     * 根据会话ID查询消息列表
     * 
     * @param conversationId 会话ID
     * @return 消息记录集合
     */
    public List<CsMessage> selectCsMessageByConversationId(Long conversationId);

    /**
     * 根据会话ID分页查询消息列表
     * 
     * @param conversationId 会话ID
     * @param offset 偏移量
     * @param limit 限制数量
     * @return 消息记录集合
     */
    public List<CsMessage> selectCsMessageByConversationIdWithPage(@Param("conversationId") Long conversationId, 
                                                                   @Param("offset") Integer offset, 
                                                                   @Param("limit") Integer limit);

    /**
     * 根据发送者查询消息列表
     * 
     * @param senderType 发送者类型
     * @param senderId 发送者ID
     * @return 消息记录集合
     */
    public List<CsMessage> selectCsMessageBySender(@Param("senderType") String senderType, 
                                                   @Param("senderId") Long senderId);

    /**
     * 新增消息记录
     * 
     * @param csMessage 消息记录
     * @return 结果
     */
    public int insertCsMessage(CsMessage csMessage);

    /**
     * 修改消息记录
     * 
     * @param csMessage 消息记录
     * @return 结果
     */
    public int updateCsMessage(CsMessage csMessage);

    /**
     * 删除消息记录
     * 
     * @param messageId 消息记录主键
     * @return 结果
     */
    public int deleteCsMessageByMessageId(Long messageId);

    /**
     * 批量删除消息记录
     * 
     * @param messageIds 需要删除的数据主键集合
     * @return 结果
     */
    public int deleteCsMessageByMessageIds(Long[] messageIds);

    /**
     * 标记消息为已读
     * 
     * @param messageId 消息ID
     * @param readTime 阅读时间
     * @return 结果
     */
    public int markMessageAsRead(@Param("messageId") Long messageId, 
                                @Param("readTime") java.util.Date readTime);

    /**
     * 批量标记消息为已读
     * 
     * @param conversationId 会话ID
     * @param senderType 发送者类型
     * @param readTime 阅读时间
     * @return 结果
     */
    public int markMessagesAsReadByConversation(@Param("conversationId") Long conversationId, 
                                               @Param("senderType") String senderType, 
                                               @Param("readTime") java.util.Date readTime);

    /**
     * 撤回消息
     * 
     * @param messageId 消息ID
     * @param recallTime 撤回时间
     * @return 结果
     */
    public int recallMessage(@Param("messageId") Long messageId, 
                            @Param("recallTime") java.util.Date recallTime);

    /**
     * 查询会话中未读消息数量
     * 
     * @param conversationId 会话ID
     * @param senderType 发送者类型
     * @return 未读消息数量
     */
    public int countUnreadMessagesByConversation(@Param("conversationId") Long conversationId, 
                                                @Param("senderType") String senderType);

    /**
     * 查询会话中最后一条消息
     * 
     * @param conversationId 会话ID
     * @return 最后一条消息
     */
    public CsMessage selectLastMessageByConversationId(Long conversationId);

    /**
     * 统计会话消息总数
     * 
     * @param conversationId 会话ID
     * @return 消息总数
     */
    public int countMessagesByConversationId(Long conversationId);

    /**
     * 根据消息类型统计消息数量
     * 
     * @param conversationId 会话ID
     * @param messageType 消息类型
     * @return 消息数量
     */
    public int countMessagesByType(@Param("conversationId") Long conversationId, 
                                  @Param("messageType") String messageType);

    /**
     * 查询指定时间范围内的消息
     * 
     * @param conversationId 会话ID
     * @param startTime 开始时间
     * @param endTime 结束时间
     * @return 消息记录集合
     */
    public List<CsMessage> selectMessagesByTimeRange(@Param("conversationId") Long conversationId, 
                                                    @Param("startTime") java.util.Date startTime, 
                                                    @Param("endTime") java.util.Date endTime);

    /**
     * 删除指定时间之前的消息
     * 
     * @param beforeTime 时间点
     * @return 删除的消息数量
     */
    public int deleteMessagesBefore(@Param("beforeTime") java.util.Date beforeTime);
}
