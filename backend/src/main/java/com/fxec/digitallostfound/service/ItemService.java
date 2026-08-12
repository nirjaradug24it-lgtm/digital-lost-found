package com.fxec.digitallostfound.service;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.fxec.digitallostfound.entity.Item;
import com.fxec.digitallostfound.repository.ItemRepository;

@Service
public class ItemService {

    private final ItemRepository itemRepository;

    public ItemService(ItemRepository itemRepository) {
        this.itemRepository = itemRepository;
    }


    // 1. Create Item
    public Item createItem(Item item) {

        if (item.getStatus() == null ||
                item.getStatus().isEmpty()) {

            item.setStatus("OPEN");
        }

        return itemRepository.save(item);
    }


    // 2. Get All Items
    public List<Item> getAllItems() {

        return itemRepository.findAll();
    }


    // 3. Get Item By ID
    public Item getItemById(Integer id) {

        return itemRepository.findById(id)
                .orElseThrow(() ->
                    new RuntimeException(
                        "Item not found with id: " + id
                    )
                );
    }


    // 4. Update Item
    public Item updateItem(
            Integer id,
            Item updatedItem) {

        Item existingItem =
                itemRepository.findById(id)
                .orElseThrow(() ->
                    new RuntimeException(
                        "Item not found with id: " + id
                    )
                );


        existingItem.setTitle(
                updatedItem.getTitle()
        );

        existingItem.setDescription(
                updatedItem.getDescription()
        );

        existingItem.setCategory(
                updatedItem.getCategory()
        );

        existingItem.setLocation(
                updatedItem.getLocation()
        );

        existingItem.setDate(
                updatedItem.getDate()
        );

        existingItem.setType(
                updatedItem.getType()
        );

        existingItem.setStatus(
                updatedItem.getStatus()
        );


        return itemRepository.save(
                existingItem
        );
    }


    // 5. Delete Item
    public void deleteItem(Integer id) {

        if (!itemRepository.existsById(id)) {

            throw new RuntimeException(
                "Item not found with id: " + id
            );
        }

        itemRepository.deleteById(id);
    }


    // 6. Search by Category
    public List<Item> searchByCategory(
            String category) {

        return itemRepository
                .findByCategory(category);
    }


    // 7. Search by Location
    public List<Item> searchByLocation(
            String location) {

        return itemRepository
                .findByLocation(location);
    }


    // 8. Search by Type
    public List<Item> searchByType(
            String type) {

        return itemRepository
                .findByType(type);
    }


    // 9. Search by Title
    public List<Item> searchByTitle(
            String title) {

        return itemRepository
                .findByTitleContainingIgnoreCase(
                        title
                );
    }


    // 10. Pagination
    public Page<Item> getItemsWithPagination(
            int page,
            int size) {

        Pageable pageable =
                PageRequest.of(page, size);

        return itemRepository.findAll(
                pageable
        );
    }


    // 11. Sorting
    public List<Item> getItemsSorted(
            String sort,
            String order) {

        Sort.Direction direction;

        if (order.equalsIgnoreCase("desc")) {

            direction = Sort.Direction.DESC;

        } else {

            direction = Sort.Direction.ASC;
        }


        Sort sorting =
                Sort.by(direction, sort);


        return itemRepository.findAll(
                sorting
        );
    }
}