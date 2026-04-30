FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

COPY target/SecondHandTransaction-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8080

ENV JAVA_OPTS="-Xmx256m"
ENV PORT=8080

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
