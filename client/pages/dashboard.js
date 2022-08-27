const {useState,useEffect} = require("react");
const {ethers} = require('ethers')
import Web3modal from "web3modal";
import { contractAddress} from "../config";
import NFTMARKETPLACE from "../abi/NFTMARKETPLACE.json"
import axios from "axios";
import Image from "next/image";


export default function createrDashBoard(){

      const [nft, setNft] = useState([])
      const [loading, setLoading] = useState('not-loading')
      useEffect(() => {
        loadNFTs();
      },[]);
      
      async function loadNFTs(){
            const web3Modal = new Web3modal();
            const connection = await web3Modal.connect();
            const provider = new ethers.providers.Web3Provider(connection);
            const getNetwork = await provider.getNetwork();
            const goerliChainId =5;
            if(getNetwork.chainId!= goerliChainId){
              alert("Should be connected to goerli network ")
              return;
            }
            // Sign the transacrion
            const getSigner = provider.getSigner();
            const marketContract  = new ethers.Contract(contractAddress,NFTMARKETPLACE.abi,getSigner);
            const data = await marketContract.fetchItemListed();
    
            const items = await Promise.all(data.map(async i =>{
            
            const tokenUri = await marketContract.tokenURI(i.tokenId)
            const meta = await axios.get(tokenUri);
            let price = ethers.utils.formatUnits(i.price.toString(),'ether');
            let item = {
              price,
              tokenId:i.tokenId.toNumber(),
              seller:i.seller,
              owner:i.ownerl,
              name:meta.data.name,
              image:meta.data.image,
              description:meta.data.description
            }
    
            return item;
          }));
          setNft(items);
          setLoading('loading')
      }

      async function cancelListing(tokenId){
            setLoading('not-loading')
            const web3Modal = new Web3modal();
            const connection = await web3Modal.connect();
            const provider = new ethers.providers.Web3Provider(connection);
            const getNetwork = await provider.getNetwork();
            const goerliChainId =5;
            if(getNetwork.chainId!= goerliChainId){
              alert("Should be connected to goerli network ")
              return;
            }
            // Sign the transacrion
            const getSigner = provider.getSigner();
            const marketContract  = new ethers.Contract(contractAddress,NFTMARKETPLACE.abi,getSigner);
            const transaction = await marketContract.cancelNFTsell(tokenId);
            await transaction.wait();
            loadNFTs();

      }

      if(loading == 'not-loading')
      return(
        <h1 className="px-20 py-10 text-3xl">Wait loading...</h1>
      )

      if(loading == "loading" && !nft.length)
      return(
        <h1 className="px-20 py-10 text-3xl">No NFT is listed by you</h1>
      )


      return(
            <div className="flex justify-center">
                <div className="px-4" style={{maxWith:'1600px'}}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 pt-4">
                    {nft.map((n,i) =>(
                      <div key={i} className="border shadow rounded-xl overflow-hidden mx-5 my-5">
                        <Image src={n.image} alt={n.name} width={400} height={300} placeholder="blur" blurDataURL="    placeholder.png" layout="responsive"/>
                        <div className="p-4">
                          <p style={{height:'64px'}} className="text-2xl font-semibold">{n.name}</p>
                        </div>
                
                        <div className="p-4 bg-black">
                          <p className="text-2xl mb-4 font-bold text-white">{n.price} ETH</p>
                          <button className="w-full bg-red500 text-white font-bold py-2 px-12 rounded" onClick={()=>cancelListing(n.tokenId)}>Cancel listing</button>
                        </div>
                      </div>
                    ))}
          
                  </div>
                
                </div>
            
    </div>
      )
}