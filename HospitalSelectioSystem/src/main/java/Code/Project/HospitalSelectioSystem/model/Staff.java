package Code.Project.HospitalSelectioSystem.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Staff {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String username;
    private String password; // hashed password

    @ManyToOne
    @JoinColumn(name = "hospitalId")
    private Hospital hospital;
}
