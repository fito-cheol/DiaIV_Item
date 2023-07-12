import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import React, { useEffect, useRef, useState } from 'react';

let a = 1;
function logTmp(text: string) {
  window.electron.ipcRenderer.sendMessage('ipc-example', [text]);
}

function Hello() {
  // const [image, setImage] = useState<any>();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [log, setLog] = useState<string>('Nothing');
  useEffect(() => {
    setLog(`useEffed Triggered_${a}`);
    a += 1;

    // window.electron.ipcRenderer.on(
    //   'MAIN->CLIENT::image-captured',
    //   (event, imageFromMain: any) => {
    //     let logText = 'on Inside';
    //     setLog(`recieved on`);

    //     const url = URL.createObjectURL(imageFromMain.data);

    //     logTmp('0');
    //     // const imgData = new ImageData(
    //     //   imageFromMain.data,
    //     //   imageFromMain.width,
    //     //   imageFromMain.height
    //     // );
    //     logTmp('a');
    //     const canvas = canvasRef.current;
    //     logTmp('b');
    //     if (canvas) {
    //       logText += 'canvas Exist';
    //       logTmp('c');
    //       const context = canvas.getContext('2d');
    //       canvas.width = imageFromMain.width;
    //       canvas.height = imageFromMain.height;
    //       if (context) {
    //         logText += 'context Exist';

    //         // context.clearRect(0, 0, canvas.width, canvas.height);
    //         // context.putImageData(imgData, 0, 0);
    //         const img = new Image();
    //         img.onload = () => {
    //           context.drawImage(img, 0, 0);
    //         };
    //         img.src = url;
    //       }
    //     } else {
    //       logText += 'canvas Not Exist';
    //     }
    //     logTmp(logText);
    //     imageFromMain.delete();
    //   }
    // );
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
