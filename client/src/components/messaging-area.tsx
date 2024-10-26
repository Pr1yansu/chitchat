import { useEffect, useRef, useState, useTransition } from "react";
import {
  Loader2,
  MessageCircle,
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  Video,
  VideoOff,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useSearchParams } from "react-router-dom";
import {
  useGetProfileQuery,
  useGetUserContactedUserByIdQuery,
} from "@/store/api/users/user";

import CustomInput from "@/components/custom-input";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store/store";
import { socket } from "@/services/socket";
import {
  useGetChatHistoryQuery,
  useGetRoomByIdQuery,
  useSendMessageMutation,
} from "@/store/api/chat/chat";
import { addMessage, clearMessages } from "@/store/slices/chat";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import MessagingHeader from "@/components/messaging-header";
import { startTyping, stopTyping } from "@/store/slices/typing";
import SimplePeer from "simple-peer";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function MessagingArea() {
  const [searchParams] = useSearchParams();
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [startCall, setStartCall] = useState(false);
  const [receivingCall, setReceivingCall] = useState(false);
  const [callerSignal, setCallerSignal] = useState("");
  const [callAccepted, setCallAccepted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const myVideo = useRef<HTMLVideoElement | null>(null);
  const userVideo = useRef<HTMLVideoElement | null>(null);
  const peerRef = useRef<SimplePeer.Instance>();
  const [pending, startTransition] = useTransition();
  const dispatch = useDispatch();
  const chatId = searchParams.get("chat") || "";
  const groupId = searchParams.get("group") || "";
  const { data: user, isLoading: isUserLoading } = useGetProfileQuery();
  const { data, isFetching, isLoading } = useGetUserContactedUserByIdQuery(
    { userId: chatId },
    { skip: !chatId }
  );
  const {
    data: groupData,
    isFetching: isGroupFetching,
    isLoading: isGroupLoading,
  } = useGetRoomByIdQuery(
    {
      roomId: groupId,
    },
    {
      skip: !groupId,
    }
  );
  const [sendMessage] = useSendMessageMutation();

  const {
    data: chatHistory,
    isFetching: isChatHistoryFetching,
    refetch: refetchChatHistory,
  } = useGetChatHistoryQuery(
    {
      roomId:
        (chatId && data?.room.id) || (groupId && groupData?.data.id) || "",
    },
    { skip: !chatId && !groupId }
  );

  const messages = useSelector((state: RootState) => state.chat.messages);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    socket.connect();
    socket.emit("join-room", data?.room.id);
    socket.on("receive-message", (data) => {
      dispatch(addMessage(data));
    });
    socket.on("user_typing", ({ roomId, userId, username }) => {
      dispatch(
        startTyping({
          roomId,
          userId,
          username,
        })
      );

      setTimeout(() => {
        dispatch(
          stopTyping({
            roomId,
            userId,
            username,
          })
        );
      }, 3000);
    });
    socket.on("user_stop_typing", ({ roomId, userId, username }) => {
      dispatch(
        stopTyping({
          roomId,
          userId,
          username,
        })
      );
    });
    socket.on("receive-call", (data) => {
      setStartCall(true);
      setReceivingCall(true);
      setCallerSignal(data.signalData);
    });

    return () => {
      socket.disconnect();
      socket.off("join-room");
      socket.off("receive-message");
      socket.off("user_typing");
      socket.off("user_stop_typing");
      dispatch(clearMessages());
    };
  }, [data, dispatch]);

  useEffect(() => {
    if (!chatHistory) return;
    if (chatHistory.data) {
      dispatch(clearMessages());
      chatHistory.data.forEach((msg) => {
        dispatch(
          addMessage({
            attachments: msg.attachments,
            fromUserId: msg.sender.id,
            message: msg.message,
            roomId: msg.room,
            timestamp: msg.timestamp,
            status: msg.status as "sent" | "delivered" | "seen",
            type: msg.type,
            username: msg.sender.firstName + " " + msg.sender.lastName,
            avatar: msg.sender.avatar ? msg.sender.avatar.url : undefined,
            messageId: msg.id,
          })
        );
      });
    }
  }, [chatHistory, dispatch]);

  useEffect(() => {
    const ref = messagesEndRef.current;
    if (ref) {
      ref.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    if (chatId || groupId) {
      refetchChatHistory();
    }
  }, [chatId, groupId, refetchChatHistory]);

  if (
    isFetching ||
    isLoading ||
    isChatHistoryFetching ||
    isUserLoading ||
    isGroupFetching ||
    isGroupLoading
  ) {
    return (
      <Card className="h-full flex items-center justify-center bg-muted/50 w-auto flex-1">
        <CardContent className="text-center">
          <Loader2 className="mx-auto h-12 w-12 text-muted-foreground mb-4 animate-spin" />
          <h2 className="text-xl font-semibold text-muted-foreground mb-2">
            Loading Conversation ...
          </h2>
        </CardContent>
      </Card>
    );
  }

  if (!chatId && !groupId) {
    return (
      <Card className="h-full flex items-center justify-center bg-muted/50 w-auto flex-1">
        <CardContent className="text-center">
          <MessageCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-semibold text-muted-foreground mb-2">
            No Conversation Selected
          </h2>
          <p className="text-muted-foreground">
            Start a conversation by selecting a user from the sidebar
          </p>
        </CardContent>
      </Card>
    );
  }

  const handleCall = () => {
    navigator.mediaDevices
      .getUserMedia({ video: false, audio: true })
      .then((cStream: MediaStream) => {
        setStartCall(true);
        setIsAudioEnabled(true);
        setStream(cStream);

        if (myVideo.current) {
          myVideo.current.srcObject = cStream;
        }

        const peer = new SimplePeer({
          initiator: true,
          trickle: false,
          stream: cStream,
        });

        peer.on("signal", (d) => {
          socket.emit("call-user", {
            signalData: d,
            roomId: data?.room.id,
          });
        });

        peer.on("stream", (s) => {
          if (userVideo.current) {
            userVideo.current.srcObject = s;
          }
        });

        socket.on("call-accepted", (signal) => {
          console.log("Signal Data:", signal);
          setCallAccepted(true);
          if (peerRef.current) {
            peerRef.current.signal(signal.signalData);
          } else {
            console.error("Peer reference is not initialized.");
          }
        });

        peerRef.current = peer;
      })
      .catch((err) => {
        console.log(err);
        setStartCall(false);
        toast.error("An error occurred while trying to make a call");
      });
  };

  const handleAnswer = () => {
    setCallAccepted(true);

    navigator.mediaDevices
      .getUserMedia({ video: false, audio: true })
      .then((cStream: MediaStream) => {
        setStream(cStream);
        const peer = new SimplePeer({
          initiator: false,
          trickle: false,
          stream: cStream,
        });

        peer.on("signal", (d) => {
          socket.emit("accept-call", {
            signalData: d,
            roomId: data?.room.id,
          });
        });

        peer.on("stream", (s) => {
          if (userVideo.current) {
            userVideo.current.srcObject = s;
          }
        });

        peer.signal(callerSignal);
        peerRef.current = peer;
      });
  };

  const handleReject = () => {
    setReceivingCall(false);
    if (peerRef.current) {
      peerRef.current.destroy();
    }
    setStream(null);
  };

  const handleEndCall = () => {
    if (peerRef.current) {
      peerRef.current.destroy();
    }
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setCallAccepted(false);
    setStartCall(false);
  };

  const toggleAudio = () => {
    if (stream) {
      const enabled = !isAudioEnabled;
      stream.getAudioTracks().forEach((track) => {
        track.enabled = enabled;
      });
      setIsAudioEnabled(enabled);
    }
  };

  const toggleVideo = () => {
    if (stream) {
      if (isVideoEnabled) {
        stream.getVideoTracks().forEach((track) => track.stop());
        setIsVideoEnabled(false);
      } else {
        navigator.mediaDevices
          .getUserMedia({ video: true })
          .then((vStream: MediaStream) => {
            if (!peerRef.current) return;
            const videoTrack = vStream.getVideoTracks()[0];
            stream.addTrack(videoTrack);
            peerRef.current.replaceTrack(
              stream.getVideoTracks()[0],
              videoTrack,
              stream
            );
            setIsVideoEnabled(true);
            if (myVideo.current) {
              myVideo.current.srcObject = stream;
            }
          })
          .catch((err) => {
            toast.error("An error occurred while trying to start video");
            console.log(err);
          });
      }
    }
  };

  if (chatId && startCall) {
    return (
      <div className="p-5 flex-1 mx-auto">
        {receivingCall && !callAccepted && (
          <div className="bg-primary/10 rounded-lg p-6 mb-6 text-center">
            <h2 className="text-2xl font-semibold mb-4">Incoming Call</h2>
            <Button
              onClick={handleAnswer}
              className="bg-green-500 hover:bg-green-600"
            >
              Answer
            </Button>
            <Button onClick={handleReject} variant="destructive">
              Reject
            </Button>
          </div>
        )}
        {(callAccepted || startCall) && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative aspect-video bg-gray-200 rounded-lg overflow-hidden">
                <video
                  ref={userVideo}
                  autoPlay
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
                  Other User
                </div>
              </div>
              <div className="relative aspect-video bg-gray-200 rounded-lg overflow-hidden">
                <video
                  ref={myVideo}
                  autoPlay
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
                  You
                </div>
              </div>
            </div>
            <div className="flex justify-center space-x-4">
              <Button onClick={handleEndCall} variant="destructive">
                End Call
              </Button>
              <Button
                onClick={toggleAudio}
                variant={isAudioEnabled ? "outline" : "secondary"}
              >
                {isAudioEnabled ? "Mute" : "Unmute"}
              </Button>
              <Button
                onClick={toggleVideo}
                variant={isVideoEnabled ? "outline" : "secondary"}
              >
                {isVideoEnabled ? "Stop Video" : "Start Video"}
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (chatId && startCall === false)
    return (
      <div className="h-full flex flex-col flex-1">
        <MessagingHeader data={data} onCall={handleCall} />
        <div className="flex-1 overflow-y-auto p-5">
          {messages.map((msg, id) => {
            const isOwnMessage = msg.fromUserId !== data?.receiver?.id;
            return (
              <div
                key={id}
                className={`flex ${
                  isOwnMessage ? "justify-end" : "justify-start"
                } mb-4`}
              >
                <div>
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="mt-2">
                      {msg.attachments.map((attachment, index) => (
                        <div
                          key={index}
                          className="flex items-center mt-1 overflow-hidden max-w-full"
                        >
                          {attachment.type?.startsWith("image") && (
                            <img
                              src={attachment.url}
                              alt="attachment"
                              className="max-h-32 rounded-lg object-cover h-32 w-32 p-5"
                            />
                          )}

                          {attachment.type === "video" && (
                            <video
                              src={attachment.url}
                              className="max-h-32 rounded-lg object-cover h-32 w-32 p-5"
                              controls
                            />
                          )}

                          {attachment.type === "audio" && (
                            <audio
                              src={attachment.url}
                              className="w-full"
                              controls
                            />
                          )}

                          {attachment.type === "file" && (
                            <a
                              href={attachment.url}
                              download
                              className="text-primary underline"
                            >
                              Download File
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  <div
                    className={`flex ${
                      isOwnMessage ? "flex-row-reverse" : "flex-row"
                    } items-end max-w-[80%]`}
                  >
                    <Avatar>
                      <AvatarImage src={msg.avatar} alt="avatar" />
                      <AvatarFallback>
                        {msg.username[0]}
                        {msg.username[1]}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={`max-w-xs p-3 rounded-2xl ${
                        isOwnMessage
                          ? "bg-primary text-primary-foreground mr-2"
                          : "bg-secondary text-secondary-foreground ml-2"
                      }`}
                    >
                      <p className="text-sm">{msg.message}</p>
                      <span className="text-xs opacity-70 block mt-1 text-nowrap">
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
        <div className="border-t p-5">
          <CustomInput
            onSend={(chatData) => {
              const formatData = {
                message: chatData.content,
                type: chatData.type,
                attachments: chatData.attachments || [],
                avatar: user?.user?.avatar?.url,
                username: `${user?.user?.firstName} ${user?.user?.lastName}`,
              };

              socket.emit("send-message", {
                formatData,
              });

              startTransition(() => {
                sendMessage({
                  message: chatData.content,
                  type: chatData.type,
                  attachments: chatData.attachments || [],
                  room: data?.room.id,
                });
              });
            }}
            onTyping={() => {
              socket.emit("typing", {
                roomId: data?.room.id,
                userId: user?.user?.id,
                username: `${user?.user?.firstName} ${user?.user?.lastName}`,
              });
            }}
            onStopTyping={() => {
              socket.emit("stop-typing", {
                roomId: data?.room.id,
                userId: user?.user?.id,
                username: `${user?.user?.firstName} ${user?.user?.lastName}`,
              });
            }}
            disabled={pending}
          />
        </div>
      </div>
    );

  if (groupId)
    return (
      <div className="h-full flex flex-col flex-1">
        <MessagingHeader groupData={groupData} />
        <div className="flex-1 overflow-y-auto p-5">
          {messages.map((msg, id) => {
            const isOwnMessage = msg.fromUserId !== user?.user?.id;
            return (
              <div
                key={id}
                className={`flex ${
                  !isOwnMessage ? "justify-end" : "justify-start"
                } mb-4`}
              >
                <div>
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="mt-2">
                      {msg.attachments.map((attachment, index) => (
                        <div
                          key={index}
                          className="flex items-center mt-1 overflow-hidden max-w-full"
                        >
                          {attachment.type?.startsWith("image") && (
                            <img
                              src={attachment.url}
                              alt="attachment"
                              className="max-h-32 rounded-lg object-cover h-32 w-32 p-5"
                            />
                          )}

                          {attachment.type === "video" && (
                            <video
                              src={attachment.url}
                              className="max-h-32 rounded-lg object-cover h-32 w-32 p-5"
                              controls
                            />
                          )}

                          {attachment.type === "audio" && (
                            <audio
                              src={attachment.url}
                              className="w-full"
                              controls
                            />
                          )}

                          {attachment.type === "file" && (
                            <a
                              href={attachment.url}
                              download
                              className="text-primary underline"
                            >
                              Download File
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  <div
                    className={`flex ${
                      !isOwnMessage ? "flex-row-reverse" : "flex-row"
                    } items-end max-w-[80%] gap-2`}
                  >
                    <Avatar>
                      <AvatarImage src={msg.avatar} alt="avatar" />
                      <AvatarFallback>
                        {msg.username[0]}
                        {msg.username[1]}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={`max-w-xs p-3 rounded-2xl ${
                        isOwnMessage
                          ? "bg-primary text-primary-foreground mr-2"
                          : "bg-secondary text-secondary-foreground ml-2"
                      }`}
                    >
                      <p className="text-sm">{msg.message}</p>
                      <span
                        className="text-xs opacity-70 block mt-1
                      text-nowrap"
                      >
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
        <div className="border-t p-5">
          <CustomInput
            onSend={(chatData) => {
              const formatData = {
                message: chatData.content,
                type: chatData.type,
                attachments: chatData.attachments || [],
                avatar: user?.user?.avatar?.url,
                username: `${user?.user?.firstName} ${user?.user?.lastName}`,
              };

              socket.emit("send-message", {
                formatData,
              });

              startTransition(() => {
                sendMessage({
                  message: chatData.content,
                  type: chatData.type,
                  attachments: chatData.attachments || [],
                  room: groupData?.data.id,
                });
              });
            }}
            onTyping={() => {
              socket.emit("typing", {
                roomId: groupData?.data.id,
                userId: user?.user?.id,
                username: `${user?.user?.firstName} ${user?.user?.lastName}`,
              });
            }}
            onStopTyping={() => {
              socket.emit("stop-typing", {
                roomId: groupData?.data.id,
                userId: user?.user?.id,
                username: `${user?.user?.firstName} ${user?.user?.lastName}`,
              });
            }}
            disabled={pending}
          />
        </div>
      </div>
    );
}
