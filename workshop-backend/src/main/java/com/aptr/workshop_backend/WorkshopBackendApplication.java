package com.aptr.workshop_backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class WorkshopBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(WorkshopBackendApplication.class, args);
	}
}
