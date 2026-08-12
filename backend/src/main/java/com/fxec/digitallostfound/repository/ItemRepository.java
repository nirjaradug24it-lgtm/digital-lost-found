package com.fxec.digitallostfound.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.fxec.digitallostfound.entity.Item;

public interface ItemRepository extends JpaRepository<Item, Integer> {

    // Search by category
    List<Item> findByCategory(String category);

    // Search by location
    List<Item> findByLocation(String location);

    // Search by type
    List<Item> findByType(String type);

    // Search by title
    List<Item> findByTitleContainingIgnoreCase(String title);

    // Find items reported by a particular student
    List<Item> findByReporterEmail(String reporterEmail);

    // Dashboard counts
    long countByTypeIgnoreCase(String type);
}