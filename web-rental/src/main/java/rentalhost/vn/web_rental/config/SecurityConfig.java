package rentalhost.vn.web_rental.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import rentalhost.vn.web_rental.security.JwtAuthenticationEntryPoint;
import rentalhost.vn.web_rental.security.JwtAuthenticationFilter;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtFilter;
    private final JwtAuthenticationEntryPoint jwtEntryPoint;
    private final OAuth2SuccessHandler oAuth2SuccessHandler;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(AbstractHttpConfigurer::disable)
            .exceptionHandling(e -> e.authenticationEntryPoint(jwtEntryPoint))
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Swagger UI
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**", "/swagger-ui.html").permitAll()

                // OAuth2
                .requestMatchers("/oauth2/**", "/login/oauth2/code/*").permitAll()

                // Public
                .requestMatchers("/api/v1/auth/register", "/api/v1/auth/login", "/api/v1/auth/refresh").permitAll()
                .requestMatchers("/api/v1/contact").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/announcements").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/servers/**", "/api/v1/categories/**").permitAll()

                // MoMo IPN (public)
                .requestMatchers("/api/v1/payments/momo/**").permitAll()

                // User
                .requestMatchers("/api/v1/auth/logout", "/api/v1/users/**").authenticated()
                .requestMatchers("/api/v1/orders/**", "/api/v1/payments/**").authenticated()

                // Static site hosting
                .requestMatchers("/api/v1/sites/**").authenticated()

                // Admin sites
                .requestMatchers("/api/v1/admin/sites/**").hasAnyRole("ADMIN", "SUPER_ADMIN")
                .requestMatchers("/api/v1/admin/announcements/**").hasAnyRole("ADMIN", "SUPER_ADMIN")

                // Admin
                .requestMatchers("/api/v1/admin/servers/**", "/api/v1/admin/categories/**").hasAnyRole("ADMIN", "SUPER_ADMIN")
                .requestMatchers("/api/v1/admin/orders/**", "/api/v1/admin/payments/**").hasAnyRole("ADMIN", "SUPER_ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/v1/admin/users/**").hasAnyRole("ADMIN", "SUPER_ADMIN")

                // Super Admin
                .requestMatchers(HttpMethod.PUT, "/api/v1/admin/users/*/role").hasRole("SUPER_ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/v1/admin/users/*/status").hasRole("SUPER_ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/v1/admin/users/*").hasRole("SUPER_ADMIN")

                .anyRequest().authenticated()
            )
            .oauth2Login(oauth2 -> oauth2
                .successHandler(oAuth2SuccessHandler)
            )
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOriginPatterns(List.of("*"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
