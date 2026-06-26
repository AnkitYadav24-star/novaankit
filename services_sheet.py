import os
import json
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

def _get_credentials(scope):
    """
    Retrieves Google Service Account credentials.
    Priority:
    1. Local portfolio.json file.
    2. Environment variables (tries Google_Credencials, Google_Credentials, GOOGLE_CREDENTIALS).
    
    Raises FileNotFoundError if both are missing.
    """
    if os.path.exists(CREDENTIALS_FILE):
        logger.info(f"Loading credentials from local file '{CREDENTIALS_FILE}'...")
        return ServiceAccountCredentials.from_json_keyfile_name(CREDENTIALS_FILE, scope)
        
    # Check multiple variants for typo safety (c vs t, uppercase vs lowercase)
    env_keys = ["Google_Credencials", "Google_Credentials", "GOOGLE_CREDENTIALS"]
    env_creds = None
    matched_key = None
    
    for key in env_keys:
        val = os.environ.get(key)
        if val:
            env_creds = val
            matched_key = key
            break
            
    if env_creds:
        logger.info(f"Loading credentials from environment variable '{matched_key}'...")
        try:
            creds_dict = json.loads(env_creds)
            return ServiceAccountCredentials.from_json_keyfile_dict(creds_dict, scope)
        except Exception as e:
            logger.error(f"Failed to parse environment variable '{matched_key}' as JSON: {str(e)}")
            raise e
            
    # If both are missing, log and raise error
    err_msg = "Google_Credencials environment variable is missing."
    logger.error(err_msg)
    # Log detailed debug info about checked keys to server output
    logger.info(f"Checked local file: {CREDENTIALS_FILE} (Not Found)")
    logger.info(f"Checked environment variables: {', '.join(env_keys)} (None Found)")
    raise FileNotFoundError(err_msg)


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
        
        creds = _get_credentials(scope)
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

def save_contact_lead(lead_data):
    """
    Saves a contact lead to the Contact_Leads worksheet in Google Sheets.
    Auto-increments the Lead_ID.
    """
    logger.info("Saving contact lead to Google Sheets...")
    try:
        scope = [
            "https://spreadsheets.google.com/feeds",
            "https://www.googleapis.com/auth/spreadsheets",
            "https://www.googleapis.com/auth/drive.file",
            "https://www.googleapis.com/auth/drive"
        ]
        
        creds = _get_credentials(scope)
        client = gspread.authorize(creds)
        
        spreadsheet = client.open_by_key(SPREADSHEET_KEY)
        worksheet = spreadsheet.worksheet("Contact_Leads")
        
        # Calculate next Lead_ID
        records = worksheet.get_all_records()
        max_id = 0
        prefix = "LEAD-" # Default prefix if none is found
        padding = 3
        
        for r in records:
            lead_id_val = str(r.get('Lead_ID', '')).strip()
            if not lead_id_val:
                continue
            
            # Match formats like LEAD-001, LEAD-1, L-001, 12, etc.
            import re
            match = re.search(r'^(.*?)(\d+)$', lead_id_val)
            if match:
                pfx = match.group(1)
                num_str = match.group(2)
                val = int(num_str)
                if val > max_id:
                    max_id = val
                    prefix = pfx
                    padding = len(num_str)
            else:
                try:
                    val = int(lead_id_val)
                    if val > max_id:
                        max_id = val
                        prefix = ""
                        padding = 0
                except ValueError:
                    pass
        
        # Determine next ID
        next_num = max_id + 1
        if prefix or padding:
            next_id = f"{prefix}{str(next_num).zfill(padding)}"
        else:
            if max_id == 0:
                next_id = "LEAD-001"
            else:
                next_id = str(next_num)
                
        # Get lead fields
        client_name = lead_data.get('client_name', '').strip()
        client_mail = lead_data.get('client_mail', '').strip()
        service_interested = lead_data.get('service_interested', '').strip()
        budget_range = lead_data.get('budget_range', '').strip()
        requirement_details = lead_data.get('requirement_details', '').strip()
        lead_status = "New"
        
        import datetime
        timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        # Order of columns: Lead_ID, Client_Name, Client_Mail, Service_Interested, Budget_Range, Requirement_details, Lead_status, Timestamp
        row_to_append = [
            next_id,
            client_name,
            client_mail,
            service_interested,
            budget_range,
            requirement_details,
            lead_status,
            timestamp
        ]
        
        worksheet.append_row(row_to_append)
        logger.info(f"Successfully saved lead {next_id} to Contact_Leads.")
        return next_id
        
    except Exception as e:
        logger.error(f"Failed to save contact lead to Google Sheets: {str(e)}")
        raise e

