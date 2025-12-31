package org.zyq.transaction.user.service.Impl;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.zyq.transaction.common.exception.ApiException;
import org.zyq.transaction.user.repository.UserRepository;
import org.zyq.transaction.user.entity.User;
import org.zyq.transaction.user.service.AuthService;

@Service
public class AuthServiceImpl implements AuthService {

    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepo;

    public AuthServiceImpl(PasswordEncoder passwordEncoder, UserRepository userRepo) {
        this.passwordEncoder = passwordEncoder;
        this.userRepo = userRepo;
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
    public Long login(String username, String password) {
        User user = userRepo.findByUsername(username).orElseThrow(() -> new RuntimeException("User not found"));
        if (passwordEncoder.matches(password, user.getPassword())){
            return user.getId();
        }else {
            return null;
        }
    }
}
