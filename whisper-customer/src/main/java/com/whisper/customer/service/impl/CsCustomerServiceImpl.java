package com.whisper.customer.service.impl;

import java.util.List;
import java.util.Date;
import javax.validation.Validator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.whisper.common.annotation.DataSource;
import com.whisper.common.core.text.Convert;
import com.whisper.common.enums.DataSourceType;
import com.whisper.common.exception.ServiceException;
import com.whisper.common.utils.DateUtils;
import com.whisper.common.utils.StringUtils;
import com.whisper.common.utils.bean.BeanValidators;
import com.whisper.common.utils.uuid.IdUtils;
import com.whisper.customer.domain.CsCustomer;
import com.whisper.customer.mapper.CsCustomerMapper;
import com.whisper.customer.service.ICsCustomerService;

/**
 * 客户信息表 服务层实现
 * 
 * @author whisper
 */
@Service
public class CsCustomerServiceImpl implements ICsCustomerService
{
    @Autowired
    private CsCustomerMapper csCustomerMapper;

    @Autowired
    protected Validator validator;

    /**
     * 查询客户信息
     * 
     * @param customerId 客户信息主键
     * @return 客户信息
     */
    @Override
    public CsCustomer selectCsCustomerByCustomerId(Long customerId)
    {
        return csCustomerMapper.selectCsCustomerByCustomerId(customerId);
    }

    /**
     * 根据客户编号查询客户信息
     * 
     * @param customerNo 客户编号
     * @return 客户信息
     */
    @Override
    public CsCustomer selectCsCustomerByCustomerNo(String customerNo)
    {
        return csCustomerMapper.selectCsCustomerByCustomerNo(customerNo);
    }

    /**
     * 根据手机号查询客户信息
     * 
     * @param phone 手机号
     * @return 客户信息
     */
    @Override
    public CsCustomer selectCsCustomerByPhone(String phone)
    {
        return csCustomerMapper.selectCsCustomerByPhone(phone);
    }

    /**
     * 根据邮箱查询客户信息
     * 
     * @param email 邮箱
     * @return 客户信息
     */
    @Override
    public CsCustomer selectCsCustomerByEmail(String email)
    {
        return csCustomerMapper.selectCsCustomerByEmail(email);
    }

    /**
     * 查询客户信息列表
     * 
     * @param csCustomer 客户信息
     * @return 客户信息
     */
    @Override
    public List<CsCustomer> selectCsCustomerList(CsCustomer csCustomer)
    {
        return csCustomerMapper.selectCsCustomerList(csCustomer);
    }

    /**
     * 新增客户信息
     * 
     * @param csCustomer 客户信息
     * @return 结果
     */
    @Override
    public int insertCsCustomer(CsCustomer csCustomer)
    {
        // 生成客户编号
        if (StringUtils.isEmpty(csCustomer.getCustomerNo()))
        {
            csCustomer.setCustomerNo(generateCustomerNo());
        }
        
        // 设置默认值
        if (StringUtils.isEmpty(csCustomer.getCustomerType()))
        {
            csCustomer.setCustomerType("1"); // 默认个人客户
        }
        if (StringUtils.isEmpty(csCustomer.getLevel()))
        {
            csCustomer.setLevel("1"); // 默认普通客户
        }
        if (StringUtils.isEmpty(csCustomer.getStatus()))
        {
            csCustomer.setStatus("0"); // 默认正常状态
        }
        if (StringUtils.isEmpty(csCustomer.getGender()))
        {
            csCustomer.setGender("0"); // 默认未知性别
        }
        
        csCustomer.setCreateTime(DateUtils.getNowDate());
        return csCustomerMapper.insertCsCustomer(csCustomer);
    }

    /**
     * 修改客户信息
     * 
     * @param csCustomer 客户信息
     * @return 结果
     */
    @Override
    public int updateCsCustomer(CsCustomer csCustomer)
    {
        csCustomer.setUpdateTime(DateUtils.getNowDate());
        return csCustomerMapper.updateCsCustomer(csCustomer);
    }

    /**
     * 批量删除客户信息
     * 
     * @param customerIds 需要删除的客户信息主键
     * @return 结果
     */
    @Override
    public int deleteCsCustomerByCustomerIds(Long[] customerIds)
    {
        return csCustomerMapper.deleteCsCustomerByCustomerIds(customerIds);
    }

    /**
     * 删除客户信息信息
     * 
     * @param customerId 客户信息主键
     * @return 结果
     */
    @Override
    public int deleteCsCustomerByCustomerId(Long customerId)
    {
        return csCustomerMapper.deleteCsCustomerByCustomerId(customerId);
    }

    /**
     * 校验客户编号是否唯一
     * 
     * @param customer 客户信息
     * @return 结果
     */
    @Override
    public boolean checkCustomerNoUnique(CsCustomer customer)
    {
        Long customerId = StringUtils.isNull(customer.getCustomerId()) ? -1L : customer.getCustomerId();
        CsCustomer info = csCustomerMapper.checkCustomerNoUnique(customer.getCustomerNo());
        if (StringUtils.isNotNull(info) && info.getCustomerId().longValue() != customerId.longValue())
        {
            return false;
        }
        return true;
    }

