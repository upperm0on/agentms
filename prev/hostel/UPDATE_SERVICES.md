# Update Services on Production Server

Run these commands to update your services so celery starts with staypal:

```bash
# 1. Update staypal.service paths
sudo sed -i 's/User=ubuntu/User=admin/g' /etc/systemd/system/staypal.service
sudo sed -i 's/Group=ubuntu/Group=admin/g' /etc/systemd/system/staypal.service
sudo sed -i 's|/home/ubuntu/staypal|/home/admin/hostel|g' /etc/systemd/system/staypal.service
sudo sed -i 's|/home/ubuntu/staypal/workstation|/home/admin/hostel/space|g' /etc/systemd/system/staypal.service
sudo sed -i 's/chown ubuntu:ubuntu/chown admin:admin/g' /etc/systemd/system/staypal.service

# 2. Update celery-worker.service paths
sudo sed -i 's/User=ubuntu/User=admin/g' /etc/systemd/system/celery-worker.service
sudo sed -i 's/Group=ubuntu/Group=admin/g' /etc/systemd/system/celery-worker.service
sudo sed -i 's|/home/ubuntu/hostel|/home/admin/hostel|g' /etc/systemd/system/celery-worker.service
sudo sed -i 's|/home/ubuntu/hostel/venv|/home/admin/hostel/space|g' /etc/systemd/system/celery-worker.service
sudo sed -i 's/chown ubuntu:ubuntu/chown admin:admin/g' /etc/systemd/system/celery-worker.service

# 3. Update celery-beat.service paths
sudo sed -i 's/User=ubuntu/User=admin/g' /etc/systemd/system/celery-beat.service
sudo sed -i 's/Group=ubuntu/Group=admin/g' /etc/systemd/system/celery-beat.service
sudo sed -i 's|/home/ubuntu/hostel|/home/admin/hostel|g' /etc/systemd/system/celery-beat.service
sudo sed -i 's|/home/ubuntu/hostel/venv|/home/admin/hostel/space|g' /etc/systemd/system/celery-beat.service
sudo sed -i 's/chown ubuntu:ubuntu/chown admin:admin/g' /etc/systemd/system/celery-beat.service

# 4. Copy updated service files (if you pulled new versions)
sudo cp /home/admin/hostel/staypal.service /etc/systemd/system/
sudo cp /home/admin/hostel/celery-worker.service /etc/systemd/system/
sudo cp /home/admin/hostel/celery-beat.service /etc/systemd/system/

# 5. Reload systemd
sudo systemctl daemon-reload

# 6. Enable all services
sudo systemctl enable staypal.service celery-worker.service celery-beat.service

# 7. Start all services together
sudo systemctl start staypal.service

# 8. Check status
sudo systemctl status staypal.service
sudo systemctl status celery-worker.service
sudo systemctl status celery-beat.service
```

Now when you start staypal.service, celery-worker and celery-beat will start automatically!

