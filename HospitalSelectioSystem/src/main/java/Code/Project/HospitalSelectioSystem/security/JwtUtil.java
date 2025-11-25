package Code.Project.HospitalSelectioSystem.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import java.security.Key;

@Component
public class JwtUtil {
    private final Key key = Keys.hmacShaKeyFor("super-secret-key-change-me-super-secret-key".getBytes());

    public String generateToken(String username, String role){
        return Jwts.builder()
                .setSubject(username)
                .claim("role", role)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public String getUsername(String token){
        return Jwts.parserBuilder().setSigningKey(key).build()
                .parseClaimsJws(token).getBody().getSubject();
    }

    public String getRole(String token){
        Object r = Jwts.parserBuilder().setSigningKey(key).build()
                .parseClaimsJws(token).getBody().get("role");
        return r == null ? null : r.toString();
    }

    public boolean validate(String token){
        try { Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token); return true; }
        catch (JwtException ex){ return false; }
    }
}
