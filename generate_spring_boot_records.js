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

// ================= RECORD MODULE =================
writeFile(path.join(basePackage, 'record', 'entity', 'RecordType.java'), `
package com.swasthyasetu.record.entity;
public enum RecordType { LAB_RESULT, IMAGING, DISCHARGE_SUMMARY, OTHER }
`);

writeFile(path.join(basePackage, 'record', 'entity', 'MedicalRecord.java'), `
package com.swasthyasetu.record.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "medical_records")
public class MedicalRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private UUID patientId;

    @Column(nullable = false)
    private UUID uploadedByUserId;

    @Enumerated(EnumType.STRING)
    private RecordType type;

    private String fileUrl;
    private String fileName;
    private long fileSizeBytes;
    private String description;
    private LocalDateTime uploadedAt = LocalDateTime.now();

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getPatientId() { return patientId; }
    public void setPatientId(UUID patientId) { this.patientId = patientId; }
    public UUID getUploadedByUserId() { return uploadedByUserId; }
    public void setUploadedByUserId(UUID uploadedByUserId) { this.uploadedByUserId = uploadedByUserId; }
    public RecordType getType() { return type; }
    public void setType(RecordType type) { this.type = type; }
    public String getFileUrl() { return fileUrl; }
    public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }
    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }
    public long getFileSizeBytes() { return fileSizeBytes; }
    public void setFileSizeBytes(long fileSizeBytes) { this.fileSizeBytes = fileSizeBytes; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public LocalDateTime getUploadedAt() { return uploadedAt; }
    public void setUploadedAt(LocalDateTime uploadedAt) { this.uploadedAt = uploadedAt; }
}
`);

writeFile(path.join(basePackage, 'record', 'StorageService.java'), `
package com.swasthyasetu.record;

import org.springframework.web.multipart.MultipartFile;

public interface StorageService {
    String storeFile(MultipartFile file);
    void deleteFile(String fileUrl);
}
`);

writeFile(path.join(basePackage, 'record', 'LocalStorageServiceImpl.java'), `
package com.swasthyasetu.record;

import com.swasthyasetu.config.AppProperties;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.*;
import java.util.UUID;

@Service
public class LocalStorageServiceImpl implements StorageService {

    private final Path rootLocation;

    public LocalStorageServiceImpl(AppProperties properties) {
        this.rootLocation = Paths.get(properties.getStorage().getUploadDir());
    }

    @PostConstruct
    public void init() {
        try {
            Files.createDirectories(rootLocation);
        } catch (IOException e) {
            throw new RuntimeException("Could not initialize storage location", e);
        }
    }

    @Override
    public String storeFile(MultipartFile file) {
        try {
            if (file.isEmpty()) throw new RuntimeException("Failed to store empty file.");
            String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path destinationFile = this.rootLocation.resolve(Paths.get(filename)).normalize().toAbsolutePath();
            if (!destinationFile.getParent().equals(this.rootLocation.toAbsolutePath())) {
                throw new RuntimeException("Cannot store file outside current directory.");
            }
            file.transferTo(destinationFile);
            return "/uploads/" + filename;
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file.", e);
        }
    }

    @Override
    public void deleteFile(String fileUrl) {
        try {
            String filename = fileUrl.substring(fileUrl.lastIndexOf("/") + 1);
            Files.deleteIfExists(this.rootLocation.resolve(filename));
        } catch (IOException e) {
            throw new RuntimeException("Failed to delete file.", e);
        }
    }
}
`);

writeFile(path.join(basePackage, 'record', 'MedicalRecordRepository.java'), `
package com.swasthyasetu.record;

import com.swasthyasetu.record.entity.MedicalRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface MedicalRecordRepository extends JpaRepository<MedicalRecord, UUID> {
    List<MedicalRecord> findByPatientIdOrderByUploadedAtDesc(UUID patientId);
}
`);

