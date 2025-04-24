import { Circle } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { MessageSkeleton, Spinner } from "./index";
import {decryptData} from '../hooks/crypto'
import { config } from "../config";

function MessageList({
  messages = [],
  loading = false,
  loadMoreLoading = false,
}) {
  // Current User info
  const { auth } = useSelector((state) => state.user);

  const { selectedUser, allUsers, isTyping } = useSelector(
    (state) => state.message
  );
  const [userInfo, setUserInfo] = useState({});

  useEffect(() => {
    // Selected user info
    if (selectedUser?.userId && allUsers?.length > 0) {
      setUserInfo(allUsers?.find((user) => user?._id === selectedUser?.userId));
    }
    return () => {
      setUserInfo({});
    };
  }, [selectedUser?.userId]);

  return (
    <div tabIndex={messages?.length > 0 ? 0 : ''}  className="focus-visible:ring-2 ring-accent outline-none p-1 focus:rounded-sm flex flex-col justify-end min-h-full h-fit">
      {/* LoadMore spinner */}
      {loadMoreLoading && (
        <div className="flex justify-center items-center p-3">
          <Spinner width="size-8" />
        </div>
      )}
      {/* End */}
      <ul className={`h-fit ${isTyping && 'pb-10'}`}>

      {/* Message List Skeleton */}
      {loading && <MessageSkeleton />}
      {/* End */}

      {/* Actual messages list */}
        {!loading && messages?.length > 0 &&
          messages?.map((message) => {
            let decryptedImage;
            let decryptedMessage;
            if(message?.message) {
              decryptedMessage = decryptData(message?.message, config?.messageEncryptionSecret)
            } 

            if(message?.image) {
             decryptedImage = decryptData(message?.image, config?.imageEncryptionSecret) 
            }

          return (
            <li key={message?._id} className="flex gap-2">
              {message?.senderId === auth?._id ? (
                // Current User
                <aside className="flex flex-row-reverse gap-2 w-full">
                  <div className="size-10 bg-zinc-400 rounded-full self-end">
                    <img
                      src={auth?.profilePicture || "/avatar.webp"}
                      className="w-full h-full rounded-full object-cover object-center"
                      alt="user's profile pic"
                    />
                  </div>

                  <div className="w-full flex flex-col items-end">
                    <span className="text-[0.6rem] sm:text-xs font-thin block pr-2 pb-2">
                      <span className="pr-1">
                        {message?.createdAt
                          ? new Date(message?.createdAt).toLocaleDateString(
                              "en-In",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "2-digit",
                              }
                            )
                          : "-- --- --"}
                      </span>
                      {message?.createdAt
                        ? new Date(message?.createdAt).toLocaleTimeString(
                            "en-In",
                            {
                              hour: "numeric",
                              minute: "numeric",
                            }
                          )
                        : "-- : -- --"}
                    </span>
                    <div
                      className={`max-[150px]:w-[100%] max-w-[75%] sm:max-w-1/2 md:max-w-1/3 h-fit p-2 rounded-md bg-zinc-600 relative ${
                        message?.pending && "animate-pulse"
                      }`}
                    >
                      <div className="absolute -right-2 border-8 bottom-0 border-transparent border-b-zinc-600"></div>
                      <div className="flex justify-end items-end w-full">
                        {message?.image && decryptedImage?.success && (
                          <img
                            src={decryptedImage?.data}
                            className={`w-full min-h-24 sm:min-h-32 object-cover object-center rounded-md ${
                              message?.image && message?.message && "mb-2"
                            }`}
                            alt="Transferred Image preview."
                          />
                        )}
                      </div>
                      <p className="flex w-full justify-end gap-2 items-center">
                        <span className="flex-1 text-xs sm:text-base">
                          {message?.message && decryptedMessage?.success && `${decryptedMessage?.data}`}
                        </span>
                      </p>
                    </div>
                  </div>
                </aside>
              ) : (
                // Selected User
                <aside className="flex gap-2 w-full">
                  <div className="size-10 bg-zinc-400 rounded-full self-end">
                    <img
                      src={userInfo?.profilePicture || "/avatar.webp"}
                      className="w-full h-full rounded-full object-cover object-center"
                      alt="Received Image preview."
                    />
                  </div>

                  <div className="w-full flex flex-col items-start">
                    <span className="text-[0.6rem] sm:text-xs font-thin block pl-2 pb-2">
                      <span className="pr-1">
                        {message?.createdAt
                          ? new Date(message?.createdAt).toLocaleDateString(
                              "en-In",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "2-digit",
                              }
                            )
                          : "-- --- --"}
                      </span>
                      {message?.createdAt
                        ? new Date(message?.createdAt).toLocaleTimeString(
                            "en-In",
                            {
                              hour: "numeric",
                              minute: "numeric",
                            }
                          )
                        : "-- : -- --"}
                    </span>

                    <div className="max-[150px]:w-[100%] max-w-[75%] sm:max-w-1/2 md:max-w-1/3 h-fit p-2 rounded-md bg-zinc-600 relative">
                      <div className="absolute -left-2 border-8 bottom-0 border-transparent border-b-zinc-600"></div>
                      <div className="flex justify-end items-end w-full">
                      {message?.image && decryptedImage?.success && (
                          <img
                            src={decryptedImage?.data}
                            className={`w-full min-h-24 sm:min-h-32 object-cover object-center rounded-md ${
                              message?.image && message?.message && "mb-2"
                            }`}
                            alt="Received Image preview."
                          />
                        )}
                      </div>
                      <p className="flex w-full justify-end gap-2 items-center">
                        <span className="flex-1 text-xs sm:text-base">
                          {message?.message && decryptedMessage?.success && `${decryptedMessage?.data}`}
                        </span>
                      </p>
                    </div>
                  </div>
                </aside>
              )}
            </li>
        )})}
      </ul>
      {/* End */}

      {/* IsTyping section */}
      {isTyping && (
          <aside className="flex gap-2 w-full">
            <div className="size-10 bg-zinc-400 rounded-full self-end">
              <img
                src={userInfo?.profilePicture || "/avatar.webp"}
                className="w-full h-full rounded-full object-cover object-center"
                alt="Received Image preview."
              />
            </div>

            <div className="w-full">
              <div className="max-w-[95%] w-fit sm:max-w-1/2 h-fit p-2 rounded-md bg-zinc-600 relative flex">
                <div className="absolute -left-2 border-8 bottom-0 border-transparent border-b-zinc-600"></div>
                {[1, 2, 3]?.map((circle) => (
                  <Circle
                    key={circle}
                    className={`fill-accent stroke-none size-3 animate-bounce`}
                  />
                ))}
              </div>
            </div>
          </aside>
        )}
      {/* End */}
    </div>
  );
}

export default MessageList;
