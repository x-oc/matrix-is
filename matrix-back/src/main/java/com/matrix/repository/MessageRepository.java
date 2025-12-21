package com.matrix.repository;

import com.matrix.entity.primary.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    @Query("SELECT m FROM Message m WHERE m.toUser.id = :userId ORDER BY m.sentAt DESC")
    List<Message> findByToUserId(@Param("userId") Long userId);

    @Query("SELECT m FROM Message m WHERE m.fromUser.id = :userId ORDER BY m.sentAt DESC")
    List<Message> findByFromUserId(@Param("userId") Long userId);
}