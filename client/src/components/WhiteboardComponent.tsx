//@ts-nocheck
import React, { useEffect, useRef } from 'react';
import io from 'socket.io-client';


const WhiteboardComponent = () => {
  const canvasRef = useRef(null);
  const testRef = useRef(null);
  const pc = new RTCPeerConnection();

  useEffect(() => {
    const canvas = canvasRef.current;
    const test = testRef.current;

    canvas.width = 0.98 * window.innerWidth;
    canvas.height = window.innerHeight;

    const ioServer = io.connect("https://dopewhiteboard.herokuapp.com/");
    const ctx = canvas.getContext("2d");

    let x;
    let y;
    let mouseDown = false;
    let dataChannel;
    const servers = {
      iceServers: [
        {
          urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
        },
      ],
      iceCandidatePoolSize: 10,
    };
    const pc = new RTCPeerConnection(servers);

    console.log("created data channels");

    const applyEvents = () => {
      dataChannel.onmessage = (e) => {
        let data = JSON.parse(e.data);

        if (data.draw) {
          ctx.lineTo(data.draw.x, data.draw.y);
          ctx.stroke();
        }
        if (data.down) {
          ctx.moveTo(data.down.x, data.down.y);
        }
      };
    };

    const handleMouseDown = (e) => {
      ctx.moveTo(x, y);
      if (dataChannel !== undefined) {
        dataChannel.send(JSON.stringify({ down: { x, y } }));
      } else {
        //console.log("not defined");
      }
      mouseDown = true;
    };

    const handleMouseUp = (e) => {
      mouseDown = false;
    };

    const handleMouseMove = (e) => {
      x = e.clientX;
      y = e.clientY;

      if (mouseDown) {
        dataChannel.send(JSON.stringify({ draw: { x, y } }));
        ctx.lineTo(x, y);
        ctx.stroke();
      }
    };

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);

    window.onload = async () => {
      pc.addEventListener("connectionstatechange", (event) => {
        if (pc.connectionState === "connected") {
          //console.log("connected");
        }
      });

      pc.ondatachannel = (e) => {
        console.log("re data channels");
        dataChannel = e.channel;
        applyEvents();
      };

      dataChannel = pc.createDataChannel("test");

      let stream = await navigator.mediaDevices.getUserMedia({ video: true });

      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });

      const remoteStream = new MediaStream();

      pc.ontrack = (event) => {
        event.streams[0].getTracks().forEach((track) => {
          remoteStream.addTrack(track);
        });
      };

      test.srcObject = remoteStream;

      //sending the ice candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          //console.log("send ice");
          ioServer.emit("propogate", { ice: event.candidate });
        }
      };

      //sending the offer
      let offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      //console.log("send offer");
      ioServer.emit("propogate", {
        offer: { type: offer.type, sdp: offer.sdp },
      });
    };

    ioServer.on("onpropogate", async (data) => {
      //console.log("happen");
      if (data.offer) {
        //console.log("offer");
        await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
        let answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        ioServer.emit("propogate", { answer });
      }
      if (data.answer) {
        //console.log("answer");
        await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
      }
      if (data.ice) {
        //console.log("ice");
        await pc.addIceCandidate(data.ice);
      }
    });

    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []); // Empty dependency array means this effect will only run once, similar to componentDidMount

  return (
    <div>
      <canvas id="canvas" ref={canvasRef}></canvas>
      <video id="test" ref={testRef}></video>
    </div>
  );
};

export default WhiteboardComponent;
