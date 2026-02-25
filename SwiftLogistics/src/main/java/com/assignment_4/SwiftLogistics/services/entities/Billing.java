package com.assignment_4.SwiftLogistics.services.entities;


import jakarta.persistence.*;

import java.math.BigDecimal;
//import java.security.PrivateKey;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "billing")
public class Billing {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID invoiceId;

    @Column(nullable = false, unique = true)
    private String invoiceNo;

    @Column(nullable = false)
    private BigDecimal totalAmount;

    @Column(nullable = false)
    private OffsetDateTime issuedAt = OffsetDateTime.now();

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "order_id", nullable = false, unique = true)
    private Order order;

    public Billing() {
    }

    public Billing(String invoiceNo, BigDecimal totalAmount) {
        this.invoiceNo = invoiceNo;
        this.totalAmount = totalAmount;

    }

    //getters and setters

    public UUID getInvoiceId() {
        return invoiceId;
    }

    public void setInvoiceId(UUID invoiceId) {
        this.invoiceId = invoiceId;
    }

    public String getInvoiceNo() {
        return invoiceNo;
    }

    public void setInvoiceNo(String invoiceNo) {
        this.invoiceNo = invoiceNo;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public OffsetDateTime getIssuedAt() {
        return issuedAt;
    }

    public void setIssuedAt(OffsetDateTime issuedAt) {
        this.issuedAt = issuedAt;
    }

    public Order getOrder() {
        return order;
    }

    public void setOrder(Order order) {
        this.order = order;
    }


}
