package com.whisper.customer.service.impl;

import java.util.List;
import java.util.Date;
import java.util.Calendar;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.whisper.common.annotation.DataSource;
import com.whisper.common.core.text.Convert;
import com.whisper.common.enums.DataSourceType;
import com.whisper.common.exception.ServiceException;
import com.whisper.common.utils.DateUtils;
import com.whisper.common.utils.StringUtils;
import com.whisper.customer.domain.CsMessage;
import com.whisper.customer.mapper.CsMessageMapper;
import com.whisper.customer.service.ICsMessageService;

/**
 * 消息记录表 服务层实现
 * 
 * @author whisper
 */
@Service
public class CsMessageServiceImpl implements ICsMessageService
{
    @Autowired
    private CsMessageMapper csMessageMapper;

    /**
     * 查询消息记录
     * 
     * @param messageId 消息记录主键
     * @return 消息记录
     */
    @Override
    public CsMessage selectCsMessageByMessageId(Long messageId)
    {
        return csMessageMapper.selectCsMessageByMessageId(messageId);
    }

    /**
     * 查询消息记录列表
     * 
     * @param csMessage 消息记录
     * @return 消息记录
     */
    @Override
    public List<CsMessage> selectCsMessageList(CsMessage csMessage)
    {
        return csMessageMapper.selectCsMessageList(csMessage);
    }

    /**
     * 根据会话ID查询消息列表
     * 
     * @param conversationId 会话ID
     * @return 消息记录集合
     */
    @Override
    public List<CsMessage> selectCsMessageByConversationId(Long conversationId)
    {
        return csMessageMapper.selectCsMessageByConversationId(conversationId);
    }

    /**
     * 根据会话ID分页查询消息列表
     * 
     * @param conversationId 会话ID
     * @param pageNum 页码
     * @param pageSize 每页数量
     * @return 消息记录集合
     */
    @Override
    public List<CsMessage> selectCsMessageByConversationIdWithPage(Long conversationId, Integer pageNum, Integer pageSize)
    {
        int offset = (pageNum - 1) * pageSize;
        return csMessageMapper.selectCsMessageByConversationIdWithPage(conversationId, offset, pageSize);
    }

    /**
     * 根据发送者查询消息列表
     * 
     * @param senderType 发送者类型
     * @param senderId 发送者ID
     * @return 消息记录集合
     */
    @Override
    public List<CsMessage> selectCsMessageBySender(String senderType, Long senderId)
    {
        return csMessageMapper.selectCsMessageBySender(senderType, senderId);
    }

    /**
     * 新增消息记录
     * 
     * @param csMessage 消息记录
     * @return 结果
     */
    @Override
    public int insertCsMessage(CsMessage csMessage)
    {
        // 设置默认值
        if (StringUtils.isEmpty(csMessage.getMessageType()))
        {
            csMessage.setMessageType("text"); // 默认文本消息
        }
        if (StringUtils.isEmpty(csMessage.getIsRead()))
        {
            csMessage.setIsRead("0"); // 默认未读
        }
        if (StringUtils.isEmpty(csMessage.getIsRecall()))
        {
            csMessage.setIsRecall("0"); // 默认未撤回
        }
        if (csMessage.getSendTime() == null)
        {
            csMessage.setSendTime(DateUtils.getNowDate());
        }
        if (csMessage.getFileSize() == null)
        {
            csMessage.setFileSize(0L);
        }
        
        csMessage.setCreateTime(DateUtils.getNowDate());
        return csMessageMapper.insertCsMessage(csMessage);
    }

    /**
     * 修改消息记录
     * 
     * @param csMessage 消息记录
     * @return 结果
     */
    @Override
    public int updateCsMessage(CsMessage csMessage)
    {
        csMessage.setUpdateTime(DateUtils.getNowDate());
        return csMessageMapper.updateCsMessage(csMessage);
    }

    /**
     * 批量删除消息记录
     * 
     * @param messageIds 需要删除的消息记录主键
     * @return 结果
     */
    @Override
    public int deleteCsMessageByMessageIds(Long[] messageIds)
    {
        return csMessageMapper.deleteCsMessageByMessageIds(messageIds);
    }

