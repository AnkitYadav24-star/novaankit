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
        
        client_name = data.get('client_name', '').strip()
        client_mail = data.get('client_mail', '').strip()
        service_interested = data.get('service_interested', '').strip()
        budget_range = data.get('budget_range', '').strip()
        requirement_details = data.get('requirement_details', '').strip()
        
        if not client_name or not client_mail or not service_interested or not requirement_details:
            return jsonify({
                "status": "error", 
                "message": "Name, Email, Service Interested, and Requirement Details are required."
            }), 400
            
        # Log to server console
        logging.info(f"New Lead Submission Received:\nName: {client_name}\nEmail: {client_mail}\nService: {service_interested}\nBudget: {budget_range}\nDetails: {requirement_details}")
        
        # Save to Google Sheets
        lead_id = services_sheet.save_contact_lead(data)
        
        # Save to a local text file log for safety backup
        os.makedirs('logs', exist_ok=True)
        with open('logs/submissions.txt', 'a', encoding='utf-8') as f:
            timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            f.write(f"[{timestamp}] ID: {lead_id} | Name: {client_name} | Email: {client_mail} | Service: {service_interested} | Budget: {budget_range} | Details: {requirement_details}\n")
        
        return jsonify({
            "status": "success", 
            "message": f"Thank you! Your inquiry has been successfully submitted (ID: {lead_id})."
        }), 200

        
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
        return jsonify({"status": "error", "message": f"Unable to load Services: {str(e)}"}), 500


if __name__ == '__main__':
    # Start the server on host 0.0.0.0, port 5000
    app.run(debug=True, port=5000)
