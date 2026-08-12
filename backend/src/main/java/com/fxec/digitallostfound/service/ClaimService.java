package com.fxec.digitallostfound.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.fxec.digitallostfound.entity.Claim;
import com.fxec.digitallostfound.repository.ClaimRepository;
import com.fxec.digitallostfound.repository.ItemRepository;

@Service
public class ClaimService {

    @Autowired
    private ClaimRepository claimRepository;

    @Autowired
    private ItemRepository itemRepository;

    // =====================================================
    // CREATE CLAIM
    // =====================================================

    public Claim createClaim(Claim claim) {

        // Check whether item exists
        if (!itemRepository.existsById(claim.getItemId())) {
            throw new RuntimeException(
                    "Item not found with id: " + claim.getItemId()
            );
        }

        // Every new claim starts as PENDING
        claim.setStatus("PENDING");

        return claimRepository.save(claim);
    }

    // =====================================================
    // GET ALL CLAIMS
    // =====================================================

    public List<Claim> getAllClaims() {

        return claimRepository.findAll();
    }

    // =====================================================
    // GET CLAIM BY ID
    // =====================================================

    public Optional<Claim> getClaimById(Integer id) {

        return claimRepository.findById(id);
    }

    // =====================================================
    // GET CLAIMS BY ITEM
    // =====================================================

    public List<Claim> getClaimsByItem(Integer itemId) {

        return claimRepository.findByItemId(itemId);
    }

    // =====================================================
    // GET CLAIMS BY STATUS
    // =====================================================

    public List<Claim> getClaimsByStatus(String status) {

        return claimRepository.findByStatus(status);
    }

    // =====================================================
    // UPDATE CLAIM STATUS
    // =====================================================

    public Claim updateClaimStatus(
            Integer id,
            String status) {

        // Validate status
        if (!status.equalsIgnoreCase("PENDING")
                && !status.equalsIgnoreCase("APPROVED")
                && !status.equalsIgnoreCase("REJECTED")) {

            throw new RuntimeException(
                    "Invalid status. Use PENDING, APPROVED, or REJECTED."
            );
        }

        // Find claim
        Claim claim = claimRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Claim not found with id: " + id
                        )
                );

        // Convert to uppercase
        claim.setStatus(status.toUpperCase());

        return claimRepository.save(claim);
    }

    // =====================================================
    // DELETE CLAIM
    // =====================================================

    public void deleteClaim(Integer id) {

        if (!claimRepository.existsById(id)) {

            throw new RuntimeException(
                    "Claim not found with id: " + id
            );
        }

        claimRepository.deleteById(id);
    }
}