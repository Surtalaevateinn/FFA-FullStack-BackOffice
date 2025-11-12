// src/main/java/com/ffa/domain/Admin.java
package com.ffa.domain;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "admin")  // 如果你的表叫 admins 改成 admins
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Admin {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 120)
    private String username;

    @Column(nullable = false, length = 200)
    private String password;

    @Column(nullable = false)
    private Boolean enabled = true;
}
