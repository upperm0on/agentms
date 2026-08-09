from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN
from pptx.dml.color import RGBColor
from pptx.chart.data import CategoryChartData
from pptx.enum.chart import XL_CHART_TYPE
from PIL import Image, ImageDraw, ImageFilter
import io
from pptx.enum.shapes import MSO_AUTO_SHAPE_TYPE

# App Design System Colors
PRIMARY_BLUE = RGBColor(37, 99, 235)        # #2563EB
BLUE_BRIGHT = RGBColor(59, 130, 246)        # #3B82F6
DARK_BLUE = RGBColor(30, 58, 138)          # #1E3A8A
ACCENT_GREEN = RGBColor(16, 185, 129)      # #10B981
DARK_TEXT = RGBColor(30, 41, 59)           # #1E293B
MUTED_TEXT = RGBColor(107, 114, 128)       # #6B7280
LIGHT_BG = RGBColor(248, 250, 252)         # #F8FAFC
WHITE = RGBColor(255, 255, 255)
SUBTLE_BORDER = RGBColor(226, 232, 240)    # #E2E8F0

# Glass morphism background creator
def create_glass_bg(width=1280, height=960, primary_color=(37, 99, 235), blur=True):
    """Create a glass morphism background image"""
    img = Image.new('RGBA', (width, height), (248, 250, 252, 255))  # Light background
    
    # Create gradient overlay
    gradient = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    d = ImageDraw.Draw(gradient)
    
    # Create subtle gradient from top
    for y in range(height):
        alpha = int((y / height) * 20)
        color = primary_color + (alpha,)
        d.line([(0, y), (width, y)], fill=color)
    
    # Apply Gaussian blur for glass effect
    if blur:
        gradient = gradient.filter(ImageFilter.GaussianBlur(radius=40))
    
    img.paste(gradient, (0, 0), gradient)
    
    # Convert to bytes
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format='PNG')
    img_byte_arr.seek(0)
    return img_byte_arr

def create_presentation():
    prs = Presentation()
    prs.slide_width = Inches(10)
    prs.slide_height = Inches(7.5)
    
    slides = [
        create_cover_slide(prs),
        create_problem_slide(prs),
        create_solution_slide(prs),
        create_demo_slide(prs),
        create_market_size_slide(prs),
        create_business_model_slide(prs),
        create_competition_slide(prs),
        create_advantage_slide(prs),
        create_gtm_slide(prs),
        create_traction_slide(prs),
        create_team_slide(prs),
        create_ask_slide(prs),
        create_vision_slide(prs),
    ]
    
    output_path = '/home/barimah/projects/hostel_react/Hostelz_Pitch_Deck.pptx'
    prs.save(output_path)
    print(f"✅ Glass Morphism Pitch Deck created: {output_path}")
    return output_path

def _make_modern_bg(width=1600, height=1200):
    """Create a modern radial gradient background with glow blobs (PNG in memory)."""
    img = Image.new('RGBA', (width, height), (248, 250, 252, 255))
    draw = ImageDraw.Draw(img, 'RGBA')

    # Radial gradient center
    center = (int(width * 0.65), int(height * 0.35))
    max_radius = int(min(width, height) * 0.7)
    for r in range(max_radius, 0, -6):
        alpha = int(60 * (r / max_radius))
        draw.ellipse([
            center[0] - r, center[1] - r,
            center[0] + r, center[1] + r
        ], fill=(37, 99, 235, max(0, alpha)))

    # Blue glow blob
    blob1 = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    b1 = ImageDraw.Draw(blob1, 'RGBA')
    b1.ellipse([int(width*0.05), int(height*0.05), int(width*0.55), int(height*0.6)], fill=(59,130,246,140))
    blob1 = blob1.filter(ImageFilter.GaussianBlur(radius=120))
    img = Image.alpha_composite(img, blob1)

    # Green glow blob
    blob2 = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    b2 = ImageDraw.Draw(blob2, 'RGBA')
    b2.ellipse([int(width*0.45), int(height*0.45), int(width*0.95), int(height*0.95)], fill=(16,185,129,110))
    blob2 = blob2.filter(ImageFilter.GaussianBlur(radius=140))
    img = Image.alpha_composite(img, blob2)

    # Subtle vignette
    vignette = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    vg = ImageDraw.Draw(vignette, 'RGBA')
    for r in range(int(max(width, height)*0.8), 0, -10):
        alpha = int(45 * (1 - r / (max(width, height)*0.8)))
        vg.rectangle([0, 0, width, height], outline=(0,0,0,alpha))
    img = Image.alpha_composite(img, vignette)

    out = io.BytesIO()
    img.convert('RGB').save(out, format='PNG')
    out.seek(0)
    return out

def add_glass_background(slide):
    """Add modern gradient background image to slide to simulate blur/glass context."""
    stream = _make_modern_bg(1600, 1200)
    slide.shapes.add_picture(stream, Inches(0), Inches(0), width=Inches(10), height=Inches(7.5))

