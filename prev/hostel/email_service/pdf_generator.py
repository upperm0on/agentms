"""
PDF Receipt Generator for Hostel Management System
Creates beautiful PDF receipts for manager bookings and payments
"""

from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor, black, white
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.lib import colors
from reportlab.graphics.shapes import Drawing, Rect
from reportlab.graphics import renderPDF
from io import BytesIO
import os
import tempfile
import atexit
from django.conf import settings
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class PDFReceiptGenerator:
    """Generate beautiful PDF receipts for bookings and payments"""
    
    def __init__(self):
        self.styles = getSampleStyleSheet()
        self.setup_custom_styles()
    
    def setup_custom_styles(self):
        """Setup custom styles for the PDF"""
        # Title style
        self.styles.add(ParagraphStyle(
            name='CustomTitle',
            parent=self.styles['Heading1'],
            fontSize=24,
            spaceAfter=30,
            alignment=TA_CENTER,
            textColor=HexColor('#667eea'),
            fontName='Helvetica-Bold'
        ))
        
        # Subtitle style
        self.styles.add(ParagraphStyle(
            name='CustomSubtitle',
            parent=self.styles['Heading2'],
            fontSize=16,
            spaceAfter=20,
            alignment=TA_CENTER,
            textColor=HexColor('#2c3e50'),
            fontName='Helvetica-Bold'
        ))
        
        # Header style
        self.styles.add(ParagraphStyle(
            name='CustomHeader',
            parent=self.styles['Heading3'],
            fontSize=14,
            spaceAfter=10,
            textColor=HexColor('#34495e'),
            fontName='Helvetica-Bold'
        ))
        
        # Body style
        self.styles.add(ParagraphStyle(
            name='CustomBody',
            parent=self.styles['Normal'],
            fontSize=11,
            spaceAfter=12,
            textColor=HexColor('#495057'),
            fontName='Helvetica'
        ))
        
        # Footer style
        self.styles.add(ParagraphStyle(
            name='CustomFooter',
            parent=self.styles['Normal'],
            fontSize=9,
            spaceAfter=6,
            alignment=TA_CENTER,
            textColor=HexColor('#6c757d'),
            fontName='Helvetica'
        ))
    
    def create_header(self, story):
        """Create the header section"""
        # Company logo placeholder (you can add actual logo)
        story.append(Spacer(1, 20))
        
        # Company name
        story.append(Paragraph("HostTels", self.styles['CustomTitle']))
        story.append(Paragraph("Your Gateway to Quality Student Accommodation", self.styles['CustomSubtitle']))
        
        # Decorative line
        story.append(Spacer(1, 20))
        story.append(self.create_decorative_line())
        story.append(Spacer(1, 20))
    
    def create_decorative_line(self):
        """Create a decorative line"""
        drawing = Drawing(100, 4)
        drawing.add(Rect(0, 0, 100, 4, fillColor=HexColor('#667eea'), strokeColor=HexColor('#667eea')))
        return drawing
    
    def create_receipt_details(self, story, receipt_data):
        """Create receipt details section"""
        # Receipt title
        story.append(Paragraph("PAYMENT RECEIPT", self.styles['CustomHeader']))
        story.append(Spacer(1, 15))
        
        # Receipt details table
        data = [
            ['Receipt Number:', receipt_data.get('receipt_number', 'N/A')],
            ['Date:', receipt_data.get('date', datetime.now().strftime('%B %d, %Y'))],
            ['Time:', receipt_data.get('time', datetime.now().strftime('%I:%M %p'))],
            ['Transaction ID:', receipt_data.get('transaction_id', 'N/A')],
        ]
        
        table = Table(data, colWidths=[2*inch, 3*inch])
        table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 11),
            ('TEXTCOLOR', (0, 0), (-1, -1), HexColor('#495057')),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ]))
        
        story.append(table)
        story.append(Spacer(1, 20))
    
    def create_customer_details(self, story, customer_data):
        """Create customer details section"""
        story.append(Paragraph("CUSTOMER INFORMATION", self.styles['CustomHeader']))
        story.append(Spacer(1, 10))
        
        data = [
            ['Name:', customer_data.get('name', 'N/A')],
            ['Email:', customer_data.get('email', 'N/A')],
            ['Phone:', customer_data.get('phone', 'N/A')],
            ['Student ID:', customer_data.get('student_id', 'N/A')],
        ]
        
        table = Table(data, colWidths=[2*inch, 3*inch])
        table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 11),
            ('TEXTCOLOR', (0, 0), (-1, -1), HexColor('#495057')),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ]))
        
        story.append(table)
        story.append(Spacer(1, 20))
    
    def create_booking_details(self, story, booking_data):
        """Create booking details section"""
        story.append(Paragraph("BOOKING DETAILS", self.styles['CustomHeader']))
        story.append(Spacer(1, 10))
        
        data = [
            ['Hostel:', booking_data.get('hostel_name', 'N/A')],
            ['Location:', booking_data.get('location', 'N/A')],
            ['Room Type:', booking_data.get('room_type', 'N/A')],
            ['Check-in Date:', booking_data.get('check_in_date', 'N/A')],
            ['Check-out Date:', booking_data.get('check_out_date', 'N/A')],
            ['Duration:', booking_data.get('duration', 'N/A')],
        ]
        
        table = Table(data, colWidths=[2*inch, 3*inch])
        table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 11),
            ('TEXTCOLOR', (0, 0), (-1, -1), HexColor('#495057')),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ]))
        
        story.append(table)
        story.append(Spacer(1, 20))
    
    def create_payment_details(self, story, payment_data):
        """Create payment details section"""
        story.append(Paragraph("PAYMENT DETAILS", self.styles['CustomHeader']))
        story.append(Spacer(1, 10))
        
        # Payment breakdown table
        data = [
            ['Description', 'Amount'],
            ['Room Fee', f"₦{payment_data.get('room_fee', 0):,.2f}"],
            ['Security Deposit', f"₦{payment_data.get('security_deposit', 0):,.2f}"],
            ['Service Charge', f"₦{payment_data.get('service_charge', 0):,.2f}"],
            ['', ''],
            ['Subtotal', f"₦{payment_data.get('subtotal', 0):,.2f}"],
            ['Tax (VAT)', f"₦{payment_data.get('tax', 0):,.2f}"],
            ['', ''],
            ['TOTAL AMOUNT', f"₦{payment_data.get('total_amount', 0):,.2f}"],
        ]
        
        table = Table(data, colWidths=[3*inch, 2*inch])
        table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (0, -1), 'LEFT'),
            ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),  # Total row
            ('FONTSIZE', (0, 0), (-1, -1), 11),
            ('FONTSIZE', (0, -1), (-1, -1), 12),  # Total row
            ('TEXTCOLOR', (0, 0), (-1, -1), HexColor('#495057')),
            ('TEXTCOLOR', (0, -1), (-1, -1), HexColor('#2c3e50')),  # Total row
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('TOPPADDING', (0, -1), (-1, -1), 12),
            ('LINEBELOW', (0, -2), (-1, -2), 1, HexColor('#dee2e6')),
            ('LINEBELOW', (0, -1), (-1, -1), 2, HexColor('#667eea')),
        ]))
        
        story.append(table)
        story.append(Spacer(1, 20))
    
    def create_payment_method(self, story, payment_method):
        """Create payment method section"""
        story.append(Paragraph("PAYMENT METHOD", self.styles['CustomHeader']))
        story.append(Spacer(1, 10))
        
        data = [
            ['Method:', payment_method.get('method', 'Online Payment')],
            ['Status:', payment_method.get('status', 'Completed')],
            ['Processed By:', payment_method.get('processor', 'HostTels Payment System')],
        ]
        
        table = Table(data, colWidths=[2*inch, 3*inch])
        table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 11),
            ('TEXTCOLOR', (0, 0), (-1, -1), HexColor('#495057')),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ]))
        
        story.append(table)
        story.append(Spacer(1, 20))
    
    def create_footer(self, story):
        """Create footer section"""
        story.append(Spacer(1, 30))
        story.append(self.create_decorative_line())
        story.append(Spacer(1, 15))
        
        footer_text = """
        <b>Thank you for choosing HostTels!</b><br/>
        This is an official receipt for your payment.<br/>
        Please keep this receipt for your records.<br/><br/>
        
        <b>Contact Information:</b><br/>
        Email: support@hosttels.com<br/>
        Website: www.hosttels.com<br/>
        Phone: +234 XXX XXX XXXX<br/><br/>
        
        <i>This receipt was generated automatically by the HostTels system.</i>
        """
        
        story.append(Paragraph(footer_text, self.styles['CustomFooter']))
    
    def generate_receipt_pdf(self, receipt_data, customer_data, booking_data, payment_data, payment_method):
        """Generate a complete PDF receipt using temporary file"""
        temp_file = None
        
        try:
            # Create temporary file
            temp_file = tempfile.NamedTemporaryFile(
                mode='w+b',
                suffix='.pdf',
                delete=False,  # We'll delete it manually after reading
                prefix='receipt_'
            )
            
            doc = SimpleDocTemplate(
                temp_file.name,
                pagesize=A4,
                rightMargin=72,
                leftMargin=72,
                topMargin=72,
                bottomMargin=18
            )
            
            story = []
            
            # Build the receipt
            self.create_header(story)
            self.create_receipt_details(story, receipt_data)
            self.create_customer_details(story, customer_data)
            self.create_booking_details(story, booking_data)
            self.create_payment_details(story, payment_data)
            self.create_payment_method(story, payment_method)
            self.create_footer(story)
            
            # Build PDF
            doc.build(story)
            
            # Read PDF content
            with open(temp_file.name, 'rb') as f:
                pdf_content = f.read()
            
            # Clean up temporary file
            temp_file.close()
            os.unlink(temp_file.name)
            
            logger.info(f"PDF receipt generated successfully, size: {len(pdf_content)} bytes")
            return pdf_content
            
        except Exception as e:
            logger.error(f"Failed to generate PDF receipt: {str(e)}")
            
            # Clean up temporary file on error
            if temp_file:
                try:
                    temp_file.close()
                    if os.path.exists(temp_file.name):
                        os.unlink(temp_file.name)
                except Exception as cleanup_error:
                    logger.error(f"Failed to cleanup temporary file: {str(cleanup_error)}")
            
            return None
    
    def generate_manager_receipt(self, reservation, user, payment=None):
        """Generate a receipt for manager bookings"""
        try:
            # Prepare receipt data
            receipt_data = {
                'receipt_number': f"HT-{reservation.id}-{datetime.now().strftime('%Y%m%d')}",
                'date': datetime.now().strftime('%B %d, %Y'),
                'time': datetime.now().strftime('%I:%M %p'),
                'transaction_id': reservation.reference,
            }
            
            # Customer data
            customer_data = {
                'name': user.get_full_name() or user.username,
                'email': user.email,
                'phone': getattr(user, 'phone', 'N/A'),
                'student_id': getattr(user, 'student_id', 'N/A'),
            }
            
            # Booking data
            booking_data = {
                'hostel_name': reservation.hostel.name,
                'location': reservation.hostel.location,
                'room_type': getattr(reservation, 'room_type', 'Standard'),
                'check_in_date': reservation.reservee_date.strftime('%B %d, %Y'),
                'check_out_date': reservation.expiry_date.strftime('%B %d, %Y'),
                'duration': f"{(reservation.expiry_date - reservation.reservee_date).days} days",
            }
            
            # Payment data
            payment_data = {
                'room_fee': float(reservation.amount) * 0.8,  # 80% room fee
                'security_deposit': float(reservation.amount) * 0.15,  # 15% security deposit
                'service_charge': float(reservation.amount) * 0.05,  # 5% service charge
                'subtotal': float(reservation.amount),
                'tax': float(reservation.amount) * 0.05,  # 5% VAT
                'total_amount': float(reservation.amount),
            }
            
            # Payment method
            payment_method = {
                'method': 'Online Payment',
                'status': 'Completed',
                'processor': 'HostTels Payment System',
            }
            
            return self.generate_receipt_pdf(
                receipt_data, customer_data, booking_data, payment_data, payment_method
            )
            
        except Exception as e:
            logger.error(f"Failed to generate manager receipt: {str(e)}")
            return None

# Global instance
pdf_generator = PDFReceiptGenerator()
