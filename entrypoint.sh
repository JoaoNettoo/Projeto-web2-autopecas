#!/bin/bash
# espera por possíveis serviços (não necessário pro sqlite, mas útil)
python manage.py migrate --noinput
# opcional: coletar staticfiles se usar
# python manage.py collectstatic --noinput
gunicorn autopecas.wsgi:application --bind 0.0.0.0:8000