def add_glass_card(slide, x, y, width, height, opacity=0.85):
    """Add a glass morphism card element"""
    shape = slide.shapes.add_shape(
        1,  # Rectangle
        Inches(x), Inches(y),
        Inches(width), Inches(height)
    )
    shape.fill.solid()
    # Semi-transparent white for glass effect
    shape.fill.fore_color.rgb = WHITE
    shape.fill.transparency = 1 - opacity
    # Subtle border
    shape.line.color.rgb = SUBTLE_BORDER
    shape.line.width = Pt(1)
    return shape

def add_gradient_header(slide, title, color=PRIMARY_BLUE, y_pos=0):
    """Add gradient header with glass effect"""
    header = slide.shapes.add_shape(
        1,  # Rectangle
        Inches(0), Inches(y_pos),
        Inches(10), Inches(0.7)
    )
    header.fill.solid()
    header.fill.fore_color.rgb = color
    header.line.color.rgb = color
    
    # Add title
    title_box = slide.shapes.add_textbox(Inches(0.5), Inches(y_pos + 0.15), Inches(9), Inches(0.5))
    title_frame = title_box.text_frame
    p = title_frame.paragraphs[0]
    p.text = title
    p.font.name = 'Poppins'
    p.font.size = Pt(24)
    p.font.bold = True
    p.font.color.rgb = WHITE
    
    return header

def create_cover_slide(prs):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    add_glass_background(slide)
    
    # Subtle blue gradient background
    bg_shape = slide.shapes.add_shape(
        1, Inches(0), Inches(0), Inches(10), Inches(7.5)
    )
    bg_shape.fill.solid()
    bg_shape.fill.fore_color.rgb = RGBColor(248, 250, 252)
    bg_shape.line.fill.background()
    
    # Centered glass card
    card = slide.shapes.add_shape(
        MSO_AUTO_SHAPE_TYPE.ROUNDED_RECTANGLE, Inches(1.5), Inches(2), Inches(7), Inches(3.5)
    )
    card.fill.solid()
    card.fill.fore_color.rgb = WHITE
    card.fill.transparency = 0.2
    card.line.color.rgb = RGBColor(229, 231, 235)
    card.line.width = Pt(0.5)
    
    # Logo/Title
    title_box = slide.shapes.add_textbox(Inches(2), Inches(2.3), Inches(6), Inches(1))
    title_frame = title_box.text_frame
    title_frame.word_wrap = True
    p = title_frame.paragraphs[0]
    p.text = "HOSTELZ"
    p.font.name = 'Poppins'
    p.font.size = Pt(64)
    p.font.bold = True
    p.font.color.rgb = PRIMARY_BLUE
    p.alignment = PP_ALIGN.CENTER
    
    # Tagline
    tagline_box = slide.shapes.add_textbox(Inches(2), Inches(3.2), Inches(6), Inches(0.6))
    tagline_frame = tagline_box.text_frame
    tagline_frame.word_wrap = True
    p = tagline_frame.paragraphs[0]
    p.text = "Airbnb meets Stripe for Africa's Student Hostels"
    p.font.name = 'Inter'
    p.font.size = Pt(16)
    p.font.italic = True
    p.font.color.rgb = MUTED_TEXT
    p.alignment = PP_ALIGN.CENTER
    
    # Bottom info with founder
    info_box = slide.shapes.add_textbox(Inches(2), Inches(4.2), Inches(6), Inches(0.8))
    info_frame = info_box.text_frame
    info_frame.word_wrap = True
    p = info_frame.paragraphs[0]
    p.text = "Yaw Barimah Amponsah, Founder & CEO"
    p.font.name = 'Poppins'
    p.font.size = Pt(14)
    p.font.bold = True
    p.font.color.rgb = DARK_TEXT
    p.alignment = PP_ALIGN.CENTER
    
    p = info_frame.add_paragraph()
    p.text = "October 2025 • Raising $101K"
    p.font.name = 'Inter'
    p.font.size = Pt(12)
    p.font.color.rgb = MUTED_TEXT
    p.alignment = PP_ALIGN.CENTER
    
    return slide

