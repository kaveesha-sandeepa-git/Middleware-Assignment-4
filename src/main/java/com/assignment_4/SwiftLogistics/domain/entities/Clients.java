package com.assignment_4.SwiftLogistics.domain.entities;


import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Entity
@Table(name="clients")
public class Clients {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID clientId;

    @Column(nullable = false)
    private String clientName;

    @Column(nullable = false,unique = true)
    private String clientEmail;

    @Getter
    @OneToMany(
            mappedBy = "client",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private List<Contracts> contracts = new ArrayList<>();


    public Clients(){}

    public Clients(String clientName, String clientEmail){
        this.clientEmail = clientEmail;
        this.clientName = clientName;
    }

    public void addContract(Contracts contract){
        contracts.add(contract);
        contract.setClient(this);
    }

    public void removeContract(Contracts contract){
        contracts.remove(contract);
        contract.setClient(null);
    }

    public String getClient_email() {
        return clientEmail;
    }

    public String getClient_name() {
        return clientName;
    }

    public UUID getClient_id() {
        return clientId;
    }


}
