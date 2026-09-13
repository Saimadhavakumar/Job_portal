from rest_framework.views import exception_handler
from rest_framework.response import Response

def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)
    
    if response is not None:
        code = getattr(exc, 'default_code', 'API_ERROR')
        if isinstance(code, str):
            code = code.upper()
        else:
            code = 'VALIDATION_ERROR'

        message = response.data
        if isinstance(response.data, dict):
            if 'detail' in response.data:
                message = response.data['detail']
            else:
                # Format validation errors cleanly
                formatted_errors = []
                for field, errors in response.data.items():
                    if isinstance(errors, list):
                        formatted_errors.append(f"{field}: {' '.join([str(e) for e in errors])}")
                    else:
                        formatted_errors.append(f"{field}: {errors}")
                message = "; ".join(formatted_errors)
        elif isinstance(response.data, list):
            message = "; ".join([str(e) for e in response.data])

        response.data = {
            "success": False,
            "error": {
                "code": code,
                "message": str(message)
            }
        }
    return response
