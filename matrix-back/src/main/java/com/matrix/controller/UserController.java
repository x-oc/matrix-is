package com.matrix.controller;

import com.matrix.dto.mappers.CommonMapper;
import com.matrix.dto.response.ApiResponse;
import com.matrix.dto.response.UserResponse;
import com.matrix.entity.enums.RoleEnum;
import com.matrix.entity.primary.User;
import com.matrix.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController extends BaseController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllUsers() {
        List<User> users = userService.findAll();
        return success(users.stream().map(CommonMapper::map).toList());
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getActiveUsers() {
        List<User> users = userService.getActiveUsers();
        return success(users.stream().map(CommonMapper::map).toList());
    }

    @GetMapping("/role/{roleName}")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getUsersByRole(@PathVariable String roleName) {
        RoleEnum role = RoleEnum.valueOf(roleName.toUpperCase());
        List<User> users = userService.getUsersByRole(role);
        return success(users.stream().map(CommonMapper::map).toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(@PathVariable Long id) {
        User user = userService.findById(id);
        return success(CommonMapper.map(user));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<User>> updateUserStatus(
            @PathVariable Long id,
            @RequestParam Boolean isActive) {
        User user = userService.updateUserStatus(id, isActive);
        return success("User status updated", user);
    }
}