package com.hlgtech.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;
import org.springframework.data.mongodb.config.EnableMongoAuditing;

@SpringBootApplication
@EnableMongoRepositories(basePackages = "com.hlgtech.api")
@EnableMongoAuditing
public class HlgtechApiApplication {

	public static void main(String[] args) {
		SpringApplication.run(HlgtechApiApplication.class, args);
	}

}
