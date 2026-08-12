package com.fxec.digitallostfound.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fxec.digitallostfound.repository.ClaimRepository;
import com.fxec.digitallostfound.repository.ItemRepository;
import com.fxec.digitallostfound.repository.UserRepository;

@RestController
@RequestMapping("/admin")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminController {

    private final ItemRepository itemRepository;
    private final ClaimRepository claimRepository;
    private final UserRepository userRepository;

    public AdminController(
            ItemRepository itemRepository,
            ClaimRepository claimRepository,
            UserRepository userRepository) {

        this.itemRepository = itemRepository;
        this.claimRepository = claimRepository;
        this.userRepository = userRepository;
    }

    // =====================================================
    // ADMIN DASHBOARD
    // =====================================================

    @GetMapping("/dashboard")
    public Map<String, Object> getDashboard() {

        Map<String, Object> dashboard = new HashMap<>();

        // Total items
        long totalItems = itemRepository.count();

        // Lost items
        long lostItems =
                itemRepository.countByTypeIgnoreCase("LOST");

        // Found items
        long foundItems =
                itemRepository.countByTypeIgnoreCase("FOUND");

        // Total claims
        long totalClaims =
                claimRepository.count();

        // Pending claims
        long pendingClaims =
                claimRepository.countByStatus("PENDING");

        // Total registered users
        long totalUsers =
                userRepository.count();

        dashboard.put("totalItems", totalItems);
        dashboard.put("lostItems", lostItems);
        dashboard.put("foundItems", foundItems);
        dashboard.put("totalClaims", totalClaims);
        dashboard.put("pendingClaims", pendingClaims);
        dashboard.put("totalUsers", totalUsers);

        return dashboard;
    }
}