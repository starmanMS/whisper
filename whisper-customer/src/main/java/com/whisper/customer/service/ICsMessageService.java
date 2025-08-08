package com.whisper.customer.service;

import java.util.List;
import java.util.Date;
import com.whisper.customer.domain.CsMessage;

/**
 * 消息记录表 服务层
 * 
 * @author whisper
 */
public interface ICsMessageService
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
     * @param pageNum 页码
     * @param pageSize 每页数量
     * @return 消息记录集合
     */
    public List<CsMessage> selectCsMessageByConversationIdWithPage(Long conversationId, Integer pageNum, Integer pageSize);

    /**
     * 根据发送者查询消息列表
     * 
     * @param senderType 发送者类型
     * @param senderId 发送者ID
     * @return 消息记录集合
     */
    public List<CsMessage> selectCsMessageBySender(String senderType, Long senderId);

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
     * 批量删除消息记录
     * 
     * @param messageIds 需要删除的消息记录主键集合
     * @return 结果
     */
    public int deleteCsMessageByMessageIds(Long[] messageIds);

    /**
     * 删除消息记录信息
     * 
     * @param messageId 消息记录主键
     * @return 结果
     */
    public int deleteCsMessageByMessageId(Long messageId);

    /**
     * 发送消息
     * 
     * @param conversationId 会话ID
     * @param senderType 发送者类型
     * @param senderId 发送者ID
     * @param senderName 发送者姓名
     * @param messageType 消息类型
     * @param content 消息内容
     * @return 消息记录
     */
    public CsMessage sendMessage(Long conversationId, String senderType, Long senderId, 
                                String senderName, String messageType, String content);

    /**
     * 发送文件消息
     * 
     * @param conversationId 会话ID
     * @param senderType 发送者类型
     * @param senderId 发送者ID
     * @param senderName 发送者姓名
     * @param messageType 消息类型
     * @param content 消息内容
     * @param fileUrl 文件地址
     * @param fileName 文件名称
     * @param fileSize 文件大小
     * @return 消息记录
     */
    public CsMessage sendFileMessage(Long conversationId, String senderType, Long senderId, 
                                    String senderName, String messageType, String content,
                                    String fileUrl, String fileName, Long fileSize);

    /**
     * 标记消息为已读
     * 
     * @param messageId 消息ID
     * @return 结果
     */
    public int markMessageAsRead(Long messageId);

    /**
     * 批量标记消息为已读
     * 
     * @param conversationId 会话ID
     * @param senderType 发送者类型
     * @return 结果
     */
    public int markMessagesAsReadByConversation(Long conversationId, String senderType);

    /**
     * 撤回消息
     * 
     * @param messageId 消息ID
     * @return 结果
     */
    public int recallMessage(Long messageId);

    /**
     * 查询会话中未读消息数量
     * 
     * @param conversationId 会话ID
     * @param senderType 发送者类型
     * @return 未读消息数量
     */
    public int countUnreadMessagesByConversation(Long conversationId, String senderType);

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
    public int countMessagesByType(Long conversationId, String messageType);

    /**
     * 查询指定时间范围内的消息
     * 
     * @param conversationId 会话ID
     * @param startTime 开始时间
     * @param endTime 结束时间
     * @return 消息记录集合
     */
    public List<CsMessage> selectMessagesByTimeRange(Long conversationId, Date startTime, Date endTime);

    /**
     * 清理历史消息
     * 
     * @param beforeDays 保留天数
     * @return 删除的消息数量
     */
    public int cleanHistoryMessages(Integer beforeDays);
}
