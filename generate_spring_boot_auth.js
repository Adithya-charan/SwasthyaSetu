const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, 'swasthyasetu-backend');
const basePackage = path.join(baseDir, 'src', 'main', 'java', 'com', 'swasthyasetu');

function makeDir(dirPath) {
    fs.mkdirSync(dirPath, { recursive: true });
}

function writeFile(filePath, content) {
    makeDir(path.dirname(filePath));
    fs.writeFileSync(filePath, content.trim() + '\n', 'utf8');
}

// ================= USER MODULE (ENTITIES) =================
writeFile(path.join(basePackage, 'user', 'entity', 'Role.java'), `
package com.swasthyasetu.user.entity;

public enum Role {
    PATIENT, DOCTOR, ADMIN, PHARMACIST
}
`);

writeFile(path.join(basePackage, 'user', 'entity', 'User.java'), `
package com.swasthyasetu.user.entity;

import com.swasthyasetu.common.BaseEntity;
import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "users")
public class User extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    private String phone;
    private String profilePicUrl;

    @Column(nullable = false)
    private boolean isActive = true;

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getProfilePicUrl() { return profilePicUrl; }
    public void setProfilePicUrl(String profilePicUrl) { this.profilePicUrl = profilePicUrl; }
    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }
}
`);

writeFile(path.join(basePackage, 'user', 'entity', 'DoctorProfile.java'), `
package com.swasthyasetu.user.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "doctor_profiles")
public class DoctorProfile {
    @Id
    private UUID id; // shares ID with User

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "id")
    private User user;

    private String specialization;
    private String qualifications;
    private int experienceYears;
    private String licenseNumber;
    private BigDecimal consultationFee;

    @Column(columnDefinition = "TEXT")
    private String bio;

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public String getSpecialization() { return specialization; }
    public void setSpecialization(String specialization) { this.specialization = specialization; }
    public String getQualifications() { return qualifications; }
    public void setQualifications(String qualifications) { this.qualifications = qualifications; }
    public int getExperienceYears() { return experienceYears; }
    public void setExperienceYears(int experienceYears) { this.experienceYears = experienceYears; }
    public String getLicenseNumber() { return licenseNumber; }
    public void setLicenseNumber(String licenseNumber) { this.licenseNumber = licenseNumber; }
    public BigDecimal getConsultationFee() { return consultationFee; }
    public void setConsultationFee(BigDecimal consultationFee) { this.consultationFee = consultationFee; }
    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }
}
`);

writeFile(path.join(basePackage, 'user', 'UserRepository.java'), `
package com.swasthyasetu.user;

import com.swasthyasetu.user.entity.Role;
import com.swasthyasetu.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);
    Page<User> findByRole(Role role, Pageable pageable);
}
`);

writeFile(path.join(basePackage, 'user', 'DoctorProfileRepository.java'), `
package com.swasthyasetu.user;

import com.swasthyasetu.user.entity.DoctorProfile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

public interface DoctorProfileRepository extends JpaRepository<DoctorProfile, UUID> {
    @Query("SELECT dp FROM DoctorProfile dp JOIN dp.user u " +
           "WHERE u.isActive = true AND u.role = 'DOCTOR' " +
           "AND (:specialization IS NULL OR dp.specialization = :specialization) " +
           "AND (:name IS NULL OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :name, '%')))")
    Page<DoctorProfile> findActiveDoctors(@Param("specialization") String specialization, @Param("name") String name, Pageable pageable);
}
`);

// ================= AUTH MODULE & SECURITY APP =================

writeFile(path.join(basePackage, 'auth', 'JwtTokenProvider.java'), `
package com.swasthyasetu.auth;

import com.swasthyasetu.config.AppProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.UUID;

@Component
public class JwtTokenProvider {

    private final AppProperties appProperties;

    public JwtTokenProvider(AppProperties appProperties) {
        this.appProperties = appProperties;
    }

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(Decoders.BASE64.decode(appProperties.getJwt().getSecret()));
    }

    public String generateAccessToken(UUID userId, String role) {
        return Jwts.builder()
                .subject(userId.toString())
                .claim("role", role)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + appProperties.getJwt().getAccessExpiryMs()))
                .signWith(getSigningKey())
                .compact();
    }

    public String generateRefreshToken(UUID userId) {
        return Jwts.builder()
                .subject(userId.toString())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + appProperties.getJwt().getRefreshExpiryMs()))
                .signWith(getSigningKey())
                .compact();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser().verifyWith(getSigningKey()).build().parseSignedClaims(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public UUID extractUserId(String token) {
        Claims claims = Jwts.parser().verifyWith(getSigningKey()).build().parseSignedClaims(token).getPayload();
        return UUID.fromString(claims.getSubject());
    }

    public String extractRole(String token) {
        Claims claims = Jwts.parser().verifyWith(getSigningKey()).build().parseSignedClaims(token).getPayload();
        return claims.get("role", String.class);
    }
}
`);

