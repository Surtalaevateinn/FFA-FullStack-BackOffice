// src/main/java/com/ffa/domain/Country.java
package com.ffa.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Entity
@Table(name = "countries", uniqueConstraints = {
        @UniqueConstraint(name = "uk_country_name", columnNames = "name")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Country {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable=false, length=120)
    private String name;

    @Column(length=3)
    private String isoCode;
}
