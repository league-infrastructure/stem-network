#!/usr/bin/env python3
"""
Generate Appwrite collections and attributes dynamically from docs/data-model.mmd.
Source of truth: the Mermaid class diagram file.
"""

import os
import re
from pathlib import Path
from typing import Dict, Any

from appwrite.client import Client
from appwrite.services.databases import Databases
from appwrite.exception import AppwriteException


def parse_mermaid_model(mmd_path: str) -> Dict[str, Dict[str, Any]]:
    """
    Parse docs/data-model.mmd Mermaid class diagram and extract entity definitions.
    Returns a dict mapping entity names to their attributes with types and modifiers.
    """
    with open(mmd_path, 'r') as f:
        content = f.read()
    
    entities = {}
    
    # Parse class blocks: class ClassName { attributes }
    class_pattern = r'class\s+(\w+)\s*\{([^}]*)\}'
    
    for match in re.finditer(class_pattern, content, re.DOTALL):
        entity_name = match.group(1)
        attrs_block = match.group(2)
        
        attributes = {}
        # Parse individual attributes: +field_name: type or variants
        for line in attrs_block.split('\n'):
            line = line.strip()
            if not line or line.startswith('%'):
                continue
            
            # Format: +field_name: type or +field_name: type[]
            if ':' in line:
                field_part, type_part = line.split(':', 1)
                field_name = field_part.strip().lstrip('+')
                raw_type = type_part.strip()
                
                # Check for array type
                is_array = raw_type.endswith('[]')
                field_type = raw_type.rstrip('[]').strip()
                
                attributes[field_name] = {
                    'type': field_type,
                    'is_array': is_array,
                }
        
        if attributes:
            entities[entity_name] = attributes
    
    return entities


def map_type_to_appwrite(field_type: str) -> str:
    """Map Mermaid/domain type to Appwrite attribute type."""
    type_map = {
        'int': 'integer',
        'integer': 'integer',
        'string': 'string',
        'text': 'string',
        'richtext': 'string',
        'date': 'datetime',
        'datetime': 'datetime',
        'time': 'string',
        'boolean': 'boolean',
        'bool': 'boolean',
        'decimal': 'float',
        'float': 'float',
        'double': 'float',
        'email': 'email',
        'url': 'url',
        'enum': 'string',
        'media': 'string',  # URL reference to storage
    }
    return type_map.get(field_type.lower(), 'string')


def create_database_if_not_exists(databases: Databases, db_id: str):
    """Create the database if it doesn't exist."""
    try:
        databases.get(db_id)
        print(f"✓ Database '{db_id}' already exists")
    except AppwriteException as e:
        if e.code == 404:
            print(f"Creating database '{db_id}'...")
            databases.create(database_id=db_id, name='STEM Network Database')
            print(f"✓ Created database '{db_id}'")
        else:
            raise


def create_collection_if_not_exists(databases: Databases, db_id: str, collection_id: str, collection_name: str):
    """Create a collection if it doesn't exist."""
    try:
        databases.get_collection(db_id, collection_id)
        print(f"  ✓ Collection '{collection_name}' already exists")
        return True
    except AppwriteException as e:
        if e.code == 404:
            print(f"  Creating collection '{collection_name}'...")
            databases.create_collection(
                database_id=db_id,
                collection_id=collection_id,
                name=collection_name
            )
            return False
        else:
            raise


