package com.dep.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.dep.common.PageQuery;
import com.dep.common.PageResult;
import com.dep.entity.StdDocument;

public interface StdDocumentService extends IService<StdDocument> {

    PageResult<StdDocument> page(PageQuery query, String name, String status);

    void submitReview(Long id);

    void approve(Long id, String remark);

    void reject(Long id, String remark);
}
