const {useState,useEffect} = require("react");
const {ethers} = require('ethers')
import { useRouter } from "next/router";
import web3modal from "web3modal";
import { contractAddress} from "../config";
import NFTMARKETPLACE from "../abi/NFTMARKETPLACE.json"
import axios from "axios";
import Image from "next/image";


export default function dashBoard(){
      return(
            <div>
                  <h1>Dashboard</h1>
            </div>
      )
}