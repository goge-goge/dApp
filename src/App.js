import "./styles/App.css";
import twitterLogo from "./assets/twitter-logo.svg";
import openseaLogo from './assets/opensea-logo.png'

import { ethers } from "ethers";
import NFTFLOW from "./abi/NFTFLOW.json";
import React from "react";

// Constants
const TWITTER_HANDLE = "NftflowStarkNet";
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const OPENSEA_LINK = "https://testnets.opensea.io/collection/nftflow-membership-pass-x1ee7njvot";
const CONTRACT_ADDRESS = "0x48E09beF65B4Ba709C69f7003C385f2aC09493D1";
// const CONTRACT_ADDRESS = "0x249F5fF0D0A4604912e2C27107cb5c22d8eD8dE1";
const RINKEBY_CHAIN_ID = "0x4";

const App = () => {
  const [currentUserAccount, setCurrentUserAccount] = React.useState("");
  const [totalTokensMinted, setTotalTokensMinted] = React.useState(0);

  const confirmNetwork = async (ethereum, chainId) => {
    let returnedChainId = await ethereum.request({ method: "eth_chainId" });
    console.log("Connected to chain " + chainId);

    // String, hex code of the chainId of the Rinkebey test network
    return returnedChainId !== RINKEBY_CHAIN_ID ? false : true;
  };

  const checkWalletConnected = async () => {
    const { ethereum } = window;
    if (!ethereum) {
      alert("Please login to Metamask 😞!");
    }

    let ok = await confirmNetwork(ethereum, RINKEBY_CHAIN_ID);
    if (!ok) {
      alert("You are not connected to the Rinkeby Test Network 😞!");
      return;
    }

    const accounts = await ethereum.request({ method: "eth_accounts" });

    if (accounts.length !== 0) {
      // User has already connected wallet.
      setCurrentUserAccount(accounts[0]);
      setupNFTMintedListener();
    } else {
      console.warn("No authorized account found");
    }
  };

  React.useEffect(() => {
    checkWalletConnected();
    getMinted();
  });

  const connectWallet = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        alert("Please login to Metamask 😞!");
        return;
      }

      let ok = await confirmNetwork(ethereum, RINKEBY_CHAIN_ID);
      if (ok) {
        // Request accounts on wallet connect
        const accounts = await ethereum.request({
          method: "eth_requestAccounts",
        });
        console.log("Connected! Account is: ", accounts[0]);
        setCurrentUserAccount(accounts[0]);
        setupNFTMintedListener();
      } else {
        alert("You are not connected to the Rinkeby Test Network 😞!");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const setupNFTMintedListener = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        // Same stuff again
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          NFTFLOW.abi,
          signer
        );

        // Listen to event
        connectedContract.on(
          "NFTMinted",
          (tokenId , owner) => {
            setTotalTokensMinted(tokenId.toNumber());
          }
        );
        console.log("event listener set up!");
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getMinted = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          NFTFLOW.abi,
          signer
        );
        const Minted = await connectedContract.getTokensMinted();
        setTotalTokensMinted(Minted.toNumber());
      } else {
        console.error("ethereum object not found");
      }
    } catch (e) {
      console.error("error in getSupply:", e);
    }

  };
  

  const mintNFT = async () => {
    try {
      let ethereum = window.ethereum;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          NFTFLOW.abi,
          signer
        );

        // let iface = new ethers.utils.Interface(NFTFLOW.abi);
        let gasP = await provider.getGasPrice();

        // let txData = iface.encodeFunctionData("mintNFTEth");

        // var rawTx = {
          // value: ethers.utils.parseEther("0.1", 'ether').toHexString(),
          // gasPrice: gasP._hex,
        // };

        // let findgaslimit = await provider.estimateGas(signer, CONTRACT_ADDRESS, txData, rawTx);
        // rawTx.gasLimit = findgaslimit;
        // console.log(rawTx);

        try {
          // mint NFT
          const tx = await connectedContract.mintNFTEth({
            value: ethers.utils.parseEther("0.1", 'ether').toHexString(),
            gasLimit: 5000000,
            gasPrice: gasP._hex,
          });

          // const tx = await connectedContract.mintNFTEth(rawTx);

          // withdraw onlyOwner
          // const tx = await connectedContract.withdraw();

          console.log("mint success", tx);
        } catch (error) {
          console.log(error);
        }
      } else {
        console.error("ethereum object not found");
      }
    } catch (e) {
      // alert("An account can only mint one Member Pass 😞!")
      console.error("error in mintNFT :", e);
    }
  };

  const disconnectWallet = async () => {
    setCurrentUserAccount("");
  };

  // Render Methods
  const renderNotConnectedContainer = () => (
    <button
      className="cta-button connect-wallet-button"
      onClick={() => {
        connectWallet();
      }}
    >
      Connect Your Wallet
    </button>
  );

  const renderMintNFTButton = () => (
    <button className="cta-button connect-wallet-button" onClick={mintNFT}>
      MINT
    </button>
  );

  const renderLogout = () => (
    <button
      className="cta-button connect-wallet-button"
      onClick={disconnectWallet}
    >
      Disconnect Wallet
    </button>
  );

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">NFTflow Membership Pass</p>
        </div>
        <div className="header-container">
          <a
              className="opensea-button"
              href={OPENSEA_LINK}
              target="_blank"
              rel="noreferrer"
            >
              <img src={openseaLogo} alt="opensea-logo" className="opensea-logo" />View Collection on OpenSea</a>
        </div>
        <div className="header-container">
          {currentUserAccount
            ? renderMintNFTButton()
            : renderNotConnectedContainer()}
        </div>
        <div className="header-container">
          {currentUserAccount ? renderLogout() : null}
        </div>
        <div className="header-container">
          <p className="sub-text gradient-text">
            {totalTokensMinted} / 1111 minted
          </p>
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built by @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
