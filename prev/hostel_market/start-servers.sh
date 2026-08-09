#!/bin/bash

# Start Servers for Marketplace
# This script starts both the Django backend and React frontend servers

echo "🚀 Starting Marketplace Servers..."
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to check if port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Check if backend is already running
if check_port 8080; then
    echo -e "${YELLOW}⚠️  Backend server already running on port 8080${NC}"
else
    echo -e "${GREEN}Starting Django backend server...${NC}"
    cd ../hostel || exit 1
    
    # Activate virtual environment
    if [ -d "workstation/bin/activate" ]; then
        source workstation/bin/activate
    fi
    
    # Start Django server in background
    python manage.py runserver localhost:8080 > /dev/null 2>&1 &
    BACKEND_PID=$!
    echo -e "${GREEN}✅ Backend server started (PID: $BACKEND_PID)${NC}"
    
    cd - || exit 1
fi

# Wait a moment for backend to start
sleep 3

# Check if frontend is already running
if check_port 5175; then
    echo -e "${YELLOW}⚠️  Frontend server already running on port 5175${NC}"
else
    echo -e "${GREEN}Starting React frontend server...${NC}"
    
    # Start React dev server in background
    npm run dev > /dev/null 2>&1 &
    FRONTEND_PID=$!
    echo -e "${GREEN}✅ Frontend server started (PID: $FRONTEND_PID)${NC}"
fi

# Wait for servers to start
echo ""
echo "⏳ Waiting for servers to initialize..."
sleep 5

# Check server status
echo ""
echo "=== Server Status ==="
echo ""

# Check backend
if check_port 8080; then
    echo -e "${GREEN}✅ Backend server: http://localhost:8080${NC}"
else
    echo -e "${RED}❌ Backend server: Not running${NC}"
fi

# Check frontend
if check_port 5175; then
    echo -e "${GREEN}✅ Frontend server: http://localhost:5175${NC}"
else
    echo -e "${RED}❌ Frontend server: Not running${NC}"
fi

echo ""
echo "=== Access URLs ==="
echo "Backend API: http://localhost:8080/hq/api/"
echo "Frontend App: http://localhost:5175"
echo ""
echo "To stop servers, use: pkill -f 'manage.py runserver' && pkill -f 'vite'"


