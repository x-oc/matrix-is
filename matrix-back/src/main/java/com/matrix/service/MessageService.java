package com.matrix.service;

import com.matrix.entity.primary.Message;
import com.matrix.entity.primary.User;
import com.matrix.exception.BusinessException;
import com.matrix.exception.ResourceNotFoundException;
import com.matrix.repository.MessageRepository;
import com.matrix.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
public class MessageService extends BaseService<Message, Long> {

    private final MessageRepository messageRepository;
    private final UserRepository userRepository;

    public MessageService(MessageRepository messageRepository, UserRepository userRepository) {
        super(messageRepository);
        this.messageRepository = messageRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Message> findAll() {
        return messageRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Message findById(Long id) {
        return messageRepository.findById(id)
                .orElseThrow(() -> new com.matrix.exception.ResourceNotFoundException("Message not found with id: " + id));
    }

    @Override
    @Transactional
    public Message save(Message entity) {
        return messageRepository.save(entity);
    }

    @Transactional
    public Message sendMessage(Long fromUserId, Long toUserId, String text) {
        User fromUser = userRepository.findById(fromUserId)
                .orElseThrow(() -> new ResourceNotFoundException("From user not found"));

        User toUser = userRepository.findById(toUserId)
                .orElseThrow(() -> new ResourceNotFoundException("To user not found"));

        Message message = new Message();
        message.setFromUser(fromUser);
        message.setToUser(toUser);
        message.setText(text);
        message.setSentAt(LocalDateTime.now());

        return messageRepository.save(message);
    }

    @Transactional
    public Message sendSystemMessage(String text, Long toUserId) {
        User systemUser = userRepository.findByUsername("system")
                .orElseGet(() -> {
                    // Fallback to any active user
                    return userRepository.findByIsActive(true).stream()
                            .findFirst()
                            .orElseThrow(() -> new BusinessException("No active users found"));
                });

        User toUser = userRepository.findById(toUserId)
                .orElseThrow(() -> new ResourceNotFoundException("To user not found"));

        Message message = new Message();
        message.setFromUser(systemUser);
        message.setToUser(toUser);
        message.setText(text);
        message.setSentAt(LocalDateTime.now());

        return messageRepository.save(message);
    }

    @Transactional(readOnly = true)
    public List<Message> getMessagesForUser(Long userId) {
        return messageRepository.findByToUserId(userId);
    }

    @Transactional(readOnly = true)
    public List<Message> getSentMessages(Long userId) {
        return messageRepository.findByFromUserId(userId);
    }

    @Transactional(readOnly = true)
    public List<Message> getUnreadMessages(Long userId) {
        // This would need a read status field in Message entity
        // For now, return all messages for user
        return getMessagesForUser(userId);
    }
}