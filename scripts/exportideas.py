#!/usr/bin/env python3

"""
Required python-dateutil
"""

import collections
import csv
from dateutil.parser import parse
import os
import pytz
from request_utils import download_all_pages
import requests
import sys


USERNAME = os.environ['USERNAME']
PASSWORD = os.environ['PASSWORD']

session = requests.Session()
session.auth = (USERNAME, PASSWORD)
session.headers = {'content-type': 'application/json', 'x-shareabouts-silent': 'true'}

# Update the DATASET_URL with the root URL of the dataset. There are a few ways
# you can find the root URL.
DATASET_URL = 'https://shareaboutsapi.poepublic.com/api/v2/somervillema/datasets/pb-cycle-1'

IDEAS_URL = DATASET_URL + '/places?include_private=True&include_invisible=True'
ET = pytz.timezone('US/Eastern')

# Load in the data
idea_pages = download_all_pages(IDEAS_URL, session=session)

# Transform the data
rows = []
fields = collections.OrderedDict([
    ('ID', lambda f: f['properties']['id']),
    ('Link', lambda f: 'https://pbsomervillema.poepublic.com/place/' + str(f['properties']['id'])),
    ('Submitted', lambda f: parse(f['properties']['created_datetime']).astimezone(ET).isoformat()[:19].replace('T', ' ')),
    ('Category', lambda f: f['properties']['location_type']),
    ('Idea', lambda f: f['properties']['idea']),
    ('Description', lambda f: f['properties']['description']),
    ('City-wide', lambda f: f['properties']['city_wide']),
    ('Comment count', lambda f: f['properties']['submission_sets'].get('comments', {}).get('length', 0)),
    ('Support count', lambda f: f['properties']['submission_sets'].get('support', {}).get('length', 0)),

    ('Longitude', lambda f: f['geometry']['coordinates'][0]),
    ('Latitude', lambda f: f['geometry']['coordinates'][1]),
    ('Near...', lambda f: f['properties'].get('location', '')),
    ('Hidden', lambda f: not f['properties']['visible']),

    ('Submitter', lambda f: f['properties'].get('submitter_name', '')),
    ('Email', 'private-email'),
    ('User token', 'user_token'),

    ('Already submitted personal info', 'private-completed_personal_info_survey'),
    ('Age', 'private-age'),
    ('Gender', 'private-gender'),
    ('Race/Ethnicity', lambda f: ', '.join(f['properties'].get('private-race_ethnicity')) if isinstance(f['properties'].get('private-race_ethnicity'), list) else f['properties'].get('private-race_ethnicity')),
    ('Diabled', 'private-disability'),
    ('Housing status', 'private-housing_status'),
])
for page in idea_pages:
    for feature in page['features']:
        row = {key: getter(feature) if callable(getter) else feature['properties'].get(getter, '') for key, getter in fields.items()}
        rows.append(row)

writer = csv.DictWriter(sys.stdout, fieldnames=fields.keys())
writer.writeheader()
writer.writerows(rows)
