package com.matrix.service;

import com.matrix.entity.linking.TicketComment;
import com.matrix.entity.primary.Ticket;
import com.matrix.entity.primary.User;
import com.matrix.exception.ResourceNotFoundException;
import com.matrix.repository.TicketCommentRepository;
import com.matrix.repository.TicketRepository;
import com.matrix.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class TicketCommentService {

    private final TicketCommentRepository commentRepository;
    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<TicketComment> findAll() {
        return commentRepository.findAll();
    }

    @Transactional(readOnly = true)
    public TicketComment findById(Long id) {
        return commentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("TicketComment not found with id: " + id));
    }

    @Transactional
    public TicketComment save(TicketComment entity) {
        return commentRepository.save(entity);
    }

    @Transactional
    public void deleteById(Long id) {
        if (!commentRepository.existsById(id)) {
            throw new ResourceNotFoundException("TicketComment not found with id: " + id);
        }
        commentRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public boolean existsById(Long id) {
        return commentRepository.existsById(id);
    }

    @Transactional
    public TicketComment addComment(Long ticketId, Long createdById, String commentText) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));

        User createdBy = userRepository.findById(createdById)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        TicketComment comment = new TicketComment();
        comment.setTicket(ticket);
        comment.setCreatedBy(createdBy);
        comment.setComment(commentText);
        comment.setCreatedAt(LocalDateTime.now());

        return commentRepository.save(comment);
    }

    @Transactional(readOnly = true)
    public List<TicketComment> getCommentsForTicket(Long ticketId) {
        return commentRepository.findByTicketIdOrderByCreatedAtDesc(ticketId);
    }
}