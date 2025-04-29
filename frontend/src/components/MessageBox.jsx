import { Image, Send, X } from "lucide-react";
import { MessageList } from "../components";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setAllMessages,
  setSelectedUser,
  setIsTyping,
  setMessageMeta,
  setMessagePage,
} from "../store/message.reducer";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import toast from "react-hot-toast";
import useImageReader from "../hooks/useImageReader";
import useImageCompress from "../hooks/useImageCompress";
import { getSocket } from "../hooks/socket";
import { useUser } from "../context/NavigationContext";
import {encryptData} from '../hooks/crypto'
import { config } from "../config";

let socket;

function MessageBox() {
  const imageSendRef = useRef(null);
  const timer = useRef(null);
  const {
    selectedUser,
    allUsers,
    allMessages,
    onlineUserInfo,
    messageMeta,
    messagePage,
  } = useSelector((state) => state.message);
  const { auth } = useSelector((state) => state.user);
  const [userInfo, setUserInfo] = useState({});
  const dispatch = useDispatch();
  const axiosPrivate = useAxiosPrivate();
  const { readImageFiles, file, setFile } = useImageReader();
  const { imageCompress, compressImageBlob, setCompressImageBlob } =
    useImageCompress();
  const [messageInput, setMessageInput] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [messagesCopy, setMessagesCopy] = useState([]);
  const [typing, setTyping] = useState(false);
  const messageListRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [loadMoreLoading, setLoadMoreLoading] = useState(false);
  const [isValidReq, setIsValidReq] = useState(true);
  const selectedImageCloseBtnRef = useRef(null);
  const { searchBoxRef, chatBoxRef } = useUser();

  useEffect(() => {
    if (selectedUser?.userId && allUsers?.length > 0) {
      setUserInfo(allUsers?.find((user) => user?._id === selectedUser?.userId));
    }
  }, [selectedUser?.userId, onlineUserInfo]);

  const getAllMessages = async (page, limit, signal, receiverId) => {
    if (messagePage === 1 && allMessages?.length > 0) {
      return;
    }
    if (messagePage === 1 && allMessages?.length <= 0) {
      setLoading(true);
    }
    if (messagePage >= 2) {
      setLoadMoreLoading(true);
    }

    setIsValidReq(false);
    try {
      let res = await axiosPrivate.get("/message/messages", {
        signal,
        params: {
          page,
          limit,
          receiverId,
        },
      });
      if (res?.data?.success) {
        const newMessages = res.data.data.data
          ?.reverse()
          ?.filter(
            (m) => !allMessages.some((message) => message._id === m._id)
          );
        if (newMessages?.length > 0) {
          dispatch(setAllMessages([...newMessages, ...allMessages]));
        }
        dispatch(setMessageMeta(res?.data?.data?.meta));
      }
    } catch (error) {
      toast.error(error?.res?.data?.message || error?.message);
      if (messagePage > 1) {
        dispatch(setMessagePage(messagePage - 1));
      }
    } finally {
      setTimeout(() => {
        setLoadMoreLoading(false);
        setLoading(false);
      }, 200);
      setIsValidReq(true);
    }
  };

  // LoadMore logic
  const handleScroll = (e) => {
    const { scrollTop } = e.target;
    if (scrollTop === 0) {
      if (
        (selectedUser?.userId && !messageMeta?.totalPages) ||
        (messageMeta?.totalPages > messagePage && isValidReq)
      ) {
        dispatch(setMessagePage(messagePage + 1));
      }
    }
  };

  useEffect(() => {
    let abortController = new AbortController();
    if (
      (selectedUser?.userId && auth?._id && !messageMeta?.totalPages) ||
      messageMeta?.totalPages >= messagePage
    ) {
      getAllMessages(
        messagePage,
        10,
        abortController.signal,
        selectedUser?.userId
      );
    }

    return () => {
      abortController.abort();
    };
  }, [selectedUser?.userId, messagePage]);

  // Image Compression logic
  const handleUpdatePicture = async (e) => {
    if (
      e?.target?.files[0]?.type?.includes("image/") &&
      !e?.target?.files[0]?.type?.includes("image/gif") &&
      e?.target?.files[0]?.size / (1024 * 1024) < 2
    ) {
      let imageFile = e.target.files[0];
      await imageCompress(imageFile);
    } else {
      toast.error("Oops! That image is too big. Try uploading one under 2MB.");
    }
    e.target.value = null;
  };

  useEffect(() => {
    if (compressImageBlob) {
      readImageFiles(compressImageBlob);
      setSelectedImage(compressImageBlob);
    }
  }, [compressImageBlob]);

  const handleMessage = async (e) => {
    e.preventDefault();
    let data;
    let encryptDummyMessage;
    let encryptDummyImage;

    if (selectedImage) {
      data = { ...data, file: selectedImage };
    }
    if (messageInput) {
      data = { ...data, message: messageInput };
      encryptDummyMessage = encryptData(
        messageInput,
        config?.messageEncryptionSecret
      );
    }

    if (!data || data === undefined) {
      toast.error("Message or image field is required.");
      return;
    }

    if (file) {
      encryptDummyImage = encryptData(
        file,
        config?.imageEncryptionSecret
      );
    }

    try {
      setMessagesCopy((prev) => [
        ...prev,
        {
          _id: `${Date.now() + Math.random() * 100}`,
          message: encryptDummyMessage?.data || "",
          image: encryptDummyImage?.data || "",
          senderId: auth?._id,
          receiverId: selectedUser?.userId,
          pending: true,
        },
      ]);
      setFile(null);
      setMessageInput("");
      setSelectedImage(null);
      socket?.emit("stop typing", {
        senderId: auth?._id,
        receiverId: selectedUser?.userId,
      });

      const response = await axiosPrivate.post(
        "/message/send-message",
        { ...data, receiverId: selectedUser?.userId },
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (response?.data?.success) {
        dispatch(setAllMessages([...allMessages, response?.data?.data]));
      }
    } catch (error) {
      dispatch(setAllMessages([...allMessages]));
      toast.error(error?.response?.data?.message || error?.message);
    } finally {
      if (messageListRef?.current) {
        messageListRef?.current?.scrollIntoView();
      }
    }
  };

  useEffect(() => {
    if (allMessages) {
      setMessagesCopy(allMessages);
    }
  }, [allMessages]);

  useEffect(() => {
    if (messageListRef?.current && messagePage === 1) {
      messageListRef?.current?.scrollIntoView();
    }
  }, [messagesCopy, selectedUser?.userId, !loading]);

  useEffect(() => {
    socket = getSocket();
  }, [auth?._id, selectedUser?.userId]);

  // RealTime message and typing logic ( Receiver )
  useEffect(() => {
    if (socket && socket?.connected) {
      socket?.on("newMessage", (data) => {
        if (data) {
          if (selectedUser?.userId !== data?.senderId) {
            return null;
          }
          dispatch(setAllMessages([...allMessages, data]));
        }
      });
    }
    socket?.on("typing", (data) => {
      if (selectedUser?.userId !== data?.senderId) {
        return null;
      }
      dispatch(setIsTyping(data?.success));
    });
    socket?.on("stop typing", (data) => {
      if (selectedUser?.userId !== data?.senderId) {
        return null;
      }
      dispatch(setIsTyping(data?.success));
    });

    return () => {
      socket?.off("newMessage");
      socket?.off("typing");
      socket?.off("stop typing");
    };
  }, [allMessages, selectedUser, socket]);

  useEffect(() => {
    setFile(null);
    setMessageInput("");
    setSelectedImage(null);
  }, [selectedUser]);

  // Typing logic ( Sender )
  const handleTyping = async (e) => {
    if (selectedUser?.userId && socket?.connected) {
      if (!typing) {
        setTyping(true);
        socket?.emit("typing", {
          senderId: auth?._id,
          receiverId: selectedUser?.userId,
        });
      }
      clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        socket?.emit("stop typing", {
          senderId: auth?._id,
          receiverId: selectedUser?.userId,
        });
        setTyping(false);
      }, 3000);
    }
  };

  useEffect(() => {
    if (chatBoxRef?.current) {
      chatBoxRef?.current?.focus();
    }
  }, [auth?._id, selectedUser?.userId]);

  useEffect(() => {
    if (file) {
      selectedImageCloseBtnRef?.current?.focus();
    }
  }, [file]);

  return (
    <>
      {selectedUser?.userId && (
        <article className="bg-secondary col-span-3 flex flex-col overflow-auto">
          {/* Selected user header section */}
          <article className="w-full">
            <div className="flex gap-2 items-center justify-center w-full bg-zinc-700 rounded-sm p-2">
              <div className="size-10 bg-zinc-400 rounded-full relative">
                <img
                  src={userInfo?.profilePicture || "/avatar.webp"}
                  className="w-full h-full rounded-full object-cover object-center"
                  alt="user's profile pic"
                />
              </div>
              <div className="flex gap-2 justify-between items-center grow text-sm p-1">
                <div className="flex flex-col gap-1">
                  <p className="font-extrabold">{userInfo?.fullName}</p>
                  <p className="font-thin justify-self-end text-xs">
                    {onlineUserInfo?.length > 0 &&
                    onlineUserInfo?.some(
                      (onlineUser) =>
                        onlineUser?.userId === selectedUser?.userId
                    ) ? (
                      <span className="text-emerald-500 font-light">
                        Online
                      </span>
                    ) : (
                      <span className="text-red-500 font-light">Offline</span>
                    )}
                  </p>
                </div>
                <X
                  ref={chatBoxRef}
                  onKeyDown={(e) => {
                    if (e.key === " " || e.key === "Enter") {
                      e.preventDefault();
                      dispatch(
                        setSelectedUser({ userId: null, connectionId: null })
                      );
                      dispatch(setAllMessages([]));
                      dispatch(setMessageMeta({}));
                      dispatch(setMessagePage(1));
                      searchBoxRef?.current?.focus();
                    }
                  }}
                  tabIndex={0}
                  onClick={() => {
                    dispatch(
                      setSelectedUser({ userId: null, connectionId: null })
                    );
                    dispatch(setAllMessages([]));
                    dispatch(setMessageMeta({}));
                    dispatch(setMessagePage(1));
                    searchBoxRef?.current?.focus();
                  }}
                  className="cursor-pointer outline-none ring-accent focus-visible:ring-2 rounded-sm w-fit hover:stroke-white stroke-white/80"
                />
              </div>
            </div>
          </article>
          {/* End */}

          {/* Chat List section */}
          <article
            className="p-2 sm:p-4 w-full flex-1 overflow-auto"
            style={{
              scrollbarGutter: "stable",
            }}
            onScroll={(e) => handleScroll(e)}
          >
            <MessageList
              loadMoreLoading={loadMoreLoading}
              loading={loading}
              messages={messagesCopy}
            />
            <div ref={messageListRef}></div>
          </article>
          {/* End */}

          {/* Selected image preview */}
          {file && (
            <div className="w-full max-h-40 px-2 mb-2 bg-secondary">
              <div className="h-full w-fit p-2 relative">
                <div className="absolute bg-secondary size-6 rounded-full right-0 top-0">
                  <X
                    ref={selectedImageCloseBtnRef}
                    tabIndex={0}
                    className="cursor-pointer focus-visible:ring-2 ring-accent outline-none rounded-full stroke-accent/80 hover:stroke-accent"
                    onClick={() => {
                      setFile(null);
                      setSelectedImage(null);
                      setCompressImageBlob(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === " " || e.key === "Enter") {
                        e.preventDefault();
                        setFile(null);
                        setSelectedImage(null);
                        setCompressImageBlob(null);
                      }
                    }}
                  />
                </div>
                <img
                  src={file}
                  className="max-h-36 object-center object-cover"
                  alt="Preview selected image."
                />
              </div>
            </div>
          )}
          {/* End */}

          {/* Image, text and send button section */}

          <article className="border-t border-zinc-600 px-4 py-4 w-full flex justify-between items-center gap-2 sm:gap-4 overflow-hidden">
            <label
              onClick={() => imageSendRef?.current?.click()}
              onKeyDown={(e) => {
                if (e.key === " " || e.key === "Enter") {
                  e.preventDefault();
                  imageSendRef?.current?.click();
                }
              }}
              htmlFor="imageToSend"
              tabIndex={0}
              className="outline-none focus:ring-accent focus-visible:ring-2 rounded-sm w-fit"
            >
              <input
                ref={imageSendRef}
                onChange={(e) => {
                  handleUpdatePicture(e);
                }}
                type="file"
                className="hidden"
                accept="image/*"
                name="file"
              />
              <Image className="sm:size-8 stroke-accent/80 cursor-pointer hover:stroke-accent" />
            </label>

            <form
              className="flex justify-between w-full gap-2"
              autoComplete="off"
              onSubmit={(e) => handleMessage(e)}
            >
              <div className="w-full">
                <input
                  className="border-2 text-xs sm:text-sm border-zinc-700 bg-zinc-800 rounded-sm px-3 py-2 focus-visible:ring-2 focus:ring-accent focus:outline-none w-full"
                  placeholder="Type a message"
                  onKeyUp={(e) => handleTyping(e)}
                  onChange={(e) => setMessageInput(e.target.value)}
                  name="message"
                  value={messageInput}
                />
              </div>
              <button className="outline-none m-1 focus-visible:ring-2 focus:ring-accent rounded-sm">
                <Send className="sm:size-6 stroke-accent/80 cursor-pointer hover:stroke-accent" />
              </button>
            </form>
          </article>
          {/* End */}
        </article>
      )}
    </>
  );
}

export default MessageBox;
