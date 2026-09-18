from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Recommendation
from .serializers import RecommendationSerializer
from .services import recalculate_user_recommendations
from apps.common.pagination import StandardPagination

class RecommendationListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.role != 'STUDENT':
            return Response({"success": False, "error": {"code": "FORBIDDEN", "message": "Recommendations are only available for Student accounts."}}, status=status.HTTP_403_FORBIDDEN)

        recs = Recommendation.objects.filter(user=user, job__status='PUBLISHED').select_related('job', 'job__company').order_by('-score')
        
        # If no recommendations exist yet, calculate on the fly
        if not recs.exists():
            recalculate_user_recommendations(user)
            recs = Recommendation.objects.filter(user=user, job__status='PUBLISHED').select_related('job', 'job__company').order_by('-score')

        # Optional minimum score filter
        min_score = request.query_params.get('min_score')
        if min_score:
            try:
                recs = recs.filter(score__gte=float(min_score))
            except ValueError:
                pass

        paginator = StandardPagination()
        page = paginator.paginate_queryset(recs, request)
        if page is not None:
            serializer = RecommendationSerializer(page, many=True, context={'request': request})
            response = paginator.get_paginated_response(serializer.data)
            response.data['recommendations'] = response.data.pop('results')
            return response

        return Response({"success": True, "count": recs.count(), "recommendations": RecommendationSerializer(recs, many=True, context={'request': request}).data})

    def post(self, request):
        recalculate_user_recommendations(request.user)
        recs = Recommendation.objects.filter(user=request.user, job__status='PUBLISHED').select_related('job', 'job__company').order_by('-score')
        return Response({"success": True, "message": "Recommendations updated.", "recommendations": RecommendationSerializer(recs, many=True, context={'request': request}).data})
