import { io } from "socket.io-client";
const socket = io("http://localhost:3001");

function App() {
  // ... existing states ...

  useEffect(() => {
    socket.on("security-alert", (data) => {
      setNewAlert(data.msg);
      setAlerts(prev => [data, ...prev]);
    });
    return () => socket.off("security-alert");
  }, []);

  return (
    <div className="app-layout">
      <nav className="side-nav">
        <div className="logo">ZN</div>
        <button className="nav-item active">🏠</button>
        <button className="nav-item">📷</button>
        <button className="nav-item">🛡️</button>
        <button className="nav-item">⚙️</button>
      </nav>

      <main className="content-area">
        {/* Your existing dashboard-container code goes here */}
      </main>
    </div>
  );
}