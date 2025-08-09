package com.whisper.customer.domain;

import java.util.Date;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;
import org.apache.commons.lang3.builder.ToStringBuilder;
import org.apache.commons.lang3.builder.ToStringStyle;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.whisper.common.annotation.Excel;
import com.whisper.common.annotation.Excel.ColumnType;
import com.whisper.common.core.domain.BaseEntity;

/**
 * 客户信息表 cs_customer
 * 
 * @author whisper
 */
public class CsCustomer extends BaseEntity
{
    private static final long serialVersionUID = 1L;

    /** 客户ID */
    @Excel(name = "客户ID", cellType = ColumnType.NUMERIC)
    private Long customerId;

    /** 客户编号 */
    @Excel(name = "客户编号")
    private String customerNo;

    /** 客户姓名 */
    @Excel(name = "客户姓名")
    private String customerName;

    /** 客户类型（1个人 2企业） */
    @Excel(name = "客户类型", readConverterExp = "1=个人,2=企业")
    private String customerType;

    /** 手机号码 */
    @Excel(name = "手机号码")
    private String phone;

    /** 邮箱地址 */
    @Excel(name = "邮箱地址")
    private String email;

    /** 微信号 */
    private String wechat;

    /** QQ号 */
    private String qq;

    /** 公司名称 */
    @Excel(name = "公司名称")
    private String company;

    /** 所属行业 */
    private String industry;

    /** 所在地区 */
    private String region;

    /** 详细地址 */
    private String address;

    /** 生日 */
    @JsonFormat(pattern = "yyyy-MM-dd")
    @Excel(name = "生日", width = 30, dateFormat = "yyyy-MM-dd")
    private Date birthday;

    /** 性别（0未知 1男 2女） */
    @Excel(name = "性别", readConverterExp = "0=未知,1=男,2=女")
    private String gender;

    /** 头像地址 */
    private String avatar;

    /** 客户等级（1普通 2VIP 3SVIP） */
    @Excel(name = "客户等级", readConverterExp = "1=普通,2=VIP,3=SVIP")
    private String level;

    /** 客户来源 */
    @Excel(name = "客户来源")
    private String source;

    /** 客户标签（JSON格式） */
    private String tags;

    /** 最后联系时间 */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    @Excel(name = "最后联系时间", width = 30, dateFormat = "yyyy-MM-dd HH:mm:ss")
    private Date lastContactTime;

    /** 状态（0正常 1黑名单 2潜在客户） */
    @Excel(name = "状态", readConverterExp = "0=正常,1=黑名单,2=潜在客户")
    private String status;

    /** 删除标志（0存在 2删除） */
    private String delFlag;

    /** IP地址 */
    private String ipAddress;

    /** IP地理位置 */
    private String ipLocation;

    /** 预留字段3 */
    private String reserved3;

    /** 扩展字段1 */
    private String extField1;

    /** 扩展字段2 */
    private String extField2;

    public Long getCustomerId()
    {
        return customerId;
    }

    public void setCustomerId(Long customerId)
    {
        this.customerId = customerId;
    }

    public String getCustomerNo()
    {
        return customerNo;
    }

    public void setCustomerNo(String customerNo)
    {
        this.customerNo = customerNo;
    }

    @NotBlank(message = "客户姓名不能为空")
    @Size(min = 0, max = 100, message = "客户姓名不能超过100个字符")
    public String getCustomerName()
    {
        return customerName;
    }

    public void setCustomerName(String customerName)
    {
        this.customerName = customerName;
    }

    public String getCustomerType()
    {
        return customerType;
    }

    public void setCustomerType(String customerType)
    {
        this.customerType = customerType;
    }

    @Size(min = 0, max = 20, message = "手机号码不能超过20个字符")
    public String getPhone()
    {
        return phone;
    }

    public void setPhone(String phone)
    {
        this.phone = phone;
    }

