import React from "react";

function MessageSkeleton({size = 5}) {
  return (
    <ul className="flex flex-col gap-6">
      {Array.from(Array(size).keys())?.map((i) => (
        <li key={i} className="flex gap-2 animate-pulse duration-50">
          {i % 2 === 0 ? (
            <aside className="flex flex-row-reverse gap-2 w-full">
              <div className="size-10 bg-zinc-400 rounded-full self-end">
                <img
                  src={"/avatar.webp"}
                  className="w-full h-full rounded-full object-cover object-center "
                  alt="user's profile pic"
                />
              </div>

              <div className="w-full flex flex-col items-end ">
                <span className="text-xs font-thin block pr-2 pb-2">
                  <span className="pr-1">-- --- --</span>
                  -- : -- --
                </span>
                <div
                  className={`max-w-[95%] w-full sm:max-w-1/4 h-10 p-2 rounded-md bg-zinc-600 relative`}
                >
                  <div className="absolute -right-2 border-8 bottom-0 border-transparent border-b-zinc-600"></div>
                </div>
              </div>
            </aside>
          ) : (
            <aside className="flex gap-2 w-full">
                <div className="size-10 bg-zinc-400 rounded-full self-end">
                <img
                  src={"/avatar.webp"}
                  className="w-full h-full rounded-full object-cover object-center "
                  alt="user's profile pic"
                />
              </div>

              <div className="w-full flex flex-col items-start ">
                <span className="text-xs font-thin block pr-2 pb-2">
                  <span className="pr-1">-- --- --</span>
                  -- : -- --
                </span>
                <div className={`max-w-[95%] w-full sm:max-w-1/4 h-10 p-2 rounded-md bg-zinc-600 relative`}>
                    <div className="absolute -left-2 border-8 bottom-0 border-transparent border-b-zinc-600"></div>
                </div>
              </div>
            </aside>
          )}
        </li>
      ))}
    </ul>
  );
}

export default MessageSkeleton;
