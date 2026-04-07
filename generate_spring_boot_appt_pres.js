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

// ================= APPOINTMENT MODULE =================
writeFile(path.join(basePackage, 'appointment', 'entity', 'AppointmentStatus.java'), `
package com.swasthyasetu.appointment.entity;

public enum AppointmentStatus {
    PENDING, CONFIRMED, CANCELLED, COMPLETED
}
`);

writeFile(path.join(basePackage, 'appointment', 'entity', 'Appointment.java'), `
package com.swasthyasetu.appointment.entity;

import com.swasthyasetu.common.BaseEntity;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "appointments")
public class Appointment extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private UUID patientId;

    @Column(nullable = false)
    private UUID doctorId;

    @Column(nullable = false)
    private LocalDateTime scheduledAt;

    private int durationMinutes = 30;

    @Enumerated(EnumType.STRING)
    private AppointmentStatus status = AppointmentStatus.PENDING;

    private String reason;
    private String cancellationReason;
    private String meetingLink;

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getPatientId() { return patientId; }
    public void setPatientId(UUID patientId) { this.patientId = patientId; }
    public UUID getDoctorId() { return doctorId; }
    public void setDoctorId(UUID doctorId) { this.doctorId = doctorId; }
    public LocalDateTime getScheduledAt() { return scheduledAt; }
    public void setScheduledAt(LocalDateTime scheduledAt) { this.scheduledAt = scheduledAt; }
    public int getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(int durationMinutes) { this.durationMinutes = durationMinutes; }
    public AppointmentStatus getStatus() { return status; }
    public void setStatus(AppointmentStatus status) { this.status = status; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
    public String getCancellationReason() { return cancellationReason; }
    public void setCancellationReason(String cancellationReason) { this.cancellationReason = cancellationReason; }
    public String getMeetingLink() { return meetingLink; }
    public void setMeetingLink(String meetingLink) { this.meetingLink = meetingLink; }
}
`);

writeFile(path.join(basePackage, 'appointment', 'dto', 'AppointmentDto.java'), `
package com.swasthyasetu.appointment.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record AppointmentDto(
    UUID id,
    UUID patientId,
    UUID doctorId,
    LocalDateTime scheduledAt,
    int durationMinutes,
    String status,
    String reason,
    String meetingLink,
    LocalDateTime createdAt
) {}
`);

writeFile(path.join(basePackage, 'appointment', 'dto', 'BookAppointmentRequest.java'), `
package com.swasthyasetu.appointment.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;
import java.util.UUID;

public record BookAppointmentRequest(
    @NotNull UUID doctorId,
    @NotNull @Future LocalDateTime scheduledAt,
    String reason
) {}
`);

writeFile(path.join(basePackage, 'appointment', 'AppointmentRepository.java'), `
package com.swasthyasetu.appointment;

import com.swasthyasetu.appointment.entity.Appointment;
import com.swasthyasetu.appointment.entity.AppointmentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface AppointmentRepository extends JpaRepository<Appointment, UUID> {
    Page<Appointment> findByPatientId(UUID patientId, Pageable pageable);
    Page<Appointment> findByDoctorId(UUID doctorId, Pageable pageable);

    @Query("SELECT COUNT(a) FROM Appointment a WHERE a.doctorId = :doctorId " +
           "AND a.status IN ('PENDING', 'CONFIRMED') " +
           "AND a.scheduledAt >= :startTime AND a.scheduledAt < :endTime")
    long countOverlappingAppointments(@Param("doctorId") UUID doctorId,
                                      @Param("startTime") LocalDateTime startTime,
                                      @Param("endTime") LocalDateTime endTime);
}
`);