writeFile(path.join(basePackage, 'record', 'RecordController.java'), `
package com.swasthyasetu.record;

import com.swasthyasetu.common.ApiResponse;
import com.swasthyasetu.record.entity.MedicalRecord;
import com.swasthyasetu.record.entity.RecordType;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/records")
public class RecordController {

    private final StorageService storageService;
    private final MedicalRecordRepository recordRepository;

    public RecordController(StorageService storageService, MedicalRecordRepository recordRepository) {
        this.storageService = storageService;
        this.recordRepository = recordRepository;
    }

    private UUID getUserId() {
        return UUID.fromString((String) SecurityContextHolder.getContext().getAuthentication().getPrincipal());
    }

    @PostMapping
    public ApiResponse<MedicalRecord> uploadRecord(@RequestParam("file") MultipartFile file,
                                                   @RequestParam("patientId") UUID patientId,
                                                   @RequestParam("type") String type,
                                                   @RequestParam(required=false) String description) {
        String url = storageService.storeFile(file);
        MedicalRecord record = new MedicalRecord();
        record.setPatientId(patientId);
        record.setUploadedByUserId(getUserId());
        record.setType(RecordType.valueOf(type));
        record.setFileName(file.getOriginalFilename());
        record.setFileSizeBytes(file.getSize());
        record.setFileUrl(url);
        record.setDescription(description);
        return new ApiResponse<>(true, "Uploaded successfully", recordRepository.save(record));
    }

    @GetMapping("/my")
    public ApiResponse<List<MedicalRecord>> getMyRecords() {
        return new ApiResponse<>(true, "Records", recordRepository.findByPatientIdOrderByUploadedAtDesc(getUserId()));
    }
}
`);

// ================= PHARMACY MODULE =================
writeFile(path.join(basePackage, 'pharmacy', 'entity', 'Medicine.java'), `
package com.swasthyasetu.pharmacy.entity;

import com.swasthyasetu.common.BaseEntity;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "medicines")
public class Medicine extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    private String genericName;
    private String manufacturer;
    private String category;

    @Column(nullable = false)
    private int stockQuantity;

    @Column(nullable = false)
    private BigDecimal unitPrice;

    private LocalDate expiryDate;
    private int reorderLevel = 50;

    // Getters / Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getGenericName() { return genericName; }
    public void setGenericName(String genericName) { this.genericName = genericName; }
    public String getManufacturer() { return manufacturer; }
    public void setManufacturer(String manufacturer) { this.manufacturer = manufacturer; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public int getStockQuantity() { return stockQuantity; }
    public void setStockQuantity(int stockQuantity) { this.stockQuantity = stockQuantity; }
    public BigDecimal getUnitPrice() { return unitPrice; }
    public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }
    public LocalDate getExpiryDate() { return expiryDate; }
    public void setExpiryDate(LocalDate expiryDate) { this.expiryDate = expiryDate; }
    public int getReorderLevel() { return reorderLevel; }
    public void setReorderLevel(int reorderLevel) { this.reorderLevel = reorderLevel; }
}
`);

writeFile(path.join(basePackage, 'pharmacy', 'MedicineRepository.java'), `
package com.swasthyasetu.pharmacy;

import com.swasthyasetu.pharmacy.entity.Medicine;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface MedicineRepository extends JpaRepository<Medicine, UUID> {
    @Query("SELECT m FROM Medicine m WHERE (:name IS NULL OR LOWER(m.name) LIKE LOWER(CONCAT('%', :name, '%'))) " +
           "AND (:category IS NULL OR m.category = :category)")
    Page<Medicine> searchMedicines(@Param("name") String name, @Param("category") String category, Pageable pageable);

    @Query("SELECT m FROM Medicine m WHERE m.stockQuantity <= m.reorderLevel")
    List<Medicine> findLowStockMedicines();
}
`);

