package com.aptr.workshop_backend.config.jwt;

import com.aptr.workshop_backend.enums.Role;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.concurrent.TimeUnit;
import java.util.function.Function;

@Component
public class JwtUtil {

    private static final String SECRET_KEY = "1aeb4a22eae4b6fc39e1298fc659b31ddf47825108c1c28db1b7438b33cc75d4d72f33d01fbb355c99603111fc09476550233e4c901028d2c3b04b150309c3a3e5549aaec219650e5b464b810330f3b56accd6e0cbe455f719fedd6278f09b8e95d3d4601032db907559fc83b5da1345e27a0a22548d72b032c171df47aaa1db4db8682bd2099527f236f71fbffcdc64f03e23071f6b97e7cc22284a81807b5733dec02ea1e881ca4827cbc51f5f76bb736e472c1befc9901d1eced96ae7f1ac8c78fccf39ae5f52c1621b5b1cd4dac53eb12a7066f5638c8dfb4915147c4d361ea11d1476d56bdf921174cd288fc994601df5689960c5ef666abed0e60c399a";

    private static final long ACCESS_TOKEN_EXPIRATION = TimeUnit.DAYS.toMillis(30);

    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(SECRET_KEY.getBytes());
    }

    public String generateAccessToken(String username, Role role) {
        return Jwts.builder()
                .setSubject(username)
                .claim("role", role.name())
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + ACCESS_TOKEN_EXPIRATION))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public String extractRole(String token) {
        return extractAllClaims(token).get("role", String.class);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    public boolean validateToken(String token, String username) {
        return username.equals(extractUsername(token)) && !isTokenExpired(token);
    }
}
