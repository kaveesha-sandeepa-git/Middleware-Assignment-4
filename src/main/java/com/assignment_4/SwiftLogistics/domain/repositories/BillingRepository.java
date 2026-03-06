package com.assignment_4.SwiftLogistics.domain.repositories;

import com.assignment_4.SwiftLogistics.domain.entities.Billing;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface BillingRepository extends JpaRepository<Billing, UUID> {


    Optional<Billing> findByInvoiceNo(String invoiceNo);
}
