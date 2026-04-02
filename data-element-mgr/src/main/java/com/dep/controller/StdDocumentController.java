package com.dep.controller;

import com.dep.common.PageQuery;
import com.dep.common.PageResult;
import com.dep.common.R;
import com.dep.entity.StdDocument;
import com.dep.service.StdDocumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/std/document")
@RequiredArgsConstructor
public class StdDocumentController {

    private final StdDocumentService stdDocumentService;

    @GetMapping("/page")
    public R<PageResult<StdDocument>> page(PageQuery query,
                                           @RequestParam(required = false) String name,
                                           @RequestParam(required = false) String status) {
        return R.ok(stdDocumentService.page(query, name, status));
    }

    @GetMapping("/{id}")
    public R<StdDocument> getById(@PathVariable Long id) {
        return R.ok(stdDocumentService.getById(id));
    }

    @PostMapping
    public R<Void> save(@RequestBody StdDocument entity) {
        stdDocumentService.save(entity);
        return R.ok();
    }

    @PutMapping("/{id}")
    public R<Void> update(@PathVariable Long id, @RequestBody StdDocument entity) {
        entity.setId(id);
        stdDocumentService.updateById(entity);
        return R.ok();
    }

    @DeleteMapping("/{id}")
    public R<Void> delete(@PathVariable Long id) {
        stdDocumentService.removeById(id);
        return R.ok();
    }

    @PostMapping("/{id}/submit")
    public R<Void> submit(@PathVariable Long id) {
        stdDocumentService.submitReview(id);
        return R.ok();
    }

    @PostMapping("/{id}/approve")
    public R<Void> approve(@PathVariable Long id,
                           @RequestParam(required = false) String remark) {
        stdDocumentService.approve(id, remark);
        return R.ok();
    }

    @PostMapping("/{id}/reject")
    public R<Void> reject(@PathVariable Long id,
                          @RequestParam(required = false) String remark) {
        stdDocumentService.reject(id, remark);
        return R.ok();
    }
}