writeFile(path.join(basePackage, 'appointment', 'AppointmentService.java'), `
package com.swasthyasetu.appointment;

import com.swasthyasetu.appointment.dto.BookAppointmentRequest;
import com.swasthyasetu.appointment.entity.Appointment;
import com.swasthyasetu.appointment.entity.AppointmentStatus;
import com.swasthyasetu.common.ResourceConflictException;
import com.swasthyasetu.common.ResourceNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class AppointmentService {
    private final AppointmentRepository appointmentRepository;

    public AppointmentService(AppointmentRepository appointmentRepository) {
        this.appointmentRepository = appointmentRepository;
    }

    @Transactional
    public Appointment bookAppointment(UUID patientId, BookAppointmentRequest req) {
        LocalDateTime endTime = req.scheduledAt().plusMinutes(30);
        long count = appointmentRepository.countOverlappingAppointments(req.doctorId(), req.scheduledAt(), endTime);
        if (count > 0) {
            throw new ResourceConflictException("Doctor already has an appointment in this time slot.");
        }
        Appointment appt = new Appointment();
        appt.setPatientId(patientId);
        appt.setDoctorId(req.doctorId());
        appt.setScheduledAt(req.scheduledAt());
        appt.setReason(req.reason());
        return appointmentRepository.save(appt);
    }

    public Page<Appointment> getPatientAppointments(UUID patientId, Pageable pageable) {
        return appointmentRepository.findByPatientId(patientId, pageable);
    }

    public Page<Appointment> getDoctorAppointments(UUID doctorId, Pageable pageable) {
        return appointmentRepository.findByDoctorId(doctorId, pageable);
    }

    public Appointment getAppointment(UUID id) {
        return appointmentRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));
    }

    @Transactional
    public void confirmAppointment(UUID id, String meetingLink) {
        Appointment appt = getAppointment(id);
        appt.setStatus(AppointmentStatus.CONFIRMED);
        if (meetingLink != null) appt.setMeetingLink(meetingLink);
        appointmentRepository.save(appt);
    }

    @Transactional
    public void cancelAppointment(UUID id, String reason) {
        Appointment appt = getAppointment(id);
        appt.setStatus(AppointmentStatus.CANCELLED);
        appt.setCancellationReason(reason);
        appointmentRepository.save(appt);
    }

    @Transactional
    public void completeAppointment(UUID id) {
        Appointment appt = getAppointment(id);
        appt.setStatus(AppointmentStatus.COMPLETED);
        appointmentRepository.save(appt);
    }
}
`);

