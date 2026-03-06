package com.assignment_4.SwiftLogistics.domain.repositories;

import com.assignment_4.SwiftLogistics.domain.entities.Clients;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ClientRepository extends JpaRepository<Clients, UUID> {

    Optional <Clients> findByClientEmail(String clientEmail);

    boolean existsByClientEmail(String clientEmail);
}
