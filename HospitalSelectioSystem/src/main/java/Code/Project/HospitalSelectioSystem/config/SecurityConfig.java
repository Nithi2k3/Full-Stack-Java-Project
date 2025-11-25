package Code.Project.HospitalSelectioSystem.config;

import Code.Project.HospitalSelectioSystem.security.JwtAuthFilter;
import Code.Project.HospitalSelectioSystem.service.AppUserDetailsService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.AnonymousAuthenticationFilter;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    private final AppUserDetailsService uds;
    private final JwtAuthFilter jwtFilter;

    public SecurityConfig(AppUserDetailsService uds, JwtAuthFilter jwtFilter) {
        this.uds = uds; this.jwtFilter = jwtFilter;
    }

    @Bean public BCryptPasswordEncoder passwordEncoder(){ return new BCryptPasswordEncoder(); }

    @Bean public DaoAuthenticationProvider authenticationProvider(){
        var p = new DaoAuthenticationProvider();
        p.setUserDetailsService(uds);
        p.setPasswordEncoder(passwordEncoder());
        return p;
    }

    @Bean public AuthenticationManager authenticationManager(AuthenticationConfiguration cfg) throws Exception {
        return cfg.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filter(HttpSecurity http) throws Exception {
        http.csrf(csrf -> csrf.disable())
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // public
                        .requestMatchers("/auth/**", "/feedback/**", "/hospitals", "/hospitals/**").permitAll()
                        // admin-only APIs (create/delete)
                        .requestMatchers("/admin/**").hasRole("ADMIN")
                        // staff APIs
                        .requestMatchers("/staff/**").hasRole("STAFF")
                        // anything else must be authenticated
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtFilter, AnonymousAuthenticationFilter.class)
                .httpBasic(httpBasic -> {});
        return http.build();
    }
}
