import React, { useCallback, useEffect, useState } from "react";
import { ethers } from "ethers";
import { makeStyles } from "@mui/styles";
import { SessionKeyManagerModule } from "@biconomy-devx/modules";
import Button from "../Button";
import { useWeb3AuthContext } from "../../contexts/SocialLoginContext";
import { useSmartAccountContext } from "../../contexts/SmartAccountContext";
import {
  configInfo as config,
  showErrorMessage,
  showSuccessMessage,
} from "../../utils";
import { activeChainId } from "../../utils/chainConfig";
import { hexConcat, hexZeroPad } from "ethers/lib/utils";

const MintNft: React.FC = () => {
  const classes = useStyles();
  const { web3Provider } = useWeb3AuthContext();
  const { smartAccount, scwAddress } = useSmartAccountContext();
  const [nftCount, setNftCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const getNftCount = useCallback(async () => {
    if (!scwAddress || !web3Provider) return;
    const nftContract = new ethers.Contract(
      config.nft.address,
      config.nft.abi,
      web3Provider
    );
    const count = await nftContract.balanceOf(scwAddress);
    console.log("count", Number(count));
    setNftCount(Number(count));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    getNftCount();
  }, [getNftCount, web3Provider]);

  const mintNft = async () => {
    if (!scwAddress || !smartAccount || !web3Provider) return;
    try {
      let biconomySmartAccount = smartAccount
      // -----> setMerkle tree tx flow

      // create dapp side session key
      const sessionSigner = ethers.Wallet.createRandom();
      const sessionKeyEOA = await sessionSigner.getAddress();

      // generate sessionModule
      const sessionModule = await SessionKeyManagerModule.create({
        moduleAddress: "0x000000456b395c4e107e0302553B90D1eF4a32e9",
        chainId: activeChainId,
        sessionPubKey: sessionKeyEOA,
        smartAccountAddress: "0x1758f42Af7026fBbB559Dc60EcE0De3ef81f665e", // TODO: replace with your smart account address
      });

      // set active module to sessionModule
      biconomySmartAccount = biconomySmartAccount.setActiveValidationModule(sessionModule);

      // cretae session key data
      const sessionKeyData = hexConcat([
        hexZeroPad(sessionKeyEOA, 20),
        hexZeroPad("0x43Eb7ebe789BC8a749Be41089a963D7e68759a6A", 20), // erc20TokenAddress
        hexZeroPad("0x42138576848E839827585A3539305774D36B9602", 20), // random receiverAddress
        hexZeroPad(ethers.utils.parseEther("100").toHexString(), 32), // maxAmountToTransfer
      ]);
      const sessionTxData = await sessionModule.createSessionData({
        validUntil: 0,
        validAfter: 0,
        sessionValidationModule: "0x000000dB3D753A1da5A6074a9F74F39a0A779d33",
        sessionPublicKey: sessionKeyEOA,
        sessionKeyData: sessionKeyData,
      });
      console.log("sessionTxData", sessionTxData);

      // tx to set session key
      const tx1 = {
        to: "0x000000456b395c4e107e0302553B90D1eF4a32e9", // session manager module address
        data: sessionTxData,
      };
      let partialUserOp = await biconomySmartAccount.buildUserOp([tx1]);

      const userOpResponse = await biconomySmartAccount.sendUserOp(partialUserOp);
      console.log(`userOp Hash: ${userOpResponse.userOpHash}`);
      const transactionDetails = await userOpResponse.wait();
      console.log(transactionDetails.receipt.transactionHash);

      // update the session key
      await sessionModule.updateSessionStatus(
        {
          sessionPublicKey: sessionKeyEOA,
        },
        "ACTIVE"
      );
    } catch (err: any) {
      console.error(err);
      setLoading(false);
      showErrorMessage(err.message || "Error in sending the transaction");
    }
  };

  return (
    <main className={classes.main}>
      <p style={{ color: "#7E7E7E" }}>
        Use Cases {"->"} Gasless {"->"} Mint Nft
      </p>

      <h3 className={classes.subTitle}>Mint Nft Flow</h3>

      <p style={{ marginBottom: 20 }}>
        This is an example gasless transaction to Mint Nft.
      </p>
      <p>
        Nft Contract Address: {config.nft.address}{" "}
        <span style={{ fontSize: 13, color: "#FFB4B4" }}>
          (same of goerli, mumbai, polygon)
        </span>
      </p>
      <p style={{ marginBottom: 30, marginTop: 30, fontSize: 24 }}>
        Nft Balance in SCW:{" "}
        {nftCount === null ? (
          <p style={{ color: "#7E7E7E", display: "contents" }}>fetching...</p>
        ) : (
          nftCount
        )}
      </p>

      <Button title="Mint NFT" isLoading={loading} onClickFunc={mintNft} />
    </main>
  );
};

const useStyles = makeStyles(() => ({
  main: {
    padding: "10px 40px",
    color: "#EEEEEE",
  },
  subTitle: {
    color: "#FFB999",
    fontSize: 36,
    margin: 0,
  },
  h3Title: {
    color: "#e6e6e6",
  },
}));

export default MintNft;