def create_problem_slide(prs):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    add_glass_background(slide)
    
    add_gradient_header(slide, "The Problem", BLUE_BRIGHT, 0)
    
    problems = [
        ("Blind Search", "New admits hunt without vetting → 30% risk of unsafe living situations"),
        ("Pressure & Compromise", "Fast decisions force subpar hostel choices without budget fit"),
        ("Zero Transparency", "Managers overcharge with no competition or management tools"),
    ]
    
    y_start = 1
    for idx, (problem_title, problem_desc) in enumerate(problems):
        # Problem card with glass effect
        card = slide.shapes.add_shape(
            MSO_AUTO_SHAPE_TYPE.ROUNDED_RECTANGLE, Inches(0.5), Inches(y_start + idx * 1.7), Inches(9), Inches(1.5)
        )
        card.fill.solid()
        card.fill.fore_color.rgb = WHITE
        card.fill.transparency = 0.2
        card.line.color.rgb = SUBTLE_BORDER
        card.line.width = Pt(0.5)
        
        # Icon/Number
        icon_circle = slide.shapes.add_shape(
            MSO_AUTO_SHAPE_TYPE.OVAL, Inches(0.8), Inches(y_start + idx * 1.7 + 0.3), Inches(0.4), Inches(0.4)
        )
        icon_circle.fill.solid()
        icon_circle.fill.fore_color.rgb = BLUE_BRIGHT
        icon_circle.line.fill.background()
        
        icon_text = slide.shapes.add_textbox(Inches(0.8), Inches(y_start + idx * 1.7 + 0.25), Inches(0.4), Inches(0.5))
        icon_frame = icon_text.text_frame
        p = icon_frame.paragraphs[0]
        p.text = str(idx + 1)
        p.font.size = Pt(18)
        p.font.bold = True
        p.font.color.rgb = WHITE
        p.alignment = PP_ALIGN.CENTER
        
        # Title
        title_box = slide.shapes.add_textbox(Inches(1.5), Inches(y_start + idx * 1.7 + 0.25), Inches(7.5), Inches(0.4))
        title_frame = title_box.text_frame
        p = title_frame.paragraphs[0]
        p.text = problem_title
        p.font.name = 'Poppins'
        p.font.size = Pt(14)
        p.font.bold = True
        p.font.color.rgb = DARK_TEXT
        
        # Description
        desc_box = slide.shapes.add_textbox(Inches(1.5), Inches(y_start + idx * 1.7 + 0.7), Inches(7.5), Inches(0.7))
        desc_frame = desc_box.text_frame
        desc_frame.word_wrap = True
        p = desc_frame.paragraphs[0]
        p.text = problem_desc
        p.font.name = 'Inter'
        p.font.size = Pt(12)
        p.font.color.rgb = MUTED_TEXT
    
    return slide

def create_solution_slide(prs):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    add_glass_background(slide)
    
    add_gradient_header(slide, "The Solution", DARK_BLUE, 0)
    
    # Two-column layout
    features_left = [
        "✓ Safe Hostel Search",
        "✓ Instant Paystack Bookings",
        "✓ Verified Reviews & Ratings",
    ]
    
    features_right = [
        "✓ Dynamic Pricing Dashboard",
        "✓ Tenant & Revenue Analytics",
        "✓ Multi-Currency Support",
    ]
    
    # Left column
    left_card = slide.shapes.add_shape(
        MSO_AUTO_SHAPE_TYPE.ROUNDED_RECTANGLE, Inches(0.5), Inches(1.2), Inches(4.5), Inches(5.5)
    )
    left_card.fill.solid()
    left_card.fill.fore_color.rgb = WHITE
    left_card.fill.transparency = 0.2
    left_card.line.color.rgb = SUBTLE_BORDER
    left_card.line.width = Pt(0.5)
    
    left_title = slide.shapes.add_textbox(Inches(0.8), Inches(1.5), Inches(4), Inches(0.4))
    left_frame = left_title.text_frame
    p = left_frame.paragraphs[0]
    p.text = "For Students"
    p.font.name = 'Poppins'
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = PRIMARY_BLUE
    
    y_pos = 2
    for feature in features_left:
        feature_box = slide.shapes.add_textbox(Inches(0.9), Inches(y_pos), Inches(3.8), Inches(0.5))
        feature_frame = feature_box.text_frame
        feature_frame.word_wrap = True
        p = feature_frame.paragraphs[0]
        p.text = feature
        p.font.name = 'Inter'
        p.font.size = Pt(13)
        p.font.color.rgb = DARK_TEXT
        y_pos += 0.7
    
    # Right column
    right_card = slide.shapes.add_shape(
        MSO_AUTO_SHAPE_TYPE.ROUNDED_RECTANGLE, Inches(5.2), Inches(1.2), Inches(4.5), Inches(5.5)
    )
    right_card.fill.solid()
    right_card.fill.fore_color.rgb = WHITE
    right_card.fill.transparency = 0.2
    right_card.line.color.rgb = SUBTLE_BORDER
    right_card.line.width = Pt(0.5)
    
    right_title = slide.shapes.add_textbox(Inches(5.5), Inches(1.5), Inches(4), Inches(0.4))
    right_frame = right_title.text_frame
    p = right_frame.paragraphs[0]
    p.text = "For Managers"
    p.font.name = 'Poppins'
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = ACCENT_GREEN
    
    y_pos = 2
    for feature in features_right:
        feature_box = slide.shapes.add_textbox(Inches(5.6), Inches(y_pos), Inches(3.8), Inches(0.5))
        feature_frame = feature_box.text_frame
        feature_frame.word_wrap = True
        p = feature_frame.paragraphs[0]
        p.text = feature
        p.font.name = 'Inter'
        p.font.size = Pt(13)
        p.font.color.rgb = DARK_TEXT
        y_pos += 0.7
    
    return slide

