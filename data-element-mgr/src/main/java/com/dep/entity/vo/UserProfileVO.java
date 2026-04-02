package com.dep.entity.vo;

import lombok.Data;
import java.util.Map;

@Data
public class UserProfileVO {
    private String id;
    private String username;
    private String displayName;
    private String email;
    private Map<String, Object> attributes;
}
