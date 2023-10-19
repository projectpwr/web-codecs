import './App.css';
import { useEffect, useState } from 'react';
import {
  byResolution
} from './helpers';

const isWebCodecsSupported = () => 'VideoEncoder' in window;
const withCapabilities = (wrappedFn) => (a, b) => wrappedFn(a.getCapabilities(), b.getCapabilities());
const pause = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Step 3: Function to toggle screen color
const screenColour = (colourCode) => {
  const colour = colourCode == 0 ? 'black' : 'white'
  console.log('screencololur called: ', colourCode, colour);
  const body = document.body;
  body.style.backgroundColor = colour;
}

const endVideoStream = (mediaStream) => {
  if (mediaStream) {
    mediaStream.getTracks().forEach((track) => {
      track.stop();
    });
  }
}


const getVideoStream = async () => {
  if (!isWebCodecsSupported()) {
    console.error('WebCodecs API not supported in this browser');
    return;
  }

  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter(device => device.kind === 'videoinput');

    if (videoDevices.length === 0) {
      console.error('No video devices found');
      return;
    }

    const bestVideoDevice = videoDevices.reduce(withCapabilities(byResolution));

    const stream = await navigator.mediaDevices.getUserMedia({
      video: { deviceId: bestVideoDevice.deviceId },
    });

    const videoElement = document.getElementById('videoElement');
    videoElement.srcObject = stream;

    return stream;

  } catch (error) {
    console.error('Error accessing camera:', error);
  }
};


function App() {
  const [capturedFrames, setCapturedFrames] = useState([]);
  const durationInSeconds = 10;
  const numberOfFrames = 20;
  const framePattern = '00110011001100110011';
  let stream;
  let chunks = [];



  // 1. Use Chrome and enable WebCodecs - no other browsers support this currently. Desktop and Android both support this feature.
  useEffect(() => async () => {

    // Step 2. Use a video stream of the user’s front facing camera. If there are multiple cameras, choose the one with the best resolution.
    stream = await getVideoStream();
    console.log('the stream: ', stream);

    // Step 4: Capture 20 frames over 10 seconds  
    captureFrames(stream);
    console.log('captured frame urls: ', capturedFrames);

    /*
      5. When encoding is complete:
        a. Display the encoded frames on the webpage
        b. Clean up the encoder
        c. Stop the webcam
    */
    // endVideoStream(stream);

  }, [stream]);


  const captureFrames = async (mediaStream) => {
    const capturedFrames = [];
    const mediaRecorder = new MediaRecorder(mediaStream);

    mediaRecorder.ondataavailable = ({data}) => {
      console.log('ON DATA AVAIL called', data, Date.now());

      if (data.size > 0) {
        //!! seems we need to do something with canvas as below
        // https://developer.mozilla.org/en-US/docs/Web/API/Media_Capture_and_Streams_API/Taking_still_photos
        const encodedFrameBlob = new Blob([data], { type: 'image/png' });
        capturedFrames.push(URL.createObjectURL(encodedFrameBlob));
        console.log('inside onAvail...', capturedFrames.length)
      }
    };

    const pauseInterval = (durationInSeconds*1000)/numberOfFrames;
    const framePatternArr = framePattern.split('');
           
      // Note: surely has to be some api method somewhere that does a single frame capture
      framePatternArr.forEach(async (item, index) => {
        
        /* something like this would be easier to read. one for later
        screenColour(item);
        mediaRecorder.start();
        await pause(pauseInterval);
        mediaRecorder.stop();
        */

        setTimeout(() => {
            screenColour(item);
            mediaRecorder.start();
          }, index * pauseInterval);

        setTimeout(() => {
          mediaRecorder.stop();
          if(framePatternArr.length === index+1){
            setCapturedFrames(capturedFrames);
            console.log('capturedFrames just updated in state?: ', capturedFrames)
          }
        }, (index + 1) * pauseInterval);
      })
  }

  return (
    <div className="App">
      <header className="App-header">
        <div>
          <h2>Live Stream</h2>
          <video id="videoElement" playsInline autoPlay />
        </div>
        <div className="Captured-Frames">
          <h2>Captured Frames</h2>
          {capturedFrames && capturedFrames.map((frame, i) => (<img id={i} key={i} src={frame} />))}
        </div>
      </header>
    </div>
  );
}

export default App;
