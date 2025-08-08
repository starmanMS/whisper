package com.whisper.customer.domain;

import java.util.Date;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import org.apache.commons.lang3.builder.ToStringBuilder;
import org.apache.commons.lang3.builder.ToStringStyle;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.whisper.common.annotation.Excel;
import com.whisper.common.annotation.Excel.ColumnType;
import com.whisper.common.core.domain.BaseEntity;

/**
 * 消息记录表 cs_message
 * 
 * @author whisper
 */
public class CsMessage extends BaseEntity
{
    private static final long serialVersionUID = 1L;

    /** 消息ID */
    @Excel(name = "消息ID", cellType = ColumnType.NUMERIC)
    private Long messageId;

    /** 会话ID */
    @Excel(name = "会话ID", cellType = ColumnType.NUMERIC)
    private Long conversationId;

    /** 发送者类型（1客户 2客服 3机器人 4系统） */
    @Excel(name = "发送者类型", readConverterExp = "1=客户,2=客服,3=机器人,4=系统")
    private String senderType;

    /** 发送者ID */
    @Excel(name = "发送者ID", cellType = ColumnType.NUMERIC)
    private Long senderId;

    /** 发送者姓名 */
    @Excel(name = "发送者姓名")
    private String senderName;

    /** 消息类型（text文本 image图片 file文件 voice语音 video视频） */
    @Excel(name = "消息类型", readConverterExp = "text=文本,image=图片,file=文件,voice=语音,video=视频")
    private String messageType;

    /** 消息内容 */
    @Excel(name = "消息内容")
    private String content;

    /** 文件地址 */
    private String fileUrl;

    /** 文件名称 */
    private String fileName;

    /** 文件大小（字节） */
    @Excel(name = "文件大小", cellType = ColumnType.NUMERIC)
    private Long fileSize;

    /** 是否已读（0未读 1已读） */
    @Excel(name = "是否已读", readConverterExp = "0=未读,1=已读")
    private String isRead;

    /** 阅读时间 */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    @Excel(name = "阅读时间", width = 30, dateFormat = "yyyy-MM-dd HH:mm:ss")
    private Date readTime;

    /** 是否撤回（0否 1是） */
    @Excel(name = "是否撤回", readConverterExp = "0=否,1=是")
    private String isRecall;

    /** 撤回时间 */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    @Excel(name = "撤回时间", width = 30, dateFormat = "yyyy-MM-dd HH:mm:ss")
    private Date recallTime;

    /** 回复消息ID */
    @Excel(name = "回复消息ID", cellType = ColumnType.NUMERIC)
    private Long replyToId;

    /** 发送时间 */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    @Excel(name = "发送时间", width = 30, dateFormat = "yyyy-MM-dd HH:mm:ss")
    private Date sendTime;

    /** 删除标志（0存在 2删除） */
    private String delFlag;

    /** 预留字段1 */
    private String reserved1;

    /** 预留字段2 */
    private String reserved2;

    /** 扩展字段1 */
    private String extField1;

    public Long getMessageId()
    {
        return messageId;
    }

    public void setMessageId(Long messageId)
    {
        this.messageId = messageId;
    }

    @NotNull(message = "会话ID不能为空")
    public Long getConversationId()
    {
        return conversationId;
    }

    public void setConversationId(Long conversationId)
    {
        this.conversationId = conversationId;
    }

    @NotBlank(message = "发送者类型不能为空")
    public String getSenderType()
    {
        return senderType;
    }

    public void setSenderType(String senderType)
    {
        this.senderType = senderType;
    }

    public Long getSenderId()
    {
        return senderId;
    }

    public void setSenderId(Long senderId)
    {
        this.senderId = senderId;
    }

    @Size(min = 0, max = 100, message = "发送者姓名不能超过100个字符")
    public String getSenderName()
    {
        return senderName;
    }

    public void setSenderName(String senderName)
    {
        this.senderName = senderName;
    }

    @Size(min = 0, max = 20, message = "消息类型不能超过20个字符")
    public String getMessageType()
    {
        return messageType;
    }

    public void setMessageType(String messageType)
    {
        this.messageType = messageType;
    }

    @NotBlank(message = "消息内容不能为空")
    public String getContent()
    {
        return content;
    }

    public void setContent(String content)
    {
        this.content = content;
    }

    @Size(min = 0, max = 500, message = "文件地址不能超过500个字符")
    public String getFileUrl()
    {
        return fileUrl;
    }

    public void setFileUrl(String fileUrl)
    {
        this.fileUrl = fileUrl;
    }

    @Size(min = 0, max = 200, message = "文件名称不能超过200个字符")
    public String getFileName()
    {
        return fileName;
    }

    public void setFileName(String fileName)
    {
        this.fileName = fileName;
    }

    public Long getFileSize()
    {
        return fileSize;
    }

    public void setFileSize(Long fileSize)
    {
        this.fileSize = fileSize;
    }

    public String getIsRead()
    {
        return isRead;
    }

    public void setIsRead(String isRead)
    {
        this.isRead = isRead;
    }

    public Date getReadTime()
    {
        return readTime;
    }

    public void setReadTime(Date readTime)
    {
        this.readTime = readTime;
    }

    public String getIsRecall()
    {
        return isRecall;
    }

    public void setIsRecall(String isRecall)
    {
        this.isRecall = isRecall;
    }

    public Date getRecallTime()
    {
        return recallTime;
    }

    public void setRecallTime(Date recallTime)
    {
        this.recallTime = recallTime;
    }

    public Long getReplyToId()
    {
        return replyToId;
    }

    public void setReplyToId(Long replyToId)
    {
        this.replyToId = replyToId;
    }

    @NotNull(message = "发送时间不能为空")
    public Date getSendTime()
    {
        return sendTime;
    }

    public void setSendTime(Date sendTime)
    {
        this.sendTime = sendTime;
    }

    public String getDelFlag()
    {
        return delFlag;
    }

    public void setDelFlag(String delFlag)
    {
        this.delFlag = delFlag;
    }

    public String getReserved1()
    {
        return reserved1;
    }

    public void setReserved1(String reserved1)
    {
        this.reserved1 = reserved1;
    }

    public String getReserved2()
    {
        return reserved2;
    }

    public void setReserved2(String reserved2)
    {
        this.reserved2 = reserved2;
    }

    public String getExtField1()
    {
        return extField1;
    }

    public void setExtField1(String extField1)
    {
        this.extField1 = extField1;
    }

    @Override
    public String toString() {
        return new ToStringBuilder(this,ToStringStyle.MULTI_LINE_STYLE)
            .append("messageId", getMessageId())
            .append("conversationId", getConversationId())
            .append("senderType", getSenderType())
            .append("senderId", getSenderId())
            .append("senderName", getSenderName())
            .append("messageType", getMessageType())
            .append("content", getContent())
            .append("fileUrl", getFileUrl())
            .append("fileName", getFileName())
            .append("fileSize", getFileSize())
            .append("isRead", getIsRead())
            .append("readTime", getReadTime())
            .append("isRecall", getIsRecall())
            .append("recallTime", getRecallTime())
            .append("replyToId", getReplyToId())
            .append("sendTime", getSendTime())
            .append("delFlag", getDelFlag())
            .append("createBy", getCreateBy())
            .append("createTime", getCreateTime())
            .append("updateBy", getUpdateBy())
            .append("updateTime", getUpdateTime())
            .append("reserved1", getReserved1())
            .append("reserved2", getReserved2())
            .append("extField1", getExtField1())
            .toString();
    }
}