def create_attribute_if_not_exists(databases: Databases, db_id: str, collection_id: str, 
                                   field_name: str, appwrite_type: str, required: bool = False):
    """Create an attribute if it doesn't exist."""
    try:
        if appwrite_type == 'string':
            databases.create_string_attribute(
                database_id=db_id,
                collection_id=collection_id,
                key=field_name,
                size=4096,
                required=required,
            )
        elif appwrite_type == 'integer':
            databases.create_integer_attribute(
                database_id=db_id,
                collection_id=collection_id,
                key=field_name,
                required=required,
            )
        elif appwrite_type == 'float':
            databases.create_float_attribute(
                database_id=db_id,
                collection_id=collection_id,
                key=field_name,
                required=required,
            )
        elif appwrite_type == 'boolean':
            databases.create_boolean_attribute(
                database_id=db_id,
                collection_id=collection_id,
                key=field_name,
                required=required,
            )
        elif appwrite_type == 'datetime':
            databases.create_datetime_attribute(
                database_id=db_id,
                collection_id=collection_id,
                key=field_name,
                required=required,
            )
        elif appwrite_type == 'email':
            databases.create_email_attribute(
                database_id=db_id,
                collection_id=collection_id,
                key=field_name,
                required=required,
            )
        elif appwrite_type == 'url':
            databases.create_url_attribute(
                database_id=db_id,
                collection_id=collection_id,
                key=field_name,
                required=required,
            )
        print(f"    ✓ Attribute '{field_name}' ({appwrite_type})")
    except AppwriteException as e:
        if e.code != 400:  # 400 = attribute already exists
            raise


def pluralize(entity_name: str) -> str:
    """Simple pluralization for collection IDs."""
    # Special cases
    special = {
        'Person': 'persons',
        'Metro': 'metros',
        'Venue': 'venues',
        'Partner': 'partners',
        'Flyer': 'flyers',
        'Event': 'events',
        'Tag': 'tags',
        'Registration': 'registrations',
        'RSVP': 'rsvps',
        'InstructorAssignment': 'instructor_assignments',
        'InstructorEvaluation': 'instructor_evaluations',
        'EventPrototype': 'event_prototypes',
        'JobPosting': 'job_postings',
    }
    return special.get(entity_name, entity_name.lower() + 's')


# Initialize Appwrite client
client = Client()
client.set_endpoint(os.getenv('PUBLIC_APPWRITE_ENDPOINT', 'http://localhost:8080/v1'))
client.set_project(os.getenv('PUBLIC_APPWRITE_PROJECT_ID', 'jtl-stem-net'))
client.set_key(os.getenv('APPWRITE_API_KEY'))

databases = Databases(client)

# Database ID from environment
DATABASE_ID = os.getenv('APPWRITE_DATABASE_ID', 'stem_network_db')


def main():
    """Main entry point: parse mermaid model and create all collections."""
    # Get the path to the data model
    repo_root = Path(__file__).parent.parent.parent
    mmd_path = repo_root / 'docs' / 'data-model.mmd'
    
    if not mmd_path.exists():
        print(f"Error: {mmd_path} not found")
        return 1
    
    print(f"Reading data model from {mmd_path}")
    entities = parse_mermaid_model(str(mmd_path))
    
    if not entities:
        print("Error: No entities found in mermaid model")
        return 1
    
    print(f"Found {len(entities)} entities: {', '.join(entities.keys())}\n")
    
    # Create database
    create_database_if_not_exists(databases, DATABASE_ID)
    
    # Create collections and attributes for each entity
    for entity_name, attributes in entities.items():
        collection_id = pluralize(entity_name)
        collection_name = entity_name
        
        print(f"\n=== {entity_name} ===")
        created = create_collection_if_not_exists(databases, DATABASE_ID, collection_id, collection_name)
        
        # Only add attributes if collection was just created
        # (Appwrite doesn't let us query existing attributes, so we skip if collection exists)
        if created:
            for field_name, attr_info in attributes.items():
                appwrite_type = map_type_to_appwrite(attr_info['type'])
                # Skip 'id' field—Appwrite creates it automatically
                if field_name.lower() != 'id':
                    create_attribute_if_not_exists(
                        databases, DATABASE_ID, collection_id, 
                        field_name, appwrite_type, 
                        required=False
                    )
    
    print("\n✓ Setup complete!")
    return 0


if __name__ == '__main__':
    exit(main())
