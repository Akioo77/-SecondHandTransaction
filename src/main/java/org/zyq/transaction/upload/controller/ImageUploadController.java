package org.zyq.transaction.upload.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.servlet.http.HttpServletRequest;
import java.io.*;
import java.nio.file.*;
import java.util.*;

@RestController
@RequestMapping("/api/upload")
public class ImageUploadController {

    private static final String UPLOAD_DIR = "/home/ubuntu/uploads/";
    private static final long MAX_SIZE = 5 * 1024 * 1024; // 5MB
    private static final Set<String> ALLOWED_TYPES = Set.of("image/jpeg", "image/png", "image/gif", "image/webp");

    @PostMapping("/image")
    public Map<String, Object> uploadImage(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return Map.of("code", 400, "message", "文件不能为空");
        }
        if (file.getSize() > MAX_SIZE) {
            return Map.of("code", 400, "message", "文件大小不能超过5MB");
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType)) {
            return Map.of("code", 400, "message", "只支持 JPG/PNG/GIF/WEBP 格式");
        }

        try {
            String originalFilename = file.getOriginalFilename();
            String ext = originalFilename != null && originalFilename.contains(".")
                ? originalFilename.substring(originalFilename.lastIndexOf("."))
                : ".jpg";
            String filename = UUID.randomUUID().toString().substring(0, 16) + ext;
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            Path filePath = uploadPath.resolve(filename);
            file.transferTo(filePath.toFile());

            String protocol = "http";
            String host = "124.220.49.156";
            // 判断是HTTP还是HTTPS
            // 这里固定用http，因为nginx uploads会处理，如果用户用https访问，nginx会转发
            return Map.of(
                "code", 0,
                "message", "success",
                "data", Map.of(
                    "url", "/uploads/" + filename,
                    "filename", filename
                )
            );
        } catch (IOException e) {
            return Map.of("code", 500, "message", "服务器存储失败: " + e.getMessage());
        }
    }

    @GetMapping("/test")
    public Map<String, Object> test() {
        return Map.of("code", 0, "message", "upload endpoint ok");
    }
}