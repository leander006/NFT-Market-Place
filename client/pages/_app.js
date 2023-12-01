import Link from "next/link";
import "../styles/globals.css";

function MyApp({ Component, pageProps }) {
  return (
    <div className="bg-blue-600 h-14 px-2 pb-4">
      <nav className="flex justify-between text-white ">
        <Link href="/">
          <a className="text-4xl m-2 font-bold">Metaverse</a>
        </Link>
        <div className="flex items-center">
          <Link href="/buy">
            <a className="text-xl m-2 font-bold">Buy</a>
          </Link>
          <Link href="/create">
            <a className="text-xl m-2 font-bold">Create</a>
          </Link>
          <Link href="/dahboard">
            <a className="text-xl m-2 font-bold">DashBoard</a>
          </Link>
        </div>
      </nav>
      <Component {...pageProps} />
    </div>
  );
}

export default MyApp;
