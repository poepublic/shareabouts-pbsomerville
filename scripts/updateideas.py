#!/usr/bin/env python3

"""
Required python-dateutil
"""

import collections
import csv
from dateutil.parser import parse
import json
import os
import pytz
from request_utils import request_with_retries
import requests
import sys


USERNAME = os.environ['USERNAME']
PASSWORD = os.environ['PASSWORD']

session = requests.Session()
session.auth = (USERNAME, PASSWORD)
session.headers = {'content-type': 'application/json', 'x-shareabouts-silent': 'true'}

# Update the DATASET_URL with the root URL of the dataset. There are a few ways
# you can find the root URL.
DATASET_URL = os.environ['DATASET_URL']

IDEAS_BASE_URL = DATASET_URL + '/places'
URL_PARAMS = 'include_invisible=true'
ET = pytz.timezone('US/Eastern')

# Load the data from a CSV in stdin
reader = csv.DictReader(sys.stdin)
ID_COL = 'ID'
BALLOT_COL = 'Ballot?'

cache = {}

for row in reader:
    idea_id = row[ID_COL]
    is_on_ballot = row[BALLOT_COL].lower().strip() in ('true', 'ballot')

    # Some ideas show up as e.g. 677025.1, 677025.2, etc., so simplify it down
    # to the firt part.
    idea_id = idea_id.split('.')[0]
    if idea_id in cache:
        if is_on_ballot != cache[idea_id]:
            raise Exception(f'Idea {idea_id} has two different values for is_on_ballot.')
        print(f'Skipping previously seen idea {idea_id}', file=sys.stderr)
        continue
    else:
        cache[idea_id] = is_on_ballot

    feature = {
        'type': 'Feature',
        'id': idea_id,
        'properties': {
            'is_on_ballot': is_on_ballot,
        }
    }

    request_with_retries(
        method='patch',
        url=f'{IDEAS_BASE_URL}/{idea_id}?{URL_PARAMS}',
        session=session,
        json=feature,
    )
