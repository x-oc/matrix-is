package com.matrix.security;

import com.matrix.entity.enums.RoleEnum;
import com.matrix.entity.primary.User;
import com.matrix.exception.BusinessException;
import com.matrix.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + username));

        return org.springframework.security.core.userdetails.User
                .withUsername(user.getUsername())
                .password(user.getPassword())
                .authorities(user.getRole().name())
                .accountExpired(false)
                .accountLocked(false)
                .credentialsExpired(false)
                .disabled(!user.getIsActive())
                .build();
    }

    public RoleEnum getRoleByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + username));

        return user.getRole();
    }

    public User getUser() {
        String username = SecurityContextHelper.getCurrentUsername();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + username));
    }

    public RoleEnum getRole() {
        return getUser().getRole();
    }

    public void checkRoles(List<RoleEnum> requiredRoles) {
        String username = SecurityContextHelper.getCurrentUsername();

        if (username == null) {
            throw new SecurityException("User not authenticated");
        }

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + username));

        if (!requiredRoles.contains(user.getRole())) {
            throw new BusinessException("Insufficient permissions. Required roles: " + requiredRoles);
        }
    }

    public User getSystemKernel() {
        List<User> systemKernels = userRepository.findByRole(RoleEnum.SYSTEM_KERNEL);
        if (systemKernels.isEmpty()) {
            throw new BusinessException("Системное Ядро временно недоступно");
        }
        return userRepository.findByRole(RoleEnum.SYSTEM_KERNEL).get(0);
    }
}