from django.urls import path
from .views import create_reservation, delete_reservation
from hq.reservations_views import initiate_reservation_payment, verify_reservation_payment, list_user_reservations

urlpatterns = [
    path('create/', create_reservation, name='create_reservation'),
    path('delete/<int:reservation_id>/', delete_reservation, name='delete_reservation'),
    path('payment/initiate/', initiate_reservation_payment, name='initiate_reservation_payment'),
    path('payment/verify/', verify_reservation_payment, name='verify_reservation_payment'),
    path('list/', list_user_reservations, name='list_user_reservations'),
]