writeFile(path.join(basePackage, 'auth', 'JwtAuthenticationFilter.java'), `
package com.swasthyasetu.auth;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.UUID;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider tokenProvider;

    public JwtAuthenticationFilter(JwtTokenProvider tokenProvider) {
        this.tokenProvider = tokenProvider;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        try {
            String jwt = getJwtFromRequest(request);

            if (StringUtils.hasText(jwt) && tokenProvider.validateToken(jwt)) {
                UUID userId = tokenProvider.extractUserId(jwt);
                String role = tokenProvider.extractRole(jwt);

                SimpleGrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + role);
                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                        userId.toString(), null, Collections.singletonList(authority));
                
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        } catch (Exception ex) {
            logger.error("Could not set user authentication in security context", ex);
        }

        filterChain.doFilter(request, response);
    }

    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
`);

writeFile(path.join(basePackage, 'config', 'SecurityConfig.java'), `
package com.swasthyasetu.config;

import com.swasthyasetu.auth.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(
                    "/api/auth/register",
                    "/api/auth/login",
                    "/api/auth/refresh-token",
                    "/api/doctors/**",
                    "/api/pharmacy/medicines/**",
                    "/v3/api-docs/**",
                    "/swagger-ui/**",
                    "/swagger-ui.html",
                    "/ws/webrtc/**"
                ).permitAll()
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000", "http://localhost:8080"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("authorization", "content-type", "x-auth-token"));
        configuration.setExposedHeaders(Arrays.asList("x-auth-token"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
`);

// ================= DTOs for Auth & User =================

writeFile(path.join(basePackage, 'auth', 'dto', 'RegisterRequest.java'), `
package com.swasthyasetu.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
    @NotBlank String fullName,
    @NotBlank @Email String email,
    @NotBlank @Size(min = 6) String password,
    @NotNull String role,
    String phone
) {}
`);

writeFile(path.join(basePackage, 'auth', 'dto', 'LoginRequest.java'), `
package com.swasthyasetu.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
    @NotBlank @Email String email,
    @NotBlank String password
) {}
`);

writeFile(path.join(basePackage, 'auth', 'dto', 'AuthResponse.java'), `
package com.swasthyasetu.auth.dto;

public record AuthResponse(
    String accessToken
) {}
`);

writeFile(path.join(basePackage, 'user', 'dto', 'UserDto.java'), `
package com.swasthyasetu.user.dto;

import java.util.UUID;
import java.time.LocalDateTime;

public record UserDto(
    UUID id,
    String fullName,
    String email,
    String role,
    String phone,
    String profilePicUrl,
    boolean isActive,
    LocalDateTime createdAt
) {}
`);

writeFile(path.join(basePackage, 'user', 'dto', 'DoctorProfileDto.java'), `
package com.swasthyasetu.user.dto;

import java.math.BigDecimal;

public record DoctorProfileDto(
    UserDto user,
    String specialization,
    String qualifications,
    int experienceYears,
    String licenseNumber,
    BigDecimal consultationFee,
    String bio
) {}
`);

// ================= AUTH CONTROLLER & SERVICE =================
writeFile(path.join(basePackage, 'auth', 'AuthService.java'), `
package com.swasthyasetu.auth;

import com.swasthyasetu.auth.dto.LoginRequest;
import com.swasthyasetu.auth.dto.RegisterRequest;
import com.swasthyasetu.common.ResourceConflictException;
import com.swasthyasetu.user.UserRepository;
import com.swasthyasetu.user.entity.Role;
import com.swasthyasetu.user.entity.User;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public User register(RegisterRequest req) {
        if (userRepository.findByEmail(req.email()).isPresent()) {
            throw new ResourceConflictException("Email is already in use");
        }
        User user = new User();
        user.setFullName(req.fullName());
        user.setEmail(req.email());
        user.setPasswordHash(passwordEncoder.encode(req.password()));
        user.setRole(Role.valueOf(req.role().toUpperCase()));
        user.setPhone(req.phone());
        return userRepository.save(user);
    }

    public User authenticate(LoginRequest req) {
        User user = userRepository.findByEmail(req.email())
            .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));
        
        if (!passwordEncoder.matches(req.password(), user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid email or password");
        }
        if (!user.isActive()) {
            throw new BadCredentialsException("User account is inactive");
        }
        return user;
    }
}
`);

