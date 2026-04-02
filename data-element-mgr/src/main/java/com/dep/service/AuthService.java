package com.dep.service;

import com.dep.entity.dto.LoginRequest;
import com.dep.entity.vo.LoginVO;
import com.dep.entity.vo.UserProfileVO;

public interface AuthService {
    LoginVO login(LoginRequest request);
    UserProfileVO getProfile(String accessToken);
}
