#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Directory paths
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="$SCRIPT_DIR/Admin/Frontend_WebAdmin"
BACKEND_DIR="$SCRIPT_DIR/Backend/backend"
BACKEND_PORT=8086

# Function to check if port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Function to start backend
start_backend() {
    echo -e "${YELLOW}Starting Backend (Spring Boot)...${NC}"
    
    if [ ! -d "$BACKEND_DIR" ]; then
        echo -e "${RED}Backend directory not found: $BACKEND_DIR${NC}"
        return 1
    fi
    
    cd "$BACKEND_DIR" || exit 1
    
    # Make mvnw executable if exists
    if [ -f "$BACKEND_DIR/mvnw" ]; then
        chmod +x "$BACKEND_DIR/mvnw"
    fi
    
    # Check if Maven is available
    if command -v mvn &> /dev/null; then
        nohup mvn spring-boot:run > "$BACKEND_DIR/backend.log" 2>&1 &
    elif [ -f "$BACKEND_DIR/mvnw" ]; then
        nohup "$BACKEND_DIR/mvnw" spring-boot:run > "$BACKEND_DIR/backend.log" 2>&1 &
    else
        echo -e "${RED}Maven not found. Please install Maven or use Maven Wrapper.${NC}"
        return 1
    fi
    
    BACKEND_PID=$!
    echo -e "${GREEN}Backend started with PID: $BACKEND_PID${NC}"
    echo -e "${GREEN}Backend logs: $BACKEND_DIR/backend.log${NC}"
    echo -e "${GREEN}Waiting for backend to start on port $BACKEND_PORT...${NC}"
    
    # Wait for backend to start
    for i in {1..30}; do
        if check_port $BACKEND_PORT; then
            echo -e "${GREEN}Backend is running on http://localhost:$BACKEND_PORT${NC}"
            return 0
        fi
        sleep 1
    done
    
    echo -e "${RED}Backend failed to start. Check logs: $BACKEND_DIR/backend.log${NC}"
    return 1
}

# Function to start frontend
start_frontend() {
    echo -e "${YELLOW}Starting Frontend (Vite)...${NC}"
    
    if [ ! -d "$FRONTEND_DIR" ]; then
        echo -e "${RED}Frontend directory not found: $FRONTEND_DIR${NC}"
        return 1
    fi
    
    cd "$FRONTEND_DIR" || exit 1
    
    # Check if node_modules exists
    if [ ! -d "$FRONTEND_DIR/node_modules" ]; then
        echo -e "${YELLOW}Installing frontend dependencies...${NC}"
        npm install
    fi
    
    npm run dev > frontend.log 2>&1 &
    
    FRONTEND_PID=$!
    echo -e "${GREEN}Frontend started with PID: $FRONTEND_PID${NC}"
    echo -e "${GREEN}Frontend logs: $FRONTEND_DIR/frontend.log${NC}"
}

# Function to stop all services
stop_all() {
    echo -e "${YELLOW}Stopping all services...${NC}"
    
    # Kill processes on port 3000 (frontend) and 8086 (backend)
    if check_port 3000; then
        lsof -ti:3000 | xargs kill -9 2>/dev/null
        echo -e "${GREEN}Stopped frontend on port 3000${NC}"
    fi
    
    if check_port 8086; then
        lsof -ti:8086 | xargs kill -9 2>/dev/null
        echo -e "${GREEN}Stopped backend on port 8086${NC}"
    fi
    
    # Also kill any node/npm processes related to this project
    pkill -f "vite" 2>/dev/null
    pkill -f "spring-boot:run" 2>/dev/null
    pkill -f "mvn spring-boot:run" 2>/dev/null
    
    echo -e "${GREEN}All services stopped${NC}"
}

# Function to show status
status() {
    echo -e "${YELLOW}Service Status:${NC}"
    
    if check_port 3000; then
        echo -e "${GREEN}Frontend: Running on http://localhost:3000${NC}"
    else
        echo -e "${RED}Frontend: Not running${NC}"
    fi
    
    if check_port 8086; then
        echo -e "${GREEN}Backend: Running on http://localhost:8086${NC}"
    else
        echo -e "${RED}Backend: Not running${NC}"
    fi
}

# Main menu
case "$1" in
    start-fe)
        start_frontend
        ;;
    start-be)
        start_backend
        ;;
    start)
        start_backend
        sleep 5
        start_frontend
        ;;
    stop)
        stop_all
        ;;
    restart)
        stop_all
        sleep 2
        start_backend
        sleep 5
        start_frontend
        ;;
    status)
        status
        ;;
    *)
        echo "Usage: $0 {start|start-fe|start-be|stop|restart|status}"
        echo ""
        echo "Commands:"
        echo "  start      - Start both frontend and backend"
        echo "  start-fe   - Start only frontend (React/Vite)"
        echo "  start-be   - Start only backend (Spring Boot)"
        echo "  stop       - Stop all services"
        echo "  restart    - Restart all services"
        echo "  status     - Show service status"
        exit 1
        ;;
esac

exit 0

