import { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Outlet, useNavigate } from 'react-router-dom'
import { Spinner } from './components'
import { initializeSocket } from './hooks/socket';
import { setOnlineUserInfo } from './store/message.reducer';
import { UserContextProvider } from './context/NavigationContext';
import { decryptData } from './hooks/crypto';
import { login } from './store/auth.reducer';
import { config } from './config';


let socket;

function Layout() {
    const {auth} = useSelector(state=> state.user)
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const [loading, setLoading] = useState(true)

    const searchBoxRef = useRef(null)
    const profilePicRef = useRef(null)
    const chatBoxRef = useRef(null)

    useEffect(()=>{
        if(!auth) {
            navigate('/login')
            setLoading(false)
        } else if(auth && auth?._id) {
            navigate('/')
            setLoading(false)
        }
        return () => {
            setLoading(false)
        }
    },[])


    useEffect(() => {
      if (!auth?._id) return;
  
      socket = initializeSocket(auth._id);
  
      if (!socket.connected) {
        socket.connect();
      }
  
      socket.on("onlineUserInfo", (data) => {
        // remover current user and decrypt
          let filteredUserInfo = data?.filter(user=> user?._id !== auth?._id)
            let decryptedUsersInfo = filteredUserInfo?.map(user=>{
              const decryptedImage = decryptData(user?.profilePicture, config?.profilePictureEncryptionSecret)
              return { ...user, profilePicture : decryptedImage?.data || '' }
            })
            dispatch(setOnlineUserInfo(decryptedUsersInfo));
      });
  
      return () => {
        socket.off("onlineUserInfo");
      };
    }, [auth]);

    useEffect(()=>{
      if(auth?.profilePicture) {
        const decryptedImage = decryptData(auth?.profilePicture, config?.profilePictureEncryptionSecret)
        if(decryptedImage?.success) {
          dispatch(login({...auth, profilePicture : decryptedImage?.data}))
        }
      }
    },[auth?.profilePicture])


  return (
    <UserContextProvider value={{searchBoxRef, profilePicRef, chatBoxRef}}>
      <section className='w-full h-screen flex justify-center items-center min-h-[400px]'>
          { loading ? <Spinner /> :
              <Outlet />
            }
      </section>
    </UserContextProvider>
  )
}

export default Layout