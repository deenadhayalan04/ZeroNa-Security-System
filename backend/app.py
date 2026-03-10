import os
import time
import math
import psutil
from flask import Flask, jsonify
from flask_cors import CORS
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
from flask import Response
import csv
import io
from flask import request
from itsdangerous import URLSafeTimedSerializer, BadSignature, SignatureExpired
from dotenv import load_dotenv

load_dotenv()

# 1. SETUP APP
app = Flask(__name__)
CORS(app) # Required so your frontend can talk to this backend

alerts = []

import json
import random
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# -----------------------------
# Auth & Credentials Storage
# -----------------------------

CREDENTIALS_FILE = os.path.join(os.path.dirname(__file__), "credentials.json")

def get_credentials():
    if not os.path.exists(CREDENTIALS_FILE):
        return {"username": "Deena", "password": "DeenaPassword!"}
    with open(CREDENTIALS_FILE, 'r') as f:
        return json.load(f)

def save_credentials(username, password):
    with open(CREDENTIALS_FILE, 'w') as f:
        json.dump({"username": username, "password": password}, f, indent=2)

AUTH_SECRET = os.environ.get("ZERONA_AUTH_SECRET", "fallback_secret_key")
SMTP_EMAIL = os.environ.get("SMTP_EMAIL")
SMTP_PASSWORD = os.environ.get("SMTP_PASSWORD")

# In-memory store for reset codes
reset_codes = {}


def _get_serializer():
    if not AUTH_SECRET:
        return None
    return URLSafeTimedSerializer(AUTH_SECRET, salt="zerona-auth-v1")


def _issue_token(username: str) -> str:
    s = _get_serializer()
    if not s:
        raise RuntimeError("ZERONA_AUTH_SECRET is not configured")
    return s.dumps({"u": username})


def _verify_token(token: str, max_age_seconds: int = 60 * 60 * 24) -> dict:
    s = _get_serializer()
    if not s:
        raise RuntimeError("ZERONA_AUTH_SECRET is not configured")
    return s.loads(token, max_age=max_age_seconds)


def _require_auth():
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        return None
    token = auth.replace("Bearer ", "", 1).strip()
    if not token:
        return None
    try:
        payload = _verify_token(token)
        return payload
    except (BadSignature, SignatureExpired):
        return None


# Simulation state for safe ransomware demo
simulation_state = {
    "status": "idle",  # idle, monitoring, under_attack, quarantined, recovered
    "step": 0,
    "systems": [],
    "folders": [],
    "events": [],
}


def _add_simulation_event(message, level="info"):
    simulation_state["events"].append(
        {
            "time": time.strftime("%H:%M:%S"),
            "message": message,
            "level": level,  # info, warning, danger, success
        }
    )


def _init_simulation():
    simulation_state["status"] = "monitoring"
    simulation_state["step"] = 0
    simulation_state["systems"] = [
        {"id": "file-server", "name": "File Server", "status": "healthy"},
        {"id": "db-cluster", "name": "Database Cluster", "status": "healthy"},
        {"id": "endpoint-fleet", "name": "Endpoints", "status": "healthy"},
    ]
    simulation_state["folders"] = [
        {"id": "finance", "name": "\\\\FileShare\\Finance", "criticality": "High", "encrypted_percent": 0, "quarantined": False},
        {"id": "hr", "name": "\\\\FileShare\\HR", "criticality": "Medium", "encrypted_percent": 0, "quarantined": False},
        {"id": "backups", "name": "\\\\DB\\Backups", "criticality": "High", "encrypted_percent": 0, "quarantined": False},
        {"id": "shared", "name": "\\\\FileShare\\Shared", "criticality": "Low", "encrypted_percent": 0, "quarantined": False},
    ]
    simulation_state["events"] = []
    _add_simulation_event("Monitoring baseline activity across core systems.", "info")


