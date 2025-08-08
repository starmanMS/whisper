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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.whisper.common.annotation.Log;
import com.whisper.common.core.controller.BaseController;
import com.whisper.common.core.domain.AjaxResult;
import com.whisper.common.core.page.TableDataInfo;
import com.whisper.common.enums.BusinessType;
import com.whisper.common.utils.poi.ExcelUtil;
import com.whisper.customer.domain.CsConversation;
import com.whisper.customer.service.ICsConversationService;

/**
 * 会话管理 信息操作处理
 * 
 * @author whisper
 */
@RestController
@RequestMapping("/customer/conversation")
public class CsConversationController extends BaseController
{
    @Autowired
    private ICsConversationService csConversationService;

    /**
     * 查询会话管理列表
     */
    @PreAuthorize("@ss.hasPermi('customer:conversation:list')")
    @GetMapping("/list")
    public TableDataInfo list(CsConversation csConversation)
    {
        startPage();
        List<CsConversation> list = csConversationService.selectCsConversationList(csConversation);
        return getDataTable(list);
    }

    /**
     * 导出会话管理列表
     */
    @PreAuthorize("@ss.hasPermi('customer:conversation:export')")
    @Log(title = "会话管理", businessType = BusinessType.EXPORT)
    @PostMapping("/export")
    public void export(HttpServletResponse response, CsConversation csConversation)
    {
        List<CsConversation> list = csConversationService.selectCsConversationList(csConversation);
        ExcelUtil<CsConversation> util = new ExcelUtil<CsConversation>(CsConversation.class);
        util.exportExcel(response, list, "会话管理数据");
    }

    /**
     * 获取会话管理详细信息
     */
    @PreAuthorize("@ss.hasPermi('customer:conversation:query')")
    @GetMapping(value = "/{conversationId}")
    public AjaxResult getInfo(@PathVariable("conversationId") Long conversationId)
    {
        return success(csConversationService.selectCsConversationByConversationId(conversationId));
    }

    /**
     * 根据会话标识获取会话信息
     */
    @GetMapping(value = "/sessionId/{sessionId}")
    public AjaxResult getInfoBySessionId(@PathVariable("sessionId") String sessionId)
    {
        return success(csConversationService.selectCsConversationBySessionId(sessionId));
    }

    /**
     * 根据客户ID查询会话列表
     */
    @GetMapping("/customer/{customerId}")
    public AjaxResult getConversationsByCustomerId(@PathVariable Long customerId)
    {
        List<CsConversation> list = csConversationService.selectCsConversationByCustomerId(customerId);
        return success(list);
    }

    /**
     * 根据客服ID查询会话列表
     */
    @GetMapping("/agent/{agentId}")
    public AjaxResult getConversationsByAgentId(@PathVariable Long agentId)
    {
        List<CsConversation> list = csConversationService.selectCsConversationByAgentId(agentId);
        return success(list);
    }

    /**
     * 查询待分配的会话列表
     */
    @GetMapping("/pending")
    public AjaxResult getPendingConversations()
    {
        List<CsConversation> list = csConversationService.selectPendingConversations();
        return success(list);
    }

    /**
     * 查询进行中的会话列表
     */
    @GetMapping("/active/{agentId}")
    public AjaxResult getActiveConversations(@PathVariable Long agentId)
    {
        List<CsConversation> list = csConversationService.selectActiveConversationsByAgentId(agentId);
        return success(list);
    }

    /**
     * 新增会话管理
     */
    @PreAuthorize("@ss.hasPermi('customer:conversation:add')")
    @Log(title = "会话管理", businessType = BusinessType.INSERT)
    @PostMapping
    public AjaxResult add(@Validated @RequestBody CsConversation csConversation)
    {
        csConversation.setCreateBy(getUsername());
        return toAjax(csConversationService.insertCsConversation(csConversation));
    }

