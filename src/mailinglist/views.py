import json
import logging
import os
from django.forms import Form, EmailField
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
# import mailchimp_marketing as MailchimpMarketing
# from mailchimp_marketing.api_client import ApiClientError
import requests

logger = logging.getLogger(__name__)

class SubscribeForm(Form):
    email = EmailField()

    def subscribe(self):
        if 'MAILCHIMP_API_KEY' not in os.environ:
            return False, 'MAILCHIMP_API_KEY not set'
        if 'MAILCHIMP_SERVER_PREFIX' not in os.environ:
            return False, 'MAILCHIMP_SERVER_PREFIX not set'
        if 'MAILCHIMP_LIST_ID' not in os.environ:
            return False, 'MAILCHIMP_LIST_ID not set'

        mc_prefix = os.environ["MAILCHIMP_SERVER_PREFIX"]
        mc_api_key = os.environ["MAILCHIMP_API_KEY"]
        mc_list_id = os.environ["MAILCHIMP_LIST_ID"]

        email = self.cleaned_data['email']

        # # The following code is adapted from the Mailchimp Marketing API docs:
        # # https://mailchimp.com/developer/marketing/api/list-members/add-member-to-list/
        # try:
        #     client = MailchimpMarketing.Client()
        #     client.set_config({
        #         "api_key": os.environ['MAILCHIMP_API_KEY'],
        #         "server": os.environ['MAILCHIMP_SERVER_PREFIX'],
        #     })
        #     response = client.lists.add_list_member(
        #         os.environ['MAILCHIMP_LIST_ID'],
        #         {"email_address": email, "status": "unsubscribed"}
        #     )
        #     return True, response

        # except ApiClientError as error:
        #     return False, error.text
        response = requests.post(
            f'https://{mc_prefix}.api.mailchimp.com/3.0/lists/{mc_list_id}/members?skip_merge_validation=true',
            auth=('anystring', mc_api_key),
            headers={'Content-Type': 'application/json'},
            data=json.dumps({
                'email_address': email,
                'status': 'subscribed',
            }),
        )

        # One reason we could get a 400 response is because the email address
        # is already subscribed. Let's treat that like a successful result.
        if response.status_code == 400 and response.json()['title'] == 'Member Exists':
            return True, response.json()

        return response.ok, response.json()


@csrf_exempt
def subscribe(request):
    if request.method == 'POST':
        form = SubscribeForm(request.POST)
        if not form.is_valid():
            logger.error(
                'Invalid subscription form data: %s\n%s',
                json.dumps(form.errors),
                json.dumps(request.POST.dict()),
                extra={
                    'fingerprint': ['invalid-subscription-form-data'],
                },
            )
            return JsonResponse(form.errors, status=400)

        success, response_json = form.subscribe()
        if success:
            return JsonResponse({}, status=201)
        else:
            logger.error(
                'Error from mailchimp:\nresponse %s\nrequest%s',
                json.dumps(response_json),
                json.dumps(request.POST.dict()),
                extra={
                    'fingerprint': ['mailchimp-error'],
                },
            )
            return JsonResponse({}, status=500)

    else:
        # Only allow POST requests
        return JsonResponse({}, status=405)
