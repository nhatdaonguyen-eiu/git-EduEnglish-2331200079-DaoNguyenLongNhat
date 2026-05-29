package com.englishcenter.backend.util;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

/**
 * ================================================================
 * UTILITY: HashUtil
 * Hỗ trợ mã hóa mật khẩu bằng thuật toán SHA-256 an toàn và gọn nhẹ.
 * Tránh phụ thuộc các thư viện Security ngoài để đảm bảo tính ổn định.
 * ================================================================
 */
public class HashUtil {

    public static String hashPassword(String password) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(password.getBytes());
            StringBuilder hexString = new StringBuilder();
            
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Lỗi thuật toán mã hóa SHA-256", e);
        }
    }

    public static boolean checkPassword(String password, String hashedPassword) {
        return hashPassword(password).equals(hashedPassword);
    }
}
