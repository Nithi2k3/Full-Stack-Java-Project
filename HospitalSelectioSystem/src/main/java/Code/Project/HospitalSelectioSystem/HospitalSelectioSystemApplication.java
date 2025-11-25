package Code.Project.HospitalSelectioSystem;

import Code.Project.HospitalSelectioSystem.model.User;
import Code.Project.HospitalSelectioSystem.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@SpringBootApplication
public class HospitalSelectioSystemApplication {

	public static void main(String[] args) {
		SpringApplication.run(HospitalSelectioSystemApplication.class, args);
	}

	@Bean
	CommandLineRunner seed(UserRepository users, BCryptPasswordEncoder enc){
		return args -> {
			if (!users.existsByUsername("admin")) {
				var u = new User();
				u.setUsername("admin");
				u.setPassword(enc.encode("Admin@123"));
				u.setRole("ADMIN");
				users.save(u);
			}
		};
	}
}