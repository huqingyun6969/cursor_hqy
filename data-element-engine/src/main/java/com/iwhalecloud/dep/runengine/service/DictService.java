package com.iwhalecloud.dep.runengine.service;

import com.iwhalecloud.dep.runengine.domain.entity.DictItem;
import com.iwhalecloud.dep.runengine.domain.entity.DictTable;

import java.util.List;
import java.util.Set;

public interface DictService {

    List<DictTable> listAllDicts();

    List<DictItem> getItemsByCode(String dictCode);

    Set<String> getValuesByCode(String dictCode);

    void saveDict(DictTable dict);

    void saveDictItems(String dictCode, List<DictItem> items);
}
