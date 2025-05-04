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
3. The backend API will be running on `http://localhost:8080`.
4. Explore the API documentation at:

   > [http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html)

## Tech Stack

* Java 21 / Spring Boot
* Axon Framework (CQRS & Event Sourcing)
* PostgreSQL 16
* Kafka (KRaft mode)
* Docker & Docker Compose

## Docker Services

* **taskmgmt\_db**: PostgreSQL database on port `5438 -> 5432`
* **taskmgmt\_backend**: Java backend on port `8080`
* **broker**: Kafka broker on port `9092`
