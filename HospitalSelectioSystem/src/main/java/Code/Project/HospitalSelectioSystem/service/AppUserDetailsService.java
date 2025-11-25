package Code.Project.HospitalSelectioSystem.service;

import Code.Project.HospitalSelectioSystem.model.User;
import Code.Project.HospitalSelectioSystem.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

@Service
public class AppUserDetailsService implements UserDetailsService{
    @Autowired
    private UserRepository users;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User u = users.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        return org.springframework.security.core.userdetails.User
                .withUsername(u.getUsername())
                .password(u.getPassword())
                .roles(u.getRole()) // "ADMIN" | "STAFF" | "PEOPLE"
                .build();
    }
}
