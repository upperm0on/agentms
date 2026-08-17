from django.shortcuts import render
from hq.models import Hostel
from django.contrib.auth.decorators import login_required
from user_auth.models import Account_status
from consumers.models import Consumer
from managers.models import Manager

from payments.models import Payment

from django.conf import settings

from ratings.models import (
    five_star,
    four_star,
    three_star,
    two_star,
    one_star
)

import json
from datetime import datetime, timedelta
@login_required(login_url='/authenticate/login')
def dashboard(request):
    context = {}
    template_name = "dashboard.html"

    # Initialize manager and consumer context
    context['is_manager'] = False
    context['consumer'] = None

    try: 
        # Check if the user is a manager
        manager = Manager.objects.filter(user=request.user).first()
        if manager:
            context['is_manager'] = True
            hostel = Hostel.objects.filter(manager=manager).first()

            if hostel: 
                context['hostel'] = hostel
                hostel_users = Consumer.objects.filter(hostel=hostel)

                # Prepare room prices from hostel details
                # room_prices = {str(room_data['number_in_room']): int(room_data['price']) for room_data in json.loads(hostel.room_details)}

                payments = Payment.objects.filter(consumer__hostel__manager=manager)

                total_revenue = 0
                for payment in payments: 
                    total_revenue += payment.amount

                context['total_revenue'] = total_revenue
                manager = Manager.objects.get(user=request.user)
                consumers = Consumer.objects.filter(hostel__manager=manager).all()


                context['hostel_consumers_number'] = consumers.count()
                context['consumers'] = consumers
                context['hostel_consumers'] = hostel_users

                context['media_url'] = settings.MEDIA_URL

                room_details = Hostel.objects.get(manager=manager).room_details
                room_details = json.loads(room_details)
                
                payment_data = Payment.objects.filter(consumer__hostel__manager=manager)
                
                # Prepare RevenueInsight by month (full month name)
                RevenueInsight = dict()
                current_year = datetime.now().year

                for data in payment_data:
                    month = data.timestamp.strftime("%B")
                    year = data.timestamp.year
                    key = f"{month} {year}"
                    RevenueInsight[key] = RevenueInsight.get(key, 0) + data.amount

                # Sort months chronologically
                sorted_months = sorted(RevenueInsight.keys(), key=lambda x: datetime.strptime(x, "%B %Y"))

                # Current and previous month info
                now = datetime.now()
                current_month = now.strftime("%B %Y")
                previous_month_date = (now.replace(day=1) - timedelta(days=1))
                previous_month = previous_month_date.strftime("%B %Y")

                current_month_earnings = RevenueInsight.get(current_month, 0)
                previous_month_earnings = RevenueInsight.get(previous_month, 0)

                # Year-to-date earnings and transaction count
                year_to_date_earnings = sum(
                    amt for k, amt in RevenueInsight.items() if k.endswith(str(current_year))
                )
                total_transactions = payment_data.count()

                # All-time earnings (sum of all payments)
                all_time_earnings = sum(RevenueInsight.values())

                # Total balance (assuming it's the same as all-time earnings for now)
                total_balance = all_time_earnings

                # Growth rate calculation (avoid division by zero)
                if previous_month_earnings > 0:
                    growth_rate = round(((current_month_earnings - previous_month_earnings) / previous_month_earnings) * 100, 2)
                else:
                    growth_rate = 0.0

                # Highest and lowest earning months
                if RevenueInsight:
                    highest_earning_month, highest_earning_amount = max(RevenueInsight.items(), key=lambda x: x[1])
                    lowest_earning_month, lowest_earning_amount = min(RevenueInsight.items(), key=lambda x: x[1])
                else:
                    highest_earning_month = highest_earning_amount = lowest_earning_month = lowest_earning_amount = 0

                # Last updated timestamp
                last_updated = payment_data.order_by('-timestamp').first().timestamp if payment_data.exists() else None

                # Pass to context
                context['current_month'] = now.strftime("%B")
                context['current_month_earnings'] = current_month_earnings
                context['previous_month'] = previous_month_date.strftime("%B")
                context['previous_month_earnings'] = previous_month_earnings
                context['year_to_date_earnings'] = year_to_date_earnings
                context['total_transactions'] = total_transactions
                context['growth_rate'] = growth_rate
                context['highest_earning_month'] = highest_earning_month if highest_earning_month else ""
                context['highest_earning_amount'] = highest_earning_amount if highest_earning_amount else 0
                context['lowest_earning_month'] = lowest_earning_month if lowest_earning_month else ""
                context['lowest_earning_amount'] = lowest_earning_amount if lowest_earning_amount else 0
                context['last_updated'] = last_updated
                context['all_time_earnings'] = all_time_earnings
                context['total_balance'] = total_balance



                total_rooms = 0
                for i, detail in enumerate(room_details):
                    i = 1
                    total_rooms += i

                context['total_rooms'] = total_rooms
                stars_list = [one_star, two_star, three_star, four_star, five_star]

                total_star = 0
                total_ratings_count = 0
            

                for i, star_model in enumerate(stars_list):
                    star_count = star_model.objects.filter(product=hostel).count()
                    total_star += star_count * (i + 1)
                    total_ratings_count += star_count

                total_rate = total_star / total_ratings_count if total_ratings_count > 0 else 0

                context['ratings'] = round(total_rate, 1)
                filtered_consumers_dict = dict()
                for detail in room_details: 
                    filtered_consumers = consumers.filter(room_uuid=detail.get('uuid')).count()
                    filtered_consumers_dict[detail['number_in_room']] = filtered_consumers

                    
                context['filtered_consumers_dict'] = json.dumps(filtered_consumers_dict)
            else: 
                context['err'] = "You do not have any hostel"

                
    except Manager.DoesNotExist:
        pass  # Not a manager

    try:
        # Check if the user is a consumer
        consumer = Consumer.objects.filter(user=request.user).first()
        if consumer:
            context['consumer'] = consumer
    except Consumer.DoesNotExist:
        pass  # Not a consumer

    # Recommended hostels for non-consumers
    if not context['consumer']:
        hostels = Hostel.objects.all().order_by('-ratings')
        context['hostels'] = hostels

    return render(request, template_name, context)


def landingPage(request): 
    template_name = "landingPage.html"
    context = {}
    return render(request, template_name, context)