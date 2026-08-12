package com.fxec.digitallostfound.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fxec.digitallostfound.entity.Claim;
import com.fxec.digitallostfound.repository.ClaimRepository;

@RestController
@RequestMapping("/api/claims")
@CrossOrigin(origins = "*")
public class ClaimController {

    private final ClaimRepository claimRepository;

    public ClaimController(ClaimRepository claimRepository) {
        this.claimRepository = claimRepository;
    }

    @GetMapping
    public ResponseEntity<List<Claim>> getAllClaims() {
        return ResponseEntity.ok(claimRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Claim> getClaimById(@PathVariable Integer id) {
        return claimRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/item/{itemId}")
    public ResponseEntity<List<Claim>> getClaimsByItem(
            @PathVariable Integer itemId) {

        return ResponseEntity.ok(
                claimRepository.findByItemId(itemId)
        );
    }

    @PostMapping
    public ResponseEntity<Claim> createClaim(
            @RequestBody Claim claim) {

        Claim savedClaim = claimRepository.save(claim);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(savedClaim);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Claim> updateClaim(
            @PathVariable Integer id,
            @RequestBody Claim claimDetails) {

        return claimRepository.findById(id)
                .map(claim -> {

                    claim.setItemId(claimDetails.getItemId());
                    claim.setClaimantName(
                            claimDetails.getClaimantName());
                    claim.setClaimantEmail(
                            claimDetails.getClaimantEmail());
                    claim.setProof(claimDetails.getProof());
                    claim.setStatus(claimDetails.getStatus());

                    Claim updatedClaim =
                            claimRepository.save(claim);

                    return ResponseEntity.ok(updatedClaim);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteClaim(
            @PathVariable Integer id) {

        if (!claimRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        claimRepository.deleteById(id);

        return ResponseEntity.noContent().build();
    }
}