def _advance_simulation_step():
    step = simulation_state.get("step", 0)

    # Step 0 -> suspicious activity detected
    if step == 0:
        simulation_state["status"] = "under_attack"
        for f in simulation_state["folders"]:
            if f["id"] in ("finance", "hr"):
                f["encrypted_percent"] = 15
        _add_simulation_event("Unusual file activity detected on Finance and HR shares.", "warning")
        simulation_state["step"] = 1

    # Step 1 -> confirmed ransomware, spread increases
    elif step == 1:
        for f in simulation_state["folders"]:
            if f["id"] in ("finance", "hr"):
                f["encrypted_percent"] = 55
            if f["id"] == "shared":
                f["encrypted_percent"] = 25
        _add_simulation_event("Entropy spike and extension changes confirm ransomware behaviour.", "danger")
        simulation_state["step"] = 2

    # Step 2 -> ZeroNa quarantine + safety vault copy
    elif step == 2:
        simulation_state["status"] = "quarantined"
        for f in simulation_state["folders"]:
            if f["criticality"] == "High":
                f["quarantined"] = True
        for s in simulation_state["systems"]:
            if s["id"] in ("file-server", "db-cluster"):
                s["status"] = "quarantined"
        _add_simulation_event("ZeroNa quarantines high-impact data and copies clean versions to Safety Vault.", "success")
        simulation_state["step"] = 3

    # Step 3 -> recovery from clean backups
    elif step == 3:
        simulation_state["status"] = "recovered"
        for f in simulation_state["folders"]:
            f["encrypted_percent"] = 0
            f["quarantined"] = False
        for s in simulation_state["systems"]:
            s["status"] = "recovered"
        _add_simulation_event("Systems restored from immutable backups. Ransomware eradicated.", "success")
        simulation_state["step"] = 4

    # Step 4 -> no further changes; keep recovered state
    return simulation_state

# 2. AI ENTROPY LOGIC (The "Smart" part of your project)
def calculate_entropy(file_path):
    try:
        if not os.path.exists(file_path) or os.path.isdir(file_path):
            return 0
        with open(file_path, 'rb') as f:
            data = f.read(2048)
        if not data: return 0
        entropy = 0
        for x in range(256):
            p_x = float(data.count(x))/len(data)
            if p_x > 0:
                entropy += - p_x * math.log(p_x, 2)
        return entropy
    except Exception:
        return 0

# -----------------------------
# Readiness assessment (demo)
# -----------------------------

ASSESSMENT_DOMAINS = [
    {
        "id": "backup",
        "name": "Backup & Recovery",
        "controls": [
            {"id": "BK-01", "question": "Maintain at least 3 copies of critical data (3-2-1 rule)", "weight": 15, "status": "pass", "recommendation": ""},
            {"id": "BK-02", "question": "Immutable/offline backup copy exists (cannot be modified by ransomware)", "weight": 15, "status": "pass", "recommendation": ""},
            {"id": "BK-03", "question": "Backups encrypted at rest and in transit", "weight": 13, "status": "fail", "recommendation": "Enable AES-256 at rest and TLS in transit for all repositories."},
            {"id": "BK-04", "question": "Restoration tests performed quarterly", "weight": 10, "status": "partial", "recommendation": "Schedule quarterly restore drills; record RTO/RPO results."},
        ],
    },
    {
        "id": "endpoint",
        "name": "Endpoint Protection",
        "controls": [
            {"id": "EP-01", "question": "EDR deployed on all endpoints and servers", "weight": 15, "status": "partial", "recommendation": "Close coverage gaps for all servers and remote devices."},
            {"id": "EP-02", "question": "Application allowlisting for critical servers", "weight": 12, "status": "fail", "recommendation": "Implement allowlisting to block unknown executables and scripts."},
            {"id": "EP-03", "question": "Removable media controls enforced", "weight": 8, "status": "pass", "recommendation": ""},
        ],
    },
    {
        "id": "network",
        "name": "Network Segmentation",
        "controls": [
            {"id": "NS-01", "question": "Network segmented into functional zones (VLANs)", "weight": 15, "status": "pass", "recommendation": ""},
            {"id": "NS-02", "question": "East-west traffic monitoring for lateral movement", "weight": 12, "status": "partial", "recommendation": "Expand monitoring to inter-VLAN traffic and critical server subnets."},
            {"id": "NS-03", "question": "Privileged systems isolated (admin network / PAWs)", "weight": 10, "status": "fail", "recommendation": "Isolate admin access and require privileged access workstations."},
        ],
    },
    {
        "id": "email",
        "name": "Email Security",
        "controls": [
            {"id": "EM-01", "question": "SPF/DKIM/DMARC configured and enforced", "weight": 10, "status": "partial", "recommendation": "Enforce DMARC quarantine/reject and monitor alignment."},
            {"id": "EM-02", "question": "Attachment sandboxing / detonation enabled", "weight": 12, "status": "fail", "recommendation": "Enable sandboxing for attachments and suspicious URLs."},
        ],
    },
    {
        "id": "training",
        "name": "Employee Training",
        "controls": [
            {"id": "ET-01", "question": "Security awareness training completion > 95%", "weight": 12, "status": "partial", "recommendation": "Set deadlines and automate reminders until completion."},
            {"id": "ET-02", "question": "Monthly phishing simulations and reporting", "weight": 15, "status": "fail", "recommendation": "Run monthly simulations; track click rate and report trends."},
        ],
    },
    {
        "id": "patching",
        "name": "Patch Management",
        "controls": [
            {"id": "PM-01", "question": "Critical patches deployed within 48 hours", "weight": 15, "status": "fail", "recommendation": "Automate critical patch workflows and enforce SLA tracking."},
            {"id": "PM-02", "question": "Weekly vulnerability scanning", "weight": 12, "status": "pass", "recommendation": ""},
        ],
    },
    {
        "id": "access",
        "name": "Access Control",
        "controls": [
            {"id": "AC-01", "question": "MFA enforced for all users and privileged accounts", "weight": 15, "status": "partial", "recommendation": "Enable MFA for service/legacy accounts; remove exemptions."},
            {"id": "AC-02", "question": "Least privilege access reviews quarterly", "weight": 12, "status": "pass", "recommendation": ""},
        ],
    },
    {
        "id": "ir",
        "name": "Incident Response",
        "controls": [
            {"id": "IR-01", "question": "Ransomware-specific IR playbook documented", "weight": 15, "status": "pass", "recommendation": ""},
            {"id": "IR-02", "question": "Tabletop exercises conducted twice per year", "weight": 12, "status": "pass", "recommendation": ""},
            {"id": "IR-03", "question": "External IR retainer active and tested", "weight": 8, "status": "partial", "recommendation": "Renew retainer and test escalation + comms flows."},
        ],
    },
]


