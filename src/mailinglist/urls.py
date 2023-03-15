from django.conf.urls import url
from . import views

urlpatterns = [
    url(r'^subscribe$', views.subscribe, name='mailinglist_subscribe'),
]
