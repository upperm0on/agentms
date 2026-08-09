"""
PDF Cleanup Utility for Hostel Management System
Ensures temporary PDF files are properly cleaned up to prevent server flooding
"""

import os
import tempfile
import glob
import logging
from datetime import datetime, timedelta
from django.conf import settings

logger = logging.getLogger(__name__)

class PDFCleanupUtility:
    """Utility for cleaning up temporary PDF files"""
    
    @staticmethod
    def cleanup_temp_pdfs():
        """Clean up any leftover temporary PDF files"""
        try:
            temp_dir = tempfile.gettempdir()
            pdf_pattern = os.path.join(temp_dir, 'receipt_*.pdf')
            
            # Find all temporary PDF files
            temp_files = glob.glob(pdf_pattern)
            
            cleaned_count = 0
            for file_path in temp_files:
                try:
                    # Check if file is older than 1 hour
                    file_age = datetime.now() - datetime.fromtimestamp(os.path.getctime(file_path))
                    if file_age > timedelta(hours=1):
                        os.unlink(file_path)
                        cleaned_count += 1
                        logger.info(f"Cleaned up old temporary PDF: {file_path}")
                except Exception as e:
                    logger.error(f"Failed to clean up temporary PDF {file_path}: {str(e)}")
            
            if cleaned_count > 0:
                logger.info(f"Cleaned up {cleaned_count} temporary PDF files")
            
            return cleaned_count
            
        except Exception as e:
            logger.error(f"Failed to cleanup temporary PDFs: {str(e)}")
            return 0
    
    @staticmethod
    def cleanup_old_pdfs(days_old=7):
        """Clean up PDF files older than specified days"""
        try:
            # Define PDF storage directory (if you have one)
            pdf_storage_dir = getattr(settings, 'PDF_STORAGE_DIR', None)
            if not pdf_storage_dir:
                return 0
            
            if not os.path.exists(pdf_storage_dir):
                return 0
            
            # Find PDF files older than specified days
            cutoff_time = datetime.now() - timedelta(days=days_old)
            cleaned_count = 0
            
            for filename in os.listdir(pdf_storage_dir):
                if filename.endswith('.pdf'):
                    file_path = os.path.join(pdf_storage_dir, filename)
                    try:
                        file_time = datetime.fromtimestamp(os.path.getctime(file_path))
                        if file_time < cutoff_time:
                            os.unlink(file_path)
                            cleaned_count += 1
                            logger.info(f"Cleaned up old PDF: {file_path}")
                    except Exception as e:
                        logger.error(f"Failed to clean up PDF {file_path}: {str(e)}")
            
            if cleaned_count > 0:
                logger.info(f"Cleaned up {cleaned_count} old PDF files")
            
            return cleaned_count
            
        except Exception as e:
            logger.error(f"Failed to cleanup old PDFs: {str(e)}")
            return 0
    
    @staticmethod
    def get_temp_pdf_count():
        """Get count of temporary PDF files"""
        try:
            temp_dir = tempfile.gettempdir()
            pdf_pattern = os.path.join(temp_dir, 'receipt_*.pdf')
            temp_files = glob.glob(pdf_pattern)
            return len(temp_files)
        except Exception as e:
            logger.error(f"Failed to count temporary PDFs: {str(e)}")
            return 0
    
    @staticmethod
    def monitor_disk_usage():
        """Monitor disk usage and cleanup if necessary"""
        try:
            temp_dir = tempfile.gettempdir()
            
            # Get disk usage
            statvfs = os.statvfs(temp_dir)
            free_space = statvfs.f_frsize * statvfs.f_bavail
            total_space = statvfs.f_frsize * statvfs.f_blocks
            usage_percent = (total_space - free_space) / total_space * 100
            
            logger.info(f"Disk usage: {usage_percent:.2f}%")
            
            # If disk usage is high, cleanup temporary files
            if usage_percent > 80:  # 80% threshold
                logger.warning(f"High disk usage detected: {usage_percent:.2f}%")
                cleaned_count = PDFCleanupUtility.cleanup_temp_pdfs()
                logger.info(f"Emergency cleanup completed: {cleaned_count} files removed")
                return cleaned_count
            
            return 0
            
        except Exception as e:
            logger.error(f"Failed to monitor disk usage: {str(e)}")
            return 0

# Global instance
pdf_cleanup_utility = PDFCleanupUtility()
