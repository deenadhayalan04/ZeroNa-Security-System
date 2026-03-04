import os
import time
import math
import psutil
from flask import Flask, jsonify
from flask_cors import CORS
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

# 1. SETUP APP
app = Flask(__name__)
CORS(app) # Required so your frontend can talk to this backend

alerts = []

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