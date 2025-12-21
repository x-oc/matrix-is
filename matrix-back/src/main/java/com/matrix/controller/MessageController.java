package com.matrix.controller;

import com.matrix.dto.request.SendMessageRequest;
import com.matrix.dto.response.ApiResponse;
import com.matrix.entity.primary.Message;
import com.matrix.service.MessageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
public class MessageController extends BaseController {

    private final MessageService messageService;

    @PostMapping
    public ResponseEntity<ApiResponse<Message>> sendMessage(@Valid @RequestBody SendMessageRequest request) {
        Message message = messageService.sendMessage(
                request.getFromUserId(),
                request.getToUserId(),
                request.getText()
        );
        return created("Message sent", message);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<Message>>> getMessagesForUser(@PathVariable Long userId) {
        List<Message> messages = messageService.getMessagesForUser(userId);
        return success(messages);
    }

    @GetMapping("/sent/{userId}")
    public ResponseEntity<ApiResponse<List<Message>>> getSentMessages(@PathVariable Long userId) {
        List<Message> messages = messageService.getSentMessages(userId);
        return success(messages);
    }
}