import React from "react";

function UsersSkeleton({size = 10}) {
  return (
    <ul className="flex flex-col gap-4 min-h-fit">
      {Array.from(Array(size).keys())?.map((i) => (
        <li key={i} className="animate-pulse">
          <aside className="flex gap-2 items-center justify-center w-full bg-zinc-700 rounded-sm p-2">
            <div className="size-10 bg-zinc-400 rounded-full relative">
              <img
                src={"/avatar.webp"}
                className="w-full h-full rounded-full object-cover object-center"
                alt="user's profile pic"
              />
            </div>
            <div className="hidden min-[780px]:flex sm:gap-2 sm:justify-between sm:items-center grow text-sm p-1">
              <div className="w-3/4 h-4 rounded-full animate-pulse bg-zinc-800"></div>
            </div>
          </aside>
        </li>
      ))}
    </ul>
  );
}

export default UsersSkeleton;
