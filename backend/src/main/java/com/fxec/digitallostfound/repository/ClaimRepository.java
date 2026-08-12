package com.fxec.digitallostfound.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.fxec.digitallostfound.entity.Claim;

public interface ClaimRepository extends JpaRepository<Claim, Integer> {

    // Find claims for a particular item
    List<Claim> findByItemId(Integer itemId);

    // Find claims by status
    List<Claim> findByStatus(String status);

    // Count claims by status
    long countByStatus(String status);

    // Check whether a claimant has already claimed an item
    boolean existsByItemIdAndClaimantEmail(
            Integer itemId,
            String claimantEmail
    );
}