package org.zyq.transaction.user.service;

import org.zyq.transaction.user.dto.ServiceArgDTO;
import org.zyq.transaction.user.vo.UserVO;

public interface AuthService {
    public boolean register(String username, String password);
    public Long login(String username, String password);
}
