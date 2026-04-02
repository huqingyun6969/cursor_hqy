package com.dep.entity.vo;

import lombok.Data;

@Data
public class LoginVO {
    private String accessToken;
    private String expiresIn;
    private String refreshToken;
}
