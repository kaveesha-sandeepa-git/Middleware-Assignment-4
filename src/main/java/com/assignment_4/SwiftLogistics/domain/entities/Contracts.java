package com.assignment_4.SwiftLogistics.domain.entities;

import jakarta.persistence.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
//@Getter
//@Setter
@Table(name = "contracts")
public class Contracts {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID contractId;

    @Column(nullable = false, unique = true)
    private String contractNo;

    @Column(nullable = false)
    private LocalDate startDate;

    private LocalDate endDate;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "client_id", nullable = false)
    private Clients client;

    @OneToMany(
            mappedBy = "contracts",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private List<Order> orders = new ArrayList<>();

    public Contracts() {
    }

    public Contracts(String contractNo, LocalDate startDate) {
        this.contractNo = contractNo;
        this.startDate = startDate;
    }

    public void addOrder(Order order) {
        orders.add(order);
        order.setContracts(this);
    }

    public void removeOrder(Order order) {
        orders.remove(order);
        order.setContracts(null);
    }

    public UUID getContractId() {
        return contractId;
    }

    public String getContractNo() {
        return contractNo;
    }

    public void setContractNo(String contractNo) {
        this.contractNo = contractNo;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public Clients getClient() {
        return client;
    }

    public void setClient(Clients client) {
        this.client = client;
    }

    public List<Order> getOrders() {
        return orders;
    }

    public void setOrders(List<Order> orders) {
        this.orders = orders;
    }


    public void setContractId(UUID contractId) {
        this.contractId = contractId;
    }


}
