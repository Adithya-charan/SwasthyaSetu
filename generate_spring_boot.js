const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, 'swasthyasetu-backend');

function makeDir(dirPath) {
    fs.mkdirSync(dirPath, { recursive: true });
}

function writeFile(filePath, content) {
    fs.writeFileSync(filePath, content.trim() + '\n', 'utf8');
}

// 1. Create Directories
const basePackage = path.join(baseDir, 'src', 'main', 'java', 'com', 'swasthyasetu');
['config', 'auth', 'user', 'appointment', 'prescription', 'record', 'pharmacy', 'common', 'calling'].forEach(pkg => {
    makeDir(path.join(basePackage, pkg));
});
makeDir(path.join(baseDir, 'src', 'main', 'resources'));

// 2. POM.XML
writeFile(path.join(baseDir, 'pom.xml'), `
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.4</version>
        <relativePath/> <!-- lookup parent from repository -->
    </parent>
    <groupId>com.swasthyasetu</groupId>
    <artifactId>swasthyasetu-backend</artifactId>
    <version>0.0.1-SNAPSHOT</version>
    <name>swasthyasetu-backend</name>
    <description>Virtual healthcare platform backend</description>
    <properties>
        <java.version>17</java.version>
    </properties>
    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-security</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-websocket</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-redis</artifactId>
        </dependency>
        <dependency>
            <groupId>org.postgresql</groupId>
            <artifactId>postgresql</artifactId>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-api</artifactId>
            <version>0.12.5</version>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-impl</artifactId>
            <version>0.12.5</version>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-jackson</artifactId>
            <version>0.12.5</version>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>org.springdoc</groupId>
            <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
            <version>2.5.0</version>
        </dependency>
        <dependency>
            <groupId>com.itextpdf</groupId>
            <artifactId>itext7-core</artifactId>
            <version>8.0.3</version>
            <type>pom</type>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>
    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>
`);

// 3. APPLICATION.YML
writeFile(path.join(baseDir, 'src', 'main', 'resources', 'application.yml'), `
server:
  port: 8080

spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/swasthyasetu
    username: postgres
    password: password
  jpa:
    hibernate:
      ddl-auto: create-drop
    show-sql: true
    properties:
      hibernate:
        format_sql: true
        dialect: org.hibernate.dialect.PostgreSQLDialect
  data:
    redis:
      host: localhost
      port: 6379

app:
  jwt:
    secret: 9A72F67448CD9B1238914B924A22F263300C32345B73F2837341829D0A13FB9C
    access-expiry-ms: 900000       # 15 minutes
    refresh-expiry-ms: 604800000   # 7 days
  storage:
    upload-dir: ./uploads
`);

// 4. MAIN APP
writeFile(path.join(basePackage, 'SwasthyaSetuApplication.java'), `
package com.swasthyasetu;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableJpaAuditing
@EnableCaching
public class SwasthyaSetuApplication {
    public static void main(String[] args) {
        SpringApplication.run(SwasthyaSetuApplication.class, args);
    }
}
`);

// 5. COMMON
writeFile(path.join(basePackage, 'common', 'ApiResponse.java'), `
package com.swasthyasetu.common;

import java.time.LocalDateTime;

public record ApiResponse<T>(
    boolean success,
    String message,
    T data,
    LocalDateTime timestamp
) {
    public ApiResponse(boolean success, String message, T data) {
        this(success, message, data, LocalDateTime.now());
    }
}
`);

writeFile(path.join(basePackage, 'common', 'PageResponse.java'), `
package com.swasthyasetu.common;

import java.util.List;

public record PageResponse<T>(
    List<T> content,
    long totalElements,
    int totalPages,
    int currentPage
) {}
`);

writeFile(path.join(basePackage, 'common', 'BaseEntity.java'), `
package com.swasthyasetu.common;

import jakarta.persistence.Column;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.MappedSuperclass;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
public abstract class BaseEntity {

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
`);

console.log("Spring Boot skeleton created successfully.");
