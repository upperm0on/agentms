# Server Status Report

## Current Status

### ✅ Frontend Server (React Marketplace)
- **Status:** ✅ Running
- **Port:** 5175
- **URL:** http://localhost:5175
- **Process:** Running in background

### ⚠️ Backend Server (Django)
- **Status:** ❌ Not Running
- **Port:** 8080
- **Issue:** Requires virtual environment activation and dependencies

## Starting Servers

### Frontend Server (Already Running)
```bash
cd /home/barimah/projects/hostel_market
npm run dev
```
✅ Already started on port 5175

### Backend Server (Needs Setup)

#### Option 1: Using Virtual Environment
```bash
cd /home/barimah/projects/hostel
source workstation/bin/activate
python manage.py runserver localhost:8080
```

#### Option 2: If Virtual Environment Doesn't Exist
```bash
cd /home/barimah/projects/hostel
python3 -m venv workstation
source workstation/bin/activate
pip install -r requirements.txt
python manage.py runserver localhost:8080
```

#### Option 3: Using System Python (if dependencies installed)
```bash
cd /home/barimah/projects/hostel
python3 manage.py runserver localhost:8080
```

## Server URLs

### Frontend
- **Marketplace:** http://localhost:5175
- **Status:** ✅ Running

### Backend API
- **Base URL:** http://localhost:8080
- **API Endpoints:** http://localhost:8080/hq/api/
- **Status:** ⚠️ Needs to be started

## Quick Start Script

Use the provided script to start both servers:
```bash
cd /home/barimah/projects/hostel_market
./start-servers.sh
```

## Testing

### Test Backend Connection
```bash
npm run test:connection
```

### Test Full Suite
```bash
npm run test:manual
```

## Troubleshooting

### Backend Server Issues

1. **ModuleNotFoundError: No module named 'decouple'**
   - Solution: Activate virtual environment and install dependencies
   ```bash
   cd /home/barimah/projects/hostel
   source workstation/bin/activate
   pip install -r requirements.txt
   ```

2. **Port 8080 already in use**
   - Solution: Kill existing process or use different port
   ```bash
   lsof -ti:8080 | xargs kill -9
   ```

3. **Virtual environment not found**
   - Solution: Create virtual environment
   ```bash
   cd /home/barimah/projects/hostel
   python3 -m venv workstation
   source workstation/bin/activate
   pip install -r requirements.txt
   ```

### Frontend Server Issues

1. **Port 5175 already in use**
   - Solution: Kill existing process
   ```bash
   lsof -ti:5175 | xargs kill -9
   ```

2. **Module not found errors**
   - Solution: Install dependencies
   ```bash
   cd /home/barimah/projects/hostel_market
   npm install
   ```

## Process Management

### Check Running Servers
```bash
# Check backend
ps aux | grep "manage.py runserver"

# Check frontend
ps aux | grep "vite"
```

### Stop Servers
```bash
# Stop backend
pkill -f "manage.py runserver"

# Stop frontend
pkill -f "vite"
```

## Next Steps

1. ✅ Frontend server is running
2. ⚠️ Start backend server (see instructions above)
3. Test backend connection: `npm run test:connection`
4. Run full test suite: `npm run test:manual`


