#!/usr/bin/env python3
"""
Create all collections and attributes for the STEM Network data model in Appwrite.
Based on docs/data-model.mmd
"""

import os
from appwrite.client import Client
from appwrite.services.databases import Databases
from appwrite.id import ID
from appwrite.exception import AppwriteException

# Initialize Appwrite client
client = Client()
client.set_endpoint(os.getenv('PUBLIC_APPWRITE_ENDPOINT', 'http://localhost:8080/v1'))
client.set_project(os.getenv('PUBLIC_APPWRITE_PROJECT_ID', 'jtl-stem-net'))
client.set_key(os.getenv('APPWRITE_API_KEY'))

databases = Databases(client)

# Database ID from environment
DATABASE_ID = os.getenv('APPWRITE_DATABASE_ID', 'stem_network_db')

def create_database_if_not_exists():
    """Create the database if it doesn't exist"""
    try:
        result = databases.get(DATABASE_ID)
        print(f"✓ Database '{DATABASE_ID}' already exists")
        return result
    except AppwriteException as e:
        if e.code == 404:
            print(f"Creating database '{DATABASE_ID}'...")
            result = databases.create(
                database_id=DATABASE_ID,
                name='STEM Network Database'
            )
            print(f"✓ Created database '{DATABASE_ID}'")
            return result
        else:
            raise

def create_collection(collection_id, name):
    """Create a collection if it doesn't exist"""
    try:
        result = databases.get_collection(DATABASE_ID, collection_id)
        print(f"  ✓ Collection '{name}' already exists")
        return result
    except AppwriteException as e:
        if e.code == 404:
            print(f"  Creating collection '{name}'...")
            result = databases.create_collection(
                database_id=DATABASE_ID,
                collection_id=collection_id,
                name=name
            )
            print(f"  ✓ Created collection '{name}'")
            return result
        else:
            raise

def create_attribute(collection_id, key, attr_type, **kwargs):
    """Create an attribute if it doesn't exist"""
    try:
        # Try to create the attribute
        if attr_type == 'string':
            databases.create_string_attribute(
                database_id=DATABASE_ID,
                collection_id=collection_id,
                key=key,
                size=kwargs.get('size', 255),
                required=kwargs.get('required', False),
                default=kwargs.get('default'),
                array=kwargs.get('array', False)
            )
        elif attr_type == 'integer':
            databases.create_integer_attribute(
                database_id=DATABASE_ID,
                collection_id=collection_id,
                key=key,
                required=kwargs.get('required', False),
                default=kwargs.get('default'),
                array=kwargs.get('array', False)
            )
        elif attr_type == 'float':
            databases.create_float_attribute(
                database_id=DATABASE_ID,
                collection_id=collection_id,
                key=key,
                required=kwargs.get('required', False),
                default=kwargs.get('default'),
                array=kwargs.get('array', False)
            )
        elif attr_type == 'boolean':
            databases.create_boolean_attribute(
                database_id=DATABASE_ID,
                collection_id=collection_id,
                key=key,
                required=kwargs.get('required', False),
                default=kwargs.get('default'),
                array=kwargs.get('array', False)
            )
        elif attr_type == 'datetime':
            databases.create_datetime_attribute(
                database_id=DATABASE_ID,
                collection_id=collection_id,
                key=key,
                required=kwargs.get('required', False),
                default=kwargs.get('default'),
                array=kwargs.get('array', False)
            )
        elif attr_type == 'enum':
            databases.create_enum_attribute(
                database_id=DATABASE_ID,
                collection_id=collection_id,
                key=key,
                elements=kwargs.get('elements', []),
                required=kwargs.get('required', False),
                default=kwargs.get('default'),
                array=kwargs.get('array', False)
            )
        elif attr_type == 'email':
            databases.create_email_attribute(
                database_id=DATABASE_ID,
                collection_id=collection_id,
                key=key,
                required=kwargs.get('required', False),
                default=kwargs.get('default'),
                array=kwargs.get('array', False)
            )
        elif attr_type == 'url':
            databases.create_url_attribute(
                database_id=DATABASE_ID,
                collection_id=collection_id,
                key=key,
                required=kwargs.get('required', False),
                default=kwargs.get('default'),
                array=kwargs.get('array', False)
            )
        print(f"    ✓ Created attribute '{key}' ({attr_type})")
    except AppwriteException as e:
        if e.code == 409:  # Attribute already exists
            print(f"    - Attribute '{key}' already exists")
        else:
            print(f"    ✗ Error creating attribute '{key}': {e.message}")