    @Size(min = 0, max = 100, message = "邮箱地址不能超过100个字符")
    public String getEmail()
    {
        return email;
    }

    public void setEmail(String email)
    {
        this.email = email;
    }

    public String getWechat()
    {
        return wechat;
    }

    public void setWechat(String wechat)
    {
        this.wechat = wechat;
    }

    public String getQq()
    {
        return qq;
    }

    public void setQq(String qq)
    {
        this.qq = qq;
    }

    public String getCompany()
    {
        return company;
    }

    public void setCompany(String company)
    {
        this.company = company;
    }

    public String getIndustry()
    {
        return industry;
    }

    public void setIndustry(String industry)
    {
        this.industry = industry;
    }

    public String getRegion()
    {
        return region;
    }

    public void setRegion(String region)
    {
        this.region = region;
    }

    public String getAddress()
    {
        return address;
    }

    public void setAddress(String address)
    {
        this.address = address;
    }

    public Date getBirthday()
    {
        return birthday;
    }

    public void setBirthday(Date birthday)
    {
        this.birthday = birthday;
    }

    public String getGender()
    {
        return gender;
    }

    public void setGender(String gender)
    {
        this.gender = gender;
    }

    public String getAvatar()
    {
        return avatar;
    }

    public void setAvatar(String avatar)
    {
        this.avatar = avatar;
    }

    public String getLevel()
    {
        return level;
    }

    public void setLevel(String level)
    {
        this.level = level;
    }

    public String getSource()
    {
        return source;
    }

    public void setSource(String source)
    {
        this.source = source;
    }

    public String getTags()
    {
        return tags;
    }

    public void setTags(String tags)
    {
        this.tags = tags;
    }

    public Date getLastContactTime()
    {
        return lastContactTime;
    }

    public void setLastContactTime(Date lastContactTime)
    {
        this.lastContactTime = lastContactTime;
    }

    public String getStatus()
    {
        return status;
    }

    public void setStatus(String status)
    {
        this.status = status;
    }

    public String getDelFlag()
    {
        return delFlag;
    }

    public void setDelFlag(String delFlag)
    {
        this.delFlag = delFlag;
    }

    public String getIpAddress()
    {
        return ipAddress;
    }

    public void setIpAddress(String ipAddress)
    {
        this.ipAddress = ipAddress;
    }

    public String getIpLocation()
    {
        return ipLocation;
    }

    public void setIpLocation(String ipLocation)
    {
        this.ipLocation = ipLocation;
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

    public String getExtField2()
    {
        return extField2;
    }

    public void setExtField2(String extField2)
    {
        this.extField2 = extField2;
    }

    @Override
    public String toString() {
        return new ToStringBuilder(this,ToStringStyle.MULTI_LINE_STYLE)
            .append("customerId", getCustomerId())
            .append("customerNo", getCustomerNo())
            .append("customerName", getCustomerName())
            .append("customerType", getCustomerType())
            .append("phone", getPhone())
            .append("email", getEmail())
            .append("wechat", getWechat())
            .append("qq", getQq())
            .append("company", getCompany())
            .append("industry", getIndustry())
            .append("region", getRegion())
            .append("address", getAddress())
            .append("birthday", getBirthday())
            .append("gender", getGender())
            .append("avatar", getAvatar())
            .append("level", getLevel())
            .append("source", getSource())
            .append("tags", getTags())
            .append("lastContactTime", getLastContactTime())
            .append("status", getStatus())
            .append("delFlag", getDelFlag())
            .append("createBy", getCreateBy())
            .append("createTime", getCreateTime())
            .append("updateBy", getUpdateBy())
            .append("updateTime", getUpdateTime())
            .append("remark", getRemark())
            .append("ipAddress", getIpAddress())
            .append("ipLocation", getIpLocation())
            .append("reserved3", getReserved3())
            .append("extField1", getExtField1())
            .append("extField2", getExtField2())
            .toString();
    }
}
