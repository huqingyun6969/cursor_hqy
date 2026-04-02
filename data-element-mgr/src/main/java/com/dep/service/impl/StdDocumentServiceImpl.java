package com.dep.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.dep.common.BizException;
import com.dep.common.PageQuery;
import com.dep.common.PageResult;
import com.dep.entity.StdApproval;
import com.dep.entity.StdDocument;
import com.dep.mapper.StdDocumentMapper;
import com.dep.service.StdApprovalService;
import com.dep.service.StdDocumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class StdDocumentServiceImpl extends ServiceImpl<StdDocumentMapper, StdDocument>
        implements StdDocumentService {

    private final StdApprovalService stdApprovalService;

    @Override
    public PageResult<StdDocument> page(PageQuery query, String name, String status) {
        Page<StdDocument> page = new Page<>(query.getCurrent(), query.getSize());
        LambdaQueryWrapper<StdDocument> wrapper = new LambdaQueryWrapper<>();
        if (name != null && !name.isBlank()) {
            wrapper.like(StdDocument::getName, name);
        }
        if (status != null && !status.isBlank()) {
            wrapper.eq(StdDocument::getStatus, status);
        }
        wrapper.orderByDesc(StdDocument::getUpdatedAt);
        Page<StdDocument> result = page(page, wrapper);
        return PageResult.of(result.getRecords(), result.getTotal(),
                result.getSize(), result.getCurrent());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void submitReview(Long id) {
        StdDocument doc = getById(id);
        if (doc == null) {
            throw new BizException("文档不存在");
        }
        if (!"DRAFT".equals(doc.getStatus()) && !"REJECTED".equals(doc.getStatus())) {
            throw new BizException("当前状态不允许提交审核");
        }
        doc.setStatus("REVIEWING");
        updateById(doc);
        saveApprovalRecord(id, "SUBMIT", null);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void approve(Long id, String remark) {
        StdDocument doc = getById(id);
        if (doc == null) {
            throw new BizException("文档不存在");
        }
        if (!"REVIEWING".equals(doc.getStatus())) {
            throw new BizException("当前状态不允许审批通过");
        }
        doc.setStatus("APPROVED");
        updateById(doc);
        saveApprovalRecord(id, "APPROVE", remark);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void reject(Long id, String remark) {
        StdDocument doc = getById(id);
        if (doc == null) {
            throw new BizException("文档不存在");
        }
        if (!"REVIEWING".equals(doc.getStatus())) {
            throw new BizException("当前状态不允许驳回");
        }
        doc.setStatus("REJECTED");
        updateById(doc);
        saveApprovalRecord(id, "REJECT", remark);
    }

    private void saveApprovalRecord(Long documentId, String action, String remark) {
        StdApproval approval = new StdApproval();
        approval.setDocumentId(documentId);
        approval.setAction(action);
        approval.setRemark(remark);
        approval.setOperatedAt(LocalDateTime.now());
        stdApprovalService.save(approval);
    }
}
