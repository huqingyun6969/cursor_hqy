package com.iwhalecloud.dep.runengine.controller;

import com.iwhalecloud.dep.runengine.domain.entity.DictItem;
import com.iwhalecloud.dep.runengine.domain.entity.DictTable;
import com.iwhalecloud.dep.runengine.domain.vo.R;
import com.iwhalecloud.dep.runengine.service.DictService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/dict")
public class DictController {

    private final DictService dictService;

    public DictController(DictService dictService) {
        this.dictService = dictService;
    }

    @GetMapping("/list")
    public R<List<DictTable>> list() {
        return R.ok(dictService.listAllDicts());
    }

    @GetMapping("/items/{dictCode}")
    public R<List<DictItem>> items(@PathVariable String dictCode) {
        return R.ok(dictService.getItemsByCode(dictCode));
    }

    @PostMapping("/save")
    public R<Void> save(@RequestBody DictTable dict) {
        dictService.saveDict(dict);
        return R.ok();
    }

    @PostMapping("/items/{dictCode}")
    public R<Void> saveItems(@PathVariable String dictCode, @RequestBody List<DictItem> items) {
        dictService.saveDictItems(dictCode, items);
        return R.ok();
    }
}