def create_demo_slide(prs):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    add_glass_background(slide)
    
    add_gradient_header(slide, "Product Demo: 30-Second Journey", PRIMARY_BLUE, 0)
    
    steps = [
        ("Search", 'KNUST • 1-Room • Wi-Fi • < GHS 6K'),
        ("Discover", "4.3★ Ratings • Real Availability"),
        ("Reserve", "Room 6 • GHS 249.97 • 29 slots left"),
        ("Pay", "Instant Paystack Receipt • Done ✓"),
    ]
    
    for idx, (step, detail) in enumerate(steps):
        y = 1.2 + idx * 1.35
        
        # Step card
        card = slide.shapes.add_shape(
            MSO_AUTO_SHAPE_TYPE.ROUNDED_RECTANGLE, Inches(0.7), Inches(y), Inches(8.6), Inches(1.2)
        )
        card.fill.solid()
        card.fill.fore_color.rgb = WHITE
        card.fill.transparency = 0.2
        card.line.color.rgb = SUBTLE_BORDER
        card.line.width = Pt(0.5)
        
        # Step number
        num_circle = slide.shapes.add_shape(
            MSO_AUTO_SHAPE_TYPE.OVAL, Inches(0.95), Inches(y + 0.2), Inches(0.35), Inches(0.35)
        )
        num_circle.fill.solid()
        num_circle.fill.fore_color.rgb = BLUE_BRIGHT
        num_circle.line.fill.background()
        
        num_text = slide.shapes.add_textbox(Inches(0.95), Inches(y + 0.15), Inches(0.35), Inches(0.45))
        num_frame = num_text.text_frame
        p = num_frame.paragraphs[0]
        p.text = str(idx + 1)
        p.font.size = Pt(16)
        p.font.bold = True
        p.font.color.rgb = WHITE
        p.alignment = PP_ALIGN.CENTER
        
        # Step title
        title_box = slide.shapes.add_textbox(Inches(1.5), Inches(y + 0.15), Inches(2.5), Inches(0.4))
        title_frame = title_box.text_frame
        p = title_frame.paragraphs[0]
        p.text = step
        p.font.name = 'Poppins'
        p.font.size = Pt(14)
        p.font.bold = True
        p.font.color.rgb = DARK_TEXT
        
        # Detail
        detail_box = slide.shapes.add_textbox(Inches(1.5), Inches(y + 0.55), Inches(7.2), Inches(0.5))
        detail_frame = detail_box.text_frame
        detail_frame.word_wrap = True
        p = detail_frame.paragraphs[0]
        p.text = detail
        p.font.name = 'Inter'
        p.font.size = Pt(12)
        p.font.color.rgb = MUTED_TEXT
    
    return slide

def create_market_size_slide(prs):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    add_glass_background(slide)
    
    add_gradient_header(slide, "Market Size: GHS 1.12B TAM", DARK_BLUE, 0)
    
    # Chart
    chart_data = CategoryChartData()
    chart_data.categories = ['Per Room', 'Per Hostel', 'Per Campus', 'Ghana Total']
    chart_data.add_series('Value (GHS M)', (0.018, 0.6, 30, 1120))
    
    x, y, cx, cy = Inches(0.5), Inches(1.2), Inches(9), Inches(4)
    chart = slide.shapes.add_chart(
        XL_CHART_TYPE.COLUMN_CLUSTERED, x, y, cx, cy, chart_data
    ).chart
    
    plot = chart.plots[0]
    plot.vary_by_categories = False
    # Series colors per category
    series = chart.series[0]
    bar_colors = [DARK_BLUE, PRIMARY_BLUE, BLUE_BRIGHT, ACCENT_GREEN]
    for idx, pt in enumerate(series.points):
        pt.format.fill.solid()
        pt.format.fill.fore_color.rgb = bar_colors[min(idx, len(bar_colors)-1)]
    chart.has_legend = False
    try:
        chart.value_axis.has_major_gridlines = True
        gl = chart.value_axis.major_gridlines
        gl.format.line.color.rgb = SUBTLE_BORDER
    except Exception:
        pass
    
    # Insight box
    insight_card = slide.shapes.add_shape(
        MSO_AUTO_SHAPE_TYPE.ROUNDED_RECTANGLE, Inches(0.7), Inches(5.5), Inches(8.6), Inches(1.5)
    )
    insight_card.fill.solid()
    insight_card.fill.fore_color.rgb = ACCENT_GREEN
    insight_card.fill.transparency = 0.15
    insight_card.line.color.rgb = ACCENT_GREEN
    insight_card.line.width = Pt(1.5)
    
    insight_text = slide.shapes.add_textbox(Inches(1), Inches(5.7), Inches(8), Inches(1.1))
    insight_frame = insight_text.text_frame
    insight_frame.word_wrap = True
    p = insight_frame.paragraphs[0]
    p.text = "78% Coverage in 3 Years = GHS 874M Addressable"
    p.font.name = 'Poppins'
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = ACCENT_GREEN
    
    p = insight_frame.add_paragraph()
    p.text = "(186K students, 1.8K hostels)"
    p.font.name = 'Inter'
    p.font.size = Pt(12)
    p.font.color.rgb = DARK_TEXT
    
    return slide

