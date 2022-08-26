import Link from 'next/link'
import '../styles/globals.css'

function MyApp({ Component, pageProps }) {
  return(
      <div>
        <nav className='border-b p-6'>
          <p className='text-4xl font-bold'>Metaverse NFT shop</p>
          <div className='flex mt-4'>
            <Link href="/">
              <a className='mr-4 text-pink-500'>Home</a>
            </Link>
            <Link href="/create-nft">
              <a className='mr-6 text-pink-500'>Sell NFT</a>
            </Link>
            <Link href="/my-nfts">
              <a className='mr-6 text-pink-500'>My Nft</a>
            </Link>
            <Link href="/dashboard">
              <a className='mr-6 text-pink-500'>Dashboard</a>
            </Link>
          </div>
        </nav>
        <Component {...pageProps} />
      </div>
  )
}

export default MyApp
