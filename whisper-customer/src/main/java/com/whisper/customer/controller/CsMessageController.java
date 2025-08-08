package com.whisper.customer.controller;

import java.util.List;
import java.util.Date;
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
import org.springframework.format.annotation.DateTimeFormat;
import com.whisper.common.annotation.Log;
import com.whisper.common.core.controller.BaseController;
import com.whisper.common.core.domain.AjaxResult;
import com.whisper.common.core.page.TableDataInfo;
import com.whisper.common.enums.BusinessType;
import com.whisper.common.utils.poi.ExcelUtil;
import com.whisper.customer.domain.CsMessage;
import com.whisper.customer.service.ICsMessageService;

/**
 * 消息记录管理 信息操作处理
 * 
 * @author whisper
 */
@RestController
@RequestMapping("/customer/message")
public class CsMessageController extends BaseController
{
    @Autowired
    private ICsMessageService csMessageService;

    /**
     * 查询消息记录列表
     */
    @PreAuthorize("@ss.hasPermi('customer:message:list')")
    @GetMapping("/list")
    public TableDataInfo list(CsMessage csMessage)
    {
        startPage();
        List<CsMessage> list = csMessageService.selectCsMessageList(csMessage);
        return getDataTable(list);
    }

    /**
     * 导出消息记录列表
     */
    @PreAuthorize("@ss.hasPermi('customer:message:export')")
    @Log(title = "消息记录管理", businessType = BusinessType.EXPORT)
    @PostMapping("/export")
    public void export(HttpServletResponse response, CsMessage csMessage)
    {
        List<CsMessage> list = csMessageService.selectCsMessageList(csMessage);
        ExcelUtil<CsMessage> util = new ExcelUtil<CsMessage>(CsMessage.class);
        util.exportExcel(response, list, "消息记录数据");
    }

    /**
     * 获取消息记录详细信息
     */
    @PreAuthorize("@ss.hasPermi('customer:message:query')")
    @GetMapping(value = "/{messageId}")
    public AjaxResult getInfo(@PathVariable("messageId") Long messageId)
    {
        return success(csMessageService.selectCsMessageByMessageId(messageId));
    }

    /**
     * 根据会话ID查询消息列表
     */
    @GetMapping("/conversation/{conversationId}")
    public AjaxResult getMessagesByConversationId(@PathVariable Long conversationId)
    {
        List<CsMessage> list = csMessageService.selectCsMessageByConversationId(conversationId);
        return success(list);
    }

    /**
     * 根据会话ID分页查询消息列表
     */
    @GetMapping("/conversation/{conversationId}/page")
    public AjaxResult getMessagesByConversationIdWithPage(@PathVariable Long conversationId,
                                                         @RequestParam(defaultValue = "1") Integer pageNum,
                                                         @RequestParam(defaultValue = "20") Integer pageSize)
    {
        List<CsMessage> list = csMessageService.selectCsMessageByConversationIdWithPage(conversationId, pageNum, pageSize);
        return success(list);
    }

    /**
     * 根据发送者查询消息列表
     */
    @GetMapping("/sender")
    public AjaxResult getMessagesBySender(@RequestParam String senderType, @RequestParam Long senderId)
    {
        List<CsMessage> list = csMessageService.selectCsMessageBySender(senderType, senderId);
        return success(list);
    }

    /**
     * 新增消息记录
     */
    @PreAuthorize("@ss.hasPermi('customer:message:add')")
    @Log(title = "消息记录管理", businessType = BusinessType.INSERT)
    @PostMapping
    public AjaxResult add(@Validated @RequestBody CsMessage csMessage)
    {
        csMessage.setCreateBy(getUsername());
        return toAjax(csMessageService.insertCsMessage(csMessage));
    }

    /**
     * 发送消息
     */
    @PostMapping("/send")
    public AjaxResult sendMessage(@RequestParam Long conversationId,
                                 @RequestParam String senderType,
                                 @RequestParam Long senderId,
                                 @RequestParam String senderName,
                                 @RequestParam(defaultValue = "text") String messageType,
                                 @RequestParam String content)
    {
        CsMessage message = csMessageService.sendMessage(conversationId, senderType, senderId, senderName, messageType, content);
        if (message != null)
        {
            return success(message);
        }
        return error("发送消息失败");
    }

