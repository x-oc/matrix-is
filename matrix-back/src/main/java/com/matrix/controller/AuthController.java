package com.matrix.controller;

import com.matrix.dto.request.LoginRequest;
import com.matrix.dto.response.ApiResponse;
import com.matrix.dto.response.AuthResponse;
import com.matrix.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController extends BaseController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse authResponse = authService.authenticate(request);
        return success("Login successful", authResponse);
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthResponse>> refreshToken(@RequestHeader("Authorization") String token) {
        AuthResponse authResponse = authService.refreshToken(token.replace("Bearer ", ""));
        return success("Token refreshed", authResponse);
    }
}