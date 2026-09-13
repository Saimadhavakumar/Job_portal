from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Notification
from .serializers import NotificationSerializer

class NotificationListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        notifs = Notification.objects.filter(user=request.user).select_related('job', 'job__company').order_by('-created_at')
        unread_count = notifs.filter(is_read=False).count()
        return Response({
            "success": True,
            "unread_count": unread_count,
            "notifications": NotificationSerializer(notifs, many=True, context={'request': request}).data
        })

class NotificationMarkReadView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, id):
        try:
            notif = Notification.objects.get(id=id, user=request.user)
            notif.is_read = True
            notif.save()
            return Response({"success": True, "message": "Notification marked as read."})
        except Notification.DoesNotExist:
            return Response({"success": False, "error": {"code": "NOT_FOUND", "message": "Notification not found."}}, status=status.HTTP_404_NOT_FOUND)

class NotificationMarkAllReadView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
        return Response({"success": True, "message": "All notifications marked as read."})