def create_business_model_slide(prs):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    add_glass_background(slide)
    
    add_gradient_header(slide, "Business Model", PRIMARY_BLUE, 0)
    
    model_items = [
        ("Student Booking Fee", "4–8% (tiered by room price)", BLUE_BRIGHT),
        ("Paystack Processing", "-2%", RGBColor(255, 107, 107)),
        ("Infrastructure Costs", "~1% (traffic-based)", MUTED_TEXT),
        ("Net Profit", "1–5%", ACCENT_GREEN),
    ]
    
    y_pos = 1.3
    for label, value, color in model_items:
        row_card = slide.shapes.add_shape(
            MSO_AUTO_SHAPE_TYPE.ROUNDED_RECTANGLE, Inches(1.5), Inches(y_pos), Inches(7), Inches(0.75)
        )
        row_card.fill.solid()
        row_card.fill.fore_color.rgb = WHITE
        row_card.fill.transparency = 0.2
        row_card.line.color.rgb = SUBTLE_BORDER
        row_card.line.width = Pt(0.5)
        
        # Label
        label_box = slide.shapes.add_textbox(Inches(1.8), Inches(y_pos + 0.15), Inches(4), Inches(0.4))
        label_frame = label_box.text_frame
        p = label_frame.paragraphs[0]
        p.text = label
        p.font.name = 'Poppins'
        p.font.size = Pt(13)
        p.font.bold = True
        p.font.color.rgb = DARK_TEXT
        
        # Value
        value_box = slide.shapes.add_textbox(Inches(6.5), Inches(y_pos + 0.15), Inches(1.5), Inches(0.4))
        value_frame = value_box.text_frame
        p = value_frame.paragraphs[0]
        p.text = value
        p.font.name = 'Poppins'
        p.font.size = Pt(13)
        p.font.bold = True
        p.font.color.rgb = color
        p.alignment = PP_ALIGN.RIGHT
        
        y_pos += 0.95
    
    # Future revenue note
    future_box = slide.shapes.add_shape(
        MSO_AUTO_SHAPE_TYPE.ROUNDED_RECTANGLE, Inches(0.7), Inches(5.8), Inches(8.6), Inches(1.2)
    )
    future_box.fill.solid()
    future_box.fill.fore_color.rgb = PRIMARY_BLUE
    future_box.fill.transparency = 0.15
    future_box.line.color.rgb = PRIMARY_BLUE
    future_box.line.width = Pt(1)
    
    future_text = slide.shapes.add_textbox(Inches(1), Inches(5.95), Inches(8), Inches(0.8))
    future_frame = future_text.text_frame
    future_frame.word_wrap = True
    p = future_frame.paragraphs[0]
    p.text = "Future Revenue: 5% Marketplace + Premium Tools + Ads"
    p.font.name = 'Inter'
    p.font.size = Pt(13)
    p.font.color.rgb = PRIMARY_BLUE
    
    return slide

def create_competition_slide(prs):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    add_glass_background(slide)
    
    add_gradient_header(slide, "Competition: We Dominate", ACCENT_GREEN, 0)
    
    competitors = [
        ("Hostelz (Us)", "9/10", "9/10", ACCENT_GREEN),
        ("GetRooms.co", "4/10", "7/10", RGBColor(107, 114, 128)),
        ("HostelReserve", "3/10", "6/10", RGBColor(107, 114, 128)),
        ("StudentRoomBook", "2/10", "3/10", RGBColor(107, 114, 128)),
    ]
    
    y_start = 1.3
    for name, efficiency, experience, color in competitors:
        row_card = slide.shapes.add_shape(
            MSO_AUTO_SHAPE_TYPE.ROUNDED_RECTANGLE, Inches(1), Inches(y_start), Inches(8), Inches(0.9)
        )
        row_card.fill.solid()
        if color == ACCENT_GREEN:
            row_card.fill.fore_color.rgb = ACCENT_GREEN
            row_card.fill.transparency = 0.15
            row_card.line.color.rgb = ACCENT_GREEN
        else:
            row_card.fill.fore_color.rgb = WHITE
            row_card.fill.transparency = 0.12
            row_card.line.color.rgb = SUBTLE_BORDER
        row_card.line.width = Pt(0.5)
        
        # Name
        name_box = slide.shapes.add_textbox(Inches(1.3), Inches(y_start + 0.2), Inches(3.5), Inches(0.5))
        name_frame = name_box.text_frame
        p = name_frame.paragraphs[0]
        p.text = name
        p.font.name = 'Poppins'
        p.font.size = Pt(13)
        p.font.bold = name == "Hostelz (Us)"
        p.font.color.rgb = color
        
        # Efficiency
        eff_box = slide.shapes.add_textbox(Inches(4.8), Inches(y_start + 0.2), Inches(1.5), Inches(0.5))
        eff_frame = eff_box.text_frame
        p = eff_frame.paragraphs[0]
        p.text = efficiency
        p.font.size = Pt(12)
        p.font.color.rgb = color
        p.alignment = PP_ALIGN.CENTER
        
        # Experience
        exp_box = slide.shapes.add_textbox(Inches(7), Inches(y_start + 0.2), Inches(1.5), Inches(0.5))
        exp_frame = exp_box.text_frame
        p = exp_frame.paragraphs[0]
        p.text = experience
        p.font.size = Pt(12)
        p.font.color.rgb = color
        p.alignment = PP_ALIGN.CENTER
        
        y_start += 1.05
    
    return slide

