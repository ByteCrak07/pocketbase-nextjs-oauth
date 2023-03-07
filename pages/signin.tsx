import Head from "next/head";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect } from "react";
import type { AuthProviderInfo, Record as PbRecord } from "pocketbase";
import pb from "../lib/pocketbase";
import { usePbAuth } from "../contexts/AuthWrapper";

const SignIn: NextPage = () => {
  const { googleSignIn, githubSignIn, setUserData } = usePbAuth();

  const router = useRouter();

  const storeUserAndRedirect = (user: PbRecord) => {
    setUserData(user);
    router.replace("/");
  };

  useEffect(() => {
    const localAuthProvider: AuthProviderInfo = JSON.parse(
      localStorage.getItem("provider") as string
    );
    const params = new URL(location.href).searchParams;
    const redirectUrl = `${location.origin}/signin`;
    const code = params.get("code");

    // cancel signin logic if not a redirect
    if (
      !localAuthProvider ||
      !code ||
      localAuthProvider.state !== params.get("state")
    )
      return;

    pb.collection("users")
      .authWithOAuth2(
        localAuthProvider.name,
        code,
        localAuthProvider.codeVerifier,
        redirectUrl
      )
      .then(async (response) => {
        const user = await pb.collection("users").getOne(response.record.id);

        // skip profile updation if user already exists or user data from OAuth providers haven't changed
        if (
          user.name &&
          user.avatarUrl &&
          user.name === response.meta?.name &&
          user.avatarUrl === response.meta?.avatarUrl
        ) {
          storeUserAndRedirect(user);
        } else
          pb.collection("users")
            .update(response.record.id, {
              name: response.meta?.name,
              avatarUrl: response.meta?.avatarUrl,
            })
            .then((res) => {
              storeUserAndRedirect(res);
            })
            .catch((err) => {
              console.error(err);
            });
      })
      .catch((err) => {
        console.error(err);
      });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Head>
        <title>SignIn page</title>
      </Head>
      <main>
        <div>
          <button onClick={googleSignIn}>Sign in with Google</button>
        </div>
        <div>
          <button onClick={githubSignIn}>Sign in with GitHub</button>
        </div>
      </main>
    </>
  );
};

export default SignIn;
