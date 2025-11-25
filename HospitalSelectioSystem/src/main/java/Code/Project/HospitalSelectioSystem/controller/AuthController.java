package Code.Project.HospitalSelectioSystem.controller;

import Code.Project.HospitalSelectioSystem.model.User;
import Code.Project.HospitalSelectioSystem.repository.UserRepository;
import Code.Project.HospitalSelectioSystem.security.JwtUtil;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*")
public class AuthController {
    private final UserRepository users;
    private final BCryptPasswordEncoder encoder;
    private final JwtUtil jwt;

    public AuthController(UserRepository users, BCryptPasswordEncoder encoder, JwtUtil jwt) {
        this.users = users; this.encoder = encoder; this.jwt = jwt;
    }

    @PostMapping("/register")
    public User register(@RequestBody User u){
        if (users.existsByUsername(u.getUsername())) throw new RuntimeException("Username taken");
        u.setPassword(encoder.encode(u.getPassword()));
        if (u.getRole() == null) u.setRole("PEOPLE"); // default
        return users.save(u);

    }

    record LoginReq(String username, String password){}
    record LoginRes(String token, String role){}

    @PostMapping("/login")
    public LoginRes login(@RequestBody LoginReq req){
        User u = users.findByUsername(req.username())
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));
        if (!encoder.matches(req.password(), u.getPassword()))
            throw new RuntimeException("Invalid credentials");

        String token = jwt.generateToken(u.getUsername(), u.getRole());
        return new LoginRes(token, u.getRole());
    }
}
