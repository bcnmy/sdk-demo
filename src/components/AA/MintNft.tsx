import React, { useCallback, useEffect, useState } from "react";
import { ethers } from "ethers";
import { makeStyles } from "@mui/styles";
import {getPaymaster} from "@biconomy-devx/smart-account";
import Button from "../Button";
import { useWeb3AuthContext } from "../../contexts/SocialLoginContext";
import { useSmartAccountContext } from "../../contexts/SmartAccountContext";
import {
  configInfo as config,
  showErrorMessage,
  showSuccessMessage,
} from "../../utils";

const MintNft: React.FC = () => {
  const tokenPmUrl = "https://paymaster-signing-service-573.staging.biconomy.io/api/v1/80001/_j_KOEYSy.600ae7b1-e6f9-4a8d-9b0e-34645024663a";
  const classes = useStyles();
  const { web3Provider } = useWeb3AuthContext();
  const { state: walletState, wallet } = useSmartAccountContext();
  const [nftCount, setNftCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const getNftCount = useCallback(async () => {
    if (!walletState?.address || !web3Provider) return;
    const nftContract = new ethers.Contract(
      config.nft.address,
      config.nft.abi,
      web3Provider
    );
    const count = await nftContract.balanceOf(walletState?.address);
    console.log("count", Number(count));
    setNftCount(Number(count));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    getNftCount();
  }, [getNftCount, walletState]);

  const mintNft = async () => {
    if (!wallet || !walletState || !web3Provider) return;
    try {
      setLoading(true);
      let smartAccount = wallet;
      const nftContract = new ethers.Contract(
        config.nft.address,
        config.nft.abi,
        web3Provider
      );
      console.log("smartAccount.address ", smartAccount.address);
      const safeMintTx = await nftContract.populateTransaction.safeMint(
        smartAccount.address
      );
      console.log(safeMintTx.data);
      const tx1 = {
        to: config.nft.address,
        data: safeMintTx.data,
      };

      const paymasterAPI: any = await getPaymaster(tokenPmUrl)
      console.log('paymasterAPI ', paymasterAPI)

      const pmAddress = await paymasterAPI?.getPaymasterAddress();
      console.log('paymaster address ', pmAddress)

 const dummyUserOp = {
  sender: '0x3a7500d42030a23d8720185e808e8b5f28943d18',
  nonce: '0x0a',
  initCode: '0x',
  callData: '0x912ccaa3000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000001200000000000000000000000000000000000000000000000000000000000000002000000000000000000000000da5289fcaaf71d52a80a254da614a192b693e977000000000000000000000000f5a5958b83628fcae33a0ac57bc9b4af44da203400000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000aa87bee5380000000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000c00000000000000000000000000000000000000000000000000000000000000044095ea7b3000000000000000000000000e9f6ffc87cac92bc94f704ae017e85cb83dbe4ec0000000000000000000000000000000000000000000000000000000000989680000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
  paymasterAndData: '0x',
  maxFeePerGas: 1500000034,
  maxPriorityFeePerGas: 1500000000,
  callGasLimit: 59536,
  verificationGasLimit: 200000,
  preVerificationGas: 50760
 }

 const feeQuotes : any = await paymasterAPI?.getPaymasterFeeQuotes(dummyUserOp, ["0xda5289fcaaf71d52a80a254da614a192b693e977", "0x27a44456bedb94dbd59d0f0a14fe977c777fc5c3"])
 console.log('<<<<<<<<<<<<<<<<<< ====================== fee quotes received')
 console.log(feeQuotes)


      const txResponse = await smartAccount.sendTransaction({
        transaction: tx1,
        paymasterServiceData: {
          tokenPaymasterData: {
            feeTokenAddress: '0xda5289fcaaf71d52a80a254da614a192b693e977'
          }
        }
      });
      console.log("Tx sent, userOpHash:", txResponse);
      console.log("Waiting for tx to be mined...");
      const txHash = await txResponse.wait();
      console.log("txHash", txHash);
      showSuccessMessage(
        `Minted Nft ${txHash.transactionHash}`,
        txHash.transactionHash
      );
      setLoading(false);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      getNftCount();
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