    /**
     * 校验手机号码是否唯一
     *
     * @param customer 客户信息
     * @return 结果
     */
    @Override
    public boolean checkPhoneUnique(CsCustomer customer)
    {
        Long customerId = StringUtils.isNull(customer.getCustomerId()) ? -1L : customer.getCustomerId();
        CsCustomer info = csCustomerMapper.checkPhoneUnique(customer.getPhone());
        if (StringUtils.isNotNull(info) && info.getCustomerId().longValue() != customerId.longValue())
        {
            return false;
        }
        return true;
    }

    /**
     * 校验email是否唯一
     *
     * @param customer 客户信息
     * @return 结果
     */
    @Override
    public boolean checkEmailUnique(CsCustomer customer)
    {
        Long customerId = StringUtils.isNull(customer.getCustomerId()) ? -1L : customer.getCustomerId();
        CsCustomer info = csCustomerMapper.checkEmailUnique(customer.getEmail());
        if (StringUtils.isNotNull(info) && info.getCustomerId().longValue() != customerId.longValue())
        {
            return false;
        }
        return true;
    }

    /**
     * 更新客户最后联系时间
     * 
     * @param customerId 客户ID
     * @return 结果
     */
    @Override
    public int updateLastContactTime(Long customerId)
    {
        return csCustomerMapper.updateLastContactTime(customerId);
    }

    /**
     * 根据客户等级查询客户列表
     * 
     * @param level 客户等级
     * @return 客户信息集合
     */
    @Override
    public List<CsCustomer> selectCsCustomerByLevel(String level)
    {
        return csCustomerMapper.selectCsCustomerByLevel(level);
    }

    /**
     * 根据客户来源查询客户列表
     * 
     * @param source 客户来源
     * @return 客户信息集合
     */
    @Override
    public List<CsCustomer> selectCsCustomerBySource(String source)
    {
        return csCustomerMapper.selectCsCustomerBySource(source);
    }

    /**
     * 统计客户总数
     * 
     * @return 客户总数
     */
    @Override
    public int countCustomers()
    {
        return csCustomerMapper.countCustomers();
    }

    /**
     * 统计今日新增客户数
     * 
     * @return 今日新增客户数
     */
    @Override
    public int countTodayNewCustomers()
    {
        return csCustomerMapper.countTodayNewCustomers();
    }

    /**
     * 导入客户数据
     * 
     * @param customerList 客户数据列表
     * @param isUpdateSupport 是否更新支持，如果已存在，则进行更新数据
     * @param operName 操作用户
     * @return 结果
     */
    @Override
    public String importCustomer(List<CsCustomer> customerList, Boolean isUpdateSupport, String operName)
    {
        if (StringUtils.isNull(customerList) || customerList.size() == 0)
        {
            throw new ServiceException("导入客户数据不能为空！");
        }
        int successNum = 0;
        int failureNum = 0;
        StringBuilder successMsg = new StringBuilder();
        StringBuilder failureMsg = new StringBuilder();
        for (CsCustomer customer : customerList)
        {
            try
            {
                // 验证是否存在这个客户
                CsCustomer c = csCustomerMapper.selectCsCustomerByCustomerNo(customer.getCustomerNo());
                if (StringUtils.isNull(c))
                {
                    BeanValidators.validateWithException(validator, customer);
                    customer.setCreateBy(operName);
                    this.insertCsCustomer(customer);
                    successNum++;
                    successMsg.append("<br/>" + successNum + "、客户 " + customer.getCustomerName() + " 导入成功");
                }
                else if (isUpdateSupport)
                {
                    BeanValidators.validateWithException(validator, customer);
                    customer.setCustomerId(c.getCustomerId());
                    customer.setUpdateBy(operName);
                    this.updateCsCustomer(customer);
                    successNum++;
                    successMsg.append("<br/>" + successNum + "、客户 " + customer.getCustomerName() + " 更新成功");
                }
                else
                {
                    failureNum++;
                    failureMsg.append("<br/>" + failureNum + "、客户 " + customer.getCustomerName() + " 已存在");
                }
            }
            catch (Exception e)
            {
                failureNum++;
                String msg = "<br/>" + failureNum + "、客户 " + customer.getCustomerName() + " 导入失败：";
                failureMsg.append(msg + e.getMessage());
            }
        }
        if (failureNum > 0)
        {
            failureMsg.insert(0, "很抱歉，导入失败！共 " + failureNum + " 条数据格式不正确，错误如下：");
            throw new ServiceException(failureMsg.toString());
        }
        else
        {
            successMsg.insert(0, "恭喜您，数据已全部导入成功！共 " + successNum + " 条，数据如下：");
        }
        return successMsg.toString();
    }

    /**
     * 生成客户编号
     *
     * @return 客户编号
     */
    @Override
    public String generateCustomerNo()
    {
        return "CUS" + DateUtils.dateTimeNow("yyyyMMddHHmmss") + IdUtils.fastSimpleUUID().substring(0, 4);
    }
}
