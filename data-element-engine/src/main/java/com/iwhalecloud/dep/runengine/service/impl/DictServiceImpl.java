package com.iwhalecloud.dep.runengine.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.iwhalecloud.dep.runengine.domain.entity.DictItem;
import com.iwhalecloud.dep.runengine.domain.entity.DictTable;
import com.iwhalecloud.dep.runengine.mapper.DictItemMapper;
import com.iwhalecloud.dep.runengine.mapper.DictTableMapper;
import com.iwhalecloud.dep.runengine.service.DictService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class DictServiceImpl implements DictService {

    private final DictTableMapper dictTableMapper;
    private final DictItemMapper dictItemMapper;

    public DictServiceImpl(DictTableMapper dictTableMapper, DictItemMapper dictItemMapper) {
        this.dictTableMapper = dictTableMapper;
        this.dictItemMapper = dictItemMapper;
    }

    @Override
    public List<DictTable> listAllDicts() {
        return dictTableMapper.selectList(null);
    }

    @Override
    public List<DictItem> getItemsByCode(String dictCode) {
        return dictItemMapper.selectList(new LambdaQueryWrapper<DictItem>()
                .eq(DictItem::getDictCode, dictCode)
                .orderByAsc(DictItem::getSortOrder));
    }

    @Override
    public Set<String> getValuesByCode(String dictCode) {
        return getItemsByCode(dictCode).stream()
                .map(DictItem::getItemValue)
                .collect(Collectors.toSet());
    }

    @Override
    @Transactional
    public void saveDict(DictTable dict) {
        DictTable existing = dictTableMapper.selectOne(new LambdaQueryWrapper<DictTable>()
                .eq(DictTable::getDictCode, dict.getDictCode()));
        if (existing == null) {
            dictTableMapper.insert(dict);
        }
    }

    @Override
    @Transactional
    public void saveDictItems(String dictCode, List<DictItem> items) {
        dictItemMapper.delete(new LambdaQueryWrapper<DictItem>()
                .eq(DictItem::getDictCode, dictCode));
        for (DictItem item : items) {
            item.setDictCode(dictCode);
            dictItemMapper.insert(item);
        }
    }
}
