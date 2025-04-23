import { Container, NavBar, Spinner } from "../components";
import { CameraIcon } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import { login } from "../store/auth.reducer";
import toast from "react-hot-toast";
import useImageReader from "../hooks/useImageReader";
import { useRef, useState } from "react";
import useImageCompress from "../hooks/useImageCompress";
import { useUser } from "../context/NavigationContext";

// Sub component ( Formatted Info section )
function Info({ title = "", data = "" }) {
  return (
    <div className="pb-4">
      <h2 className="text-sm sm:text-xl pb-1">{title}</h2>
      <p className="text-xs text-white/60 sm:text-sm">{data}</p>
    </div>
  );
}

function Profile() {
  const { auth } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const axiosPrivate = useAxiosPrivate();
  const [loading, setLoading] = useState(false);
  const { imageCompress, setCompressImageBlob } = useImageCompress();
  const { readImageFiles, file, setFile } = useImageReader();
  const selectProfilePicture = useRef(null);
  const { profilePicRef } = useUser();

  const handleUpdatePicture = async (e) => {
    if (
      e?.target?.files[0]?.type?.includes("image/") &&
      !e?.target?.files[0]?.type?.includes("image/gif") &&
      e?.target?.files[0]?.size / (1024 * 1024) < 2
    ) {
      const compressImageBlob = await imageCompress(e.target.files[0]);

      if (compressImageBlob) {
        readImageFiles(compressImageBlob);
        setLoading(true);
        try {
          const response = await axiosPrivate.patch(
            "/user/update-profile-pic",
            { file: compressImageBlob },
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );
          if (response?.data?.success) {
            toast?.success(response?.data?.message);
            dispatch(
              login({
                ...auth,
                profilePicture: response?.data?.data?.profilePicture,
              })
            );
          }
        } catch (error) {
          toast.error(error?.response?.data?.message || error?.message);
        } finally {
          setLoading(false);
          setFile(null);
          setCompressImageBlob(null);
          e.target.value = null;
        }
      }
    } else {
      toast.error("Oops! That image is too big. Try uploading one under 2MB.");
    }
  };

  return (
    <Container>
      <section className="text-white min-h-[500px] h-screen py-2 w-full">
        <NavBar />

        <article className="bg-secondary relative w-full min-h-[500px] h-[calc(100vh-6rem)] my-2 overflow-auto py-10 sm:p-10">
          <div className="bg-zinc-800 rounded-md w-full px-4 py-10 flex justify-center items-center flex-wrap gap-4">
            {/* Update profile picture section */}
            <label
              ref={profilePicRef}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  selectProfilePicture?.current?.click();
                }
              }}
              onClick={(e) => {
                if (loading) {
                  e.preventDefault();
                }
              }}
              className="flex justify-center items-center w-full sm:w-fit cursor-pointer p-2 rounded-sm sm:rounded-full outline-none focus-visible:ring-2 ring-white"
            >
              <input
                ref={selectProfilePicture}
                onChange={(e) => {
                  if (!loading) {
                    handleUpdatePicture(e);
                  }
                }}
                type="file"
                className="hidden"
                accept="image/*"
                name="file"
              />
              <div className="size-44 border-4 border-accent/70 bg-zinc-400 sm:size-56 sm:border-8 rounded-sm sm:rounded-full relative">
                <img
                  src={file || auth?.profilePicture || "/avatar.webp"}
                  className={`rounded-sm sm:rounded-full h-full w-full object-cover object-center ${
                    loading && "animate-pulse cursor-not-allowed"
                  }`}
                  alt="User's profile picture."
                />
                <div
                  className={`size-8 sm:size-12 border-4 rounded-full absolute bg-white -bottom-3 -right-3 sm:-right-2 sm:top-2/3 flex items-center justify-center ${
                    loading && "cursor-not-allowed"
                  } `}
                >
                  {loading ? (
                    <Spinner width="size-6" />
                  ) : (
                    <CameraIcon className={`size-4 sm:size-6 stroke-accent`} />
                  )}
                </div>
              </div>
            </label>
            <div className="ml-2 sm:ml-10">
              <Info title="Name" data={auth?.fullName} />
              <Info title="Email address" data={auth?.email} />
              {auth?.createdAt && (
                <Info
                  title="User since"
                  data={auth?.createdAt?.split("T")[0]}
                />
              )}
            </div>
          </div>

          <div className="absolute bottom-5 right-10 flex gap-2 justify-center items-center text-xs text-white/60 sm:text-sm">
            Active
            <span className="size-3 rounded-full bg-emerald-500 flex items-center justify-center relative">
              <span className="size-4 rounded-full bg-emerald-500/80 animate-pulse block absolute"></span>
            </span>
          </div>
        </article>
      </section>
    </Container>
  );
}

export default Profile;
