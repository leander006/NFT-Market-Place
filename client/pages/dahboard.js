const { useState, useEffect } = require("react");
const { ethers } = require("ethers");
import Web3modal from "web3modal";
import { contractAddress, Infura_URL } from "../config";
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
    const provider = new ethers.providers.JsonRpcProvider(Infura_URL);
    const marketContract = new ethers.Contract(
      contractAddress,
      NFTMARKETPLACE.abi,
      provider
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

  async function resellNFT(tokenId, tokenPrice) {
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
    console.log("getSigner ", getSigner);
    const marketContract = new ethers.Contract(
      contractAddress,
      NFTMARKETPLACE.abi,
      getSigner
    );
    const price = ethers.utils.parseUnits(tokenPrice, "ether");
    let listingPrice = await marketContract.getListingPrice();
    listingPrice = listingPrice.toString();
    let transaction = await marketContract.resellToken(tokenId, price, {
      value: listingPrice,
    });
    await transaction.wait();
    loadNFTs();
  }

  if (loading == "not-loading")
    return <h1 className="px-20 py-10 text-3xl">Wait loading...</h1>;

  if (loading == "loading" && !nft.length)
    return <h1 className="px-20 py-10 text-3xl">No NFT own by you</h1>;

  if (loading == "not-loading")
    return <h1 className="px-20 py-10 text-3xl">Wait loading...</h1>;

  if (loading == "loading" && !nft.length)
    return <h1 className="px-20 py-10 text-3xl">No NFT is listed by you</h1>;

  return (
    <div className="flex justify-center">
      <div className="flex justify-center">
        <div className="flex flex-row mr-10 mt-10">
          {nft.map((n, i) => (
            <div
              key={i}
              className="border text-blue-600 shadow w-64 h-60 rounded-xl mx-2 "
            >
              <Image
                src={n.image}
                alt={n.name}
                width={600}
                height={600}
                placeholder="blur"
                blurDataURL="/placeholder.png"
                layout="responsive"
                className="rounded-xl"
              />
              <div className="p-4">
                <p
                  style={{ height: "42px" }}
                  className="text-2xl font-semibold"
                >
                  {n.name}
                </p>
                <div style={{ height: "70px", overflow: "hidden" }}>
                  <p>{n.description}</p>
                </div>
              </div>

              <div className="p-4 bg-blue-600">
                <p className="text-2xl mb-4 font-bold text-white">
                  {n.price} ETH
                </p>
                <button
                  className="w-full bg-white text-black font-bold py-2 px-12 rounded"
                  onClick={() => resellNFT(n.tokenId, n.price)}
                >
                  Resell
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
