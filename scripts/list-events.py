#!/usr/bin/env python3
"""
CLI tool to list events from Appwrite
"""

import os
from appwrite.client import Client
from appwrite.services.databases import Databases
from appwrite.query import Query

# Initialize Appwrite client
client = Client()
client.set_endpoint(os.getenv('PUBLIC_APPWRITE_ENDPOINT', 'http://localhost:8080/v1'))
client.set_project(os.getenv('PUBLIC_APPWRITE_PROJECT_ID', 'jtl-stem-net'))
client.set_key(os.getenv('APPWRITE_API_KEY'))

databases = Databases(client)

# Database ID from environment
DATABASE_ID = os.getenv('APPWRITE_DATABASE_ID', 'stem_network_db')

def format_date(date_str):
    """Format ISO date to readable format"""
    if not date_str:
        return 'No date'
    from datetime import datetime
    dt = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
    return dt.strftime('%Y-%m-%d')

def list_events():
    """List all events from the database"""
    try:
        result = databases.list_documents(
            database_id=DATABASE_ID,
            collection_id='events',
            queries=[
                Query.order_desc('event_date'),
                Query.limit(100)
            ]
        )
        
        events = result['documents']
        
        if not events:
            print("No events found.")
            return
        
        print(f"\n{'='*80}")
        print(f"Found {len(events)} event(s)")
        print(f"{'='*80}\n")
        
        for event in events:
            print(f"ID: {event['$id']}")
            print(f"Title: {event.get('title', 'Untitled')}")
            if event.get('slug'):
                print(f"Slug: {event['slug']}")
            if event.get('blurb'):
                print(f"Blurb: {event['blurb']}")
            print(f"Date: {format_date(event.get('event_date'))}")
            if event.get('start_time'):
                print(f"Time: {event['start_time']}", end='')
                if event.get('end_time'):
                    print(f" - {event['end_time']}")
                else:
                    print()
            if event.get('capacity'):
                print(f"Capacity: {event['capacity']}")
            print(f"Status: {event.get('status', 'draft')}")
            print(f"Registration: {event.get('registration_type', 'open')}")
            print(f"Created: {format_date(event.get('$createdAt'))}")
            print(f"{'-'*80}\n")
            
    except Exception as e:
        print(f"Error listing events: {e}")
        return 1

if __name__ == '__main__':
    import sys
    sys.exit(list_events() or 0)