def setup_person_collection():
    """Create Person collection and attributes"""
    print("\n=== Person Collection ===")
    create_collection('persons', 'Persons')
    
    create_attribute('persons', 'first_name', 'string', size=255, required=True)
    create_attribute('persons', 'last_name', 'string', size=255, required=False)
    create_attribute('persons', 'email', 'email', required=False)
    create_attribute('persons', 'phone', 'string', size=50, required=False)
    create_attribute('persons', 'date_of_birth', 'datetime', required=False)
    create_attribute('persons', 'sex', 'enum', elements=['male', 'female', 'other', 'prefer_not_to_say'], required=False)
    create_attribute('persons', 'grade', 'string', size=50, required=False)
    create_attribute('persons', 'school', 'string', size=255, required=False)
    create_attribute('persons', 'bio', 'string', size=5000, required=False)
    create_attribute('persons', 'photo', 'string', size=255, required=False)  # URL to storage
    create_attribute('persons', 'is_adult', 'boolean', required=False, default=False)
    create_attribute('persons', 'login_enabled', 'boolean', required=False, default=False)
    create_attribute('persons', 'background_check_status', 'enum', 
                    elements=['not_started', 'pending', 'approved', 'rejected'], required=False)
    create_attribute('persons', 'volunteer_tier', 'enum',
                    elements=['none', 'tier1', 'tier2', 'tier3'], required=False)
    create_attribute('persons', 'total_events', 'integer', required=False, default=0)
    create_attribute('persons', 'open_to_employment', 'boolean', required=False, default=False)
    create_attribute('persons', 'specializations', 'string', size=100, array=True, required=False)
    create_attribute('persons', 'metro_id', 'string', size=255, required=False)

def setup_metro_collection():
    """Create Metro collection and attributes"""
    print("\n=== Metro Collection ===")
    create_collection('metros', 'Metros')
    
    create_attribute('metros', 'name', 'string', size=255, required=True)
    create_attribute('metros', 'slug', 'string', size=255, required=True)
    create_attribute('metros', 'coordinator_email', 'email', required=False)
    create_attribute('metros', 'short_url_domain', 'string', size=255, required=False)

def setup_venue_collection():
    """Create Venue collection and attributes"""
    print("\n=== Venue Collection ===")
    create_collection('venues', 'Venues')
    
    create_attribute('venues', 'name', 'string', size=255, required=True)
    create_attribute('venues', 'address', 'string', size=500, required=False)
    create_attribute('venues', 'parking_instructions', 'string', size=2000, required=False)
    create_attribute('venues', 'building_entry_instructions', 'string', size=2000, required=False)
    create_attribute('venues', 'capacity', 'integer', required=False)
    create_attribute('venues', 'has_computers', 'boolean', required=False, default=False)
    create_attribute('venues', 'metro_id', 'string', size=255, required=True)
    create_attribute('venues', 'partner_id', 'string', size=255, required=False)

def setup_partner_collection():
    """Create Partner collection and attributes"""
    print("\n=== Partner Collection ===")
    create_collection('partners', 'Partners')
    
    create_attribute('partners', 'name', 'string', size=255, required=True)
    create_attribute('partners', 'partner_type', 'enum', 
                    elements=['school', 'library', 'community_center', 'business', 'other'], required=False)
    create_attribute('partners', 'website', 'url', required=False)
    create_attribute('partners', 'contact_email', 'email', required=False)
    create_attribute('partners', 'can_deliver_events', 'boolean', required=False, default=False)
    create_attribute('partners', 'can_host_events', 'boolean', required=False, default=False)
    create_attribute('partners', 'metro_id', 'string', size=255, required=True)

def setup_flyer_collection():
    """Create Flyer collection and attributes"""
    print("\n=== Flyer Collection ===")
    create_collection('flyers', 'Flyers')
    
    create_attribute('flyers', 'name', 'string', size=255, required=True)
    create_attribute('flyers', 'distribution_date', 'datetime', required=False)
    create_attribute('flyers', 'distribution_count', 'integer', required=False, default=0)
    create_attribute('flyers', 'design_file', 'string', size=255, required=False)  # URL to storage
    create_attribute('flyers', 'utm_source', 'string', size=100, required=False)
    create_attribute('flyers', 'utm_campaign', 'string', size=100, required=False)
    create_attribute('flyers', 'total_reach', 'integer', required=False, default=0)

