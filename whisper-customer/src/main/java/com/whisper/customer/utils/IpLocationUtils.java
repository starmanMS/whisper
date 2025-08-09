package com.whisper.customer.utils;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;

import javax.servlet.http.HttpServletRequest;
import java.net.InetAddress;
import java.net.UnknownHostException;

/**
 * IP地址和地理位置获取工具类
 * 
 * @author whisper
 */
public class IpLocationUtils 
{
    private static final Logger logger = LoggerFactory.getLogger(IpLocationUtils.class);
    
    private static final RestTemplate restTemplate = new RestTemplate();
    private static final ObjectMapper objectMapper = new ObjectMapper();
    
    /**
     * 从HttpServletRequest中获取客户端真实IP地址
     * 
     * @param request HTTP请求对象
     * @return 客户端IP地址
     */
    public static String getClientIpAddress(HttpServletRequest request) 
    {
        if (request == null) {
            return "unknown";
        }
        
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("HTTP_CLIENT_IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("HTTP_X_FORWARDED_FOR");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        
        // 如果是多个IP，取第一个
        if (ip != null && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }
        
        // 如果是本地IP，尝试获取真实IP
        if ("127.0.0.1".equals(ip) || "0:0:0:0:0:0:0:1".equals(ip)) {
            try {
                InetAddress addr = InetAddress.getLocalHost();
                ip = addr.getHostAddress();
            } catch (UnknownHostException e) {
                logger.warn("无法获取本地IP地址", e);
            }
        }
        
        return ip;
    }
    
    /**
     * 获取IP地址的地理位置信息
     * 
     * @param ip IP地址
     * @return IP地理位置信息对象
     */
    public static IpLocationInfo getIpLocationInfo(String ip) 
    {
        if (ip == null || ip.trim().isEmpty() || "unknown".equals(ip)) {
            return createDefaultLocationInfo(ip);
        }
        
        // 如果是内网IP，返回默认信息
        if (isPrivateIp(ip)) {
            return createDefaultLocationInfo(ip);
        }
        
        try {
            // 使用免费的IP地理位置API
            String apiUrl = "http://ip-api.com/json/" + ip + "?lang=zh-CN";
            
            ResponseEntity<String> response = restTemplate.getForEntity(apiUrl, String.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return parseIpApiResponse(response.getBody(), ip);
            }
        } catch (Exception e) {
            logger.warn("调用IP地理位置API失败，IP: {}, 错误: {}", ip, e.getMessage());
        }
        
        // 如果API调用失败，尝试备用API
        try {
            String backupApiUrl = "https://ipapi.co/" + ip + "/json/";
            ResponseEntity<String> response = restTemplate.getForEntity(backupApiUrl, String.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return parseIpapiCoResponse(response.getBody(), ip);
            }
        } catch (Exception e) {
            logger.warn("调用备用IP地理位置API失败，IP: {}, 错误: {}", ip, e.getMessage());
        }
        
        return createDefaultLocationInfo(ip);
    }
    
    /**
     * 解析ip-api.com的响应
     */
    private static IpLocationInfo parseIpApiResponse(String responseBody, String ip) 
    {
        try {
            JsonNode jsonNode = objectMapper.readTree(responseBody);
            
            if ("success".equals(jsonNode.get("status").asText())) {
                IpLocationInfo info = new IpLocationInfo();
                info.setIp(ip);
                info.setCountry(jsonNode.path("country").asText(""));
                info.setRegion(jsonNode.path("regionName").asText(""));
                info.setCity(jsonNode.path("city").asText(""));
                info.setIsp(jsonNode.path("isp").asText(""));
                info.setLatitude(jsonNode.path("lat").asDouble(0.0));
                info.setLongitude(jsonNode.path("lon").asDouble(0.0));
                
                // 构建完整地址
                StringBuilder address = new StringBuilder();
                if (!info.getCountry().isEmpty()) address.append(info.getCountry());
                if (!info.getRegion().isEmpty()) address.append(" ").append(info.getRegion());
                if (!info.getCity().isEmpty()) address.append(" ").append(info.getCity());
                info.setAddress(address.toString().trim());
                
                return info;
            }
        } catch (Exception e) {
            logger.warn("解析IP地理位置响应失败: {}", e.getMessage());
        }
        
        return createDefaultLocationInfo(ip);
    }
    
    /**
     * 解析ipapi.co的响应
     */
    private static IpLocationInfo parseIpapiCoResponse(String responseBody, String ip) 
    {
        try {
            JsonNode jsonNode = objectMapper.readTree(responseBody);
            
            IpLocationInfo info = new IpLocationInfo();
            info.setIp(ip);
            info.setCountry(jsonNode.path("country_name").asText(""));
            info.setRegion(jsonNode.path("region").asText(""));
            info.setCity(jsonNode.path("city").asText(""));
            info.setIsp(jsonNode.path("org").asText(""));
            info.setLatitude(jsonNode.path("latitude").asDouble(0.0));
            info.setLongitude(jsonNode.path("longitude").asDouble(0.0));
            
            // 构建完整地址
            StringBuilder address = new StringBuilder();
            if (!info.getCountry().isEmpty()) address.append(info.getCountry());
            if (!info.getRegion().isEmpty()) address.append(" ").append(info.getRegion());
            if (!info.getCity().isEmpty()) address.append(" ").append(info.getCity());
            info.setAddress(address.toString().trim());
            
            return info;
        } catch (Exception e) {
            logger.warn("解析备用IP地理位置响应失败: {}", e.getMessage());
        }
        
        return createDefaultLocationInfo(ip);
    }
    
    /**
     * 创建默认的地理位置信息
     */
    private static IpLocationInfo createDefaultLocationInfo(String ip) 
    {
        IpLocationInfo info = new IpLocationInfo();
        info.setIp(ip);
        info.setCountry("未知");
        info.setRegion("未知");
        info.setCity("未知");
        info.setAddress("未知地区");
        info.setIsp("未知");
        info.setLatitude(0.0);
        info.setLongitude(0.0);
        return info;
    }
    
    /**
     * 判断是否为内网IP
     */
    private static boolean isPrivateIp(String ip) 
    {
        if (ip == null || ip.trim().isEmpty()) {
            return true;
        }
        
        return ip.startsWith("192.168.") || 
               ip.startsWith("10.") || 
               ip.startsWith("172.") ||
               ip.equals("127.0.0.1") ||
               ip.equals("localhost");
    }
    
    /**
     * IP地理位置信息类
     */
    public static class IpLocationInfo 
    {
        private String ip;
        private String country;
        private String region;
        private String city;
        private String address;
        private String isp;
        private Double latitude;
        private Double longitude;
        
        // Getters and Setters
        public String getIp() { return ip; }
        public void setIp(String ip) { this.ip = ip; }
        
        public String getCountry() { return country; }
        public void setCountry(String country) { this.country = country; }
        
        public String getRegion() { return region; }
        public void setRegion(String region) { this.region = region; }
        
        public String getCity() { return city; }
        public void setCity(String city) { this.city = city; }
        
        public String getAddress() { return address; }
        public void setAddress(String address) { this.address = address; }
        
        public String getIsp() { return isp; }
        public void setIsp(String isp) { this.isp = isp; }
        
        public Double getLatitude() { return latitude; }
        public void setLatitude(Double latitude) { this.latitude = latitude; }
        
        public Double getLongitude() { return longitude; }
        public void setLongitude(Double longitude) { this.longitude = longitude; }
        
        @Override
        public String toString() {
            return String.format("IP: %s, 地址: %s, ISP: %s", ip, address, isp);
        }
    }
}
