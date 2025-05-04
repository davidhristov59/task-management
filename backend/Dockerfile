FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app

COPY mvnw pom.xml ./
COPY .mvn .mvn
RUN chmod +x mvnw && \
    ./mvnw dependency:go-offline -B -Dmaven.repo.local=/root/.m2

COPY src ./src
RUN ./mvnw clean package -DskipTests -B -Dmaven.repo.local=/root/.m2

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

ENTRYPOINT ["java", "-XX:+ExitOnOutOfMemoryError", "-XX:+UseContainerSupport", "-jar", "/app/app.jar"]
