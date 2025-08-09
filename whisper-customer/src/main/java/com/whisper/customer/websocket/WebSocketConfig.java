package com.whisper.customer.websocket;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.server.standard.ServerEndpointExporter;
import org.springframework.boot.web.embedded.tomcat.TomcatServletWebServerFactory;
import org.springframework.boot.web.servlet.server.ServletWebServerFactory;

/**
 * WebSocket配置类
 *
 * @author whisper
 */
@Configuration
public class WebSocketConfig
{
    /**
     * 注入ServerEndpointExporter，
     * 这个bean会自动注册使用了@ServerEndpoint注解声明的Websocket endpoint
     */
    @Bean
    public ServerEndpointExporter serverEndpointExporter()
    {
        return new ServerEndpointExporter();
    }

    /**
     * 配置Tomcat以支持WebSocket
     */
    @Bean
    public ServletWebServerFactory createEmbeddedServletContainerFactory()
    {
        TomcatServletWebServerFactory tomcatFactory = new TomcatServletWebServerFactory();
        tomcatFactory.addConnectorCustomizers(connector -> {
            connector.setProperty("relaxedQueryChars", "|{}[]");
        });
        return tomcatFactory;
    }
}
