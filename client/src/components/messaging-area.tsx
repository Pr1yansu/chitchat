import { useEffect, useRef, useTransition } from "react";
import { Loader2, MessageCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useSearchParams } from "react-router-dom";
import {
  useGetProfileQuery,
  useGetUserContactedUserByIdQuery,
} from "@/store/api/users/user";
import { Skeleton } from "@/components/ui/skeleton";
import MainAvatar from "@/components/avatar";
import CustomInput from "@/components/custom-input";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store/store";
import { socket } from "@/services/socket";
import {
  useGetChatHistoryQuery,
  useSendMessageMutation,
} from "@/store/api/chat/chat";
import { addMessage, clearMessages } from "@/store/slices/chat";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

export default function MessagingArea() {
  const [searchParams] = useSearchParams();
  const [pending, startTransition] = useTransition();
  const dispatch = useDispatch();
  const chatId = searchParams.get("chat") || "";
  const { data: user, isLoading: isUserLoading } = useGetProfileQuery();
  const { data, isFetching, isLoading } = useGetUserContactedUserByIdQuery(
    { userId: chatId },
    { skip: !chatId }
  );
  const [sendMessage] = useSendMessageMutation();

  const { data: chatHistory, isFetching: isChatHistoryFetching } =
    useGetChatHistoryQuery(
      {
        otherUserId: chatId,
      },
      { skip: !chatId }
    );

  const messages = useSelector((state: RootState) => state.chat.messages);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    socket.connect();
    socket.emit("join-room", data?.room.id);
    socket.on("receive-message", (data) => {
      dispatch(addMessage(data));
    });

    return () => {
      socket.disconnect();
      socket.off("join-room");
      socket.off("receive-message");
      clearMessages();
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
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (isFetching || isLoading || isChatHistoryFetching || isUserLoading) {
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

  if (!chatId) {
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

  return (
    <div className="h-full flex flex-col flex-1">
      <div className="border-b p-4 flex items-center gap-2">
        {data?.receiver ? (
          <MainAvatar
            src={data?.receiver?.avatar?.url}
            sn={`${data?.receiver?.firstName[0]}${data?.receiver?.lastName[0]}`}
          />
        ) : (
          <Skeleton className="w-14 h-14 rounded-full" />
        )}
        <div className="space-y-1">
          {data?.receiver ? (
            <h4 className="text-base font-bold line-clamp-1 capitalize">
              {data.receiver.firstName} {data.receiver.lastName}
            </h4>
          ) : (
            <Skeleton className="w-20 h-4" />
          )}
          <p className="text-xs text-primary/60 flex items-center gap-1 line-clamp-1">
            last seen 2 hours ago
          </p>
        </div>
      </div>
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
          onTyping={() => {}}
          onStopTyping={() => {}}
          disabled={pending}
        />
      </div>
    </div>
  );
}
