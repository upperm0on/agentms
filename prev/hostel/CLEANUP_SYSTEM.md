# 🧹 Unverified Accounts Cleanup System

This system automatically deletes unverified user accounts that are older than 24 hours to keep the database clean and prevent accumulation of inactive accounts.

## 📋 Overview

The cleanup system consists of:
- **Management Command**: `cleanup_unverified_accounts` - Core cleanup logic
- **Scheduled Script**: `schedule_cleanup.py` - Wrapper script for automation
- **Cron Setup**: `setup_cron_cleanup.sh` - Automated scheduling setup
- **Logging**: Comprehensive logging for monitoring and debugging

## 🛠️ Components

### 1. Management Command
**File**: `hq/management/commands/cleanup_unverified_accounts.py`

**Features**:
- Deletes unverified accounts older than specified hours (default: 24)
- Dry-run mode for testing
- Detailed logging and progress reporting
- Safety checks and error handling
- Configurable time threshold

**Usage**:
```bash
# Dry run (test mode)
python manage.py cleanup_unverified_accounts --dry-run

# Delete accounts older than 24 hours (default)
python manage.py cleanup_unverified_accounts

# Delete accounts older than 12 hours
python manage.py cleanup_unverified_accounts --hours=12

# Delete accounts older than 48 hours
python manage.py cleanup_unverified_accounts --hours=48
```

### 2. Scheduled Script
**File**: `schedule_cleanup.py`

**Features**:
- Standalone script that can be run independently
- Comprehensive logging to file and console
- Error handling and reporting
- Can be used with cron jobs or manual execution

**Usage**:
```bash
# Run directly
python schedule_cleanup.py

# Run with virtual environment
source space/bin/activate && python schedule_cleanup.py
```

### 3. Cron Setup Script
**File**: `setup_cron_cleanup.sh`

**Features**:
- Automated cron job setup
- Validates environment and paths
- Creates daily midnight execution
- Provides management instructions

**Usage**:
```bash
# Setup daily cleanup at midnight
./setup_cron_cleanup.sh
```

## ⏰ Scheduling Options

### Option 1: Cron Job (Recommended)
```bash
# Setup automated daily cleanup
./setup_cron_cleanup.sh

# Manual cron entry (runs daily at midnight)
0 0 * * * cd /path/to/project && /path/to/python schedule_cleanup.py >> cleanup.log 2>&1
```

### Option 2: Manual Execution
```bash
# Run cleanup manually
source space/bin/activate && python schedule_cleanup.py
```

### Option 3: Django Q (Alternative)
If Django Q is properly configured, you can use the task in `hq/tasks.py`:
```python
from hq.tasks import cleanup_unverified_accounts
cleanup_unverified_accounts()
```

## 📊 Monitoring and Logs

### Log Files
- **`cleanup.log`**: Main log file with all cleanup operations
- **Console output**: Real-time feedback during execution

### Log Format
```
2025-09-19 13:29:13 - INFO - 🧹 Starting scheduled cleanup of unverified accounts...
2025-09-19 13:29:13 - INFO - 🧹 Starting cleanup of unverified accounts older than 24 hours...
2025-09-19 13:29:13 - INFO - 📅 Cutoff time: 2025-09-18 13:29:13.809119+00:00
2025-09-19 13:29:13 - INFO - ✅ No unverified accounts found to delete.
2025-09-19 13:29:13 - INFO - ✅ Scheduled cleanup completed successfully
```

### Monitoring Commands
```bash
# View recent cleanup logs
tail -f cleanup.log

# Check cron job status
crontab -l

# View system logs for cron
grep CRON /var/log/syslog
```

## 🔧 Configuration

### Time Thresholds
- **Default**: 24 hours
- **Configurable**: Use `--hours` parameter
- **Recommended**: 24-48 hours for production

### Safety Features
- **Dry-run mode**: Test before actual deletion
- **Detailed logging**: Track all operations
- **Error handling**: Graceful failure handling
- **Progress reporting**: Real-time feedback

## 🚀 Setup Instructions

### 1. Initial Setup
```bash
# Make setup script executable
chmod +x setup_cron_cleanup.sh

# Test the cleanup command
source space/bin/activate && python manage.py cleanup_unverified_accounts --dry-run

# Test the scheduled script
source space/bin/activate && python schedule_cleanup.py
```

### 2. Production Deployment
```bash
# Setup automated daily cleanup
./setup_cron_cleanup.sh

# Verify cron job was added
crontab -l

# Monitor the first few runs
tail -f cleanup.log
```

### 3. Maintenance
```bash
# Check cleanup status
tail -20 cleanup.log

# Run manual cleanup if needed
source space/bin/activate && python schedule_cleanup.py

# Remove cron job if needed
crontab -e  # Then delete the cleanup line
```

## 📈 Performance Impact

### Database Impact
- **Minimal**: Only queries unverified accounts
- **Efficient**: Uses indexed fields for filtering
- **Safe**: Cascading deletes handle related data

### System Impact
- **Low CPU**: Simple database operations
- **Low Memory**: Processes accounts in batches
- **Scheduled**: Runs during low-traffic hours (midnight)

## 🔍 Troubleshooting

### Common Issues

#### 1. Permission Errors
```bash
# Fix script permissions
chmod +x setup_cron_cleanup.sh
chmod +x schedule_cleanup.py
```

#### 2. Path Issues
```bash
# Verify paths in setup script
./setup_cron_cleanup.sh
# Check the output for correct paths
```

#### 3. Virtual Environment Issues
```bash
# Ensure virtual environment is activated
source space/bin/activate
which python  # Should show project's python
```

#### 4. Django Settings Issues
```bash
# Test Django setup
source space/bin/activate && python manage.py check
```

### Debug Mode
```bash
# Run with verbose output
source space/bin/activate && python manage.py cleanup_unverified_accounts --dry-run --verbosity=2
```

## 📝 Best Practices

### 1. Testing
- Always test with `--dry-run` first
- Monitor logs after deployment
- Verify cron job execution

### 2. Monitoring
- Check logs regularly
- Monitor database size reduction
- Track cleanup statistics

### 3. Maintenance
- Review time thresholds periodically
- Update paths if project moves
- Backup before major changes

## 🎯 Benefits

### Database Health
- **Reduced size**: Removes inactive accounts
- **Better performance**: Fewer records to query
- **Clean data**: Only active users remain

### Security
- **Reduced attack surface**: Fewer inactive accounts
- **Data privacy**: Removes unverified personal data
- **Compliance**: Automatic data cleanup

### Maintenance
- **Automated**: No manual intervention needed
- **Reliable**: Consistent daily execution
- **Transparent**: Full logging and monitoring

## 📞 Support

For issues or questions:
1. Check the logs: `tail -f cleanup.log`
2. Test manually: `python schedule_cleanup.py`
3. Verify setup: `crontab -l`
4. Review this documentation

---

**Last Updated**: September 19, 2025  
**Version**: 1.0  
**Status**: Production Ready ✅