def setup_job_posting_collection():
    """Create JobPosting collection and attributes"""
    print("\n=== JobPosting Collection ===")
    create_collection('job_postings', 'Job Postings')
    
    create_attribute('job_postings', 'title', 'string', size=255, required=True)
    create_attribute('job_postings', 'description', 'string', size=10000, required=False)  # richtext
    create_attribute('job_postings', 'hourly_rate', 'string', size=100, required=False)
    create_attribute('job_postings', 'hours_per_week', 'string', size=100, required=False)
    create_attribute('job_postings', 'requirements', 'string', size=5000, required=False)
    create_attribute('job_postings', 'status', 'enum',
                    elements=['draft', 'open', 'closed', 'filled'], required=False, default='draft')
    create_attribute('job_postings', 'posted_date', 'datetime', required=False)
    create_attribute('job_postings', 'partner_id', 'string', size=255, required=True)
    create_attribute('job_postings', 'metro_id', 'string', size=255, required=True)

def setup_event_collection():
    """Create Event collection and attributes"""
    print("\n=== Event Collection ===")
    create_collection('events', 'Events')
    
    create_attribute('events', 'slug', 'string', size=255, required=True)
    create_attribute('events', 'title', 'string', size=255, required=True)
    create_attribute('events', 'blurb', 'string', size=500, required=False)
    create_attribute('events', 'short_description', 'string', size=2000, required=False)
    create_attribute('events', 'description', 'string', size=10000, required=False)
    create_attribute('events', 'instructions', 'string', size=5000, required=False)
    create_attribute('events', 'enroll', 'string', size=5000, required=False)
    create_attribute('events', 'event_date', 'datetime', required=False)
    create_attribute('events', 'start_time', 'string', size=20, required=False)  # time as string
    create_attribute('events', 'end_time', 'string', size=20, required=False)    # time as string
    create_attribute('events', 'capacity', 'integer', required=False)
    create_attribute('events', 'available_slots', 'integer', required=False)
    create_attribute('events', 'registration_type', 'enum',
                    elements=['open', 'waitlist', 'closed', 'invite_only'], required=False, default='open')
    create_attribute('events', 'status', 'enum',
                    elements=['draft', 'published', 'cancelled', 'completed'], required=False, default='draft')
    create_attribute('events', 'walk_in_count', 'integer', required=False, default=0)
    create_attribute('events', 'page_views', 'integer', required=False, default=0)
    create_attribute('events', 'register_clicks', 'integer', required=False, default=0)
    create_attribute('events', 'reference', 'string', size=255, required=False)
    create_attribute('events', 'metro_id', 'string', size=255, required=True)
    create_attribute('events', 'venue_id', 'string', size=255, required=True)
    create_attribute('events', 'partner_id', 'string', size=255, required=False)
    create_attribute('events', 'prototype_id', 'string', size=255, required=False)

def setup_event_prototype_collection():
    """Create EventPrototype collection and attributes"""
    print("\n=== EventPrototype Collection ===")
    create_collection('event_prototypes', 'Event Prototypes')
    
    # Inherits all fields from Event, so same structure
    create_attribute('event_prototypes', 'slug', 'string', size=255, required=True)
    create_attribute('event_prototypes', 'title', 'string', size=255, required=True)
    create_attribute('event_prototypes', 'blurb', 'string', size=500, required=False)
    create_attribute('event_prototypes', 'short_description', 'string', size=2000, required=False)
    create_attribute('event_prototypes', 'description', 'string', size=10000, required=False)
    create_attribute('event_prototypes', 'instructions', 'string', size=5000, required=False)
    create_attribute('event_prototypes', 'enroll', 'string', size=5000, required=False)

def setup_tag_collection():
    """Create Tag collection and attributes"""
    print("\n=== Tag Collection ===")
    create_collection('tags', 'Tags')
    
    create_attribute('tags', 'name', 'string', size=255, required=True)
    create_attribute('tags', 'slug', 'string', size=255, required=True)

def setup_registration_collection():
    """Create Registration collection and attributes"""
    print("\n=== Registration Collection ===")
    create_collection('registrations', 'Registrations')
    
    create_attribute('registrations', 'registration_source', 'enum',
                    elements=['website', 'phone', 'email', 'partner', 'walk_in', 'other'], required=False)
    create_attribute('registrations', 'utm_source', 'string', size=100, required=False)
    create_attribute('registrations', 'utm_campaign', 'string', size=100, required=False)
    create_attribute('registrations', 'notes', 'string', size=5000, required=False)
    create_attribute('registrations', 'event_id', 'string', size=255, required=True)
    create_attribute('registrations', 'registrant_id', 'string', size=255, required=True)

