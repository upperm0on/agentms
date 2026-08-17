from .models import Notification


def create_notification(*, audience: str, title: str, body: str, tone: str = "neutral", recipient=None, link_url: str = "", metadata=None):
    return Notification.objects.create(
        recipient=recipient,
        audience=audience,
        title=title,
        body=body,
        tone=tone,
        link_url=link_url,
        metadata=metadata or {},
    )