def create_advantage_slide(prs):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    add_glass_background(slide)
    
    add_gradient_header(slide, "Our Competitive Advantage", DARK_BLUE, 0)
    
    advantages = [
        ("Smart Pricing", "Auto-adjusts by stay length (monthly/yearly)"),
        ("Verified Reviews", "Trusted insights from real users"),
        ("Escrow Marketplace", "Safe transactions + wallet payouts"),
        ("Global Ready", "50+ currencies + real-time WebSockets"),
    ]
    
    y_pos = 1.2
    for adv_title, adv_desc in advantages:
        card = slide.shapes.add_shape(
            MSO_AUTO_SHAPE_TYPE.ROUNDED_RECTANGLE, Inches(0.7), Inches(y_pos), Inches(8.6), Inches(1.2)
        )
        card.fill.solid()
        card.fill.fore_color.rgb = WHITE
        card.fill.transparency = 0.2
        card.line.color.rgb = SUBTLE_BORDER
        card.line.width = Pt(0.5)
        
        # Icon
        icon_circle = slide.shapes.add_shape(
            MSO_AUTO_SHAPE_TYPE.OVAL, Inches(1), Inches(y_pos + 0.25), Inches(0.3), Inches(0.3)
        )
        icon_circle.fill.solid()
        icon_circle.fill.fore_color.rgb = BLUE_BRIGHT
        icon_circle.line.fill.background()
        
        # Title
        title_box = slide.shapes.add_textbox(Inches(1.6), Inches(y_pos + 0.15), Inches(7), Inches(0.4))
        title_frame = title_box.text_frame
        p = title_frame.paragraphs[0]
        p.text = adv_title
        p.font.name = 'Poppins'
        p.font.size = Pt(13)
        p.font.bold = True
        p.font.color.rgb = DARK_TEXT
        
        # Description
        desc_box = slide.shapes.add_textbox(Inches(1.6), Inches(y_pos + 0.6), Inches(7.2), Inches(0.5))
        desc_frame = desc_box.text_frame
        desc_frame.word_wrap = True
        p = desc_frame.paragraphs[0]
        p.text = adv_desc
        p.font.name = 'Inter'
        p.font.size = Pt(11)
        p.font.color.rgb = MUTED_TEXT
        
        y_pos += 1.35
    
    return slide

