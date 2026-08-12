package com.fxec.digitallostfound.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.fxec.digitallostfound.entity.Item;
import com.fxec.digitallostfound.repository.ItemRepository;

@RestController
@RequestMapping("/items")
@CrossOrigin(origins = "http://localhost:5173")
public class ItemController {

    private final ItemRepository itemRepository;

    public ItemController(ItemRepository itemRepository) {
        this.itemRepository = itemRepository;
    }

    // Get all items
    @GetMapping
    public List<Item> getAllItems() {
        return itemRepository.findAll();
    }

    // Get item by ID
    @GetMapping("/{id}")
    public ResponseEntity<Item> getItemById(
            @PathVariable Integer id) {

        return itemRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Add new item
    @PostMapping
    public ResponseEntity<Item> createItem(
            @RequestBody Item item) {

        if (item.getReporterEmail() == null ||
                item.getReporterEmail().isBlank()) {

            return ResponseEntity.badRequest().build();
        }

        Item savedItem = itemRepository.save(item);

        return ResponseEntity.ok(savedItem);
    }

    // Update item
    @PutMapping("/{id}")
    public ResponseEntity<Item> updateItem(
            @PathVariable Integer id,
            @RequestBody Item updatedItem) {

        return itemRepository.findById(id)
                .map(item -> {

                    item.setTitle(updatedItem.getTitle());
                    item.setDescription(updatedItem.getDescription());
                    item.setCategory(updatedItem.getCategory());
                    item.setLocation(updatedItem.getLocation());
                    item.setDate(updatedItem.getDate());
                    item.setType(updatedItem.getType());
                    item.setStatus(updatedItem.getStatus());
                    item.setImage(updatedItem.getImage());

                    // Reporter should not change during normal update
                    // Keep the original reporterEmail

                    return ResponseEntity.ok(
                            itemRepository.save(item)
                    );
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // Delete item
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteItem(
            @PathVariable Integer id) {

        if (!itemRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        itemRepository.deleteById(id);

        return ResponseEntity.noContent().build();
    }

    // Search by category
    @GetMapping("/search/category")
    public List<Item> searchByCategory(
            @RequestParam String category) {

        return itemRepository.findByCategory(category);
    }

    // Search by location
    @GetMapping("/search/location")
    public List<Item> searchByLocation(
            @RequestParam String location) {

        return itemRepository.findByLocation(location);
    }

    // Search by type
    @GetMapping("/search/type")
    public List<Item> searchByType(
            @RequestParam String type) {

        return itemRepository.findByType(type);
    }

    // Search by title
    @GetMapping("/search/title")
    public List<Item> searchByTitle(
            @RequestParam String title) {

        return itemRepository.findByTitleContainingIgnoreCase(title);
    }
    @GetMapping("/reporter")
    public List<Item> getItemsByReporter(
            @RequestParam String email) {

        return itemRepository.findByReporterEmail(email);
    }
}