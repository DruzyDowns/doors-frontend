import Head from "next/head";
import { useState, useEffect, useRef } from "react";
import { MarqueeText } from "../components/MarqueeText";
import { ethers } from "ethers";
import doors from "../utils/doors.json";

const TWITTER_HANDLE = "druzydowns";
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const OPENSEA_LINK =
  "https://rinkeby.rarible.com/collection/0x2c2895bda1c05c5a53b51349204a9cf20c58e622";
const TOTAL_MINT_COUNT = 50;
const CONTRACT_ADDRESS = "0x2C2895bDa1C05c5A53b51349204a9CF20C58e622";

function useWindowDimensions() {
  const hasWindow = typeof window !== "undefined";

  function getWindowDimensions() {
    const width = hasWindow ? window.innerWidth : null;
    const height = hasWindow ? window.innerHeight : null;
    return {
      width,
      height,
    };
  }

  const [windowDimensions, setWindowDimensions] = useState(
    getWindowDimensions()
  );

  useEffect(() => {
    if (hasWindow) {
      function handleResize() {
        setWindowDimensions(getWindowDimensions());
      }

      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, [hasWindow]);

  return windowDimensions;
}

export default function Home() {
  const canvasRef = useRef();
  const { height, width } = useWindowDimensions();
  useEffect(() => {
    canvasRef.current.width = width;
    canvasRef.current.height = width;
  }, []);
  const [currentAccount, setCurrentAccount] = useState("");
  const [miningStarted, setMiningStarted] = useState(false);
  const [miningComplete, setMiningComplete] = useState(false);
  const [mintMessage, setMintMessage] = useState(false);

  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      console.log("Make sure you have metamask!");
      return;
    } else {
      console.log("We have the ethereum object", ethereum);
    }

    const accounts = await ethereum.request({ method: "eth_accounts" });

    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account:", account);
      setCurrentAccount(account);
      setupEventListener();
    } else {
      console.log("No authorized account found");
    }
  };

  /*
   * Implement your connectWallet method here
   */
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      /*
       * Fancy method to request access to account.
       */
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      /*
       * Boom! This should print out public address once we authorize Metamask.
       */
      console.log("Connected", accounts[0]);

      let chainId = await ethereum.request({ method: "eth_chainId" });
      console.log("Connected to chain " + chainId);

      // String, hex code of the chainId of the Rinkebey test network
      const rinkebyChainId = "0x4";
      if (chainId !== rinkebyChainId) {
        alert("You are not connected to the Rinkeby Test Network!");
      }

      setCurrentAccount(accounts[0]);
      setupEventListener();
    } catch (error) {
      console.log(error);
    }
  };

  // Setup our listener.
  const setupEventListener = async () => {
    // Most of this looks the same as our function askContractToMintNft
    try {
      const { ethereum } = window;

      if (ethereum) {
        // Same stuff again
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          doors.abi,
          signer
        );

        // THIS IS THE MAGIC SAUCE.
        // This will essentially "capture" our event when our contract throws it.
        // If you're familiar with webhooks, it's very similar to that!
        connectedContract.on("doorMinted", (from, tokenId) => {
          console.log(from, tokenId.toNumber());
          setMintMessage(
            `Success! 🤝 Minted and sent to wallet on Rinkeby network. It can take a few minutes to show up on Rarible. Here's the link: https://rinkeby.rarible.com/token/${CONTRACT_ADDRESS}:${tokenId.toNumber()}`
          );
        });

        console.log("Setup event listener!");
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const askContractToMintNft = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          doors.abi,
          signer
        );

        console.log("Going to pop wallet now to pay gas...");
        let nftTxn = await connectedContract.openDoors();

        console.log("Mining...please wait.");
        setMiningStarted(true);

        await nftTxn.wait();

        console.log(
          `Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`
        );
        setMiningComplete(true);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-blvk hvnd-red garamond p-4 relative overflow-hidden">
      <Head>
        <title>Void Society</title>
        <link rel="icon" href="/favicon.ico" />
        <link rel="stylesheet" href="https://use.typekit.net/rsc4kdd.css" />
        <script
          type="text/javascript"
          src="https://rawgit.com/patriciogonzalezvivo/glslCanvas/master/dist/GlslCanvas.js"
        ></script>
      </Head>

      <div id="glsl-bg" className="absolute left-0 top-0 w-full h-screen">
        <canvas
          ref={canvasRef}
          id="glsl-canvas"
          className="glslCanvas w-full h-full"
          data-fragment-url="/shader.frag"
        ></canvas>
      </div>
      <div className="absolute left-0 bottom-0 transform -rotate-90 -translate-x-1/2 pt-12">
        <MarqueeText />
      </div>
      <main className="relative glass">
        <div className="w-full hvnd-red border border-current p-8">
          <p className="absolute -top-4 px-2 text-white uppercase text-2xl bg-blvk">
            Void Society
          </p>
          <div className="header-container">
            <p className="text-xl uppercase tracking-widest">
              When one door opens, another door opens.
            </p>
            {currentAccount === "" ? (
              <button
                onClick={connectWallet}
                className="p-2 my-2 text-xl uppercase tracking-widest border border-current transition hover:text-white"
              >
                Connect to Wallet
              </button>
            ) : (
              <button
                onClick={askContractToMintNft}
                className={`p-2 my-2 text-xl uppercase tracking-widest border border-current transition hover:text-white ${
                  miningStarted && !miningComplete
                    ? "animate-pulse text-white"
                    : "animate-none"
                }`}
              >
                Mint NFT
              </button>
            )}
          </div>
          <div>
            {miningStarted && !miningComplete ? (
              <p>mining in process...</p>
            ) : (
              <p></p>
            )}
            {miningComplete ? <p>Success!</p> : <p></p>}
          </div>
          <div className="footer-container">
            <a
              className="footer-text"
              href={OPENSEA_LINK}
              target="_blank"
              rel="noreferrer"
            >
              <button className="p-2 my-2 uppercase tracking-widest text-white border border-current">
                🌈 View Collection on Rarible 🌈
              </button>
            </a>
            <div></div>

            <a
              className="mt-6"
              href={TWITTER_LINK}
              target="_blank"
              rel="noreferrer"
            >{`built by @${TWITTER_HANDLE}`}</a>
          </div>
        </div>
      </main>
    </div>
  );
}