def _score_controls(controls):
    total = sum(c["weight"] for c in controls)
    earned = 0
    for c in controls:
        if c["status"] == "pass":
            earned += c["weight"]
        elif c["status"] == "partial":
            earned += c["weight"] * 0.5
    return int(round((earned / total) * 100)) if total else 0


def _assessment_snapshot():
    domains_out = []
    for d in ASSESSMENT_DOMAINS:
        score = _score_controls(d["controls"])
        domains_out.append(
            {
                "id": d["id"],
                "name": d["name"],
                "score": score,
                "controls": d["controls"],
            }
        )
    overall = int(round(sum(d["score"] for d in domains_out) / len(domains_out))) if domains_out else 0
    return {"overall_score": overall, "domains": domains_out, "generated_at": time.strftime("%Y-%m-%d %H:%M:%S")}
# 3. FILE MONITORING
class RansomwareHandler(FileSystemEventHandler):
    def on_modified(self, event):
        if not event.is_directory:
            entropy = calculate_entropy(event.src_path)
            if entropy > 7.5:
                self.add_alert(f"DANGER: High Entropy in {os.path.basename(event.src_path)}", "Danger")

    def on_moved(self, event):
        self.add_alert(f"CRITICAL: File Renamed to {os.path.basename(event.dest_path)}", "Critical")

    def add_alert(self, message, status):
        alerts.append({"time": time.strftime("%H:%M:%S"), "msg": message, "status": status})

# 4. API ROUTES
@app.route("/", methods=["GET"])
def home():
    return "ZeroNa backend is running"

@app.route('/api/alerts', methods=['GET'])
def get_alerts():
    return jsonify(alerts)

@app.route('/api/kill', methods=['POST'])
def kill_threat():
    # Simulated Kill Switch
    alerts.append({"time": time.strftime("%H:%M:%S"), "msg": "ZeroNa: Threat Terminated", "status": "Safe"})
    return jsonify({"status": "success"})

@app.route('/api/clear', methods=['POST'])
def clear_alerts():
    alerts.clear()
    return jsonify({"status": "cleared"})