writeFile(path.join(basePackage, 'appointment', 'AppointmentController.java'), `
package com.swasthyasetu.appointment;

import com.swasthyasetu.appointment.dto.AppointmentDto;
import com.swasthyasetu.appointment.dto.BookAppointmentRequest;
import com.swasthyasetu.appointment.entity.Appointment;
import com.swasthyasetu.common.ApiResponse;
import com.swasthyasetu.common.PageResponse;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class AppointmentController {
    private final AppointmentService appointmentService;

    public AppointmentController(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

    private UUID getUserId() {
        return UUID.fromString((String) SecurityContextHolder.getContext().getAuthentication().getPrincipal());
    }

    private boolean isRole(String role) {
        return SecurityContextHolder.getContext().getAuthentication().getAuthorities().stream()
            .anyMatch(a -> a.getAuthority().equals("ROLE_" + role));
    }

    private AppointmentDto mapDto(Appointment appt) {
        return new AppointmentDto(appt.getId(), appt.getPatientId(), appt.getDoctorId(),
            appt.getScheduledAt(), appt.getDurationMinutes(), appt.getStatus().name(),
            appt.getReason(), appt.getMeetingLink(), appt.getCreatedAt());
    }

    @PreAuthorize("hasRole('PATIENT')")
    @PostMapping("/appointments")
    public ApiResponse<AppointmentDto> bookAppointment(@Valid @RequestBody BookAppointmentRequest req) {
        Appointment appt = appointmentService.bookAppointment(getUserId(), req);
        return new ApiResponse<>(true, "Appointment booked", mapDto(appt));
    }

    @GetMapping("/appointments/my")
    public ApiResponse<PageResponse<AppointmentDto>> getMyAppointments(Pageable pageable) {
        Page<Appointment> page;
        if (isRole("PATIENT")) {
            page = appointmentService.getPatientAppointments(getUserId(), pageable);
        } else if (isRole("DOCTOR")) {
            page = appointmentService.getDoctorAppointments(getUserId(), pageable);
        } else {
            throw new RuntimeException("Invalid role for this endpoint");
        }
        PageResponse<AppointmentDto> pr = new PageResponse<>(
            page.getContent().stream().map(this::mapDto).collect(Collectors.toList()),
            page.getTotalElements(), page.getTotalPages(), page.getNumber()
        );
        return new ApiResponse<>(true, "Appointments fetched", pr);
    }

    @GetMapping("/appointments/{id}")
    public ApiResponse<AppointmentDto> getAppointment(@PathVariable UUID id) {
        Appointment appt = appointmentService.getAppointment(id);
        return new ApiResponse<>(true, "Appointment fetched", mapDto(appt));
    }

    @PreAuthorize("hasRole('DOCTOR')")
    @PutMapping("/appointments/{id}/confirm")
    public ApiResponse<Void> confirmAppointment(@PathVariable UUID id, @RequestParam(required=false) String meetingLink) {
        appointmentService.confirmAppointment(id, meetingLink);
        return new ApiResponse<>(true, "Appointment confirmed", null);
    }

    @PutMapping("/appointments/{id}/cancel")
    public ApiResponse<Void> cancelAppointment(@PathVariable UUID id, @RequestParam String reason) {
        appointmentService.cancelAppointment(id, reason);
        return new ApiResponse<>(true, "Appointment cancelled", null);
    }

    @PreAuthorize("hasRole('DOCTOR')")
    @PutMapping("/appointments/{id}/complete")
    public ApiResponse<Void> completeAppointment(@PathVariable UUID id) {
        appointmentService.completeAppointment(id);
        return new ApiResponse<>(true, "Appointment completed", null);
    }
}
`);


// ================= PRESCRIPTION MODULE =================
writeFile(path.join(basePackage, 'prescription', 'entity', 'MedicineItem.java'), `
package com.swasthyasetu.prescription.entity;

import jakarta.persistence.Embeddable;

@Embeddable
public class MedicineItem {
    private String name;
    private String dosage;
    private String frequency;
    private int durationDays;
    private String instructions;

    // Getters and Setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDosage() { return dosage; }
    public void setDosage(String dosage) { this.dosage = dosage; }
    public String getFrequency() { return frequency; }
    public void setFrequency(String frequency) { this.frequency = frequency; }
    public int getDurationDays() { return durationDays; }
    public void setDurationDays(int durationDays) { this.durationDays = durationDays; }
    public String getInstructions() { return instructions; }
    public void setInstructions(String instructions) { this.instructions = instructions; }
}
`);

writeFile(path.join(basePackage, 'prescription', 'entity', 'Prescription.java'), `
package com.swasthyasetu.prescription.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "prescriptions")
public class Prescription {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private UUID appointmentId;

    @Column(nullable = false)
    private UUID doctorId;

    @Column(nullable = false)
    private UUID patientId;

    @Column(columnDefinition = "TEXT")
    private String diagnosis;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "prescription_medicines", joinColumns = @JoinColumn(name = "prescription_id"))
    private List<MedicineItem> medicines;

    private LocalDateTime issuedAt = LocalDateTime.now();

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getAppointmentId() { return appointmentId; }
    public void setAppointmentId(UUID appointmentId) { this.appointmentId = appointmentId; }
    public UUID getDoctorId() { return doctorId; }
    public void setDoctorId(UUID doctorId) { this.doctorId = doctorId; }
    public UUID getPatientId() { return patientId; }
    public void setPatientId(UUID patientId) { this.patientId = patientId; }
    public String getDiagnosis() { return diagnosis; }
    public void setDiagnosis(String diagnosis) { this.diagnosis = diagnosis; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public List<MedicineItem> getMedicines() { return medicines; }
    public void setMedicines(List<MedicineItem> medicines) { this.medicines = medicines; }
    public LocalDateTime getIssuedAt() { return issuedAt; }
    public void setIssuedAt(LocalDateTime issuedAt) { this.issuedAt = issuedAt; }
}
`);