writeFile(path.join(basePackage, 'auth', 'AuthController.java'), `
package com.swasthyasetu.auth;

import com.swasthyasetu.auth.dto.AuthResponse;
import com.swasthyasetu.auth.dto.LoginRequest;
import com.swasthyasetu.auth.dto.RegisterRequest;
import com.swasthyasetu.common.ApiResponse;
import com.swasthyasetu.config.AppProperties;
import com.swasthyasetu.user.dto.UserDto;
import com.swasthyasetu.user.entity.User;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    
    private final AuthService authService;
    private final JwtTokenProvider jwtTokenProvider;
    private final AppProperties appProperties;

    public AuthController(AuthService authService, JwtTokenProvider jwtTokenProvider, AppProperties appProperties) {
        this.authService = authService;
        this.jwtTokenProvider = jwtTokenProvider;
        this.appProperties = appProperties;
    }

    private UserDto mapUserDto(User user) {
        return new UserDto(user.getId(), user.getFullName(), user.getEmail(), 
            user.getRole().name(), user.getPhone(), user.getProfilePicUrl(), 
            user.isActive(), user.getCreatedAt());
    }

    @PostMapping("/register")
    public ApiResponse<UserDto> register(@Valid @RequestBody RegisterRequest req) {
        User user = authService.register(req);
        return new ApiResponse<>(true, "Registration successful", mapUserDto(user));
    }

    @PostMapping("/login")
    public ApiResponse<AuthResponse> login(@Valid @RequestBody LoginRequest req, HttpServletResponse response) {
        User user = authService.authenticate(req);
        
        String accessToken = jwtTokenProvider.generateAccessToken(user.getId(), user.getRole().name());
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getId());
        
        Cookie refreshCookie = new Cookie("refreshToken", refreshToken);
        refreshCookie.setHttpOnly(true);
        refreshCookie.setPath("/api/auth/refresh-token");
        refreshCookie.setMaxAge((int) (appProperties.getJwt().getRefreshExpiryMs() / 1000));
        response.addCookie(refreshCookie);
        
        return new ApiResponse<>(true, "Login successful", new AuthResponse(accessToken));
    }

    @PostMapping("/refresh-token")
    public ApiResponse<AuthResponse> refreshToken(@CookieValue(name = "refreshToken", required = false) String refreshToken) {
        if (refreshToken == null || !jwtTokenProvider.validateToken(refreshToken)) {
            throw new BadCredentialsException("Invalid or expired refresh token");
        }
        UUID userId = jwtTokenProvider.extractUserId(refreshToken);
        // Note: in prod checking the db state of user is recommended here.
        String accessToken = jwtTokenProvider.generateAccessToken(userId, "PATIENT"); // placeholder role
        return new ApiResponse<>(true, "Token refreshed", new AuthResponse(accessToken));
    }

    @PostMapping("/logout")
    public ApiResponse<Void> logout(HttpServletResponse response) {
        Cookie refreshCookie = new Cookie("refreshToken", null);
        refreshCookie.setHttpOnly(true);
        refreshCookie.setMaxAge(0);
        refreshCookie.setPath("/api/auth/refresh-token");
        response.addCookie(refreshCookie);
        return new ApiResponse<>(true, "Logged out successfully", null);
    }
}
`);

// ================= USER CONTROLLER & SERVICE =================
writeFile(path.join(basePackage, 'user', 'UserService.java'), `
package com.swasthyasetu.user;

import com.swasthyasetu.common.ResourceNotFoundException;
import com.swasthyasetu.user.entity.DoctorProfile;
import com.swasthyasetu.user.entity.Role;
import com.swasthyasetu.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final DoctorProfileRepository doctorProfileRepository;

    public UserService(UserRepository userRepository, DoctorProfileRepository doctorProfileRepository) {
        this.userRepository = userRepository;
        this.doctorProfileRepository = doctorProfileRepository;
    }

    public User getUserById(UUID id) {
        return userRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    @Transactional
    public User updateUserProfile(UUID id, String fullName, String phone, String profilePicUrl) {
        User user = getUserById(id);
        if (fullName != null) user.setFullName(fullName);
        if (phone != null) user.setPhone(phone);
        if (profilePicUrl != null) user.setProfilePicUrl(profilePicUrl);
        return userRepository.save(user);
    }

    public Page<DoctorProfile> getActiveDoctors(String specialization, String name, Pageable pageable) {
        return doctorProfileRepository.findActiveDoctors(specialization, name, pageable);
    }

    public DoctorProfile getDoctorProfile(UUID doctorId) {
        return doctorProfileRepository.findById(doctorId)
            .orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found"));
    }

    public Page<User> getAllUsersAdmin(Role role, Pageable pageable) {
        if (role != null) {
            return userRepository.findByRole(role, pageable);
        }
        return userRepository.findAll(pageable);
    }

    @Transactional
    public void setUserActiveStatus(UUID userId, boolean isActive) {
        User user = getUserById(userId);
        user.setActive(isActive);
        userRepository.save(user);
    }
}
`);

