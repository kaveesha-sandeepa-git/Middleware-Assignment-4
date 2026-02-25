package com.assignment_4.SwiftLogistics.services;


import com.assignment_4.SwiftLogistics.services.entities.Contracts;
import jakarta.persistence.*;
import lombok.Setter;

import java.util.UUID;
import java.util.ArrayList;
import java.util.List;

@Setter
@Entity
@Table(name="clients")
public class Clients {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID client_id;

    @Column(nullable = false)
    private String client_name;

    @Column(nullable = false,unique = true)
    private String client_email;

    @OneToMany(
            mappedBy = "client",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private List<Contracts> contracts = new ArrayList<>();


    public Clients(){}

    public Clients(String client_name, String client_email){
        this.client_email = client_email;
        this.client_name = client_name;
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
        return client_email;
    }

    public List<Contracts> getContracts() {
        return contracts;
    }

    public String getClient_name() {
        return client_name;
    }

    public UUID getClient_id() {
        return client_id;
    }


}