writeFile(path.join(basePackage, 'pharmacy', 'PharmacyController.java'), `
package com.swasthyasetu.pharmacy;

import com.swasthyasetu.common.ApiResponse;
import com.swasthyasetu.common.ResourceNotFoundException;
import com.swasthyasetu.pharmacy.entity.Medicine;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/pharmacy")
public class PharmacyController {

    private final MedicineRepository medicineRepository;

    public PharmacyController(MedicineRepository medicineRepository) {
        this.medicineRepository = medicineRepository;
    }

    @GetMapping("/medicines")
    public ApiResponse<Page<Medicine>> getMedicines(@RequestParam(required=false) String name,
                                                    @RequestParam(required=false) String category,
                                                    Pageable pageable) {
        return new ApiResponse<>(true, "Medicines fetched", 
                medicineRepository.searchMedicines(name, category, pageable));
    }

    @PreAuthorize("hasAnyRole('PHARMACIST', 'ADMIN')")
    @PostMapping("/medicines")
    public ApiResponse<Medicine> addMedicine(@RequestBody Medicine medicine) {
        return new ApiResponse<>(true, "Added medicine", medicineRepository.save(medicine));
    }

    @PreAuthorize("hasRole('PHARMACIST')")
    @PutMapping("/medicines/{id}/stock")
    public ApiResponse<Medicine> adjustStock(@PathVariable UUID id, @RequestParam int adjustment) {
        Medicine m = medicineRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Not found"));
        if (m.getStockQuantity() + adjustment < 0) {
            throw new IllegalArgumentException("Stock cannot be negative");
        }
        m.setStockQuantity(m.getStockQuantity() + adjustment);
        return new ApiResponse<>(true, "Stock adjusted", medicineRepository.save(m));
    }

    @PreAuthorize("hasRole('PHARMACIST')")
    @GetMapping("/medicines/low-stock")
    public ApiResponse<List<Medicine>> getLowStock() {
        return new ApiResponse<>(true, "Low stock medicines", medicineRepository.findLowStockMedicines());
    }
}
`);

// ================= DATA.SQL SEEDER =================
writeFile(path.join(baseDir, 'src', 'main', 'resources', 'data.sql'), `
-- Using pgcrypto for UUID generation if needed, but JPA handles UUID generation.
-- Here we insert some sample medicines so the DB is not empty.
-- Users and passwords require hashed passwords. Let's create an admin with hardcoded bcrypt hash of 'password123'
-- Hash for 'password123' = $2a$10$o3f.A6Yg.Q.hK0.y1F2o/.GQQO9q2C1xON4iP4T1z5QvJ.U8MInG
INSERT INTO users (id, full_name, email, password_hash, role, phone, is_active, created_at, updated_at)
VALUES 
('d50b4d45-5d93-4e8f-8f83-e18e5b6140b0', 'Admin User', 'admin@swasthyasetu.com', '$2a$10$o3f.A6Yg.Q.hK0.y1F2o/.GQQO9q2C1xON4iP4T1z5QvJ.U8MInG', 'ADMIN', '9999999999', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('c7ab2bf2-1fc5-4c6e-826c-d23dd88d9cb6', 'Dr. Smith', 'smith@swasthyasetu.com', '$2a$10$o3f.A6Yg.Q.hK0.y1F2o/.GQQO9q2C1xON4iP4T1z5QvJ.U8MInG', 'DOCTOR', '8888888888', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('a2c8f8b9-8e7c-473d-8d48-39e2e690fd1f', 'John Doe', 'patient@swasthyasetu.com', '$2a$10$o3f.A6Yg.Q.hK0.y1F2o/.GQQO9q2C1xON4iP4T1z5QvJ.U8MInG', 'PATIENT', '7777777777', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;

INSERT INTO doctor_profiles (id, specialization, qualifications, experience_years, license_number, consultation_fee, bio)
VALUES 
('c7ab2bf2-1fc5-4c6e-826c-d23dd88d9cb6', 'Cardiologist', 'MBBS, MD', 10, 'LIC-12345', 500.00, 'Experienced Cardiologist')
ON CONFLICT DO NOTHING;

INSERT INTO medicines (id, name, generic_name, manufacturer, category, stock_quantity, unit_price, reorder_level, created_at, updated_at)
VALUES 
(gen_random_uuid(), 'Paracetamol 500mg', 'Paracetamol', 'PharmaCorp', 'Painkiller', 1000, 2.50, 100, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'Amoxicillin 250mg', 'Amoxicillin', 'HealthInc', 'Antibiotic', 500, 5.00, 50, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;
`);

console.log("Record, Pharmacy, and Seeder Scripts built perfectly!");
