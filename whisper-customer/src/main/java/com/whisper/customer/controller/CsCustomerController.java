package com.whisper.customer.controller;

import java.util.List;
import javax.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import com.whisper.common.annotation.Log;
import com.whisper.common.core.controller.BaseController;
import com.whisper.common.core.domain.AjaxResult;
import com.whisper.common.core.page.TableDataInfo;
import com.whisper.common.enums.BusinessType;
import com.whisper.common.utils.poi.ExcelUtil;
import com.whisper.customer.domain.CsCustomer;
import com.whisper.customer.service.ICsCustomerService;

/**
 * 客户信息管理 信息操作处理
 * 
 * @author whisper
 */
@RestController
@RequestMapping("/customer/customer")
public class CsCustomerController extends BaseController
{
    @Autowired
    private ICsCustomerService csCustomerService;

    /**
     * 查询客户信息列表
     */
    @PreAuthorize("@ss.hasPermi('customer:customer:list')")
    @GetMapping("/list")
    public TableDataInfo list(CsCustomer csCustomer)
    {
        startPage();
        List<CsCustomer> list = csCustomerService.selectCsCustomerList(csCustomer);
        return getDataTable(list);
    }

    /**
     * 导出客户信息列表
     */
    @PreAuthorize("@ss.hasPermi('customer:customer:export')")
    @Log(title = "客户信息管理", businessType = BusinessType.EXPORT)
    @PostMapping("/export")
    public void export(HttpServletResponse response, CsCustomer csCustomer)
    {
        List<CsCustomer> list = csCustomerService.selectCsCustomerList(csCustomer);
        ExcelUtil<CsCustomer> util = new ExcelUtil<CsCustomer>(CsCustomer.class);
        util.exportExcel(response, list, "客户信息数据");
    }

    /**
     * 获取客户信息详细信息
     */
    @PreAuthorize("@ss.hasPermi('customer:customer:query')")
    @GetMapping(value = "/{customerId}")
    public AjaxResult getInfo(@PathVariable("customerId") Long customerId)
    {
        return success(csCustomerService.selectCsCustomerByCustomerId(customerId));
    }

    /**
     * 根据客户编号获取客户信息
     */
    @GetMapping(value = "/customerNo/{customerNo}")
    public AjaxResult getInfoByCustomerNo(@PathVariable("customerNo") String customerNo)
    {
        return success(csCustomerService.selectCsCustomerByCustomerNo(customerNo));
    }

    /**
     * 根据手机号获取客户信息
     */
    @GetMapping(value = "/phone/{phone}")
    public AjaxResult getInfoByPhone(@PathVariable("phone") String phone)
    {
        return success(csCustomerService.selectCsCustomerByPhone(phone));
    }

    /**
     * 根据邮箱获取客户信息
     */
    @GetMapping(value = "/email/{email}")
    public AjaxResult getInfoByEmail(@PathVariable("email") String email)
    {
        return success(csCustomerService.selectCsCustomerByEmail(email));
    }

    /**
     * 新增客户信息
     */
    @PreAuthorize("@ss.hasPermi('customer:customer:add')")
    @Log(title = "客户信息管理", businessType = BusinessType.INSERT)
    @PostMapping
    public AjaxResult add(@Validated @RequestBody CsCustomer csCustomer)
    {
        if (!csCustomerService.checkCustomerNoUnique(csCustomer))
        {
            return error("新增客户'" + csCustomer.getCustomerName() + "'失败，客户编号已存在");
        }
        else if (!csCustomerService.checkPhoneUnique(csCustomer))
        {
            return error("新增客户'" + csCustomer.getCustomerName() + "'失败，手机号码已存在");
        }
        else if (!csCustomerService.checkEmailUnique(csCustomer))
        {
            return error("新增客户'" + csCustomer.getCustomerName() + "'失败，邮箱账号已存在");
        }
        csCustomer.setCreateBy(getUsername());
        return toAjax(csCustomerService.insertCsCustomer(csCustomer));
    }

