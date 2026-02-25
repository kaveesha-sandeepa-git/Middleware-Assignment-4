package com.assignment_4.SwiftLogistics.services.repositories;

import com.assignment_4.SwiftLogistics.services.entities.Contracts;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ContractRepository extends JpaRepository<Contracts, UUID> {

    Optional<Contracts> findByContractNo(String contractNo);
}
