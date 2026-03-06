package com.assignment_4.SwiftLogistics.middleware.soap.config;

import org.springframework.boot.web.servlet.ServletRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.oxm.jaxb.Jaxb2Marshaller;
import org.springframework.ws.config.annotation.EnableWs;
import org.springframework.ws.transport.http.MessageDispatcherServlet;
import org.springframework.ws.wsdl.wsdl11.DefaultWsdl11Definition;
import org.springframework.xml.xsd.SimpleXsdSchema;
import org.springframework.xml.xsd.XsdSchema;

@EnableWs
@Configuration
public class WebServiceConfig {

    @Bean
    public ServletRegistrationBean<MessageDispatcherServlet> messageDispatcherServlet(
            org.springframework.context.ApplicationContext context) {

        MessageDispatcherServlet servlet = new MessageDispatcherServlet();
        servlet.setApplicationContext(context);
        servlet.setTransformWsdlLocations(true);
        return new ServletRegistrationBean<>(servlet, "/ws/*");
    }

    // WSDL: http://localhost:4000/ws/cms.wsdl
    @Bean(name = "cms")
    public DefaultWsdl11Definition cmsWsdl(XsdSchema cmsSchema) {
        DefaultWsdl11Definition wsdl = new DefaultWsdl11Definition();
        wsdl.setPortTypeName("CmsPort");
        wsdl.setLocationUri("/ws");
        wsdl.setTargetNamespace("http://swiftlogistics.com/cms");
        wsdl.setSchema(cmsSchema);
        return wsdl;
    }

    @Bean
    public XsdSchema cmsSchema() {
        return new SimpleXsdSchema(new ClassPathResource("cms.xsd"));
    }

    @Bean
    public Jaxb2Marshaller jaxb2Marshaller() {
        Jaxb2Marshaller m = new Jaxb2Marshaller();
        m.setContextPath("com.assignment_4.SwiftLogistics.wsdl");
        return m;
    }
}