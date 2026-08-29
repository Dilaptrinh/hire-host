package rentalhost.vn.web_rental.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import rentalhost.vn.web_rental.enums.UserRole;
import rentalhost.vn.web_rental.exception.UnauthorizedException;

@Component
public class SecurityUtil {

    public static UserPrincipal getCurrentUserPrincipal() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || !(auth.getPrincipal() instanceof UserPrincipal)) {
            throw new UnauthorizedException("Not authenticated");
        }
        return (UserPrincipal) auth.getPrincipal();
    }

    public static Long getCurrentUserId() {
        return getCurrentUserPrincipal().getUser().getId();
    }

    public static boolean hasRole(UserRole role) {
        return getCurrentUserPrincipal().getUser().getRole() == role;
    }

    public static boolean isAdmin() {
        UserRole r = getCurrentUserPrincipal().getUser().getRole();
        return r == UserRole.ADMIN || r == UserRole.SUPER_ADMIN;
    }
}
