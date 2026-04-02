package com.dep.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.dep.entity.StdApproval;
import com.dep.mapper.StdApprovalMapper;
import com.dep.service.StdApprovalService;
import org.springframework.stereotype.Service;

@Service
public class StdApprovalServiceImpl extends ServiceImpl<StdApprovalMapper, StdApproval>
        implements StdApprovalService {
}
