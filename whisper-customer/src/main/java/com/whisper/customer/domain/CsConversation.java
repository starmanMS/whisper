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
 * 会话管理表 cs_conversation
 * 
 * @author whisper
 */
public class CsConversation extends BaseEntity
{
    private static final long serialVersionUID = 1L;

    /** 会话ID */
    @Excel(name = "会话ID", cellType = ColumnType.NUMERIC)
    private Long conversationId;

    /** 会话标识 */
    @Excel(name = "会话标识")
    private String sessionId;

    /** 客户ID */
    @Excel(name = "客户ID", cellType = ColumnType.NUMERIC)
    private Long customerId;

    /** 客服人员ID */
    @Excel(name = "客服人员ID", cellType = ColumnType.NUMERIC)
    private Long agentId;

    /** 渠道（web网页 wechat微信 app应用 phone电话） */
    @Excel(name = "渠道", readConverterExp = "web=网页,wechat=微信,app=应用,phone=电话")
    private String channel;

    /** 会话类型（1咨询 2投诉 3建议 4售后） */
    @Excel(name = "会话类型", readConverterExp = "1=咨询,2=投诉,3=建议,4=售后")
    private String conversationType;

    /** 会话标题 */
    @Excel(name = "会话标题")
    private String title;

    /** 会话状态（0待分配 1进行中 2已结束 3已转接） */
    @Excel(name = "会话状态", readConverterExp = "0=待分配,1=进行中,2=已结束,3=已转接")
    private String status;

    /** 优先级（1低 2中 3高 4紧急） */
    @Excel(name = "优先级", readConverterExp = "1=低,2=中,3=高,4=紧急")
    private String priority;

    /** 开始时间 */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    @Excel(name = "开始时间", width = 30, dateFormat = "yyyy-MM-dd HH:mm:ss")
    private Date startTime;

    /** 结束时间 */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    @Excel(name = "结束时间", width = 30, dateFormat = "yyyy-MM-dd HH:mm:ss")
    private Date endTime;

    /** 持续时长（秒） */
    @Excel(name = "持续时长", cellType = ColumnType.NUMERIC)
    private Integer duration;

    /** 满意度（1很不满意 2不满意 3一般 4满意 5很满意） */
    @Excel(name = "满意度", readConverterExp = "1=很不满意,2=不满意,3=一般,4=满意,5=很满意")
    private String satisfaction;

    /** 是否机器人服务（0否 1是） */
    @Excel(name = "是否机器人服务", readConverterExp = "0=否,1=是")
    private String isRobot;

    /** 转接次数 */
    @Excel(name = "转接次数", cellType = ColumnType.NUMERIC)
    private Integer transferCount;

    /** 排队时长（秒） */
    @Excel(name = "排队时长", cellType = ColumnType.NUMERIC)
    private Integer queueTime;

    /** 首次响应时长（秒） */
    @Excel(name = "首次响应时长", cellType = ColumnType.NUMERIC)
    private Integer firstResponseTime;

    /** 平均响应时长（秒） */
    @Excel(name = "平均响应时长", cellType = ColumnType.NUMERIC)
    private Integer avgResponseTime;

    /** 消息总数 */
    @Excel(name = "消息总数", cellType = ColumnType.NUMERIC)
    private Integer messageCount;

    /** 删除标志（0存在 2删除） */
    private String delFlag;

    /** 预留字段1 */
    private String reserved1;

    /** 预留字段2 */
    private String reserved2;

    /** 预留字段3 */
    private String reserved3;

    /** 扩展字段1 */
    private String extField1;

    public Long getConversationId()
    {
        return conversationId;
    }

    public void setConversationId(Long conversationId)
    {
        this.conversationId = conversationId;
    }

    @NotBlank(message = "会话标识不能为空")
    @Size(min = 0, max = 64, message = "会话标识不能超过64个字符")
    public String getSessionId()
    {
        return sessionId;
    }

    public void setSessionId(String sessionId)
    {
        this.sessionId = sessionId;
    }

    @NotNull(message = "客户ID不能为空")
    public Long getCustomerId()
    {
        return customerId;
    }

