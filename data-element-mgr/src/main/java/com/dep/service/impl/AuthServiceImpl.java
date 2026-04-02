package com.dep.service.impl;

import cn.hutool.crypto.symmetric.AES;
import com.dep.common.BizException;
import com.dep.config.SsoProperties;
import com.dep.entity.dto.LoginRequest;
import com.dep.entity.vo.LoginVO;
import com.dep.entity.vo.UserProfileVO;
import com.dep.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.nio.charset.StandardCharsets;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final SsoProperties ssoProperties;
    private final RestTemplate restTemplate;

    @Override
    public LoginVO login(LoginRequest request) {
        String encryptedPassword = encryptPassword(request.getPassword());
        Map<String, String> body = buildLoginBody(request.getUsername(), encryptedPassword);
        Map<String, Object> result = callSsoLogin(body);
        return parseLoginResult(result);
    }

    @Override
    public UserProfileVO getProfile(String accessToken) {
        String url = ssoProperties.getProfileUrl() + "?access_token=" + accessToken;
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> result = restTemplate.getForObject(url, Map.class);
            return parseProfile(result);
        } catch (Exception e) {
            log.error("获取用户信息失败", e);
            throw new BizException(401, "token已失效或无效");
        }
    }

    private String encryptPassword(String password) {
        try {
            AES aes = new AES(ssoProperties.getAesKey().getBytes(StandardCharsets.UTF_8));
            return aes.encryptBase64(password);
        } catch (Exception e) {
            log.error("密码加密失败", e);
            throw new BizException("密码加密失败");
        }
    }

    private Map<String, String> buildLoginBody(String username, String encryptedPassword) {
        Map<String, String> body = new HashMap<>();
        body.put("clientId", ssoProperties.getClientId());
        body.put("userName", username);
        body.put("password", encryptedPassword);
        body.put("service", ssoProperties.getService());
        return body;
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> callSsoLogin(Map<String, String> body) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, String>> entity = new HttpEntity<>(body, headers);
        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(
                    ssoProperties.getLoginUrl(), entity, Map.class);
            return response.getBody();
        } catch (Exception e) {
            log.error("SSO登录请求失败", e);
            throw new BizException("SSO服务不可用");
        }
    }

    private LoginVO parseLoginResult(Map<String, Object> result) {
        if (result == null) {
            throw new BizException("SSO返回结果为空");
        }
        Integer code = (Integer) result.get("code");
        if (code == null || code != 200) {
            String msg = (String) result.getOrDefault("message", "登录失败");
            throw new BizException(code != null ? code : 500, msg);
        }
        String data = (String) result.get("data");
        return parseTokenData(data);
    }

    private LoginVO parseTokenData(String data) {
        LoginVO vo = new LoginVO();
        if (data == null) {
            throw new BizException("SSO未返回token数据");
        }
        for (String pair : data.split("&")) {
            String[] kv = pair.split("=", 2);
            if (kv.length != 2) continue;
            switch (kv[0]) {
                case "access_token" -> vo.setAccessToken(kv[1]);
                case "expires_in" -> vo.setExpiresIn(kv[1]);
                case "refresh_token" -> vo.setRefreshToken(kv[1]);
                default -> { }
            }
        }
        return vo;
    }

    @SuppressWarnings("unchecked")
    private UserProfileVO parseProfile(Map<String, Object> result) {
        if (result == null) {
            throw new BizException(401, "获取用户信息失败");
        }
        UserProfileVO vo = new UserProfileVO();
        vo.setId(String.valueOf(result.getOrDefault("id", "")));
        vo.setUsername((String) result.getOrDefault("id", ""));
        vo.setDisplayName((String) result.getOrDefault("displayName", ""));
        vo.setEmail((String) result.getOrDefault("email", ""));
        vo.setAttributes((Map<String, Object>) result.getOrDefault("attributes", Collections.emptyMap()));
        return vo;
    }
}
