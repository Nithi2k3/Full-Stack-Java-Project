package Code.Project.HospitalSelectioSystem.controller;

import Code.Project.HospitalSelectioSystem.model.Staff;
import Code.Project.HospitalSelectioSystem.repository.StaffRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/staff")
public class StaffController {

    private final StaffRepository staffRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public StaffController(StaffRepository staffRepository, BCryptPasswordEncoder passwordEncoder) {
        this.staffRepository = staffRepository;
        this.passwordEncoder = passwordEncoder;
    }
    
    @PostMapping("/register")
    public Staff registerStaff(@RequestBody Staff staff) {
        staff.setPassword(passwordEncoder.encode(staff.getPassword()));
        return staffRepository.save(staff);
    }
}