    /**
     * 修改客户信息
     */
    @PreAuthorize("@ss.hasPermi('customer:customer:edit')")
    @Log(title = "客户信息管理", businessType = BusinessType.UPDATE)
    @PutMapping
    public AjaxResult edit(@Validated @RequestBody CsCustomer csCustomer)
    {
        if (!csCustomerService.checkCustomerNoUnique(csCustomer))
        {
            return error("修改客户'" + csCustomer.getCustomerName() + "'失败，客户编号已存在");
        }
        else if (!csCustomerService.checkPhoneUnique(csCustomer))
        {
            return error("修改客户'" + csCustomer.getCustomerName() + "'失败，手机号码已存在");
        }
        else if (!csCustomerService.checkEmailUnique(csCustomer))
        {
            return error("修改客户'" + csCustomer.getCustomerName() + "'失败，邮箱账号已存在");
        }
        csCustomer.setUpdateBy(getUsername());
        return toAjax(csCustomerService.updateCsCustomer(csCustomer));
    }

    /**
     * 删除客户信息
     */
    @PreAuthorize("@ss.hasPermi('customer:customer:remove')")
    @Log(title = "客户信息管理", businessType = BusinessType.DELETE)
    @DeleteMapping("/{customerIds}")
    public AjaxResult remove(@PathVariable Long[] customerIds)
    {
        return toAjax(csCustomerService.deleteCsCustomerByCustomerIds(customerIds));
    }

    /**
     * 更新客户最后联系时间
     */
    @PostMapping("/updateLastContactTime/{customerId}")
    public AjaxResult updateLastContactTime(@PathVariable Long customerId)
    {
        return toAjax(csCustomerService.updateLastContactTime(customerId));
    }

    /**
     * 根据客户等级查询客户列表
     */
    @GetMapping("/level/{level}")
    public AjaxResult getCustomersByLevel(@PathVariable String level)
    {
        List<CsCustomer> list = csCustomerService.selectCsCustomerByLevel(level);
        return success(list);
    }

    /**
     * 根据客户来源查询客户列表
     */
    @GetMapping("/source/{source}")
    public AjaxResult getCustomersBySource(@PathVariable String source)
    {
        List<CsCustomer> list = csCustomerService.selectCsCustomerBySource(source);
        return success(list);
    }

    /**
     * 客户统计信息
     */
    @GetMapping("/statistics")
    public AjaxResult getStatistics()
    {
        AjaxResult ajax = AjaxResult.success();
        ajax.put("totalCustomers", csCustomerService.countCustomers());
        ajax.put("todayNewCustomers", csCustomerService.countTodayNewCustomers());
        return ajax;
    }

    /**
     * 导入客户数据
     */
    @Log(title = "客户信息管理", businessType = BusinessType.IMPORT)
    @PreAuthorize("@ss.hasPermi('customer:customer:import')")
    @PostMapping("/importData")
    public AjaxResult importData(MultipartFile file, boolean updateSupport) throws Exception
    {
        ExcelUtil<CsCustomer> util = new ExcelUtil<CsCustomer>(CsCustomer.class);
        List<CsCustomer> customerList = util.importExcel(file.getInputStream());
        String operName = getUsername();
        String message = csCustomerService.importCustomer(customerList, updateSupport, operName);
        return success(message);
    }

    /**
     * 下载客户导入模板
     */
    @PostMapping("/importTemplate")
    public void importTemplate(HttpServletResponse response)
    {
        ExcelUtil<CsCustomer> util = new ExcelUtil<CsCustomer>(CsCustomer.class);
        util.importTemplateExcel(response, "客户数据");
    }

    /**
     * 生成客户编号
     */
    @GetMapping("/generateCustomerNo")
    public AjaxResult generateCustomerNo()
    {
        return AjaxResult.success().put("customerNo", csCustomerService.generateCustomerNo());
    }
}