def create_gtm_slide(prs):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    add_glass_background(slide)
    
    add_gradient_header(slide, "Go-to-Market Strategy", PRIMARY_BLUE, 0)
    
    gtm_phases = [
        ("Students", "Social ads (IG/TikTok) + influencer collabs"),
        ("Managers", "Partner with SRC presidents & housing offices"),
        ("Pilot Launch", "Start KNUST → UCC/UG (78% Ghana in 3 yrs)"),
        ("Campus Events", "Direct onboardings & partnerships"),
    ]
    
    for idx, (phase, action) in enumerate(gtm_phases):
        x = 0.5 + (idx % 2) * 5
        y = 1.2 + (idx // 2) * 2.8
        
        card = slide.shapes.add_shape(
            MSO_AUTO_SHAPE_TYPE.ROUNDED_RECTANGLE, Inches(x), Inches(y), Inches(4.5), Inches(2.4)
        )
        card.fill.solid()
        card.fill.fore_color.rgb = WHITE
        card.fill.transparency = 0.2
        card.line.color.rgb = SUBTLE_BORDER
        card.line.width = Pt(0.5)
        
        # Number
        num_circle = slide.shapes.add_shape(
            MSO_AUTO_SHAPE_TYPE.OVAL, Inches(x + 0.3), Inches(y + 0.3), Inches(0.35), Inches(0.35)
        )
        num_circle.fill.solid()
        num_circle.fill.fore_color.rgb = BLUE_BRIGHT
        num_circle.line.fill.background()
        
        num_text = slide.shapes.add_textbox(Inches(x + 0.3), Inches(y + 0.22), Inches(0.35), Inches(0.5))
        num_frame = num_text.text_frame
        p = num_frame.paragraphs[0]
        p.text = str(idx + 1)
        p.font.size = Pt(16)
        p.font.bold = True
        p.font.color.rgb = WHITE
        p.alignment = PP_ALIGN.CENTER
        
        # Phase
        phase_box = slide.shapes.add_textbox(Inches(x + 0.9), Inches(y + 0.25), Inches(3.3), Inches(0.5))
        phase_frame = phase_box.text_frame
        p = phase_frame.paragraphs[0]
        p.text = phase
        p.font.name = 'Poppins'
        p.font.size = Pt(13)
        p.font.bold = True
        p.font.color.rgb = DARK_TEXT
        
        # Action
        action_box = slide.shapes.add_textbox(Inches(x + 0.35), Inches(y + 1), Inches(3.8), Inches(1.1))
        action_frame = action_box.text_frame
        action_frame.word_wrap = True
        p = action_frame.paragraphs[0]
        p.text = action
        p.font.name = 'Inter'
        p.font.size = Pt(11)
        p.font.color.rgb = MUTED_TEXT
    
    return slide

def create_traction_slide(prs):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    add_glass_background(slide)
    
    add_gradient_header(slide, "Traction: Building Momentum", ACCENT_GREEN, 0)
    
    traction_points = [
        "100% Beta Tester Love — \"Finally, an app that gets it right\"",
        "Manager Validation — \"No tools like this exist\"",
        "Pipeline: SRC Presidents (Kumasi Tech + more)",
        "MVP Live: Paystack integrated, multi-env tested",
    ]
    
    y_pos = 1.3
    for i, point in enumerate(traction_points):
        card = slide.shapes.add_shape(
            MSO_AUTO_SHAPE_TYPE.ROUNDED_RECTANGLE, Inches(0.7), Inches(y_pos), Inches(8.6), Inches(1.1)
        )
        card.fill.solid()
        card.fill.fore_color.rgb = ACCENT_GREEN
        card.fill.transparency = 0.15
        card.line.color.rgb = ACCENT_GREEN
        card.line.width = Pt(0.5)
        
        # Checkmark
        check_text = slide.shapes.add_textbox(Inches(1), Inches(y_pos + 0.2), Inches(0.3), Inches(0.6))
        check_frame = check_text.text_frame
        p = check_frame.paragraphs[0]
        p.text = "✓"
        p.font.size = Pt(24)
        p.font.color.rgb = ACCENT_GREEN
        
        # Text
        text_box = slide.shapes.add_textbox(Inches(1.6), Inches(y_pos + 0.15), Inches(7.2), Inches(0.8))
        text_frame = text_box.text_frame
        text_frame.word_wrap = True
        p = text_frame.paragraphs[0]
        p.text = point
        p.font.name = 'Inter'
        p.font.size = Pt(12)
        p.font.color.rgb = DARK_TEXT
        
        y_pos += 1.3
    
    return slide

def create_team_slide(prs):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    add_glass_background(slide)
    
    add_gradient_header(slide, "Team: Built It Solo (So Far)", DARK_BLUE, 0)
    
    # Team card
    team_card = slide.shapes.add_shape(
        MSO_AUTO_SHAPE_TYPE.ROUNDED_RECTANGLE, Inches(1.5), Inches(1.2), Inches(7), Inches(5.5)
    )
    team_card.fill.solid()
    team_card.fill.fore_color.rgb = WHITE
    team_card.fill.transparency = 0.2
    team_card.line.color.rgb = SUBTLE_BORDER
    team_card.line.width = Pt(0.5)
    
    # Name
    name_box = slide.shapes.add_textbox(Inches(2), Inches(1.6), Inches(6), Inches(0.6))
    name_frame = name_box.text_frame
    p = name_frame.paragraphs[0]
    p.text = "Yaw Barimah Amponsah"
    p.font.name = 'Poppins'
    p.font.size = Pt(20)
    p.font.bold = True
    p.font.color.rgb = PRIMARY_BLUE
    p.alignment = PP_ALIGN.CENTER
    
    # Role
    role_box = slide.shapes.add_textbox(Inches(2), Inches(2.3), Inches(6), Inches(0.4))
    role_frame = role_box.text_frame
    p = role_frame.paragraphs[0]
    p.text = "Founder & CEO"
    p.font.name = 'Inter'
    p.font.size = Pt(14)
    p.font.color.rgb = MUTED_TEXT
    p.alignment = PP_ALIGN.CENTER
    
    # Credentials
    creds = [
        "🚀 95% Solo Build: Django + React + DevOps",
        "🚀 Deployed & Live: Multi-env tested",
        "🚀 Pitching & Fundraising: Ready to scale",
    ]
    
    y_pos = 2.9
    for cred in creds:
        cred_box = slide.shapes.add_textbox(Inches(2.2), Inches(y_pos), Inches(5.6), Inches(0.6))
        cred_frame = cred_box.text_frame
        cred_frame.word_wrap = True
        p = cred_frame.paragraphs[0]
        p.text = cred
        p.font.name = 'Inter'
        p.font.size = Pt(11)
        p.font.color.rgb = DARK_TEXT
        y_pos += 0.8
    
    return slide

def create_ask_slide(prs):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    add_glass_background(slide)
    
    add_gradient_header(slide, "The Ask: $101K for Marketing Fuel", RGBColor(239, 68, 68), 0)
    
    allocations = [
        ("100% Marketing", "Social + Influencer campaigns → 50+ campuses", "18 months"),
        ("Self-Fund Ops", "App revenue covers servers & team", "Ongoing"),
        ("Target Milestone", "GHS 40M+ bookings • 78% Ghana", "Year 2-3"),
    ]
    
    y_pos = 1.3
    for title, desc, timeline in allocations:
        card = slide.shapes.add_shape(
            MSO_AUTO_SHAPE_TYPE.ROUNDED_RECTANGLE, Inches(0.7), Inches(y_pos), Inches(8.6), Inches(1.6)
        )
        card.fill.solid()
        card.fill.fore_color.rgb = WHITE
        card.fill.transparency = 0.2
        card.line.color.rgb = SUBTLE_BORDER
        card.line.width = Pt(0.5)
        
        # Title
        title_box = slide.shapes.add_textbox(Inches(1), Inches(y_pos + 0.2), Inches(6), Inches(0.4))
        title_frame = title_box.text_frame
        p = title_frame.paragraphs[0]
        p.text = title
        p.font.name = 'Poppins'
        p.font.size = Pt(13)
        p.font.bold = True
        p.font.color.rgb = DARK_TEXT
        
        # Timeline
        time_box = slide.shapes.add_textbox(Inches(7.2), Inches(y_pos + 0.2), Inches(1.2), Inches(0.4))
        time_frame = time_box.text_frame
        p = time_frame.paragraphs[0]
        p.text = timeline
        p.font.name = 'Inter'
        p.font.size = Pt(10)
        p.font.color.rgb = MUTED_TEXT
        p.alignment = PP_ALIGN.RIGHT
        
        # Description
        desc_box = slide.shapes.add_textbox(Inches(1), Inches(y_pos + 0.7), Inches(8), Inches(0.7))
        desc_frame = desc_box.text_frame
        desc_frame.word_wrap = True
        p = desc_frame.paragraphs[0]
        p.text = desc
        p.font.name = 'Inter'
        p.font.size = Pt(11)
        p.font.color.rgb = MUTED_TEXT
        
        y_pos += 1.8
    
    return slide

def create_vision_slide(prs):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    add_glass_background(slide)
    
    add_gradient_header(slide, "The Vision: Africa's Student OS", DARK_BLUE, 0)
    
    vision_points = [
        "100% Student Housing Control Across Africa",
        "Global Bookings Platform (Multi-Currency)",
        "5% Marketplace Net + Ads + Premium Tools",
        "Safer, Smarter Living for Millions",
    ]
    
    y_pos = 1.5
    for vision in vision_points:
        card = slide.shapes.add_shape(
            MSO_AUTO_SHAPE_TYPE.ROUNDED_RECTANGLE, Inches(1), Inches(y_pos), Inches(8), Inches(0.9)
        )
        card.fill.solid()
        card.fill.fore_color.rgb = PRIMARY_BLUE
        card.fill.transparency = 0.15
        card.line.color.rgb = PRIMARY_BLUE
        card.line.width = Pt(1)
        
        # Icon
        icon_text = slide.shapes.add_textbox(Inches(1.4), Inches(y_pos + 0.15), Inches(0.3), Inches(0.6))
        icon_frame = icon_text.text_frame
        p = icon_frame.paragraphs[0]
        p.text = "→"
        p.font.size = Pt(18)
        p.font.color.rgb = PRIMARY_BLUE
        
        # Text
        text_box = slide.shapes.add_textbox(Inches(2), Inches(y_pos + 0.15), Inches(6.8), Inches(0.6))
        text_frame = text_box.text_frame
        text_frame.word_wrap = True
        p = text_frame.paragraphs[0]
        p.text = vision
        p.font.name = 'Poppins'
        p.font.size = Pt(13)
        p.font.bold = True
        p.font.color.rgb = DARK_TEXT
        
        y_pos += 1.15
    
    # Closing quote
    quote_card = slide.shapes.add_shape(
        MSO_AUTO_SHAPE_TYPE.ROUNDED_RECTANGLE, Inches(1.5), Inches(6.2), Inches(7), Inches(0.8)
    )
    quote_card.fill.solid()
    quote_card.fill.fore_color.rgb = ACCENT_GREEN
    quote_card.fill.transparency = 0.2
    quote_card.line.color.rgb = ACCENT_GREEN
    quote_card.line.width = Pt(1.5)
    
    quote_text = slide.shapes.add_textbox(Inches(1.8), Inches(6.35), Inches(6.4), Inches(0.7))
    quote_frame = quote_text.text_frame
    quote_frame.word_wrap = True
    p = quote_frame.paragraphs[0]
    p.text = "One app. Every campus. Transformative scale."
    p.font.name = 'Poppins'
    p.font.size = Pt(14)
    p.font.italic = True
    p.font.bold = True
    p.font.color.rgb = ACCENT_GREEN
    p.alignment = PP_ALIGN.CENTER
    
    return slide

if __name__ == "__main__":
    create_presentation()
