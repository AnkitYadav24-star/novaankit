# Nova Ankit Portfolio - Web Application

Welcome to the official repository of **Ankit Yadav (Nova Ankit)** - Tech Solutions & Training Expert. This is a Flask-based dynamic portfolio application integrated with Google Sheets to serve and manage services, pricing, and new contact inquiries dynamically.

---

## 🚀 Features

- **Dynamic Services & Pricing**: Fetches real-time service listings from Google Sheets.
- **In-Memory Caching**: Caches services list data locally to optimize page load speeds and API limits.
- **Lead Capture Integration**: Contact form submissions are automatically pushed to Google Sheets (`Contact_Leads` worksheet).
- **Safety Lead Backup**: Lead submissions are written to local file logs under `logs/submissions.txt` in case Google Sheets API is temporarily unreachable.
- **Responsive Modern Design**: Elegant user interface configured with custom CSS styles, smooth transitions, and premium aesthetics.

---

## 🛠️ Tech Stack

- **Backend**: Python, [Flask (v3.0.3)](https://flask.palletsprojects.com/)
- **Frontend**: HTML5, Vanilla CSS3, JavaScript
- **Database & Integrations**: Google Sheets API via [gspread](https://github.com/burnash/gspread) & [oauth2client](https://github.com/googleapis/oauth2client)
- **Production Server**: Gunicorn (configured for production environments)

---

## ⚙️ Prerequisites

Before setting up the project locally, ensure you have:
1. **Python 3.8+** installed on your system.
2. A **Google Cloud Console Service Account** JSON file containing your Google Sheets API credentials.

---

## 💻 Local Setup & Installation

Follow these steps to run the application on your local machine:

### 1. Clone the Project
Navigate to the directory where you want to store the project and open your terminal:
```bash
git clone https://github.com/AnkitYadav24-star/novaankit.git
cd novaankit
```

### 2. Set Up a Virtual Environment (Recommended)
Creating a virtual environment ensures dependencies do not conflict with other Python projects on your machine.

**On Windows (Command Prompt / PowerShell):**
```powershell
python -m venv venv
venv\Scripts\activate
```

**On macOS / Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies
Install all required libraries using pip:
```bash
pip install -r requirements.txt
```

### 4. Setup Google Sheets Credentials
The application communicates with Google Sheets using credentials from your Google Cloud Project. 

#### Option A: Local File Configuration (e.g. for development)
1. Generate service account credentials in JSON format from the [Google Cloud Console](https://console.cloud.google.com/).
2. Rename the downloaded file to `portfolio.json`.
3. Place `portfolio.json` in the **root directory** of this project.
> [!NOTE]
> `portfolio.json` is already ignored in `.gitignore` to prevent committing your secret keys to GitHub.

#### Option B: Environment Variable Configuration (e.g. for production hosting like Render/Heroku)
Alternatively, you can set the JSON credential string in one of the following environment variables:
- `Google_Credencials`
- `Google_Credentials`
- `GOOGLE_CREDENTIALS`

---

## 📊 Google Sheets Configuration

The application is configured to connect to the spreadsheet key: `1AJwa8cO5H6AvMBo0t0msFtAgqEAfCI_mXPLaxdFnK6M`.

To support the app's features, ensure your spreadsheet contains the following sheets and structures:

### Sheet 1: `Services_Pricing`
This sheet lists the services you offer. The first row (headers) should contain:
- `Service_ID`
- `Catagory` (or `Category`)
- `Service_name`
- `Base_price`
- `Duration_estimated`
- `Deliverables`

### Sheet 2: `Contact_Leads`
This sheet collects messages and contact details from potential clients. The first row (headers) should contain:
- `Lead_ID`
- `Client_Name`
- `Client_Mail`
- `Service_Interested`
- `Budget_Range`
- `Requirement_details`
- `Lead_status`
- `Timestamp`

---

## 🏃 Running the Application

Once setup is complete, run the Flask development server:

```bash
python app.py
```

Upon successful startup, you will see output resembling:
```text
 * Serving Flask app 'app'
 * Debug mode: on
 * Running on http://127.0.0.1:5000
```

Open your browser and navigate to **`http://localhost:5000`** (or `http://127.0.0.1:5000`) to view and interact with the application.

---

## 📂 Project Structure

```text
├── app.py                  # Flask application entry point
├── services_sheet.py       # Google Sheets API helper (fetch services, save leads, caching)
├── portfolio.json          # Google Cloud Service Account Credentials (ignored by git)
├── requirements.txt        # Project python package dependencies
├── templates/
│   └── index.html          # Main web portfolio UI template
├── static/
│   ├── css/
│   │   └── style.css       # Custom styles
│   └── js/                 # Client-side scripts
└── logs/
    └── submissions.txt     # Safety backup logs of contact lead submissions
```