writeFile(path.join(basePackage, 'prescription', 'dto', 'IssuePrescriptionRequest.java'), `
package com.swasthyasetu.prescription.dto;

import com.swasthyasetu.prescription.entity.MedicineItem;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import java.util.UUID;

public record IssuePrescriptionRequest(
    @NotNull UUID appointmentId,
    @NotNull UUID patientId,
    String diagnosis,
    String notes,
    List<MedicineItem> medicines
) {}
`);

writeFile(path.join(basePackage, 'prescription', 'PrescriptionRepository.java'), `
package com.swasthyasetu.prescription;

import com.swasthyasetu.prescription.entity.Prescription;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.UUID;

public interface PrescriptionRepository extends JpaRepository<Prescription, UUID> {
    Page<Prescription> findByPatientIdOrderByIssuedAtDesc(UUID patientId, Pageable pageable);
    Page<Prescription> findByDoctorIdOrderByIssuedAtDesc(UUID doctorId, Pageable pageable);
    
    @Query("SELECT p FROM Prescription p WHERE NOT EXISTS (SELECT 1 FROM MedicineOrder mo WHERE mo.prescriptionId = p.id)")
    Page<Prescription> findUndispensedPrescriptions(Pageable pageable);
}
`);

writeFile(path.join(basePackage, 'prescription', 'PrescriptionService.java'), `
package com.swasthyasetu.prescription;

import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import com.swasthyasetu.appointment.AppointmentService;
import com.swasthyasetu.appointment.entity.Appointment;
import com.swasthyasetu.appointment.entity.AppointmentStatus;
import com.swasthyasetu.common.ResourceConflictException;
import com.swasthyasetu.common.ResourceNotFoundException;
import com.swasthyasetu.prescription.dto.IssuePrescriptionRequest;
import com.swasthyasetu.prescription.entity.MedicineItem;
import com.swasthyasetu.prescription.entity.Prescription;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.util.UUID;

@Service
public class PrescriptionService {
    private final PrescriptionRepository prescriptionRepository;
    private final AppointmentService appointmentService;

    public PrescriptionService(PrescriptionRepository prescriptionRepository, AppointmentService appointmentService) {
        this.prescriptionRepository = prescriptionRepository;
        this.appointmentService = appointmentService;
    }

    @Transactional
    public Prescription issuePrescription(UUID doctorId, IssuePrescriptionRequest req) {
        Appointment appt = appointmentService.getAppointment(req.appointmentId());
        if (appt.getStatus() != AppointmentStatus.COMPLETED) {
            throw new ResourceConflictException("Cannot issue prescription for an incomplete appointment");
        }
        Prescription pres = new Prescription();
        pres.setAppointmentId(req.appointmentId());
        pres.setDoctorId(doctorId);
        pres.setPatientId(req.patientId());
        pres.setDiagnosis(req.diagnosis());
        pres.setNotes(req.notes());
        pres.setMedicines(req.medicines());
        return prescriptionRepository.save(pres);
    }

    public Page<Prescription> getPatientPrescriptions(UUID patientId, Pageable pageable) {
        return prescriptionRepository.findByPatientIdOrderByIssuedAtDesc(patientId, pageable);
    }

    public Page<Prescription> getDoctorPrescriptions(UUID doctorId, Pageable pageable) {
        return prescriptionRepository.findByDoctorIdOrderByIssuedAtDesc(doctorId, pageable);
    }

    public Page<Prescription> getUndispensedPrescriptions(Pageable pageable) {
        return prescriptionRepository.findUndispensedPrescriptions(pageable);
    }

    public Prescription getPrescription(UUID id) {
        return prescriptionRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Prescription not found"));
    }

    public byte[] generatePrescriptionPdf(UUID id) {
        Prescription pres = getPrescription(id);
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try {
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdf = new PdfDocument(writer);
            Document document = new Document(pdf);
            
            document.add(new Paragraph("SWASTHYA SETU E-PRESCRIPTION"));
            document.add(new Paragraph("Prescription ID: " + pres.getId()));
            document.add(new Paragraph("Date: " + pres.getIssuedAt().toString()));
            document.add(new Paragraph("Diagnosis: " + pres.getDiagnosis()));
            document.add(new Paragraph("Medicines:"));
            
            for (MedicineItem m : pres.getMedicines()) {
                document.add(new Paragraph(" - " + m.getName() + " | " + m.getDosage() + " | " + m.getFrequency() + " | " + m.getDurationDays() + " days"));
            }
            document.close();
        } catch (Exception e) {
            throw new RuntimeException("Error generating PDF", e);
        }
        return baos.toByteArray();
    }
}
`);

