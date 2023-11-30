import Link from "next/link";
import "../styles/globals.css";

function MyApp({ Component, pageProps }) {
  return (
    <div className="bg-blue-600 h-12 px-2">
      <nav className="flex justify-between text-white ">
        <Link href="/landing2">
          <a className="text-4xl m-2 font-bold">Metaverse</a>
        </Link>
        <div className="flex items-center">
          <Link href="/">
            <a className="text-xl m-2 font-bold">Buy</a>
          </Link>
          <Link href="/create">
            <a className="text-xl m-2 font-bold">Create</a>
          </Link>
          <Link href="/dahboard">
            <a className="text-xl m-2 font-bold">DashBoard</a>
          </Link>
        </div>
        {/* <div className="flex mt-4">
          <Link href="/">
            <a className="mr-4 text-pink-500">Home</a>
          </Link>
          <Link href="/create-nft">
            <a className="mr-6 text-pink-500">Sell NFT</a>
          </Link>
          <Link href="/my-nfts">
            <a className="mr-6 text-pink-500">My Nft</a>
          </Link>
          <Link href="/dashboard">
            <a className="mr-6 text-pink-500">Dashboard</a>
          </Link>
        </div> */}
      </nav>
      <Component {...pageProps} />
    </div>
  );
}

export default MyApp;