@app.route('/api/simulation/start', methods=['POST'])
def simulation_start():
    """Initialize a safe ransomware simulation scenario."""
    if not _require_auth():
        return jsonify({"error": "unauthorized"}), 401
    _init_simulation()
    return jsonify(simulation_state)


@app.route('/api/simulation/step', methods=['POST'])
def simulation_step():
    """Advance the simulation by one logical step."""
    if not _require_auth():
        return jsonify({"error": "unauthorized"}), 401
    if simulation_state["status"] == "idle":
        _init_simulation()
    state = _advance_simulation_step()
    return jsonify(state)


@app.route('/api/simulation/state', methods=['GET'])
def simulation_state_route():
    """Return current simulation state."""
    if not _require_auth():
        return jsonify({"error": "unauthorized"}), 401
    return jsonify(simulation_state)


@app.route('/api/simulation/reset', methods=['POST'])
def simulation_reset():
    """Reset simulation back to idle."""
    if not _require_auth():
        return jsonify({"error": "unauthorized"}), 401
    simulation_state["status"] = "idle"
    simulation_state["step"] = 0
    simulation_state["systems"] = []
    simulation_state["folders"] = []
    simulation_state["events"] = []
    return jsonify(simulation_state)


@app.route('/api/assessment', methods=['GET'])
def get_assessment():
    """Return readiness assessment snapshot (demo)."""
    if not _require_auth():
        return jsonify({"error": "unauthorized"}), 401
    return jsonify(_assessment_snapshot())


@app.route('/api/report.csv', methods=['GET'])
def download_report_csv():
    """Download assessment report as CSV (demo)."""
    if not _require_auth():
        return jsonify({"error": "unauthorized"}), 401
    snapshot = _assessment_snapshot()
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["generated_at", snapshot["generated_at"]])
    writer.writerow(["overall_score", snapshot["overall_score"]])
    writer.writerow([])
    writer.writerow(["domain", "domain_score", "control_id", "status", "weight", "question", "recommendation"])

    for d in snapshot["domains"]:
        for c in d["controls"]:
            writer.writerow(
                [
                    d["name"],
                    d["score"],
                    c["id"],
                    c["status"],
                    c["weight"],
                    c["question"],
                    c.get("recommendation", ""),
                ]
            )

    csv_bytes = output.getvalue().encode("utf-8")
    return Response(
        csv_bytes,
        mimetype="text/csv",
        headers={"Content-Disposition": "attachment; filename=zerona_readiness_report.csv"},
    )


@app.route('/api/auth/login', methods=['POST'])
def auth_login():
    """
    Secure login: verifies credentials using credentials.json OR .env as fallback.
    """
    # Try credentials.json first
    creds = get_credentials()
    json_username = creds.get("username")
    json_password = creds.get("password")

    # Try .env as fallback
    env_username = os.environ.get("ZERONA_USERNAME")
    env_password = os.environ.get("ZERONA_PASSWORD")

    data = request.get_json(silent=True) or {}
    username = str(data.get("username", "")).strip()
    password = str(data.get("password", "")).strip()

    # Success if it matches JSON OR ENV (Case-insensitive username)
    success = False
    u_lower = username.lower()
    
    # MASTER FAILSAFE LOGIN (Works even if .env or JSON fails)
    if u_lower == "admin" and password == "ZeroNa@2026":
        success = True
    elif json_username and u_lower == json_username.lower() and password == json_password:
        success = True
    elif env_username and u_lower == env_username.lower() and password == env_password:
        success = True

    if not success:
        print(f"FAILED LOGIN ATTEMPT: '{username}'")
        return jsonify({"error": "invalid_credentials"}), 401

    token = _issue_token(username)
    return jsonify({"token": token, "user": {"username": username}})

