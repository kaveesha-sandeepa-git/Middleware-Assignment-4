package com.assignment_4.SwiftLogistics.services.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;



@Entity
@Table(name = "orders")
public class Order {



    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID orderId;

    @Column(nullable = false,unique = false)
    private String orderNo;

    @Column(nullable = false)
    private BigDecimal orderAmount;

    @Column(nullable = false)
    private OffsetDateTime orderedAt =  OffsetDateTime.now();



    @Column(nullable = false)
    private String OrderStatus;

    @ManyToOne(fetch = FetchType.LAZY,optional = false)
    @JoinColumn(name="contract_id", nullable = false)
    private Contracts contracts;

    @OneToOne(
            mappedBy = "order",
            cascade = CascadeType.ALL,
            orphanRemoval = true,
            fetch = FetchType.LAZY
    )

    private Billing billing;

    public Order(){}

    public Order(String orderNo,BigDecimal orderAmount){
        this.orderNo = orderNo;
        this.orderAmount = orderAmount;
        this.OrderStatus = "created";
    }

    public UUID getOrderId() {
        return orderId;
    }

    public void setOrderId(UUID orderId) {
        this.orderId = orderId;
    }

    public String getOrderNo() {
        return orderNo;
    }

    public void setOrderNo(String orderNo) {
        this.orderNo = orderNo;
    }

    public BigDecimal getOrderAmount() {
        return orderAmount;
    }

    public void setOrderAmount(BigDecimal orderAmount) {
        this.orderAmount = orderAmount;
    }

    public OffsetDateTime getOrderedAt() {
        return orderedAt;
    }

    public void setOrderedAt(OffsetDateTime orderedAt) {
        this.orderedAt = orderedAt;
    }

    public Contracts getContracts() {
        return contracts;
    }

    public void setContracts(Contracts contracts) {
        this.contracts = contracts;
    }

    public Billing getBilling() {
        return billing;
    }

    public void setBilling(Billing billing) {
        this.billing = billing;
    }

    public String getOrderStatus() {
        return OrderStatus;
    }

    public void setOrderStatus(String orderStatus) {
        OrderStatus = orderStatus;
    }


}