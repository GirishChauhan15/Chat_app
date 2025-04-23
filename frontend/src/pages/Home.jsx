import { Container, MessageBox, NavBar, SideBar } from "../components";
import { useSelector } from "react-redux";
import { MessageSquareMoreIcon } from "lucide-react";

function Home() {
  const { selectedUser } = useSelector((state) => state.message);

  return (
    <Container>
      <section className="text-white py-2 min-h-fit w-full overflow-hidden relative">
        <NavBar />

        <section className="flex flex-1 min-h-fit overflow-auto h-[calc(100vh-6rem)]">
          <article className="grid grid-cols-4 w-full py-2 gap-2">
            <SideBar />

            {selectedUser?.userId ? (
              <MessageBox />
            ) : (
              <div className="flex flex-col justify-center items-center w-full col-span-3 gap-2 bg-secondary text-center">
                <MessageSquareMoreIcon className="size-8 sm:size-10 stroke-accent animate-bounce" />
                <h2 className="text-sm font-bold sm:text-xl">
                  Nothing Here Yet, Start Chatting
                </h2>
                <p className="text-[.6rem] sm:text-sm">
                  Engage in a conversation, and this space will fill with life.
                </p>
              </div>
            )}
          </article>
        </section>
      </section>
    </Container>
  );
}

export default Home;