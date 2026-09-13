from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Company
from .serializers import CompanySerializer
from apps.common.permissions import IsAdminUser

class CompanyListView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        companies = Company.objects.all().order_by('name')
        search = request.query_params.get('search')
        if search:
            companies = companies.filter(name__icontains=search)
        return Response({"success": True, "companies": CompanySerializer(companies, many=True).data})

    def post(self, request):
        if not (request.user and request.user.is_authenticated and (request.user.role == 'ADMIN' or request.user.is_staff)):
            return Response({"success": False, "error": {"code": "FORBIDDEN", "message": "Only administrators can create companies."}}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = CompanySerializer(data=request.data)
        if serializer.is_valid():
            company = serializer.save()
            return Response({"success": True, "company": CompanySerializer(company).data}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CompanyDetailView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, slug):
        try:
            company = Company.objects.get(slug=slug)
            return Response({"success": True, "company": CompanySerializer(company).data})
        except Company.DoesNotExist:
            return Response({"success": False, "error": {"code": "NOT_FOUND", "message": "Company not found."}}, status=status.HTTP_404_NOT_FOUND)

    def put(self, request, slug):
        if not (request.user and request.user.is_authenticated and (request.user.role == 'ADMIN' or request.user.is_staff)):
            return Response({"success": False, "error": {"code": "FORBIDDEN", "message": "Only administrators can edit companies."}}, status=status.HTTP_403_FORBIDDEN)
        try:
            company = Company.objects.get(slug=slug)
            serializer = CompanySerializer(company, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response({"success": True, "company": serializer.data})
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Company.DoesNotExist:
            return Response({"success": False, "error": {"code": "NOT_FOUND", "message": "Company not found."}}, status=status.HTTP_404_NOT_FOUND)
