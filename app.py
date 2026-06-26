import os
import logging
import datetime
from flask import Flask, render_template, request, jsonify
import services_sheet

# Set up logging to track contact messages
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/contact', methods=['POST'])
def contact():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"status": "error", "message": "No data received."}), 400
        
        name = data.get('name', '').strip()
        email = data.get('email', '').strip()
        message = data.get('message', '').strip()
        
        if not name or not email or not message:
            return jsonify({"status": "error", "message": "Name, Email, and Message are required."}), 400
        
        # Log the message to the console
        logging.info(f"New Contact Message Received:\nName: {name}\nEmail: {email}\nMessage: {message}")
        
        # Save to a local text file log for safety
        os.makedirs('logs', exist_ok=True)
        with open('logs/submissions.txt', 'a', encoding='utf-8') as f:
            timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            f.write(f"[{timestamp}] Name: {name} | Email: {email} | Message: {message}\n")
        
        # -------------------------------------------------------------
        # FUTURE GOOGLE SHEETS DATABASE INTEGRATION REFERENCE
        # -------------------------------------------------------------
        # To connect to Google Sheets in the future, follow these steps:
        # 1. Go to Google Cloud Console and create a project.
        # 2. Enable the Google Drive and Google Sheets APIs.
        # 3. Create a Service Account, generate a JSON key, and save it in your project folder as 'credentials.json'.
        # 4. Share your Google Sheet with the client email found in 'credentials.json' (giving it Editor access).
        # 5. Uncomment the code block below:
        #
        # import gspread
        # from oauth2client.service_account import ServiceAccountCredentials
        #
        # scope = ["https://spreadsheets.google.com/feeds", 'https://www.googleapis.com/auth/spreadsheets',
        #          "https://www.googleapis.com/auth/drive.file", "https://www.googleapis.com/auth/drive"]
        #
        # creds = ServiceAccountCredentials.from_json_keyfile_name("credentials.json", scope)
        # client = gspread.authorize(creds)
        #
        # # Open the sheet by its name (make sure the name matches your Google Sheet name)
        # sheet = client.open("Ankit Yadav Portfolio Leads").sheet1
        #
        # # Append the data to the sheet (Row: Timestamp, Name, Email, Message)
        # timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        # sheet.append_row([timestamp, name, email, message])
        # -------------------------------------------------------------
        
        return jsonify({"status": "success", "message": "Thank you! Your message has been received."}), 200
        
    except Exception as e:
        logging.error(f"Error handling contact submission: {str(e)}")
        return jsonify({"status": "error", "message": "An internal error occurred. Please try again later."}), 500

@app.route('/api/services')
def get_services():
    try:
        # Check if refresh is requested
        refresh = request.args.get('refresh', 'false').lower() == 'true'
        services = services_sheet.get_services(refresh=refresh)
        return jsonify({"status": "success", "data": services}), 200
    except Exception as e:
        logging.error(f"Error serving services API: {str(e)}")
        return jsonify({"status": "error", "message": "Unable to load Services. Please try again later."}), 500

if __name__ == '__main__':
    # Start the server on host 0.0.0.0, port 5000
    app.run(debug=True, port=5000)
