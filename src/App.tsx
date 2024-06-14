import React, { useCallback } from 'react';
import './App.css';
import { useState } from 'react';
import Dropzone, { DropzoneState } from 'react-dropzone'

function App() {
  const cv = (window as any).cv;

  const [urls, setUrls] = useState<string[]>([]);

  function onDrop(files: File[]) {
    if (files) {
      setUrls(files.map(file => URL.createObjectURL(file)));
    }
    return;
  }

  function readGraph() {
    console.log(urls);
    if (urls.length < 0) {
      console.log("画像を入力してください");
      return;
    }
    const img = new Image();
    img.src = urls[0];
    img.onload = function () {
      console.log("Image loaded");
      img.height = 240;
      img.width = img.naturalWidth * (240 / img.naturalHeight);
      const imageMat = cv.imread(img);

      const hsvMat = new cv.Mat();
      cv.cvtColor(imageMat, hsvMat, cv.COLOR_RGB2HSV_FULL, 0);
      const minMat_a = cv.matFromArray(1, 3, cv.CV_8UC1, [0, 64, 0]);
      const maxMat_a = cv.matFromArray(1, 3, cv.CV_8UC1, [30, 255, 255]);
      const minMat_b = cv.matFromArray(1, 3, cv.CV_8UC1, [150, 64, 0]);
      const maxMat_b = cv.matFromArray(1, 3, cv.CV_8UC1, [179, 255, 255]);
      const redMask_a = new cv.Mat();
      const redMask_b = new cv.Mat();
      cv.inRange(hsvMat, minMat_a, maxMat_a, redMask_a);
      console.log("Created mask_a");
      cv.inRange(hsvMat, minMat_b, maxMat_b, redMask_b);
      console.log("Created mask_b");
      const redMask = new cv.Mat();
      cv.bitwise_or(redMask_a, redMask_b, redMask);
      console.log("Created mask");

      const maskedMat = new cv.Mat();
      cv.bitwise_and(hsvMat, redMask, maskedMat);

      cv.imshow(`output`, hsvMat);

      /*
      imageMat.delete();
      hsvMat.delete();
      minMat_a.delete();
      maxMat_a.delete();
      minMat_b.delete();
      maxMat_b.delete();
      redMask_a.delete();
      redMask_b.delete();
      redMask.delete();
      maskedMat.delete();
      */
    }
  }

  return (
    <>
      <div className='dropzone'>
        <Dropzone onDrop={onDrop}>
          {({ getRootProps, getInputProps }: DropzoneState) => (
            <div {...getRootProps()}>
              <input {...getInputProps()} />
              <p>ここにファイルをドロップ、またはクリックしてファイルを選択</p>
            </div>
          )}
        </Dropzone>
      </div>
      <div className='read-image'>
        <img src={urls[0]} alt="" style={{ maxWidth: 320, maxHeight: 240 }} />
      </div>
      <div className='read-graph' onClick={readGraph}>
        ここをクリックして画像を読み込む
      </div>
      <canvas className="output" id="output" />
    </>
  );
}

export default App;
