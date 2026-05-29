package org.zyq.transaction.user.service.Impl;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.zyq.transaction.common.exception.ApiException;
import org.zyq.transaction.user.repository.UserRepository;
import org.zyq.transaction.user.entity.User;
import org.zyq.transaction.user.service.AuthService;
import org.zyq.transaction.user.service.IpGeoService;

@Service
public class AuthServiceImpl implements AuthService {

    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepo;
    private final IpGeoService ipGeoService;

    public AuthServiceImpl(PasswordEncoder passwordEncoder, UserRepository userRepo, IpGeoService ipGeoService) {
        this.passwordEncoder = passwordEncoder;
        this.userRepo = userRepo;
        this.ipGeoService = ipGeoService;
    }

    @Override
    public boolean register(String username, String password) {
        boolean exists = userRepo.existsByUsername(username);
        if (!exists){
            User newUser = new User();
            newUser.setUsername(username);
            String hashedPassword = passwordEncoder.encode(password);
            newUser.setPassword(hashedPassword);
            userRepo.save(newUser);
            return true;
        }else  {
            throw new ApiException(HttpStatus.BAD_REQUEST.value(), "Error", "Username already exists");
        }

    }

    @Override
    public Long login(String username, String password, String ip) {
        User user = userRepo.findByUsername(username).orElseThrow(() -> new RuntimeException("User not found"));
        if (user.getDeleted() == 1) {
            throw new ApiException(HttpStatus.FORBIDDEN.value(), "账号已被禁用", null);
        }
        if (passwordEncoder.matches(password, user.getPassword())){
            // 记录登录 IP + 归属地
            user.setLastLoginIp(ip);
            String location = ipGeoService.lookup(ip);
            if (location != null && !location.isEmpty() && !"未知".equals(location)) {
                // 格式：广东省/深圳市
                int slash = location.indexOf('/');
                if (slash > 0) {
                    user.setLastLoginProvince(location.substring(0, slash));
                    user.setLastLoginCity(location.substring(slash + 1));
                } else {
                    user.setLastLoginProvince(location);
                    user.setLastLoginCity(null);
                }
            }
            userRepo.save(user);
            return user.getId();
        }else {
            return null;
        }
    }
}
