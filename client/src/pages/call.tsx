import { useEffect, useRef, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { socket } from "@/services/socket";
import { Button } from "@/components/ui/button";
import { Video, PhoneOff, PhoneCall } from "lucide-react";
import SimplePeer, { Instance, SignalData } from "simple-peer";

const Call: React.FC = () => {
  const { userId } = useParams<{ userId: string }>(); // Ensure typed params
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [peer, setPeer] = useState<Instance | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((mediaStream) => {
        setStream(mediaStream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = mediaStream;
        }
      })
      .catch((err) => {
        console.error("Failed to access media devices:", err);
      });
  }, []);

  // Handle signaling events from Socket.IO
  useEffect(() => {
    socket.on("call-accepted", (signal: SignalData) => {
      peer?.signal(signal); // Pass the signal to SimplePeer
    });

    socket.on("incoming-call", ({ signal }: { signal: SignalData }) => {
      const newPeer = new SimplePeer({
        initiator: false,
        trickle: false,
        stream: stream || undefined,
      });

      newPeer.signal(signal);

      newPeer.on("stream", (remoteStream: MediaStream) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
        }
      });

      setPeer(newPeer);
      setSearchParams({ status: "incoming" });
    });

    return () => {
      socket.off("call-accepted");
      socket.off("incoming-call");
    };
  }, [peer, stream, setSearchParams]);

  // Function to initiate a call
  const initiateCall = () => {
    const newPeer = new SimplePeer({
      initiator: true,
      trickle: false,
      stream: stream || undefined,
    });

    newPeer.on("signal", (signal: SignalData) => {
      socket.emit("initiate-call", {
        callerId: socket.id,
        calleeId: userId,
        signal,
      });
    });

    newPeer.on("stream", (remoteStream: MediaStream) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream;
      }
    });

    setPeer(newPeer);
  };

  // Function to accept an incoming call
  const acceptCall = () => {
    if (!peer) return;

    peer.on("signal", (signal: SignalData) => {
      socket.emit("accept-call", { signal, callerId: userId });
    });

    setSearchParams({ status: "outgoing" });
  };

  // Function to end the call
  const endCall = () => {
    peer?.destroy();
    navigate("/chat");
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-screen">
      <video ref={localVideoRef} autoPlay muted className="w-1/3 mb-4" />
      <video ref={remoteVideoRef} autoPlay className="w-1/3 mb-4" />

      <div className="flex gap-4">
        {searchParams.get("status") === "incoming" ? (
          <Button onClick={acceptCall}>
            Accept <PhoneCall className="ml-2 h-5 w-5" />
          </Button>
        ) : (
          <Button onClick={initiateCall}>
            Call <Video className="ml-2 h-5 w-5" />
          </Button>
        )}

        <Button variant="destructive" onClick={endCall}>
          End Call <PhoneOff className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default Call;
