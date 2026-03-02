import os, threading, time
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

app = FastAPI()

# 1. Allow Frontend Communication
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

# 2. State of the Organization's Security
org_status = {"status": "Secure", "threats": 0, "last_scan": "Active"}

class RansomwareMonitor(FileSystemEventHandler):
    def on_created(self, event):
        if event.src_path.endswith((".crypt", ".locked", ".encrypted")):
            global org_status
            org_status["status"] = "CRITICAL: RANSOMWARE DETECTED"
            org_status["threats"] += 1
            org_status["last_scan"] = f"Detected: {os.path.basename(event.src_path)}"

# 3. Background Monitoring Process
def start_monitor():
    path = "./org_data_vault" # Folder to protect
    if not os.path.exists(path): os.makedirs(path)
    observer = Observer()
    observer.schedule(RansomwareMonitor(), path, recursive=False)
    observer.start()
    while True: time.sleep(1)

threading.Thread(target=start_monitor, daemon=True).start()

# 4. API Endpoints for React
@app.get("/api/readiness")
async def get_readiness():
    return org_status

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)