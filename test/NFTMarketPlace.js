const {expect} = require("chai");
const {ethers} = require("hardhat")


describe("NFT MarketPlace", function () {
      let NFTMarket;
      let nftmarket;
      let listingprice;
      let contractOwner;
      let buyerAddress;
      let nftMarketaddress;

      const auctionprice = ethers.utils.parseUnits("100", "ether");

      beforeEach(async () =>{
            NFTMarket = await ethers.getContractFactory("NFTMARKETPLACE")
            nftmarket = await NFTMarket.deploy();
            await nftmarket.deployed();
            nftMarketaddress = nftmarket.address;
            [contractOwner,buyerAddress] = await ethers.getSigners();
            listingprice = await nftmarket.getListingPrice();
            listingprice = listingprice.toString();
      })

      const mintAndListNFT =async(tokenURI,auctionprice)=>{
            const transaction = await nftmarket.createToken(tokenURI,auctionprice,{value:listingprice})
            const receipt = await transaction.wait();
            const tokenId =receipt.events[0].args.tokenId;
            return tokenId;

      }

      describe(" Mint and List new NFT",() =>{
            const tokenURI = "https://some-token.uri/";

            it("Should revert if price is zero",async () =>{
                  await expect(mintAndListNFT(tokenURI,0)).to.be.revertedWith("Price must be greater than zero");
            } )

            it("Should revert if listing price is not correct",async () =>{
                  await expect(nftmarket.createToken(tokenURI,auctionprice,{value:0})).to.be.revertedWith("Price must be equal to listing price")
            })

            it("Should create NFT with correct owner and tokenId", async ()=>{
                  const tokenId = await mintAndListNFT(tokenURI,auctionprice);

                  const mintedTokenURI = await nftmarket.tokenURI(tokenId);
                  const owner = await nftmarket.ownerOf(tokenId);

                  expect(owner).to.equal(nftMarketaddress)
                  expect(mintedTokenURI).to.equal(tokenURI)
            })

            it("Should emit MarketItem created after successfully listing NFT", async () =>{
                  const transaction = await nftmarket.createToken(tokenURI,auctionprice,{value:listingprice})
                  const receipt = await transaction.wait();
                  const tokenID = receipt.events[0].args.tokenId;
                  await expect(transaction).to.emit(nftmarket,"MarketItemCreated").withArgs(tokenID,contractOwner.address,nftMarketaddress,auctionprice,false)
            })
      })

      describe("Execute sale of MarketItem" , ()=>{
            const tokenURI = "https://some-token.uri/";

            it("Should revert if price is not correct", async ()=>{
                  
                  const newNftToken = await mintAndListNFT(tokenURI,auctionprice);

                  await expect(nftmarket.connect(buyerAddress).createMarketSale(newNftToken,{value:60})).to.be.revertedWith("Please give the require price of NFT ")
            })

            it("Buy a new Token and check token owner address", async () =>{
                  const newNftToken = await mintAndListNFT(tokenURI,auctionprice);
                  const oldOwnerAddress = await nftmarket.ownerOf(newNftToken)

                  // Now owner is marketPlace owner 
                  expect(oldOwnerAddress).to.equal(nftMarketaddress)

                  await nftmarket.connect(buyerAddress).createMarketSale(newNftToken,{value:auctionprice});
                  const newOwnerAddress = await nftmarket.ownerOf(newNftToken)
                  // Now check new owner is buyer address 

                  expect(newOwnerAddress).to.equal(buyerAddress.address)
            })
      })

      describe("Resell of MarketItem", () =>{
            const tokenURI = "https://some-token.uri/";

            it("Should revert if token owner of listing price is not correct", async() =>{
                  const newTokenURI = await mintAndListNFT(tokenURI,auctionprice);

                  await nftmarket.connect(buyerAddress).createMarketSale(newTokenURI,{value:auctionprice})
                  await expect(nftmarket.resellToken(newTokenURI,auctionprice,{value:listingprice})).to.rejectedWith("Owner can resell his own NFT")
                  await expect(nftmarket.connect(buyerAddress).resellToken(newTokenURI,auctionprice,{value:0})).to.rejectedWith("Please pay a listing price before reselling")
            })

            it("Buy a new token and then resell it",async() =>{
                  const newTokenURI = await mintAndListNFT(tokenURI,auctionprice);

                  await nftmarket.connect(buyerAddress).createMarketSale(newTokenURI,{value:auctionprice})
                  const tokenOnwerAddress = await nftmarket.ownerOf(newTokenURI)

                  expect(tokenOnwerAddress).to.equal(buyerAddress.address);

                  await nftmarket.connect(buyerAddress).resellToken(newTokenURI,auctionprice,{value:listingprice});

                  const resellTokenAddress = await nftmarket.ownerOf(newTokenURI);

                  expect(resellTokenAddress).to.equal(nftMarketaddress)
            })
      })

      describe("Fetch marketPlace Item", () =>{
            const tokenURI = "https://some-token.uri/";
            it("Should fetch the correct number of listed items" , async() =>{
                  await mintAndListNFT(tokenURI,auctionprice);
                  await mintAndListNFT(tokenURI,auctionprice);
                  await mintAndListNFT(tokenURI,auctionprice);

                  let unsoldItem = await nftmarket.fetchMarketItem();

                  expect(unsoldItem.length).to.equal(3);
            })

            it("Should fetch correct number of item that user buy", async() =>{
                  const newNftToken = await mintAndListNFT(tokenURI,auctionprice);
                  await mintAndListNFT(tokenURI,auctionprice);
                  await mintAndListNFT(tokenURI,auctionprice);

                  await nftmarket.connect(buyerAddress).createMarketSale(newNftToken,{value:auctionprice});
                  let soldItem = await nftmarket.connect(buyerAddress).fetchMyNFT();
                  expect(soldItem.length).to.equal(1);
            })

            it("Should fetch correct number of items listed by user", async () =>{
                  await mintAndListNFT(tokenURI,auctionprice);
                  await mintAndListNFT(tokenURI,auctionprice);

                  await nftmarket.connect(buyerAddress).createToken(tokenURI,auctionprice,{value:listingprice})

                  let ownerItem = await nftmarket.fetchItemListed();

                  expect(ownerItem.length).to.equal(2);
            })
      })

      describe("Cancel a MarketPlace Item" , () =>{
            const tokenURI = "https://some-token.uri/";
            
            it("Should cancel and return the correct number of listings", async() =>{
                  const newTokenURI = await mintAndListNFT(tokenURI,auctionprice);

                  await nftmarket.connect(buyerAddress).createToken(tokenURI,auctionprice,{value:listingprice});
                  await nftmarket.connect(buyerAddress).createToken(tokenURI,auctionprice,{value:listingprice});

                  let unsoldItem = await nftmarket.fetchMarketItem();
                  expect(unsoldItem.length).to.equal(3);

                  await nftmarket.cancelNFTsell(newTokenURI);

                  let newListItem = await nftmarket.fetchMarketItem();

                  expect(newListItem.length).to.equal(2);
            })
      })
})