# Task Management

This project implements a DDD Service-Oriented Task Management System designed to help users (employees and students) create and manage workspaces, projects, and tasks. It provides features such as:

* **Workspaces & Projects**: Organize tasks into projects and workspaces.
* **Task Management**: Create, update, assign, and complete tasks; set priorities and deadlines; support for recurring tasks.
* **Roles & Permissions**: Employees can create and manage; students can update assigned tasks.

* **Progress Tracking & Notifications**: Kanban views, email/push reminders, and automatic alerts.
* **Archiving**: Archive completed projects and access historical data.

## Prerequisites

* [Docker](https://www.docker.com/)
* [Docker Compose](https://docs.docker.com/compose/)

## Getting Started

1. Clone the repository:

   ```bash
   git clone https://gitlab.finki.ukim.mk/soa/soa2025/task-management.git
   
   cd task-management
   ```
2. Start all services:

   ```bash
   docker-compose up -d
   ```
3. The frontend application is running on `http://localhost:5173/`.
4. The backend API will be running on `http://localhost:8087`.
5. Explore the API documentation at:

   > [http://localhost:8087/swagger-ui/index.html](http://localhost:8087/swagger-ui/index.html)
6. Access the Consul dashboard at:
   
   > [http://localhost:8500](http://localhost:8500)

7. Keycloak (Authentication & Authorization)

   > [http://localhost:8001](http://localhost:8001)

   Log in with the admin credentials below

   - **Admin Username:** admin
   - **Admin Password:** admin
   - **Port:** 8001 (mapped to container port 8080)

## Tech Stack

* Java 21 / Spring Boot
* Axon Framework (CQRS & Event Sourcing)
* TypeScript / React.js
* PostgreSQL 16
* Kafka (KRaft mode)
* Docker & Docker Compose
* Consul (Service Discovery)
* Keycloak (Authentication & Authorization)

## Docker Services

* **taskmgmt\_db**: PostgreSQL database on port `5438 -> 5432`
* **taskmgmt\_frontend**: React app frontend on port `5173`
* **taskmgmt\_backend**: SpringBoot (Java + Kotlin) backend on port `8087`
* **broker**: Kafka broker on port `9092`
* **consul**: Consul service registry and discovery on port `8500`
* **keycloak**: Keycloak for authentication and authorization on port `8001`