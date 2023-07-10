import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import React, { useEffect, useRef, useState } from 'react';

function Hello() {
  // const [image, setImage] = useState<any>();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [log, setLog] = useState<string>('Nothing');
  useEffect(() => {
    setLog('useEffed Triggered');

    window.electron.ipcRenderer.on(
      'MAIN->CLIENT::image-captured',
      (event, imageFromMain: any) => {
        window.electron.ipcRenderer.sendMessage('ipc-example', ['on Inside']);
        setLog(`recieved on`);
        const imgData = new ImageData(
          new Uint8ClampedArray(imageFromMain.data),
          imageFromMain.cols,
          imageFromMain.rows
        );
        const canvas = canvasRef.current;
        if (canvas) {
          const context = canvas.getContext('2d');
          canvas.width = imgData.width;
          canvas.height = imgData.height;
          if (context) {
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.putImageData(imgData, 0, 0);
          }
        }
        imageFromMain.delete();
      }
    );
  }, []);

  return (
    <div>
      <h1>electron-react-boilerplate</h1>
      <canvas ref={canvasRef} id="outputCanvas" className="canvas" />
      <div>
        <h1 style={{ color: 'black' }}> {log} </h1>
      </div>
      <div className="Hello">
        {/* <img src={image} alt="캡쳐 이미지" /> */}
        <button
          type="button"
          onClick={() => {
            window.electron.ipcRenderer.sendMessage('ipc-example', ['ping']);
          }}
        >
          Ping
        </button>
        <a
          href="https://electron-react-boilerplate.js.org/"
          target="_blank"
          rel="noreferrer"
        >
          <button type="button">
            <span role="img" aria-label="books">
              📚
            </span>
            Read our docs
          </button>
        </a>
        <a
          href="https://github.com/sponsors/electron-react-boilerplate"
          target="_blank"
          rel="noreferrer"
        >
          <button type="button">
            <span role="img" aria-label="folded hands">
              🙏
            </span>
            Donate
          </button>
        </a>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Hello />} />
      </Routes>
    </Router>
  );
}