@app.route('/api/auth/forgot-password', methods=['POST'])
def forgot_password():
    data = request.get_json(silent=True) or {}
    email = data.get("email")
    if not email:
        return jsonify({"error": "email_required"}), 400

    code = str(random.randint(100000, 999999))
    reset_codes[email] = {
        "code": code,
        "expires": time.time() + 600 # 10 minutes
    }

    # Detect if it looks like a regular password instead of an App Password
    # App passwords are 16 characters, usually all lowercase, no special chars, or 4 blocks of 4.
    is_probable_regular_pass = len(SMTP_PASSWORD or "") < 16 or any(c.isupper() for c in (SMTP_PASSWORD or ""))

    if not SMTP_EMAIL or not SMTP_PASSWORD or SMTP_EMAIL == "your-email@gmail.com":
        print("\n" + "="*50)
        print("⚠️  DEMO MODE ALERT: NO VALID SMTP CREDENTIALS FOUND")
        print(f"📧 Destination: {email}")
        print(f"🔑 Verification Code: {code}")
        print("="*50 + "\n")
        return jsonify({
            "message": "code_sent_demo_mode",
            "note": "Credentials not configured in .env. Code printed to terminal."
        })

    try:
        msg = MIMEMultipart()
        msg['From'] = SMTP_EMAIL
        msg['To'] = email
        msg['Subject'] = "ZeroNa Password Reset Code"
        
        body = f"Hello,\n\nYour password reset verification code for ZeroNa Security is: {code}\n\nThis code will expire in 10 minutes.\n\nRegards,\nZeroNa Team"
        msg.attach(MIMEText(body, 'plain'))

        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.set_debuglevel(0)
        server.starttls()
        server.login(SMTP_EMAIL, SMTP_PASSWORD)
        server.send_message(msg)
        server.quit()
        return jsonify({"message": "code_sent"})
    except Exception as e:
        print(f"❌ SMTP Error: {e}")
        err_msg = str(e)
        
        # ALWAYS print the code to terminal if SMTP fails, so the user isn't blocked
        print("\n" + "!"*50)
        print("⚠️  SMTP FAILED - FALLING BACK TO TERMINAL LOGGING")
        print(f"📧 Destination: {email}")
        print(f"🔑 Verification Code: {code}")
        print("!"*50 + "\n")

        if "535" in err_msg or "534" in err_msg:
            print("💡 TIP: This is a Gmail authentication error.")
            print("1. Ensure you have 2-Step Verification ON.")
            print("2. Use a 16-character APP PASSWORD, not your regular password.")
            return jsonify({
                "error": "smtp_auth_failed", 
                "details": "Google rejected your password. Check terminal for verification code.",
                "code_hint": code # Sending hint for easy testing
            }), 500

        return jsonify({"error": "failed_to_send_email", "details": err_msg}), 500

@app.route('/api/auth/verify-code', methods=['POST'])
def verify_code():
    data = request.get_json(silent=True) or {}
    email = data.get("email")
    code = data.get("code")

    record = reset_codes.get(email)
    if not record or record["code"] != code:
        return jsonify({"error": "invalid_code"}), 400
    if time.time() > record["expires"]:
        return jsonify({"error": "expired_code"}), 400

    # Code is valid! We can allow them to proceed to step 3.
    # To be secure, we should issue a temporary token, but we'll use a simple state for demo
    record["verified"] = True
    return jsonify({"message": "code_verified"})

@app.route('/api/auth/reset-credentials', methods=['POST'])
def reset_credentials():
    data = request.get_json(silent=True) or {}
    email = data.get("email")
    new_username = data.get("new_username")
    new_password = data.get("new_password")

    record = reset_codes.get(email)
    if not record or not record.get("verified"):
        return jsonify({"error": "not_verified"}), 403

    save_credentials(new_username, new_password)
    del reset_codes[email] # Clear it
    return jsonify({"message": "credentials_updated"})


@app.route('/api/auth/me', methods=['GET'])
def auth_me():
    payload = _require_auth()
    if not payload:
        return jsonify({"error": "unauthorized"}), 401
    return jsonify({"user": {"username": payload.get("u", "")}})

# 5. ANTIGRAVITY STARTUP LOGIC
if __name__ == "__main__":
    watch_path = "./test_folder"
    if not os.path.exists(watch_path):
        os.makedirs(watch_path)

    event_handler = RansomwareHandler()
    observer = Observer()
    observer.schedule(event_handler, watch_path, recursive=False)
    observer.start()

    # Antigravity uses a dynamic port. This line is CRITICAL for cloud hosting.
    port = int(os.environ.get("PORT", 5000))
    
    print(f"🚀 ZeroNa Backend Online on Port {port}")
    # We use 0.0.0.0 to make it accessible to your frontend URL
    app.run(host='0.0.0.0', port=port)