# Module 4 - Edric's Coaching Week 2

## Create multiple docker containers for a simple web application

### Approach 1: Setup everything using docker commands

1. Setup the database container

```bash
# Create a custom network
docker network create myapp-network

# Create a volume for database persistence
docker volume create db-data

# Run a database container
# Not best practice tot include password here, just for demonstrate purpose
docker run -d \
  --name demo-db \
  --network myapp-network \
  -v db-data:/var/lib/postgresql/data \
  -e POSTGRES_PASSWORD=mysecretpassword \
  -e POSTGRES_USER=myuser \
  -e POSTGRES_DB=mydb \
  -p 5433:5432 \
  postgres:13
```

2. Build the web application container

```bash
# Build the web application container
docker build -t demo-app .
```

3. Run the web application container

```bash
docker run \
  --name demo-app-container \
  -d \
  -p 8080:3000 \
  -v $(pwd)/logs:/app/logs \
  -e DB_USER=myuser \
  -e DB_HOST=demo-db \
  -e DB_NAME=mydb \
  -e DB_PASSWORD=mysecretpassword \
  demo-app
```

4. Test the application

```bash
# Health Check
curl http://localhost:8080

# Get Items
curl http://localhost:8080/api/items

# Add Items
curl -X POST http://localhost:8080/api/items -H "Content-Type: application/json" -d '{"name": "Test Item"}'
```

5. Clean up

```bash
docker stop demo-app-container
docker rm demo-app-container
docker stop demo-db
docker rm demo-db
docker volume rm db-data
docker network rm myapp-network
```

### Approach 2: Use docker compose

#### Step 1: Create a basic docker-compose.yml file

1. Create a basic docker-compose.yml file

Here's a table of the basic components used in Docker Compose:
| Component | Description | Example |
|-----------|-------------|---------|
| networks | Defines how containers communicate with each other | `myapp-network` with bridge driver |
| volumes | Persistent data storage for containers | `db-data` for database persistence |
| services | Individual containers that make up the application | `demo-db`, `demo-app` |
| environment | Configuration passed to containers | `DB_USER`, `DB_PASSWORD` |
| ports | Maps container ports to host ports | `8080:3000` (host:container) |
| depends_on | Defines service dependencies | `demo-app` depends on `demo-db` |
| restart | Controls container restart behavior | `unless-stopped` |
| build | Location of Dockerfile for building images | `.` (current directory) |

2. Add the initial structure:

```yaml
networks:
  myapp-network:
    driver: bridge

volumes:
  db-data:
    name: db-data
```

#### Step 2: Add the database service

Now, let's add the PostgreSQL database service:

⚠️ Warning: Not a best practice to include password in the docker-compose.yml file, just for demonstration purpose.

```yaml
networks:
  myapp-network:
    driver: bridge

volumes:
  db-data:
    name: db-data

services:
  demo-db:
    image: postgres:13
    container_name: demo-db
    environment:
      POSTGRES_PASSWORD: mysecretpassword
      POSTGRES_USER: myuser
      POSTGRES_DB: mydb
    ports:
      - "5433:5432"
    volumes:
      - db-data:/var/lib/postgresql/data
    networks:
      - myapp-network
    restart: unless-stopped
```

At this point, you can start just the database with:

```bash
# Start just the database
docker compose up -d demo-db

# Check that it's running
docker compose ps
```

#### Step 3: Add the web application service

Now let's add the web application service to the docker-compose.yml file:

```yaml
networks:
  myapp-network:
    driver: bridge

volumes:
  db-data:
    name: db-data

services:
  demo-db:
    image: postgres:13
    container_name: demo-db
    environment:
      POSTGRES_PASSWORD: mysecretpassword
      POSTGRES_USER: myuser
      POSTGRES_DB: mydb
    ports:
      - "5433:5432"
    volumes:
      - db-data:/var/lib/postgresql/data
    networks:
      - myapp-network
    restart: unless-stopped

  demo-app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: demo-app-container
    ports:
      - "8080:3000"
    volumes:
      - ./logs:/app/logs
    environment:
      DB_USER: myuser
      DB_HOST: demo-db
      DB_NAME: mydb
      DB_PASSWORD: mysecretpassword
    networks:
      - myapp-network
    restart: unless-stopped
```

#### Step 4: Add service dependency

Let's add a dependency to ensure the database starts before the application:

```yaml
networks:
  myapp-network:
    driver: bridge

volumes:
  db-data:
    name: db-data

services:
  demo-db:
    image: postgres:13
    container_name: demo-db
    environment:
      POSTGRES_PASSWORD: mysecretpassword
      POSTGRES_USER: myuser
      POSTGRES_DB: mydb
    ports:
      - "5433:5432"
    volumes:
      - db-data:/var/lib/postgresql/data
    networks:
      - myapp-network
    restart: unless-stopped

  demo-app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: demo-app-container
    ports:
      - "8080:3000"
    volumes:
      - ./logs:/app/logs
    environment:
      DB_USER: myuser
      DB_HOST: demo-db
      DB_NAME: mydb
      DB_PASSWORD: mysecretpassword
    depends_on:
      - demo-db
    networks:
      - myapp-network
    restart: unless-stopped
```

#### Step 5: Running the stack

Now that the docker-compose.yml file is complete, you can run the entire stack:

```bash
# Build and start all services
docker compose up -d

# Check that all services are running
docker compose ps

# View logs from all services
docker compose logs

# View logs from a specific service
docker compose logs demo-app
```

#### Step 6: Testing the application

Test the application the same way as in Approach 1:

```bash
# Health Check
curl http://localhost:8080

# Get Items
curl http://localhost:8080/api/items

# Add Items
curl -X POST http://localhost:8080/api/items -H "Content-Type: application/json" -d '{"name": "Test Item"}'
```

#### Step 7: Clean up

When you're done, clean up all resources:

```bash
# Stop all services
docker compose stop

# Stop and remove containers, networks (but keep volumes)
docker compose down

# Stop and remove containers, networks, and volumes
docker compose down -v
```

## Key benefits of using Docker Compose:

- **Simplified management**: All configuration is in a single file
- **Service dependencies**: The `depends_on` parameter ensures the database starts before the app
- **Environment consistency**: The configuration is easily shared and versioned
- **One-command deployment**: Starts the entire stack with a single command
