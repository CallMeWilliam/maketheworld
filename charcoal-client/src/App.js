import React, { useState, useEffect } from 'react';
import './App.css';

function App({ webSocketOverride = null }) {

  const [webSocket, setWebSocket] = useState(webSocketOverride)

  useEffect(() => {
      if (!webSocket) {
        let setupSocket = new WebSocket('wss://m3j0brmd23.execute-api.us-east-1.amazonaws.com/Prod')
        setupSocket.onopen = () => {
          console.log('WebSocket Client Connected')
        }
        setupSocket.onmessage = (message) => {
          console.log(message)
        }
        setWebSocket(setupSocket)
      }
  }, [webSocket, setWebSocket])
  return (
    <div className="App">
      <header className="App-header">
        Test of WebSockets
      </header>
    </div>
  );
}

export default App;