    /**
     * 删除消息记录信息
     * 
     * @param messageId 消息记录主键
     * @return 结果
     */
    @Override
    public int deleteCsMessageByMessageId(Long messageId)
    {
        return csMessageMapper.deleteCsMessageByMessageId(messageId);
    }

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
    @Override
    public CsMessage sendMessage(Long conversationId, String senderType, Long senderId, 
                                String senderName, String messageType, String content)
    {
        CsMessage message = new CsMessage();
        message.setConversationId(conversationId);
        message.setSenderType(senderType);
        message.setSenderId(senderId);
        message.setSenderName(senderName);
        message.setMessageType(messageType);
        message.setContent(content);
        message.setSendTime(DateUtils.getNowDate());
        message.setIsRead("0");
        message.setIsRecall("0");
        message.setCreateTime(DateUtils.getNowDate());
        
        int result = csMessageMapper.insertCsMessage(message);
        if (result > 0)
        {
            return message;
        }
        return null;
    }

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
    @Override
    public CsMessage sendFileMessage(Long conversationId, String senderType, Long senderId, 
                                    String senderName, String messageType, String content,
                                    String fileUrl, String fileName, Long fileSize)
    {
        CsMessage message = new CsMessage();
        message.setConversationId(conversationId);
        message.setSenderType(senderType);
        message.setSenderId(senderId);
        message.setSenderName(senderName);
        message.setMessageType(messageType);
        message.setContent(content);
        message.setFileUrl(fileUrl);
        message.setFileName(fileName);
        message.setFileSize(fileSize);
        message.setSendTime(DateUtils.getNowDate());
        message.setIsRead("0");
        message.setIsRecall("0");
        message.setCreateTime(DateUtils.getNowDate());
        
        int result = csMessageMapper.insertCsMessage(message);
        if (result > 0)
        {
            return message;
        }
        return null;
    }

    /**
     * 标记消息为已读
     * 
     * @param messageId 消息ID
     * @return 结果
     */
    @Override
    public int markMessageAsRead(Long messageId)
    {
        return csMessageMapper.markMessageAsRead(messageId, DateUtils.getNowDate());
    }

    /**
     * 批量标记消息为已读
     * 
     * @param conversationId 会话ID
     * @param senderType 发送者类型
     * @return 结果
     */
    @Override
    public int markMessagesAsReadByConversation(Long conversationId, String senderType)
    {
        return csMessageMapper.markMessagesAsReadByConversation(conversationId, senderType, DateUtils.getNowDate());
    }

    /**
     * 撤回消息
     * 
     * @param messageId 消息ID
     * @return 结果
     */
    @Override
    public int recallMessage(Long messageId)
    {
        return csMessageMapper.recallMessage(messageId, DateUtils.getNowDate());
    }

    /**
     * 查询会话中未读消息数量
     * 
     * @param conversationId 会话ID
     * @param senderType 发送者类型
     * @return 未读消息数量
     */
    @Override
    public int countUnreadMessagesByConversation(Long conversationId, String senderType)
    {
        return csMessageMapper.countUnreadMessagesByConversation(conversationId, senderType);
    }

    /**
     * 查询会话中最后一条消息
     * 
     * @param conversationId 会话ID
     * @return 最后一条消息
     */
    @Override
    public CsMessage selectLastMessageByConversationId(Long conversationId)
    {
        return csMessageMapper.selectLastMessageByConversationId(conversationId);
    }

    /**
     * 统计会话消息总数
     * 
     * @param conversationId 会话ID
     * @return 消息总数
     */
    @Override
    public int countMessagesByConversationId(Long conversationId)
    {
        return csMessageMapper.countMessagesByConversationId(conversationId);
    }

    /**
     * 根据消息类型统计消息数量
     * 
     * @param conversationId 会话ID
     * @param messageType 消息类型
     * @return 消息数量
     */
    @Override
    public int countMessagesByType(Long conversationId, String messageType)
    {
        return csMessageMapper.countMessagesByType(conversationId, messageType);
    }

    /**
     * 查询指定时间范围内的消息
     * 
     * @param conversationId 会话ID
     * @param startTime 开始时间
     * @param endTime 结束时间
     * @return 消息记录集合
     */
    @Override
    public List<CsMessage> selectMessagesByTimeRange(Long conversationId, Date startTime, Date endTime)
    {
        return csMessageMapper.selectMessagesByTimeRange(conversationId, startTime, endTime);
    }

    /**
     * 清理历史消息
     * 
     * @param beforeDays 保留天数
     * @return 删除的消息数量
     */
    @Override
    public int cleanHistoryMessages(Integer beforeDays)
    {
        Calendar calendar = Calendar.getInstance();
        calendar.add(Calendar.DAY_OF_MONTH, -beforeDays);
        Date beforeTime = calendar.getTime();
        return csMessageMapper.deleteMessagesBefore(beforeTime);
    }
}
