import os
import logging
import threading
import gspread
from oauth2client.service_account import ServiceAccountCredentials

# Setup logging
logger = logging.getLogger(__name__)

# Constants
CREDENTIALS_FILE = "portfolio.json"
SPREADSHEET_KEY = "1AJwa8cO5H6AvMBo0t0msFtAgqEAfCI_mXPLaxdFnK6M"
WORKSHEET_NAME = "Services_Pricing"

# In-memory cache variables
_cached_services = None
_cache_lock = threading.Lock()

def get_services(refresh=False):
    """
    Fetches the services and pricing data from Google Sheets.
    Caches the results in memory to minimize API calls.
    
    :param refresh: If True, bypasses the cache and forces a reload from Google Sheets.
    :returns: A list of dictionaries containing service details.
    """
    global _cached_services
    
    # Check cache first if refresh is not forced
    if not refresh:
        with _cache_lock:
            if _cached_services is not None:
                logger.info("Returning services from in-memory cache.")
                return _cached_services
                
    # Fetch from Google Sheets
    logger.info("Fetching services from Google Sheets...")
    try:
        scope = [
            "https://spreadsheets.google.com/feeds",
            "https://www.googleapis.com/auth/spreadsheets",
            "https://www.googleapis.com/auth/drive.file",
            "https://www.googleapis.com/auth/drive"
        ]
        
        # Verify credentials file exists
        if not os.path.exists(CREDENTIALS_FILE):
            raise FileNotFoundError(f"Credentials file '{CREDENTIALS_FILE}' not found. Please place it in the project root.")
            
        creds = ServiceAccountCredentials.from_json_keyfile_name(CREDENTIALS_FILE, scope)
        client = gspread.authorize(creds)
        
        # Open by key is direct and robust
        spreadsheet = client.open_by_key(SPREADSHEET_KEY)
        worksheet = spreadsheet.worksheet(WORKSHEET_NAME)
        
        # Get all records (uses first row as keys)
        raw_records = worksheet.get_all_records()
        
        # Clean and validate records
        services_list = []
        for index, record in enumerate(raw_records):
            # Clean fields
            service_id = str(record.get('Service_ID', '')).strip()
            category = str(record.get('Catagory', record.get('Category', ''))).strip()
            service_name = str(record.get('Service_name', '')).strip()
            base_price = str(record.get('Base_price', '')).strip()
            duration = str(record.get('Duration_estimated', '')).strip()
            deliverables = str(record.get('Deliverables', '')).strip()
            
            # Skip if critical fields are empty
            if not service_name or not category:
                logger.warning(f"Skipping record at row {index + 2} due to missing Service_name or Category.")
                continue
                
            services_list.append({
                "Service_ID": service_id,
                "Category": category,
                "Catagory": category,
                "Service_name": service_name,
                "Base_price": base_price,
                "Duration_estimated": duration,
                "Deliverables": deliverables
            })
            
        # Update cache under lock
        with _cache_lock:
            _cached_services = services_list
            
        logger.info(f"Successfully loaded and cached {len(services_list)} services.")
        return services_list
        
    except Exception as e:
        logger.error(f"Failed to fetch data from Google Sheets: {str(e)}")
        # If fetch fails, return cached data if available as a fallback, otherwise re-raise
        with _cache_lock:
            if _cached_services is not None:
                logger.warning("Returning stale cached data as fallback due to fetch failure.")
                return _cached_services
        raise e

def clear_cache():
    """Clears the in-memory cache."""
    global _cached_services
    with _cache_lock:
        _cached_services = None
    logger.info("Services cache cleared.")
