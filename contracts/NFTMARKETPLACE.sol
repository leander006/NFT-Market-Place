// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract NFTMARKETPLACE is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds; // Total number of items ever created
    Counters.Counter private _itemsold; // Total number of items sold

    uint256 listingPrice = 0.000025 ether; //people have to pay to list their nft
    address payable owner;

    constructor() ERC721("METAVERSE TOKEN", "META") {
        owner = payable(msg.sender);
    }

    mapping(uint256 => MarketItem) private idToMarketItem;

    struct MarketItem {
        uint256 tokenId;
        address payable seller;
        address payable owner;
        uint256 price;
        bool sold;
    }

    event MarketItemCreated(
        uint256 indexed tokenId,
        address seller,
        address owner,
        uint256 price,
        bool sold
    );

    // Returns the listing Price of market

    function getListingPrice() public view returns (uint256) {
        return listingPrice;
    }

    // Update the listing price of markter
    function updatePrice(uint _listingPrice) public payable {
        require(owner == msg.sender, "Only owner can change listing price");
        listingPrice = _listingPrice;
    }

    // Create Item //

    function createItem(uint256 tokenId, uint256 price) private {
        require(price > 0, "Price must be greater than zero");
        require(
            msg.value == listingPrice,
            "Price must be equal to listing price"
        );

        idToMarketItem[tokenId] = MarketItem(
            tokenId,
            payable(msg.sender),
            payable(address(this)),
            price,
            false
        );

        _transfer(msg.sender, address(this), tokenId);
        emit MarketItemCreated(
            tokenId,
            msg.sender,
            address(this),
            price,
            false
        );
    }

    // Mint a token and list it in market

    function createToken(
        string memory tokenURI,
        uint256 price
    ) public payable returns (uint) {
        _tokenIds.increment();
        uint newTokenId = _tokenIds.current();
        _mint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, tokenURI);
        createItem(newTokenId, price);
        return newTokenId;
    }

    // To transfer ownership of token and funds between users

    function createMarketSale(uint tokenId) public payable {
        uint price = idToMarketItem[tokenId].price;
        address seller = idToMarketItem[tokenId].seller;
        require(msg.value == price, "Please give the require price of NFT ");
        idToMarketItem[tokenId].owner = payable(msg.sender);
        idToMarketItem[tokenId].sold = true;
        idToMarketItem[tokenId].seller = payable(address(0));
        _itemsold.increment();
        _transfer(address(this), msg.sender, tokenId); // To transfer tokenId
        payable(owner).transfer(listingPrice);
        payable(seller).transfer(price);
    }

    // To get all listed unsoled NFT

    function fetchMarketItem() public view returns (MarketItem[] memory) {
        uint itemCount = _tokenIds.current();
        uint unsoldCount = _tokenIds.current() - _itemsold.current();
        uint currentIndex = 0;

        MarketItem[] memory items = new MarketItem[](unsoldCount);

        for (uint i = 0; i < itemCount; i++) {
            if (idToMarketItem[i + 1].owner == address(this)) {
                MarketItem storage currentItem = idToMarketItem[i + 1];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }

        return items;
    }

    // To get all NFT own by user

    function fetchMyNFT() public view returns (MarketItem[] memory) {
        uint itemCount = _tokenIds.current();
        uint unsoldCount = 0;
        uint currentIndex = 0;

        for (uint i = 0; i < itemCount; i++) {
            if (idToMarketItem[i + 1].owner == msg.sender) {
                unsoldCount += 1;
            }
        }

        MarketItem[] memory items = new MarketItem[](unsoldCount);

        for (uint i = 0; i < itemCount; i++) {
            if (idToMarketItem[i + 1].owner == msg.sender) {
                MarketItem storage currentItem = idToMarketItem[i + 1];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }

        return items;
    }

    // To get NFT that is to be selled

    function fetchItemListed() public view returns (MarketItem[] memory) {
        uint itemCount = _tokenIds.current();
        uint unsoldCount = 0;
        uint currentIndex = 0;

        for (uint i = 0; i < itemCount; i++) {
            if (idToMarketItem[i + 1].seller == msg.sender) {
                unsoldCount += 1;
            }
        }

        MarketItem[] memory items = new MarketItem[](unsoldCount);

        for (uint i = 0; i < itemCount; i++) {
            if (idToMarketItem[i + 1].seller == msg.sender) {
                MarketItem storage currentItem = idToMarketItem[i + 1];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }

        return items;
    }

    // To resell NFT

    function resellToken(uint256 tokenId, uint256 price) public payable {
        require(
            idToMarketItem[tokenId].owner == msg.sender,
            "Owner can resell his own NFT"
        );
        require(
            msg.value == listingPrice,
            "Please pay a listing price before reselling"
        );
        idToMarketItem[tokenId].owner = payable(address(this));
        idToMarketItem[tokenId].seller = payable(msg.sender);
        idToMarketItem[tokenId].sold = false;
        idToMarketItem[tokenId].price = price;
        _itemsold.decrement();
        _transfer(msg.sender, address(this), tokenId);
    }

    // To cancel the resell NFT

    function cancelNFTsell(uint256 tokenId) public {
        require(
            idToMarketItem[tokenId].seller == msg.sender,
            "Seller can cancel his own NFT"
        );
        require(
            idToMarketItem[tokenId].sold == false,
            "You can cancel only if you listed it for sell"
        );
        idToMarketItem[tokenId].owner = payable(msg.sender);
        idToMarketItem[tokenId].sold = true;
        idToMarketItem[tokenId].seller = payable(address(0));
        _itemsold.increment();
        _transfer(address(this), msg.sender, tokenId);
        payable(owner).transfer(listingPrice);
    }
}