def setup_rsvp_collection():
    """Create RSVP collection and attributes"""
    print("\n=== RSVP Collection ===")
    create_collection('rsvps', 'RSVPs')
    
    create_attribute('rsvps', 'role', 'enum',
                    elements=['student', 'parent', 'volunteer', 'instructor', 'observer'], required=False)
    create_attribute('rsvps', 'relationship', 'enum',
                    elements=['self', 'parent', 'guardian', 'sibling', 'friend', 'other'], required=False)
    create_attribute('rsvps', 'attended', 'boolean', required=False, default=False)
    create_attribute('rsvps', 'checked_in_at', 'datetime', required=False)
    create_attribute('rsvps', 'notes', 'string', size=5000, required=False)
    create_attribute('rsvps', 'registration_id', 'string', size=255, required=True)
    create_attribute('rsvps', 'event_id', 'string', size=255, required=True)
    create_attribute('rsvps', 'attendee_id', 'string', size=255, required=True)
    create_attribute('rsvps', 'guardian_id', 'string', size=255, required=False)

def setup_instructor_assignment_collection():
    """Create InstructorAssignment collection and attributes"""
    print("\n=== InstructorAssignment Collection ===")
    create_collection('instructor_assignments', 'Instructor Assignments')
    
    create_attribute('instructor_assignments', 'role', 'enum',
                    elements=['lead', 'assistant', 'volunteer'], required=False)
    create_attribute('instructor_assignments', 'employment_type', 'enum',
                    elements=['employee', 'contractor', 'volunteer'], required=False)
    create_attribute('instructor_assignments', 'hourly_rate', 'float', required=False)
    create_attribute('instructor_assignments', 'is_volunteer', 'boolean', required=False, default=False)
    create_attribute('instructor_assignments', 'confirmed', 'boolean', required=False, default=False)
    create_attribute('instructor_assignments', 'hours_worked', 'float', required=False, default=0.0)
    create_attribute('instructor_assignments', 'event_id', 'string', size=255, required=True)
    create_attribute('instructor_assignments', 'instructor_id', 'string', size=255, required=True)
    create_attribute('instructor_assignments', 'employer_id', 'string', size=255, required=False)

def setup_instructor_evaluation_collection():
    """Create InstructorEvaluation collection and attributes"""
    print("\n=== InstructorEvaluation Collection ===")
    create_collection('instructor_evaluations', 'Instructor Evaluations')
    
    create_attribute('instructor_evaluations', 'technical_skills', 'integer', required=False)
    create_attribute('instructor_evaluations', 'teaching_ability', 'integer', required=False)
    create_attribute('instructor_evaluations', 'reliability', 'integer', required=False)
    create_attribute('instructor_evaluations', 'student_engagement', 'integer', required=False)
    create_attribute('instructor_evaluations', 'notes', 'string', size=5000, required=False)
    create_attribute('instructor_evaluations', 'potential_hire', 'boolean', required=False, default=False)
    create_attribute('instructor_evaluations', 'instructor_assignment_id', 'string', size=255, required=True)
    create_attribute('instructor_evaluations', 'evaluator_id', 'string', size=255, required=True)

def main():
    """Main setup function"""
    print("🚀 Setting up Appwrite collections for STEM Network")
    print(f"Endpoint: {client.endpoint}")
    print(f"Project: {client.headers['x-appwrite-project']}")
    print(f"Database: {DATABASE_ID}")
    
    # Create database
    create_database_if_not_exists()
    
    # Create all collections
    setup_metro_collection()
    setup_venue_collection()
    setup_partner_collection()
    setup_person_collection()
    setup_flyer_collection()
    setup_job_posting_collection()
    setup_event_prototype_collection()
    setup_event_collection()
    setup_tag_collection()
    setup_registration_collection()
    setup_rsvp_collection()
    setup_instructor_assignment_collection()
    setup_instructor_evaluation_collection()
    
    print("\n✅ Setup complete!")
    print("\nNote: Many-to-many relationships (e.g., Event-Tag, Event-Flyer) will need")
    print("junction collections or should be handled via relationship attributes.")

if __name__ == '__main__':
    main()
