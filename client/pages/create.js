import React, { useState } from "react";
const { ethers } = require("ethers");
import { useRouter } from "next/router";
import web3modal from "web3modal";
import { contractAddress, PINATA_KEY, PINATA_SECRET } from "../config";
import NFTMARKETPLACE from "../abi/NFTMARKETPLACE.json";
import axios from "axios";
import Image from "next/image";

export default function create() {
  const [fileUrl, setFileUrl] = useState(null);
  const [formInput, setFormInput] = useState({
    price: "",
    name: "",
    description: "",
  });
  const router = useRouter();
  const [loading, setLoading] = useState("not-loading");

  // upload image to ipfs //
  async function imageUpload(e) {
    const file = e.target.files[0];
    try {
      const formData = new FormData();
      formData.append("file", file);
      const resFile = await axios({
        method: "post",
        url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
        data: formData,
        headers: {
          pinata_api_key: `${PINATA_KEY}`,
          pinata_secret_api_key: `${PINATA_SECRET}`,
          "content-type": "multipart/form-data",
        },
      });
      console.log("resFile ", resFile);
      const imageUrl = `https://gateway.pinata.cloud/ipfs/${resFile.data.IpfsHash}`;
      setFileUrl(imageUrl);
    } catch (error) {
      console.log("error in uploading file", error);
    }
  }

  // Uplaod json data in ipfs and to get tokenURI //
  async function uploadToIPFS() {
    const { name, description, price } = formInput;
    if (!name || !description || !price || !fileUrl) return;
    setLoading("loading");
    try {
      var jsonData = JSON.stringify({
        pinataMetadata: {
          name: `${name}.json`,
        },
        pinataContent: {
          name,
          description,
          image: fileUrl,
        },
      });
      const resFile = await axios({
        method: "post",
        url: "https://api.pinata.cloud/pinning/pinJSONToIPFS",
        data: jsonData,
        headers: {
          pinata_api_key: PINATA_KEY,
          pinata_secret_api_key: PINATA_SECRET,
          "Content-type": "application/json",
        },
      });
      const tokenUrl = `https://gateway.pinata.cloud/ipfs/${resFile.data.IpfsHash}`;
      return tokenUrl;
    } catch (error) {
      console.log("error in uploading json ", error);
    }
  }

  async function listNFTforSale() {
    const url = await uploadToIPFS();
    const web3Modal = new web3modal();
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
    const contract = new ethers.Contract(
      contractAddress,
      NFTMARKETPLACE.abi,
      getSigner
    );
    console.log("formInput.price ", formInput.price);
    const price = ethers.utils.parseUnits(formInput.price, "ether");
    let listingPrice = await contract.getListingPrice();
    listingPrice = listingPrice.toString();
    let transaction = await contract.createToken(url, price, {
      value: listingPrice,
    });
    await transaction.wait();
    router.push("/");
  }

  return (
    <div className="flex justify-center">
      <div className="w-1/8 flex flex-col mr-10 mt-10">
        {!fileUrl && (
          <Image
            className="rounded mt-4"
            height={200}
            width={300}
            src="/placeholder.png"
          />
        )}
        {fileUrl && (
          <Image
            className="rounded mt-4"
            alt="Image uploaded successfully"
            height={200}
            width={300}
            src={fileUrl}
            placeholder="blur"
            blurDataURL="/placeholder.png"
          />
        )}
      </div>
      <div className="w-1/2 flex flex-col">
        <input
          placeholder="Assest name"
          type="text"
          className="mt-8 border p-4"
          onChange={(e) => setFormInput({ ...formInput, name: e.target.value })}
        />
        <textarea
          placeholder="Assest Description"
          className="mt-2 border p-4"
          onChange={(e) =>
            setFormInput({ ...formInput, description: e.target.value })
          }
        />
        <input
          placeholder="Assest price in ETH"
          type="number"
          className="mt-8 border p-4"
          onChange={(e) =>
            setFormInput({ ...formInput, price: e.target.value })
          }
        />
        <input
          placeholder="Amount of token"
          type="number"
          className="mt-8 border p-4"
          onChange={(e) =>
            setFormInput({ ...formInput, price: e.target.value })
          }
        />
        <input
          type="file"
          accept="image/*"
          name="Assest"
          className="my-4"
          onChange={imageUpload}
        />
        {fileUrl && (
          <button
            className="font-bold mt-4 bg-pink-500 text-white rounded p-4 shadow-lg"
            onClick={listNFTforSale}
          >
            {loading == "not-loading" ? "Create NFT" : "Wait uploading...."}
          </button>
        )}
      </div>
    </div>
  );
}