    /**
     * 发送文件消息
     */
    @PostMapping("/sendFile")
    public AjaxResult sendFileMessage(@RequestParam Long conversationId,
                                     @RequestParam String senderType,
                                     @RequestParam Long senderId,
                                     @RequestParam String senderName,
                                     @RequestParam String messageType,
                                     @RequestParam String content,
                                     @RequestParam String fileUrl,
                                     @RequestParam String fileName,
                                     @RequestParam Long fileSize)
    {
        CsMessage message = csMessageService.sendFileMessage(conversationId, senderType, senderId, senderName,
                                                           messageType, content, fileUrl, fileName, fileSize);
        if (message != null)
        {
            return success(message);
        }
        return error("发送文件消息失败");
    }

    /**
     * 修改消息记录
     */
    @PreAuthorize("@ss.hasPermi('customer:message:edit')")
    @Log(title = "消息记录管理", businessType = BusinessType.UPDATE)
    @PutMapping
    public AjaxResult edit(@Validated @RequestBody CsMessage csMessage)
    {
        csMessage.setUpdateBy(getUsername());
        return toAjax(csMessageService.updateCsMessage(csMessage));
    }

    /**
     * 删除消息记录
     */
    @PreAuthorize("@ss.hasPermi('customer:message:remove')")
    @Log(title = "消息记录管理", businessType = BusinessType.DELETE)
    @DeleteMapping("/{messageIds}")
    public AjaxResult remove(@PathVariable Long[] messageIds)
    {
        return toAjax(csMessageService.deleteCsMessageByMessageIds(messageIds));
    }

    /**
     * 标记消息为已读
     */
    @PostMapping("/markRead/{messageId}")
    public AjaxResult markMessageAsRead(@PathVariable Long messageId)
    {
        return toAjax(csMessageService.markMessageAsRead(messageId));
    }

    /**
     * 批量标记消息为已读
     */
    @PostMapping("/markReadByConversation")
    public AjaxResult markMessagesAsReadByConversation(@RequestParam Long conversationId, 
                                                      @RequestParam String senderType)
    {
        return toAjax(csMessageService.markMessagesAsReadByConversation(conversationId, senderType));
    }

    /**
     * 撤回消息
     */
    @PostMapping("/recall/{messageId}")
    public AjaxResult recallMessage(@PathVariable Long messageId)
    {
        return toAjax(csMessageService.recallMessage(messageId));
    }

    /**
     * 查询会话中未读消息数量
     */
    @GetMapping("/unreadCount")
    public AjaxResult getUnreadCount(@RequestParam Long conversationId, @RequestParam String senderType)
    {
        int count = csMessageService.countUnreadMessagesByConversation(conversationId, senderType);
        return AjaxResult.success().put("count", count);
    }

    /**
     * 查询会话中最后一条消息
     */
    @GetMapping("/lastMessage/{conversationId}")
    public AjaxResult getLastMessage(@PathVariable Long conversationId)
    {
        CsMessage message = csMessageService.selectLastMessageByConversationId(conversationId);
        return success(message);
    }

    /**
     * 统计会话消息总数
     */
    @GetMapping("/count/{conversationId}")
    public AjaxResult getMessageCount(@PathVariable Long conversationId)
    {
        int count = csMessageService.countMessagesByConversationId(conversationId);
        return AjaxResult.success().put("count", count);
    }

    /**
     * 根据消息类型统计消息数量
     */
    @GetMapping("/count/{conversationId}/{messageType}")
    public AjaxResult getMessageCountByType(@PathVariable Long conversationId, @PathVariable String messageType)
    {
        int count = csMessageService.countMessagesByType(conversationId, messageType);
        return AjaxResult.success().put("count", count);
    }

    /**
     * 查询指定时间范围内的消息
     */
    @GetMapping("/timeRange/{conversationId}")
    public AjaxResult getMessagesByTimeRange(@PathVariable Long conversationId,
                                           @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") Date startTime,
                                           @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") Date endTime)
    {
        List<CsMessage> list = csMessageService.selectMessagesByTimeRange(conversationId, startTime, endTime);
        return success(list);
    }

    /**
     * 清理历史消息
     */
    @PreAuthorize("@ss.hasPermi('customer:message:clean')")
    @Log(title = "消息记录管理", businessType = BusinessType.CLEAN)
    @PostMapping("/clean")
    public AjaxResult cleanHistoryMessages(@RequestParam(defaultValue = "90") Integer beforeDays)
    {
        int count = csMessageService.cleanHistoryMessages(beforeDays);
        return success("清理了 " + count + " 条历史消息");
    }
}
