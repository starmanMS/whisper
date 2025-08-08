package com.whisper.customer.mapper;

import java.util.List;
import org.apache.ibatis.annotations.Param;
import com.whisper.customer.domain.CsCustomer;

/**
 * 客户信息表 数据层
 * 
 * @author whisper
 */
public interface CsCustomerMapper
{
    /**
     * 查询客户信息
     * 
     * @param customerId 客户信息主键
     * @return 客户信息
     */
    public CsCustomer selectCsCustomerByCustomerId(Long customerId);

    /**
     * 根据客户编号查询客户信息
     * 
     * @param customerNo 客户编号
     * @return 客户信息
     */
    public CsCustomer selectCsCustomerByCustomerNo(String customerNo);

    /**
     * 根据手机号查询客户信息
     * 
     * @param phone 手机号
     * @return 客户信息
     */
    public CsCustomer selectCsCustomerByPhone(String phone);

    /**
     * 根据邮箱查询客户信息
     * 
     * @param email 邮箱
     * @return 客户信息
     */
    public CsCustomer selectCsCustomerByEmail(String email);

    /**
     * 查询客户信息列表
     * 
     * @param csCustomer 客户信息
     * @return 客户信息集合
     */
    public List<CsCustomer> selectCsCustomerList(CsCustomer csCustomer);

    /**
     * 新增客户信息
     * 
     * @param csCustomer 客户信息
     * @return 结果
     */
    public int insertCsCustomer(CsCustomer csCustomer);

    /**
     * 修改客户信息
     * 
     * @param csCustomer 客户信息
     * @return 结果
     */
    public int updateCsCustomer(CsCustomer csCustomer);

    /**
     * 删除客户信息
     * 
     * @param customerId 客户信息主键
     * @return 结果
     */
    public int deleteCsCustomerByCustomerId(Long customerId);

    /**
     * 批量删除客户信息
     * 
     * @param customerIds 需要删除的数据主键集合
     * @return 结果
     */
    public int deleteCsCustomerByCustomerIds(Long[] customerIds);

    /**
     * 校验客户编号是否唯一
     * 
     * @param customerNo 客户编号
     * @return 结果
     */
    public CsCustomer checkCustomerNoUnique(String customerNo);

    /**
     * 校验手机号码是否唯一
     *
     * @param phone 手机号码
     * @return 结果
     */
    public CsCustomer checkPhoneUnique(String phone);

    /**
     * 校验email是否唯一
     *
     * @param email 客户邮箱
     * @return 结果
     */
    public CsCustomer checkEmailUnique(String email);

    /**
     * 更新客户最后联系时间
     * 
     * @param customerId 客户ID
     * @return 结果
     */
    public int updateLastContactTime(@Param("customerId") Long customerId);

    /**
     * 根据客户等级查询客户列表
     * 
     * @param level 客户等级
     * @return 客户信息集合
     */
    public List<CsCustomer> selectCsCustomerByLevel(String level);

    /**
     * 根据客户来源查询客户列表
     * 
     * @param source 客户来源
     * @return 客户信息集合
     */
    public List<CsCustomer> selectCsCustomerBySource(String source);

    /**
     * 统计客户总数
     * 
     * @return 客户总数
     */
    public int countCustomers();

    /**
     * 统计今日新增客户数
     * 
     * @return 今日新增客户数
     */
    public int countTodayNewCustomers();
}
