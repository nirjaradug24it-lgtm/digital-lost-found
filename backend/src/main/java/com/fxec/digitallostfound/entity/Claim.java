package com.fxec.digitallostfound.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class Claim {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private Integer itemId;

    private String claimantName;

    private String claimantEmail;

    private String proof;

    private String status;

    public Claim() {
    }

    public Claim(Integer id, Integer itemId, String claimantName,
                 String claimantEmail, String proof, String status) {
        this.id = id;
        this.itemId = itemId;
        this.claimantName = claimantName;
        this.claimantEmail = claimantEmail;
        this.proof = proof;
        this.status = status;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Integer getItemId() {
        return itemId;
    }

    public void setItemId(Integer itemId) {
        this.itemId = itemId;
    }

    public String getClaimantName() {
        return claimantName;
    }

    public void setClaimantName(String claimantName) {
        this.claimantName = claimantName;
    }

    public String getClaimantEmail() {
        return claimantEmail;
    }

    public void setClaimantEmail(String claimantEmail) {
        this.claimantEmail = claimantEmail;
    }

    public String getProof() {
        return proof;
    }

    public void setProof(String proof) {
        this.proof = proof;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}