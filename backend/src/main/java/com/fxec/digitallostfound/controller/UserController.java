package com.fxec.digitallostfound.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.fxec.digitallostfound.entity.User;
import com.fxec.digitallostfound.repository.UserRepository;

@RestController
@RequestMapping("/users")
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // =====================================================
    // GET ALL USERS
    // =====================================================

    @GetMapping
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // =====================================================
    // GET USER BY EMAIL
    // =====================================================

    @GetMapping("/by-email")
    public ResponseEntity<User> getUserByEmail(
            @RequestParam String email) {

        Optional<User> user =
                userRepository.findByEmail(email);

        return user
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // =====================================================
    // REGISTER
    // =====================================================

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {

        if (userRepository.existsByEmail(user.getEmail())) {
            return ResponseEntity
                    .badRequest()
                    .body("Email already registered");
        }

        user.setRole("STUDENT");

        User savedUser = userRepository.save(user);

        Map<String, Object> response = new HashMap<>();

        response.put("id", savedUser.getId());
        response.put("name", savedUser.getName());
        response.put("email", savedUser.getEmail());
        response.put("role", savedUser.getRole());

        return ResponseEntity.ok(response);
    }

    // =====================================================
    // LOGIN
    // =====================================================

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody User loginUser) {

        Optional<User> userOptional =
                userRepository.findByEmail(loginUser.getEmail());

        if (userOptional.isEmpty()) {
            return ResponseEntity
                    .status(401)
                    .body("Invalid email or password");
        }

        User user = userOptional.get();

        if (!user.getPassword()
                .equals(loginUser.getPassword())) {

            return ResponseEntity
                    .status(401)
                    .body("Invalid email or password");
        }

        Map<String, Object> response = new HashMap<>();

        response.put("id", user.getId());
        response.put("name", user.getName());
        response.put("email", user.getEmail());
        response.put("role", user.getRole());

        return ResponseEntity.ok(response);
    }
}