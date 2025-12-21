package com.matrix.service;

import com.matrix.dto.request.LoginRequest;
import com.matrix.dto.response.AuthResponse;
import com.matrix.entity.primary.User;
import com.matrix.exception.BusinessException;
import com.matrix.repository.UserRepository;
import com.matrix.security.JwtTokenUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenUtil jwtTokenUtil;
    private final UserDetailsService userDetailsService;
    private final UserRepository userRepository;

    @Transactional
    public AuthResponse authenticate(LoginRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getUsername(),
                            request.getPassword()
                    )
            );

            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            String token = jwtTokenUtil.generateToken(userDetails);

            User user = userRepository.findByUsername(request.getUsername())
                    .orElseThrow(() -> new BusinessException("User not found"));

            return createAuthResponse(token, user);

        } catch (Exception e) {
            log.error("Authentication failed for user: {}", request.getUsername(), e);
            throw new BusinessException("Invalid username or password");
        }
    }

    @Transactional(readOnly = true)
    public AuthResponse refreshToken(String token) {
        String username = jwtTokenUtil.extractUsername(token);
        UserDetails userDetails = userDetailsService.loadUserByUsername(username);

        if (!jwtTokenUtil.validateToken(token, userDetails)) {
            throw new BusinessException("Invalid token");
        }

        String newToken = jwtTokenUtil.generateToken(userDetails);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new BusinessException("User not found"));

        return createAuthResponse(newToken, user);
    }

    private AuthResponse createAuthResponse(String token, User user) {
        AuthResponse response = new AuthResponse();
        response.setToken(token);
        response.setUserId(user.getId());
        response.setUsername(user.getUsername());
        response.setRole(user.getRole().getName());
        response.setExpiresAt(LocalDateTime.now().plusHours(24));

        return response;
    }
}