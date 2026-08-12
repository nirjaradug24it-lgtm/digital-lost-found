package com.fxec.digitallostfound.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fxec.digitallostfound.service.DashboardService;

@RestController
@RequestMapping("/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(
            DashboardService dashboardService) {

        this.dashboardService = dashboardService;
    }

    @GetMapping
    public ResponseEntity<Map<String, Long>> getDashboard() {

        Map<String, Long> dashboard =
                dashboardService.getDashboardData();

        return ResponseEntity.ok(dashboard);
    }
}