# Market Data Generation

This script generates realistic market data (stores, commodities, and entrepreneurs) for the marketplace app.

## Overview

The script generates:
- **40 Stores** with realistic names and descriptions
- **15-25 Commodities per store** (mix of products and services)
- **Entrepreneurs** linking existing users (who belong to hostels) to stores

## Requirements

- Django project must be set up
- Database must have users (preferably users with Consumer records linked to hostels)
- Python 3.x with Django installed

## Usage

### Method 1: Run as Django Shell Script

```bash
cd /home/barimah/projects/hostel
python manage.py shell < generate_market_data.py
```

### Method 2: Run Directly (if Django is configured)

```bash
cd /home/barimah/projects/hostel
python generate_market_data.py
```

### Method 3: Import and Run in Django Shell

```bash
cd /home/barimah/projects/hostel
python manage.py shell
```

Then in the shell:
```python
exec(open('generate_market_data.py').read())
```

## Output

The script generates a file called `market_fixtures.json` in the project root directory.

## Loading Data into Database

After generating the JSON file, load it into Django using:

```bash
python manage.py loaddata market_fixtures.json
```

## Data Structure

### Stores
- Name: Realistic store names (e.g., "TechHub Electronics", "Campus Services")
- Description: Store descriptions
- Location: Campus locations (KNUST, UG, UCC, UEW, UENR, etc.)

### Commodities
Each store has 15-25 commodities:
- **Products** (60%): Electronics, Furniture, Clothing, Books, Food items
- **Services** (40%): Academic services, Design services, Tech services, Personal services, Delivery services

Each commodity includes:
- Name
- Description
- Type (product or service)
- Price (realistic price ranges)

### Entrepreneurs
- Links existing users (who have Consumer records with hostels) to stores
- Automatically populates location from user's hostel campus
- If no users with hostels are found, uses any available users

## Notes

- The script automatically queries for users who belong to hostels (via Consumer model)
- If no users with hostels are found, it attempts to use any available users
- Store names are unique
- Commodity names are unique within each store
- Prices are randomly generated within realistic ranges for each product/service category

## Troubleshooting

### No Users Found
If you get a warning about no users found:
1. Create some users in the database first
2. Optionally create Consumer records linking users to hostels
3. Re-run the script

### Foreign Key Errors
If you get foreign key errors when loading:
- Make sure the user IDs in the fixture match existing users in your database
- You may need to adjust user IDs in the JSON file manually

### Duplicate Key Errors
If you get duplicate key errors:
- Clear existing stores/commodities/entrepreneurs from the database
- Or modify the script to use different PK ranges


