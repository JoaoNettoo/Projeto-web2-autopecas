import requests
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Pedido  

# token do bot e o chat_id do Telegram
BOT_TOKEN = '7398225580:AAG7hzSW_qY1st-s0SWcYrAMvFBEF255VcM'
CHAT_ID = '1153940186'

@receiver(post_save, sender=Pedido)
def notificar_pedido(sender, instance, created, **kwargs):
    if created:
        mensagem = f" Novo pedido criado!\nID: {instance.id}\nCliente: {instance.cliente_nome}\nTotal: {instance.total}"
        url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage"
        try:
            requests.post(url, data={'chat_id': CHAT_ID, 'text': mensagem})
        except Exception as e:
            print("Erro ao enviar mensagem Telegram:", e)
