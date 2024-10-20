from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
import json
from .chatbot_utils import get_portfolio_data, generate_response, preprocess_input

@csrf_exempt
@require_POST
def chat(request):
    try:
        data = json.loads(request.body)
        user_message = data.get('message', '')

        # Preprocess user input
        processed_input = preprocess_input(user_message)

        # Get portfolio data
        portfolio_data = get_portfolio_data()

        # Generate response
        response = generate_response(processed_input, portfolio_data)

        return JsonResponse({'message': response})
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)