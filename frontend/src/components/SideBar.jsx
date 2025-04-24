import { User2Icon } from "lucide-react";
import React, { useEffect, useId, useState } from "react";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import { useDispatch, useSelector } from "react-redux";
import {
  setAllMessages,
  setAllUsers,
  setSelectedUser,
  setUsersMeta,
  setPage,
  setMessageMeta,
  setMessagePage,
} from "../store/message.reducer";
import toast from "react-hot-toast";
import { Input, Spinner, UsersSkeleton } from "./index";
import { useUser } from "../context/NavigationContext";
import { decryptData } from "../hooks/crypto";
import { config } from "../config";

function SideBar() {
  const [loading, setLoading] = useState(false);
  const [isValidReq, setIsValidReq] = useState(true);
  const [loadMoreLoading, setLoadMoreLoading] = useState(false);
  const axiosPrivate = useAxiosPrivate();
  const dispatch = useDispatch();
  const { onlineUserInfo, selectedUser, allUsers, usersMeta, page } =
    useSelector((state) => state.message);
  const { auth } = useSelector((state) => state.user);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const { searchBoxRef, chatBoxRef } = useUser();
  const [showOnline, setShowOnline] = useState(false);
  const showOnlineInputId = useId()

  const allUserInfo = async (page, limit, signal) => {
    setIsValidReq(false);
    if (page === 1 && allUsers?.length > 0) {
      return;
    }
    if (page === 1 && allUsers?.length <= 0) {
      setLoading(true);
    }
    if (page >= 2) {
      setLoadMoreLoading(true);
    }
    try {
      let res = await axiosPrivate.get("/message/all-users", {
        signal,
        params: {
          page,
          limit,
        },
      });
      if (res?.data?.success) {
        const filteredUserInfo = res?.data?.data?.data?.filter(
          (user) => !allUsers?.some((userInfo) => userInfo?._id === user?._id)
        );
        if (filteredUserInfo?.length > 0) {
          let decryptedUsersInfo = filteredUserInfo?.map(user=>{
            const decryptedImage = decryptData(user?.profilePicture, config?.profilePictureEncryptionSecret)
            return { ...user, profilePicture : decryptedImage?.data || '' }
          })

          dispatch(setAllUsers([...allUsers, ...decryptedUsersInfo]));
        }
        dispatch(setUsersMeta(res?.data?.data?.meta));
        setIsValidReq(true);
      }
    } catch (error) {
      toast.error(error?.res?.data?.message || error?.message);
      setIsValidReq(false);
    } finally {
      setTimeout(() => {
        setLoadMoreLoading(false);
        setLoading(false);
      }, 200);
    }
  };

  const handleSelectUser = (userId) => {
    if (!userId?.trim()) {
      return;
    }
    let connectionId = onlineUserInfo?.find((user) => user?.userId === userId);
    dispatch(
      setSelectedUser({ userId, connectionId: connectionId?.socketId || null })
    );
    if (selectedUser?.userId !== userId) {
      dispatch(setAllMessages([]));
      dispatch(
        setMessageMeta({
          totalPages: 1,
        })
      );
      dispatch(setMessagePage(1));
    }
  };

  useEffect(() => {
    let abortController = new AbortController();
    if (
      (auth?._id && !usersMeta?.totalPages) ||
      usersMeta?.totalPages >= page
    ) {
      allUserInfo(page, 10, abortController.signal);
    }

    return () => {
      abortController.abort();
    };
  }, [auth, page]);

  // LoadMore logic
  const handleScroll = (e) => {
    if (!loadMoreLoading) {
      if (
        e?.target?.scrollTop + e?.target?.clientHeight >=
        e?.target?.scrollHeight
      ) {
        if (
          (!loading && !usersMeta?.totalPages) ||
          (usersMeta?.totalPages >= page && isValidReq)
        ) {
          dispatch(setPage(page + 1));
        }
      }
    }
  };

  useEffect(() => {
    if(showOnline) {
      setFilteredUsers(onlineUserInfo)
    } else {
      setFilteredUsers(allUsers);
    }
  }, [allUsers, page, auth, showOnline, onlineUserInfo]);

  return (
    <article
      style={{
        scrollbarGutter: "stable",
      }}
      className="bg-secondary p-2 overflow-auto"
      onScroll={(e) => handleScroll(e)}
    >
      {/* Search box section */}
      <Input
        autoComplete="off"
        tabIndex={0}
        ref={searchBoxRef}
        onKeyUp={(e) => {
          if (showOnline) {
            setFilteredUsers(
              onlineUserInfo?.filter((user) =>
                user?.fullName
                  ?.toLowerCase()
                  ?.includes(e.target.value?.trim()?.toLowerCase())
              )
            );
          } else {
            setFilteredUsers(
              allUsers?.filter((user) =>
                user?.fullName
                  ?.toLowerCase()
                  ?.includes(e.target.value?.trim()?.toLowerCase())
              )
            );
          }
        }}
        inputId={"searchUsers"}
        type={"search"}
        placeholderInfo={"Search users..."}
        isRequired={true}
      />
      {/* End */}

      <article className="flex gap-1 items-center justify-center my-5">
        <User2Icon className="stroke-accent" />
        Users
      </article>
      
      <hr className="border-accent border rounded-sm" />

      {/* Show Online user section */}
      <label htmlFor={showOnlineInputId} className="flex gap-1 sm:gap-2 w-full flex-wrap items-center justify-center sm:justify-start my-4 text-[.6rem] sm:text-sm cursor-pointer select-none">
        <input id={showOnlineInputId} onChange={()=>{
          setShowOnline(prev=> !prev)
          if(searchBoxRef?.current) {
            searchBoxRef.current.value = ''
          }
        }} className="size-3 focus-visible:ring-2 accent-white ring-accent outline-none cursor-pointer" type="checkbox" />
        Show Online
      </label>
      {/* End */}


      {/* Users List Skeleton */}
      {
        loading && <UsersSkeleton />
      }
      {/* End */}

      {/* Actual Users list */}
      <ul className="flex flex-col gap-4 min-h-fit">
        {!loading && filteredUsers && filteredUsers?.length > 0 ? (
          filteredUsers?.map((user, i) => (
            <li
              key={user?._id}
              tabIndex={0}
              className="outline-none cursor-pointer focus-visible:ring-2 ring-accent rounded-sm"
              onKeyUp={(e) => {
                if (e.key === "Enter") {
                  if (selectedUser?.userId !== user?._id) {
                    handleSelectUser(user?._id);
                  }
                }
                if (e?.key === "ArrowRight") {
                  if (selectedUser?.userId === user?._id) {
                    if (chatBoxRef?.current) {
                      chatBoxRef?.current?.focus();
                    }
                  }
                }
              }}
              onClick={() => {
                if (selectedUser?.userId !== user?._id) {
                  handleSelectUser(user?._id);
                }
              }}
            >
              <aside
                className={`flex gap-2 items-center justify-center w-full rounded-sm p-2 border-none outline-none ${
                  selectedUser?.userId === user?._id
                    ? "bg-zinc-500 ring-2 ring-accent/50"
                    : "bg-zinc-700"
                }`}
              >
                <div className="size-10 bg-zinc-400 rounded-full relative">
                  <img
                    src={user?.profilePicture || "/avatar.webp"}
                    className="w-full h-full rounded-full object-cover object-center"
                    alt="user's profile pic"
                  />
                  {onlineUserInfo?.length > 0 &&
                    onlineUserInfo?.some(
                      (onlineUser) => onlineUser?.userId === user?._id
                    ) && (
                      <span className="size-3 bg-emerald-500 rounded-full absolute bottom-0 right-0"></span>
                    )}
                </div>
                <div className="hidden min-[780px]:flex sm:gap-2 sm:justify-between sm:items-center grow text-sm p-1">
                  <p className="font-extrabold">{user?.fullName}</p>
                </div>
              </aside>
            </li>
          ))
        ) : (
          <p className="text-center text-xs text-zinc-300">{showOnline ? "All quiet here." : "User Not Found!"}</p>
        )}
      </ul>
      
       {/* LoadMore spinner */}
      {loadMoreLoading && (
        <div className="flex justify-center items-center p-3">
          <Spinner width="size-8" />
        </div>
      )}
      {/* End */}
    </article>
  );
}

export default SideBar;
