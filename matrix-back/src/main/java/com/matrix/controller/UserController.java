package com.matrix.controller;

import com.matrix.dto.response.ApiResponse;
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
    public ResponseEntity<ApiResponse<List<User>>> getAllUsers() {
        List<User> users = userService.findAll();
        return success(users);
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<User>>> getActiveUsers() {
        List<User> users = userService.getActiveUsers();
        return success(users);
    }

    @GetMapping("/role/{roleName}")
    public ResponseEntity<ApiResponse<List<User>>> getUsersByRole(@PathVariable String roleName) {
        RoleEnum role = RoleEnum.valueOf(roleName.toUpperCase());
        List<User> users = userService.getUsersByRole(role);
        return success(users);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<User>> getUserById(@PathVariable Long id) {
        User user = userService.findById(id);
        return success(user);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<User>> updateUserStatus(
            @PathVariable Long id,
            @RequestParam Boolean isActive) {
        User user = userService.updateUserStatus(id, isActive);
        return success("User status updated", user);
    }
}