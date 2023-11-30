const { useState, useEffect } = require("react");
const { ethers } = require("ethers");
import Web3modal from "web3modal";
import { contractAddress } from "../config";
import NFTMARKETPLACE from "../abi/NFTMARKETPLACE.json";
import axios from "axios";
import Image from "next/image";

export default function dahboard() {
  const [nft, setNft] = useState([]);
  const [loading, setLoading] = useState("not-loading");
  useEffect(() => {
    loadNFTs();
  }, []);

  async function loadNFTs() {
    const web3Modal = new Web3modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const getNetwork = await provider.getNetwork();
    const goerliChainId = 5;
    if (getNetwork.chainId != goerliChainId) {
      alert("Should be connected to goerli network ");
      return;
    }
    // Sign the transacrion
    const getSigner = provider.getSigner();
    const marketContract = new ethers.Contract(
      contractAddress,
      NFTMARKETPLACE.abi,
      getSigner
    );
    const data = await marketContract.fetchItemListed();

    const items = await Promise.all(
      data.map(async (i) => {
        const tokenUri = await marketContract.tokenURI(i.tokenId);
        const meta = await axios.get(tokenUri);
        let price = ethers.utils.formatUnits(i.price.toString(), "ether");
        let item = {
          price,
          tokenId: i.tokenId.toNumber(),
          seller: i.seller,
          owner: i.ownerl,
          name: meta.data.name,
          image: meta.data.image,
          description: meta.data.description,
        };

        return item;
      })
    );
    setNft(items);
    setLoading("loading");
  }

  async function cancelListing(tokenId) {
    setLoading("not-loading");
    const web3Modal = new Web3modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const getNetwork = await provider.getNetwork();
    const goerliChainId = 5;
    if (getNetwork.chainId != goerliChainId) {
      alert("Should be connected to goerli network ");
      return;
    }
    // Sign the transacrion
    const getSigner = provider.getSigner();
    const marketContract = new ethers.Contract(
      contractAddress,
      NFTMARKETPLACE.abi,
      getSigner
    );
    const transaction = await marketContract.cancelNFTsell(tokenId);
    await transaction.wait();
    loadNFTs();
  }

  if (loading == "not-loading")
    return <h1 className="px-20 py-10 text-3xl">Wait loading...</h1>;

  if (loading == "loading" && !nft.length)
    return <h1 className="px-20 py-10 text-3xl">No NFT is listed by you</h1>;

  return (
    <div className="flex justify-center">
      <div className="flex justify-center">
        <h1>Dashboard</h1>
        <div className="w-1/8 flex flex-col mr-10 mt-10">
          <Image
            className="rounded mt-4"
            height={200}
            width={300}
            src="/placeholder.png"
          />
          <Image
            className="rounded mt-4"
            alt="Image uploaded successfully"
            height={200}
            width={300}
            // src={fileUrl}
            placeholder="blur"
            blurDataURL="/placeholder.png"
          />
          <h1 className="text-blue-400">hello</h1>
        </div>
      </div>
    </div>
  );
}
