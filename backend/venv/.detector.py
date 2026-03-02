import time
import os
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

# Specify the path you want to protect (The HoneyPot)
PROTECTED_DIRECTORY = r"C:\Users\deena\ZeroNa-Project\Protected_Files"

# Create the folder if it doesn't exist
if not os.path.exists(PROTECTED_DIRECTORY):
    os.makedirs(PROTECTED_DIRECTORY)

class RansomwareGuard(FileSystemEventHandler):
    def on_modified(self, event):
        if not event.is_directory:
            # Check for suspicious ransomware extensions
            if event.src_path.endswith(".locked") or event.src_path.endswith(".crypto"):
                print(f"!!! ALERT: SUSPICIOUS ENCRYPTION ATTEMPT: {event.src_path} !!!")
                # In the next step, we will trigger the React Dashboard red light here

def run_protection():
    event_handler = RansomwareGuard()
    observer = Observer()
    observer.schedule(event_handler, PROTECTED_DIRECTORY, recursive=False)
    observer.start()
    print(f"🛡️ ZeroNa Protection Active. Watching: {PROTECTED_DIRECTORY}")
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
    observer.join()

if __name__ == "__main__":
    run_protection()