package com.fxec.digitallostfound.service;

import java.util.HashMap;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.fxec.digitallostfound.repository.ClaimRepository;
import com.fxec.digitallostfound.repository.ItemRepository;

@Service
public class DashboardService {

    private final ItemRepository itemRepository;
    private final ClaimRepository claimRepository;

    public DashboardService(
            ItemRepository itemRepository,
            ClaimRepository claimRepository) {

        this.itemRepository = itemRepository;
        this.claimRepository = claimRepository;
    }

    public Map<String, Long> getDashboardData() {

        Map<String, Long> data = new HashMap<>();

        long totalItems = itemRepository.count();

        long lostItems =
                itemRepository.countByTypeIgnoreCase("LOST");

        long foundItems =
                itemRepository.countByTypeIgnoreCase("FOUND");

        long totalClaims =
                claimRepository.count();

        data.put("totalItems", totalItems);
        data.put("lostItems", lostItems);
        data.put("foundItems", foundItems);
        data.put("totalClaims", totalClaims);

        return data;
    }
}