    public void setCustomerId(Long customerId)
    {
        this.customerId = customerId;
    }

    public Long getAgentId()
    {
        return agentId;
    }

    public void setAgentId(Long agentId)
    {
        this.agentId = agentId;
    }

    @NotBlank(message = "渠道不能为空")
    @Size(min = 0, max = 20, message = "渠道不能超过20个字符")
    public String getChannel()
    {
        return channel;
    }

    public void setChannel(String channel)
    {
        this.channel = channel;
    }

    public String getConversationType()
    {
        return conversationType;
    }

    public void setConversationType(String conversationType)
    {
        this.conversationType = conversationType;
    }

    @Size(min = 0, max = 200, message = "会话标题不能超过200个字符")
    public String getTitle()
    {
        return title;
    }

    public void setTitle(String title)
    {
        this.title = title;
    }

    public String getStatus()
    {
        return status;
    }

    public void setStatus(String status)
    {
        this.status = status;
    }

    public String getPriority()
    {
        return priority;
    }

    public void setPriority(String priority)
    {
        this.priority = priority;
    }

    @NotNull(message = "开始时间不能为空")
    public Date getStartTime()
    {
        return startTime;
    }

    public void setStartTime(Date startTime)
    {
        this.startTime = startTime;
    }

    public Date getEndTime()
    {
        return endTime;
    }

    public void setEndTime(Date endTime)
    {
        this.endTime = endTime;
    }

    public Integer getDuration()
    {
        return duration;
    }

    public void setDuration(Integer duration)
    {
        this.duration = duration;
    }

    public String getSatisfaction()
    {
        return satisfaction;
    }

    public void setSatisfaction(String satisfaction)
    {
        this.satisfaction = satisfaction;
    }

    public String getIsRobot()
    {
        return isRobot;
    }

    public void setIsRobot(String isRobot)
    {
        this.isRobot = isRobot;
    }

    public Integer getTransferCount()
    {
        return transferCount;
    }

    public void setTransferCount(Integer transferCount)
    {
        this.transferCount = transferCount;
    }

    public Integer getQueueTime()
    {
        return queueTime;
    }

    public void setQueueTime(Integer queueTime)
    {
        this.queueTime = queueTime;
    }

    public Integer getFirstResponseTime()
    {
        return firstResponseTime;
    }

    public void setFirstResponseTime(Integer firstResponseTime)
    {
        this.firstResponseTime = firstResponseTime;
    }

    public Integer getAvgResponseTime()
    {
        return avgResponseTime;
    }

    public void setAvgResponseTime(Integer avgResponseTime)
    {
        this.avgResponseTime = avgResponseTime;
    }

    public Integer getMessageCount()
    {
        return messageCount;
    }

    public void setMessageCount(Integer messageCount)
    {
        this.messageCount = messageCount;
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

    public String getReserved3()
    {
        return reserved3;
    }

    public void setReserved3(String reserved3)
    {
        this.reserved3 = reserved3;
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
            .append("conversationId", getConversationId())
            .append("sessionId", getSessionId())
            .append("customerId", getCustomerId())
            .append("agentId", getAgentId())
            .append("channel", getChannel())
            .append("conversationType", getConversationType())
            .append("title", getTitle())
            .append("status", getStatus())
            .append("priority", getPriority())
            .append("startTime", getStartTime())
            .append("endTime", getEndTime())
            .append("duration", getDuration())
            .append("satisfaction", getSatisfaction())
            .append("isRobot", getIsRobot())
            .append("transferCount", getTransferCount())
            .append("queueTime", getQueueTime())
            .append("firstResponseTime", getFirstResponseTime())
            .append("avgResponseTime", getAvgResponseTime())
            .append("messageCount", getMessageCount())
            .append("delFlag", getDelFlag())
            .append("createBy", getCreateBy())
            .append("createTime", getCreateTime())
            .append("updateBy", getUpdateBy())
            .append("updateTime", getUpdateTime())
            .append("remark", getRemark())
            .append("reserved1", getReserved1())
            .append("reserved2", getReserved2())
            .append("reserved3", getReserved3())
            .append("extField1", getExtField1())
            .toString();
    }
}
