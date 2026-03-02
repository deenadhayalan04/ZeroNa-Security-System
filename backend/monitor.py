import time
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
import math

# CONFIGURATION
MONITOR_PATH = "./my_files" # Folder to protect
THRESHOLD_FILES = 10        # Number of files modified
TIME_WINDOW = 2             # In seconds

class ZeroNaHandler(FileSystemEventHandler):
    def __init__(self):
        self.history = []

    def on_modified(self, event):
        if not event.is_directory:
            current_time = time.time()
            self.history.append(current_time)
            
            # Remove old events outside the time window
            self.history = [t for t in self.history if current_time - t <= TIME_WINDOW]
            
            if len(self.history) > THRESHOLD_FILES:
                print(f"⚠️ ALERT: Suspicious Activity! {len(self.history)} files changed in {TIME_WINDOW}s")
                # Trigger Offline Alert here (e.g., win10toast)

# START THE MONITOR
event_handler = ZeroNaHandler()
observer = Observer()
observer.schedule(event_handler, MONITOR_PATH, recursive=True)
observer.start()
try:
    while True:
        time.sleep(1)
except KeyboardInterrupt:
    observer.stop()
observer.join()