    /**
     * 创建新会话
     */
    @PostMapping("/create")
    public AjaxResult createConversation(@RequestParam Long customerId, 
                                        @RequestParam String channel, 
                                        @RequestParam(required = false) String conversationType)
    {
        CsConversation conversation = csConversationService.createConversation(customerId, channel, conversationType);
        if (conversation != null)
        {
            return success(conversation);
        }
        return error("创建会话失败");
    }

    /**
     * 修改会话管理
     */
    @PreAuthorize("@ss.hasPermi('customer:conversation:edit')")
    @Log(title = "会话管理", businessType = BusinessType.UPDATE)
    @PutMapping
    public AjaxResult edit(@Validated @RequestBody CsConversation csConversation)
    {
        csConversation.setUpdateBy(getUsername());
        return toAjax(csConversationService.updateCsConversation(csConversation));
    }

    /**
     * 删除会话管理
     */
    @PreAuthorize("@ss.hasPermi('customer:conversation:remove')")
    @Log(title = "会话管理", businessType = BusinessType.DELETE)
    @DeleteMapping("/{conversationIds}")
    public AjaxResult remove(@PathVariable Long[] conversationIds)
    {
        return toAjax(csConversationService.deleteCsConversationByConversationIds(conversationIds));
    }

    /**
     * 分配会话给客服
     */
    @PostMapping("/assign")
    public AjaxResult assignConversation(@RequestParam Long conversationId, @RequestParam Long agentId)
    {
        return toAjax(csConversationService.assignConversationToAgent(conversationId, agentId));
    }

    /**
     * 自动分配会话
     */
    @PostMapping("/autoAssign/{conversationId}")
    public AjaxResult autoAssignConversation(@PathVariable Long conversationId)
    {
        Long agentId = csConversationService.autoAssignConversation(conversationId);
        if (agentId != null)
        {
            return AjaxResult.success().put("agentId", agentId);
        }
        return error("暂无可用客服");
    }

    /**
     * 更新会话状态
     */
    @PostMapping("/updateStatus")
    public AjaxResult updateStatus(@RequestParam Long conversationId, @RequestParam String status)
    {
        return toAjax(csConversationService.updateConversationStatus(conversationId, status));
    }

    /**
     * 结束会话
     */
    @PostMapping("/end/{conversationId}")
    public AjaxResult endConversation(@PathVariable Long conversationId)
    {
        return toAjax(csConversationService.endConversation(conversationId));
    }

    /**
     * 转接会话
     */
    @PostMapping("/transfer")
    public AjaxResult transferConversation(@RequestParam Long conversationId, 
                                          @RequestParam Long fromAgentId, 
                                          @RequestParam Long toAgentId)
    {
        return toAjax(csConversationService.transferConversation(conversationId, fromAgentId, toAgentId));
    }

    /**
     * 设置会话满意度
     */
    @PostMapping("/satisfaction")
    public AjaxResult setSatisfaction(@RequestParam Long conversationId, @RequestParam String satisfaction)
    {
        return toAjax(csConversationService.updateConversationSatisfaction(conversationId, satisfaction));
    }

    /**
     * 会话统计信息
     */
    @GetMapping("/statistics")
    public AjaxResult getStatistics(@RequestParam(required = false) Long agentId)
    {
        AjaxResult ajax = AjaxResult.success();
        ajax.put("todayConversations", csConversationService.countTodayConversations());
        ajax.put("pendingConversations", csConversationService.countPendingConversations());
        if (agentId != null)
        {
            ajax.put("activeConversations", csConversationService.countActiveConversationsByAgentId(agentId));
        }
        return ajax;
    }

    /**
     * 根据渠道统计会话数
     */
    @GetMapping("/statistics/channel/{channel}")
    public AjaxResult getStatisticsByChannel(@PathVariable String channel)
    {
        int count = csConversationService.countConversationsByChannel(channel);
        return AjaxResult.success().put("count", count);
    }

    /**
     * 生成会话标识
     */
    @GetMapping("/generateSessionId")
    public AjaxResult generateSessionId()
    {
        return AjaxResult.success().put("sessionId", csConversationService.generateSessionId());
    }
}