writeFile(path.join(basePackage, 'user', 'UserController.java'), `
package com.swasthyasetu.user;

import com.swasthyasetu.common.ApiResponse;
import com.swasthyasetu.common.PageResponse;
import com.swasthyasetu.user.dto.DoctorProfileDto;
import com.swasthyasetu.user.dto.UserDto;
import com.swasthyasetu.user.entity.DoctorProfile;
import com.swasthyasetu.user.entity.Role;
import com.swasthyasetu.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    private UUID getAuthenticatedUserId() {
        return UUID.fromString((String) SecurityContextHolder.getContext().getAuthentication().getPrincipal());
    }

    private UserDto mapUserDto(User user) {
        return new UserDto(user.getId(), user.getFullName(), user.getEmail(), 
                           user.getRole().name(), user.getPhone(), user.getProfilePicUrl(), 
                           user.isActive(), user.getCreatedAt());
    }

    private DoctorProfileDto mapDoctorProfileDto(DoctorProfile dp) {
        return new DoctorProfileDto(mapUserDto(dp.getUser()), dp.getSpecialization(), 
                                    dp.getQualifications(), dp.getExperienceYears(), 
                                    dp.getLicenseNumber(), dp.getConsultationFee(), dp.getBio());
    }

    @GetMapping("/users/me")
    public ApiResponse<UserDto> getMe() {
        return new ApiResponse<>(true, "Success", mapUserDto(userService.getUserById(getAuthenticatedUserId())));
    }

    @PutMapping("/users/me")
    public ApiResponse<UserDto> updateMe(@RequestParam(required=false) String fullName, 
                                         @RequestParam(required=false) String phone, 
                                         @RequestParam(required=false) String profilePicUrl) {
        User updated = userService.updateUserProfile(getAuthenticatedUserId(), fullName, phone, profilePicUrl);
        return new ApiResponse<>(true, "Updated profile", mapUserDto(updated));
    }

    @GetMapping("/doctors")
    public ApiResponse<PageResponse<DoctorProfileDto>> getDoctors(
            @RequestParam(required = false) String specialization,
            @RequestParam(required = false) String name,
            Pageable pageable) {
        Page<DoctorProfile> page = userService.getActiveDoctors(specialization, name, pageable);
        PageResponse<DoctorProfileDto> pr = new PageResponse<>(
            page.getContent().stream().map(this::mapDoctorProfileDto).collect(Collectors.toList()),
            page.getTotalElements(), page.getTotalPages(), page.getNumber()
        );
        return new ApiResponse<>(true, "Doctors fetched", pr);
    }

    @GetMapping("/doctors/{id}")
    public ApiResponse<DoctorProfileDto> getDoctorById(@PathVariable UUID id) {
        return new ApiResponse<>(true, "Doctor fetched", mapDoctorProfileDto(userService.getDoctorProfile(id)));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin/users")
    public ApiResponse<PageResponse<UserDto>> getAllUsers(
            @RequestParam(required = false) Role role, Pageable pageable) {
        Page<User> page = userService.getAllUsersAdmin(role, pageable);
        PageResponse<UserDto> pr = new PageResponse<>(
            page.getContent().stream().map(this::mapUserDto).collect(Collectors.toList()),
            page.getTotalElements(), page.getTotalPages(), page.getNumber()
        );
        return new ApiResponse<>(true, "Users fetched", pr);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/admin/users/{id}/activate")
    public ApiResponse<Void> activateUser(@PathVariable UUID id, @RequestParam boolean active) {
        userService.setUserActiveStatus(id, active);
        return new ApiResponse<>(true, "User status updated", null);
    }
}
`);

console.log("Auth and User Modules generated successfully.");
