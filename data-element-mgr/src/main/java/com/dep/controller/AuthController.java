package com.dep.controller;

import com.dep.common.R;
import com.dep.entity.dto.LoginRequest;
import com.dep.entity.vo.LoginVO;
import com.dep.entity.vo.UserProfileVO;
import com.dep.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public R<LoginVO> login(@Valid @RequestBody LoginRequest request) {
        return R.ok(authService.login(request));
    }

    @GetMapping("/profile")
    public R<UserProfileVO> profile(@RequestParam("access_token") String accessToken) {
        return R.ok(authService.getProfile(accessToken));
    }

    @PostMapping("/logout")
    public R<Void> logout() {
        return R.ok();
    }
}
