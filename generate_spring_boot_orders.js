const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, 'swasthyasetu-backend');
const basePackage = path.join(baseDir, 'src', 'main', 'java', 'com', 'swasthyasetu');

function writeFile(filePath, content) {
    fs.writeFileSync(filePath, content.trim() + '\n', 'utf8');
}

// ================= PHARMACY ORDER MODULE =================
writeFile(path.join(basePackage, 'pharmacy', 'entity', 'OrderStatus.java'), `
package com.swasthyasetu.pharmacy.entity;
public enum OrderStatus { PENDING, PROCESSING, READY, DISPENSED }
`);

writeFile(path.join(basePackage, 'pharmacy', 'entity', 'MedicineOrder.java'), `
package com.swasthyasetu.pharmacy.entity;

import com.swasthyasetu.common.BaseEntity;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "medicine_orders")
public class MedicineOrder extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private UUID prescriptionId;
    private UUID patientId;
    private UUID pharmacistId;

    @Enumerated(EnumType.STRING)
    private OrderStatus status = OrderStatus.PENDING;

    private BigDecimal totalAmount;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "order_id")
    private List<OrderItem> items;

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getPrescriptionId() { return prescriptionId; }
    public void setPrescriptionId(UUID prescriptionId) { this.prescriptionId = prescriptionId; }
    public UUID getPatientId() { return patientId; }
    public void setPatientId(UUID patientId) { this.patientId = patientId; }
    public UUID getPharmacistId() { return pharmacistId; }
    public void setPharmacistId(UUID pharmacistId) { this.pharmacistId = pharmacistId; }
    public OrderStatus getStatus() { return status; }
    public void setStatus(OrderStatus status) { this.status = status; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
    public List<OrderItem> getItems() { return items; }
    public void setItems(List<OrderItem> items) { this.items = items; }
}
`);

writeFile(path.join(basePackage, 'pharmacy', 'entity', 'OrderItem.java'), `
package com.swasthyasetu.pharmacy.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "order_items")
public class OrderItem {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private UUID medicineId;
    private String medicineName;
    private int quantityRequested;
    private BigDecimal unitPrice;

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getMedicineId() { return medicineId; }
    public void setMedicineId(UUID medicineId) { this.medicineId = medicineId; }
    public String getMedicineName() { return medicineName; }
    public void setMedicineName(String medicineName) { this.medicineName = medicineName; }
    public int getQuantityRequested() { return quantityRequested; }
    public void setQuantityRequested(int quantityRequested) { this.quantityRequested = quantityRequested; }
    public BigDecimal getUnitPrice() { return unitPrice; }
    public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }
}
`);

writeFile(path.join(basePackage, 'pharmacy', 'MedicineOrderRepository.java'), `
package com.swasthyasetu.pharmacy;

import com.swasthyasetu.pharmacy.entity.MedicineOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface MedicineOrderRepository extends JpaRepository<MedicineOrder, UUID> {
    Optional<MedicineOrder> findByPrescriptionId(UUID prescriptionId);
}
`);

writeFile(path.join(basePackage, 'pharmacy', 'OrderController.java'), `
package com.swasthyasetu.pharmacy;

import com.swasthyasetu.common.ApiResponse;
import com.swasthyasetu.common.ResourceNotFoundException;
import com.swasthyasetu.pharmacy.entity.MedicineOrder;
import com.swasthyasetu.pharmacy.entity.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/pharmacy/orders")
@PreAuthorize("hasRole('PHARMACIST')")
public class OrderController {
    
    private final MedicineOrderRepository orderRepository;

    public OrderController(MedicineOrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    private UUID getUserId() {
        return UUID.fromString((String) SecurityContextHolder.getContext().getAuthentication().getPrincipal());
    }

    @PostMapping
    public ApiResponse<MedicineOrder> createOrder(@RequestBody MedicineOrder order) {
        order.setPharmacistId(getUserId());
        return new ApiResponse<>(true, "Order created", orderRepository.save(order));
    }

    @GetMapping
    public ApiResponse<Page<MedicineOrder>> getOrders(Pageable pageable) {
        return new ApiResponse<>(true, "Orders fetching", orderRepository.findAll(pageable));
    }

    @PutMapping("/{id}/status")
    public ApiResponse<MedicineOrder> updateStatus(@PathVariable UUID id, @RequestParam String status) {
        MedicineOrder order = orderRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Not found"));
        OrderStatus newStatus = OrderStatus.valueOf(status);
        if (order.getStatus() == OrderStatus.PENDING && newStatus == OrderStatus.PROCESSING) order.setStatus(newStatus);
        else if (order.getStatus() == OrderStatus.PROCESSING && newStatus == OrderStatus.READY) order.setStatus(newStatus);
        else if (order.getStatus() == OrderStatus.READY && newStatus == OrderStatus.DISPENSED) order.setStatus(newStatus);
        else throw new IllegalStateException("Illegal status transition from " + order.getStatus() + " to " + newStatus);
        
        return new ApiResponse<>(true, "Status updated", orderRepository.save(order));
    }

    @GetMapping("/prescription/{prescriptionId}")
    public ApiResponse<MedicineOrder> getOrderByPrescription(@PathVariable UUID prescriptionId) {
        MedicineOrder order = orderRepository.findByPrescriptionId(prescriptionId).orElse(null);
        return new ApiResponse<>(true, "Check completed", order);
    }
}
`);
console.log("MedicineOrder logic added.");
