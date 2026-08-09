
#!/bin/bash

# Navigate to Django project folder
cd ../hostel/ || exit

# Activate virtual environment
echo "Activating virtual environment..."
source workstation/bin/activate

# Start Django server in background
echo "Starting Django server..."
python manage.py runserver localhost:8080 &

# Start Django-Q in background
echo "Starting Django Q Cluster..."
python manage.py qcluster &

# Deactivate venv so React uses system node
deactivate

# Navigate back to React project root
cd - || exit

# Start React frontend
echo "Starting React (npm run dev)..."
npm run dev