writeFile(path.join(basePackage, 'prescription', 'PrescriptionController.java'), `
package com.swasthyasetu.prescription;

import com.swasthyasetu.common.ApiResponse;
import com.swasthyasetu.common.PageResponse;
import com.swasthyasetu.prescription.dto.IssuePrescriptionRequest;
import com.swasthyasetu.prescription.entity.Prescription;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api")
public class PrescriptionController {

    private final PrescriptionService prescriptionService;

    public PrescriptionController(PrescriptionService prescriptionService) {
        this.prescriptionService = prescriptionService;
    }

    private UUID getUserId() {
        return UUID.fromString((String) SecurityContextHolder.getContext().getAuthentication().getPrincipal());
    }

    @PreAuthorize("hasRole('DOCTOR')")
    @PostMapping("/prescriptions")
    public ApiResponse<Prescription> issuePrescription(@Valid @RequestBody IssuePrescriptionRequest req) {
        Prescription p = prescriptionService.issuePrescription(getUserId(), req);
        return new ApiResponse<>(true, "Prescription issued", p);
    }

    @PreAuthorize("hasRole('PATIENT')")
    @GetMapping("/prescriptions/my")
    public ApiResponse<Page<Prescription>> getMyPrescriptions(Pageable pageable) {
        return new ApiResponse<>(true, "Prescriptions", prescriptionService.getPatientPrescriptions(getUserId(), pageable));
    }

    @PreAuthorize("hasRole('DOCTOR')")
    @GetMapping("/prescriptions/doctor/issued")
    public ApiResponse<Page<Prescription>> getIssued(Pageable pageable) {
        return new ApiResponse<>(true, "Prescriptions", prescriptionService.getDoctorPrescriptions(getUserId(), pageable));
    }

    @GetMapping("/prescriptions/{id}")
    public ApiResponse<Prescription> getPrescription(@PathVariable UUID id) {
        return new ApiResponse<>(true, "Prescription fetched", prescriptionService.getPrescription(id));
    }

    @GetMapping("/prescriptions/{id}/pdf")
    public ResponseEntity<byte[]> getPdf(@PathVariable UUID id) {
        byte[] pdf = prescriptionService.generatePrescriptionPdf(id);
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=prescription-" + id + ".pdf")
            .contentType(MediaType.APPLICATION_PDF)
            .body(pdf);
    }

    @PreAuthorize("hasRole('PHARMACIST')")
    @GetMapping("/pharmacist/prescriptions")
    public ApiResponse<Page<Prescription>> getUndispensed(Pageable pageable) {
         return new ApiResponse<>(true, "Undispensed", prescriptionService.getUndispensedPrescriptions(pageable));
    }
}
`);

console.log("Appointment and Prescription Modules generated.");
