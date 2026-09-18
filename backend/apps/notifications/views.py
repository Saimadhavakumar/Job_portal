from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Notification
from .serializers import NotificationSerializer
from apps.common.pagination import StandardPagination

class NotificationListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        notifs = Notification.objects.filter(user=request.user).select_related('job', 'job__company').order_by('-created_at')

        # Optional filter by type
        notif_type = request.query_params.get('type')
        if notif_type:
            notifs = notifs.filter(type=notif_type)

        # Optional filter for unread only
        unread_only = request.query_params.get('unread')
        if unread_only and unread_only.lower() in ('true', '1'):
            notifs = notifs.filter(is_read=False)

        unread_count = Notification.objects.filter(user=request.user, is_read=False).count()

        paginator = StandardPagination()
        page = paginator.paginate_queryset(notifs, request)
        if page is not None:
            serializer = NotificationSerializer(page, many=True, context={'request': request})
            response = paginator.get_paginated_response(serializer.data)
            response.data['notifications'] = response.data.pop('results')
            response.data['unread_count'] = unread_count
            return response

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
