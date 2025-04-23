import {
  LogOut,
  LucideGanttChartSquare,
  Menu,
  UserSquare2Icon,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { logo } from "../assets";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../store/auth.reducer";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import useSocketDisconnect from "../hooks/useSocketDisconnect";
import { reset } from "../store/message.reducer";
import { Spinner } from "./index";
import { useUser } from "../context/NavigationContext";


function NavBar() {
  const [showSideBar, setShowSidebar] = useState(false);
  const axiosPrivate = useAxiosPrivate();
  const { disconnectSocket } = useSocketDisconnect();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [logoutLoading, setLogoutLoading] = useState(false);
  const sideBarRef = useRef(null)
  const {searchBoxRef, profilePicRef} = useUser()
  const [isMobile, setIsMobile] = useState(false)
  const location = useLocation()

  const handleLogout = async () => {
    setLogoutLoading(true);
    try {
      const response = await axiosPrivate.patch("/user/logout");
      if (response?.data?.success) {
      window.location.reload()
      }
    } catch (error) {
    } finally {
      dispatch(logout());
      navigate("/login");
      dispatch(reset());
      disconnectSocket();
      setLogoutLoading(false);
    }
  };

  // Checks screen width and update accordingly
  useEffect(()=>{
    const abortcontroller = new AbortController()
    if(window?.innerWidth > 640) {
      setIsMobile(false)
    } else {
      setIsMobile(true)
    }

    window.addEventListener('resize', (e) => {
      if(e?.target?.innerWidth > 640) {
        setIsMobile(false)
    } else {
      setIsMobile(true)
    }
      setShowSidebar(false)
    },{signal: abortcontroller?.signal})
    return () => {
      abortcontroller.abort()
    }
  },[])


  // Auto-close on blur logic
  useEffect(()=>{
    const controller = new AbortController()
    const handleClickOutSideNav = (e) => {
      if(!sideBarRef?.current?.contains(e?.target)) {
        setShowSidebar(false)
      }
    }

    window.addEventListener('mousedown', handleClickOutSideNav, {signal: controller?.signal})
    return () => {
      controller?.abort()
    }

  },[])

  useEffect(()=>{
    if(showSideBar) {
    if(sideBarRef?.current) {
      sideBarRef?.current?.focus()
    }
  }
  },[showSideBar])

  return (
    <article className="min-h-20 bg-secondary flex justify-between items-center gap-4 px-10 text-sm flex-wrap py-2 relative z-[999]">
      {/* Skip navigation button */}
      <button 
      onFocus={()=>{
        if(showSideBar){
          setShowSidebar(false)
        }
      }}
      onClick={()=>{
        if(location?.pathname === '/') {
          if(searchBoxRef?.current) {
            searchBoxRef?.current?.focus()
          }
        }

        if(location?.pathname === '/profile') {
          if(profilePicRef?.current) {
            profilePicRef?.current?.focus()
          }
        }
          }}
      className="text-transparent bg-transparent absolute z-50 -translate-y-56 focus-visible:translate-y-0 transition-transform focus:bg-black focus:text-accent w-fit text-xs sm:text-sm px-3 py-2 rounded-md font-semibold focus-visible:ring-2 focus:outline-none focus:ring-accent">Skip navigation</button>
      {/* End */}

      {/* Dynamic Navbar section */}
      {showSideBar ? (
        <img src={logo} className="w-20" />
      ) : (
        <div className="flex justify-between gap-2 flex-wrap items-center w-full sm:w-fit">
            <img src={logo} className="w-20" />
          <Menu
          tabIndex={0}
          onKeyDown={(e)=>{
            if(e.key === 'Enter') {
              setShowSidebar(true)
            }
          }}
            className={`cursor-pointer max-[200px]:self-end sm:hidden focus-visible:ring-2 ring-accent hover:stroke-white stroke-white/80 rounded-sm outline-none ${showSideBar && isMobile && 'hidden'}`}
            onClick={() => {
              setShowSidebar(true)
            }}
          />
        </div>
      )}

      <aside
      tabIndex={isMobile ? 0 : ''}
      ref={sideBarRef}
      onKeyUp={(e)=>{
        if(e.key === 'Escape') {
          setShowSidebar(false)
        }
      }}
        className={`w-2/3 grow h-full bg-accent/20 backdrop-blur-3xl sm:bg-transparent fixed right-0 top-0 min-h-screen overflow-auto sm:static sm:min-h-fit transition-transform ease-in-out outline-none focus-visible:ring-1 ring-accent ${
          showSideBar ? "sm:translate-0" : "translate-x-full sm:translate-0"
        } 
        ${!showSideBar && isMobile && 'hidden' }
        `}
      >
        <X
        tabIndex={0}
        onKeyUp={(e)=>{
          if(e.key === 'Enter') {
            setShowSidebar(false)
          }
        }}
          className={`absolute right-10 top-7 cursor-pointer sm:hidden outline-none rounded-md focus-visible:ring-2 ring-accent hover:stroke-white stroke-white/80 ${!showSideBar && isMobile  && 'hidden'}`}
          onClick={() => setShowSidebar(false)}
        />
        <div className="pt-20 pb-10 flex justify-between flex-col min-h-screen items-center gap-8 sm:flex-row sm:min-h-fit sm:p-0">
          <div className="flex gap-4 flex-col sm:flex-row sm:justify-end sm:w-full sm:pr-10">
            <NavLink
              to={"/"}
              className={({ isActive }) =>
                `flex gap-4 items-center bg-accent/30 px-3 py-2 rounded-lg outline-none focus:ring-2 focus:ring-accent hover:bg-accent/40 ${
                  isActive && "bg-accent/50"
                } ${!showSideBar && isMobile && 'hidden'}`}
              >
              <LucideGanttChartSquare className="size-5 stroke-accent hover:stroke-accent/80" />
              <span className="max-[280px]:hidden sm:block">Chat</span>
            </NavLink>
            <NavLink
              to={"/profile"}
              className={({ isActive }) =>
                `flex gap-4 items-center bg-accent/30 px-3 py-2 rounded-lg outline-none focus:ring-2 focus:ring-accent hover:bg-accent/40 ${
                  isActive && "bg-accent/50"
                } ${!showSideBar && isMobile && 'hidden'}`}
            >
              <UserSquare2Icon className="size-5 stroke-accent hover:stroke-accent/80" />
              <span className="max-[280px]:hidden sm:block">Profile</span>
            </NavLink>
          </div>
          <button 
            onClick={handleLogout}
            onKeyDown={(e)=>{
              if(e.key === 'Tab' && !e.shiftKey) {
                setShowSidebar(false)
              }
            }}
            className={`flex gap-2 cursor-pointer items-center border-2 border-accent/30 px-3 py-2 rounded-lg outline-none hover:bg-accent/10 focus:bg-accent/20 ${!showSideBar && isMobile && 'hidden'}`}
          >
            {logoutLoading ? (
              <Spinner width="size-4" />
            ) : (
              <><LogOut className="size-5 stroke-accent hover:stroke-accent/80" />
                <span className="max-[280px]:hidden sm:block"></span> Logout</>
            )}
          </button>
        </div>
      </aside>
    </article>
  );
}

export default NavBar;
