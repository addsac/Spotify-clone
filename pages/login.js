import { getProviders, signIn } from "next-auth/react";

function Login({ providers }) {
  return (
    <div className="flex flex-col items-center justify-center bg-black min-h-screen w-full">
      <img src="https://storage.googleapis.com/pr-newsroom-wp/1/2018/11/Spotify_Logo_RGB_Green.png" alt="Spotify logo" className="h-20" />

      {Object.values(providers).map((provider) => (
        <div key={provider.name}>
          <button
            className="mt-7 bg-[#18D816] font-medium text-white px-4 py-3 rounded-full hover:opacity-80"
            onClick={() => signIn(provider.id, { callbackUrl: "/" })}
          >
            Accedi con {provider.name}
          </button>
        </div>
      ))}
    </div>
  );
}

export default Login;

export async function getServerSideProps() {
  const providers = await getProviders();

  return {
    props: {
      providers,
    },
  };
}
