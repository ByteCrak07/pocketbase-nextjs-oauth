import Head from "next/head";
import { NextPage } from "next";
import Link from "next/link";
import { usePbAuth } from "../contexts/AuthWrapper";

const Home: NextPage = () => {
  const { user, signOut } = usePbAuth();

  return (
    <>
      <Head>
        <title>Home page</title>
      </Head>
      <main>
        {!user ? (
          <Link href="/signin">Sign In page</Link>
        ) : (
          <>
            <h1>{user.name}</h1>
            <p>
              <img src={user.avatarUrl} width={50} alt="avatar" />
            </p>
            <p>Username: {user.username}</p>
            <p>Email: {user.email}</p>
            <button onClick={signOut}>Sign Out</button>
          </>
        )}
      </main>
    </>
  );
};

export default Home;
