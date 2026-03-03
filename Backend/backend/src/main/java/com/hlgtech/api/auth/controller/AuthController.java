package com.hlgtech.api.auth.controller;

import com.hlgtech.api.auth.dto.LoginRequest;
import com.hlgtech.api.auth.dto.RegisterRequest;
import com.hlgtech.api.auth.model.Role;
import com.hlgtech.api.auth.model.User;
import com.hlgtech.api.auth.repository.UserRepository;
import com.hlgtech.api.auth.service.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import org.springframework.security.core.annotation.AuthenticationPrincipal;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final com.hlgtech.api.notification.service.NotificationService notificationService;

    public AuthController(UserRepository userRepository, PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager, JwtService jwtService,
            com.hlgtech.api.notification.service.NotificationService notificationService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.notificationService = notificationService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest().body("Email đã tồn tại");
        }

        // Tạo avatar mặc định ngẫu nhiên theo username để hồ sơ không bị trống
        String defaultAvatar = "https://api.dicebear.com/7.x/avataaars/svg?seed=" + request.getUsername();

        // Tạo ID dạng số ngẫu nhiên (8 chữ số)
        long numericId = 10000000L + (long) (Math.random() * 90000000L);

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole() != null ? request.getRole() : Role.WORKER)
                .avatar(defaultAvatar)
                .numericId(numericId)
                .build();

        userRepository.save(user);

        notificationService.notifyAdmins(
                "Người dùng mới đăng ký: " + user.getEmail() + " với vai trò " + user.getRole(),
                com.hlgtech.api.notification.model.NotificationType.USER_REGISTERED);

        return ResponseEntity.ok("Đăng ký thành công");
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        return performRoleLogin(request.getIdentifier(), request.getPassword(), null); // USER login không cần kiểm tra
                                                                                       // Role

    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated");
        }

        // Tìm User trong database dựa trên email/username từ token
        Optional<User> userOpt = userRepository.findByUsernameOrEmail(userDetails.getUsername(),
                userDetails.getUsername());

        return userOpt.map(user -> {
            if (user.getNumericId() == null) {
                user.setNumericId(10000000L + (long) (Math.random() * 90000000L));
                userRepository.save(user);
            }
            return ResponseEntity.ok(user);
        })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    /**
     * Endpoint để tạo một tài khoản Đại lý mới.
     * Chỉ có ADMIN mới có quyền truy cập.
     * 
     * @param request Dữ liệu đăng ký từ client
     * @return Thông tin người dùng đại lý vừa được tạo
     */

    // =============================================================
    // === CÁC API LOGIN PHÂN QUYỀN (MỚI BỔ SUNG) ===
    // =============================================================

    @PostMapping("/admin-login")
    public ResponseEntity<?> adminLogin(@RequestBody LoginRequest request) {
        // Chỉ cho phép đăng nhập nếu Role là ADMIN
        return performRoleLogin(request.getIdentifier(), request.getPassword(), Role.ADMIN);
    }

    // User update is handled by UserController.java

    private ResponseEntity<?> performRoleLogin(String identifier, String password, Role requiredRole) {
        try {
            // 1. Tìm User theo email hoặc username
            Optional<User> userOpt = userRepository.findByUsernameOrEmail(identifier, identifier);
            if (userOpt.isEmpty()) {
                userOpt = userRepository.findByUsernameOrEmail(identifier, identifier);
            }

            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Tài khoản không tồn tại");
            }

            User user = userOpt.get();

            // 2. KIỂM TRA ROLE (CHỈ THỰC HIỆN NẾU requiredRole KHÔNG PHẢI NULL)
            if (requiredRole != null && user.getRole() != requiredRole) {
                String errorMessage = String.format("Vai trò %s không được phép đăng nhập tại đây.",
                        user.getRole().name());
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorMessage);
            }

            // 3. Xác thực mật khẩu với AuthenticationManager
            Authentication auth = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(user.getEmail(), password));

            // 4. Lấy Balance và update vào user (logic của bạn)

            // 5. Tạo JWT Token
            UserDetails userDetails = (UserDetails) auth.getPrincipal();
            String token = jwtService.generateToken(userDetails);

            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("type", "Bearer");
            response.put("user", user);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            // Log lỗi chi tiết ở backend
            System.err.println("Login failed for identifier " + identifier + ": " + e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Sai tài khoản hoặc mật khẩu");
        }
    }

}
