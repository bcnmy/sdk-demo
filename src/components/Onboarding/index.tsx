import React, { Dispatch, SetStateAction, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { LocalRelayer } from "@biconomy/relayer";
import Button from "../Button";
// import { useWeb3Context } from "../../contexts/Web3Context";
import { useSmartAccountContext } from "../../contexts/SmartAccountContext";
import {
  getEOAWallet,
  showErrorMessage,
  showInfoMessage,
  showSuccessMessage,
} from "../../utils";
import { activeChainId } from "../../utils/chainConfig";

type OnboardingProps = {
  setValue: Dispatch<SetStateAction<number>>;
};

const Onboarding: React.FC<OnboardingProps> = ({ setValue }) => {
  // const { provider } = useWeb3Context();
  const {
    state,
    wallet: smartAccount,
    getSmartAccount,
  } = useSmartAccountContext();

  const [deployLoading1, setDeployLoading1] = useState(false);
  const [deployLoading2, setDeployLoading2] = useState(false);

  const deploySmartAccount1 = async () => {
    try {
      if (!smartAccount || !state) {
        showErrorMessage("Init Smart Account First");
        return;
      }
      setDeployLoading1(true);
      // you can create instance of local relayer with current signer or any other private key signer
      const relayer = new LocalRelayer(
        getEOAWallet(process.env.REACT_APP_PKEY || "", null)
      );

      console.log("relayer");
      console.log(relayer);
      const context = smartAccount.getSmartAccountContext();

      try {
        const deployment = await relayer.deployWallet({
          config: state,
          context,
          index: 0,
        }); // index 0

        const res = await deployment.wait(1);
        console.log(res);
      } catch (err) {
        console.log("fails here");
        console.log(err);
      }

      getSmartAccount();
      showInfoMessage("Smart Account deployed");
      setDeployLoading1(false);
    } catch (err: any) {
      setDeployLoading1(false);
      showErrorMessage(err.message.slice(0, 60));
      console.error("deploySmartAccount", err);
    }
  };

  const deploySmartAccount2 = async () => {
    try {
      if (!smartAccount || !state) {
        showErrorMessage("Init Smart Account First");
        return;
      }
      setDeployLoading2(true);
      const context = smartAccount.getSmartAccountContext();
      console.log(context);

      const feeQuotes = await smartAccount.prepareDeployAndPayFees();
      console.log("feeQuotes ", feeQuotes);

      console.log("token address ", feeQuotes[1].address);

      const txHash = await smartAccount.deployAndPayFees(
        activeChainId,
        feeQuotes[1]
      );
      showSuccessMessage(`Tx hash ${txHash}`, txHash);
      console.log(txHash);

      getSmartAccount();
      showSuccessMessage("Smart Account deployed");
      setDeployLoading2(false);
    } catch (err: any) {
      setDeployLoading2(false);
      showErrorMessage(err.message.slice(0, 60));
      console.error("deploySmartAccount", err);
    }
  };

  const deploySmartAccount3 = async () => {
    try {
      if (!smartAccount || !state) {
        showErrorMessage("Init Smart Account First");
        return;
      }
      setDeployLoading1(true);
      try {
        debugger;
        const response = await smartAccount.deployWalletUsingPaymaster();
        console.log("response");
        console.log(response);
        // todo : only show success and reload when mined event is received!
      } catch (err) {
        console.log("fails here");
        console.log(err);
      }

      getSmartAccount();
      showSuccessMessage("Smart Account deployed");
      setDeployLoading1(false);
    } catch (err: any) {
      setDeployLoading1(false);
      showErrorMessage(err.message.slice(0, 60));
      console.error("deploySmartAccount", err);
    }
  };

  function sleep(ms: any) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  return (
    <main className="flex flex-col gap-4 h-full w-full">
      <h1 className="text-4xl text-textPrimary">{"Deploy Smart Account"}</h1>
      <p className="text-white">
        Welcome onboard! This is the demo of the new Biconomy SDK. You need to
        deploy your smart account wallet to get started.
      </p>
      {state?.isDeployed ? (
        <div className="w-full flex flex-col gap-8 mt-10 items-center justify-center">
          <p className="text-xl text-green-400">
            ✅ Your Smart Account is already created.
          </p>
          <Button
            className="bg-buttonOrange transition-colors hover:bg-buttonOrangeHover text-white px-4 h-10 rounded-lg"
            title="Go to Use Cases"
            isLoading={deployLoading1}
            onClickFunc={() => setValue(2)}
          />
        </div>
      ) : (
        <div className="flex items-center h-full justify-between gap-8">
          <div className="w-full flex flex-col gap-8 items-center justify-center border-2 border-dashed h-full rounded-2xl transition-colors border-white hover:border-textPrimary p-10">
            <h2 className="text-2xl text-textPrimary">
              Demo dapp pays for the wallet deployment cost.
            </h2>
            <ul className="flex list-disc flex-col text-center items-center justify-center gap-2 text-white">
              <li>Single click deployment.</li>
              <li>Relayers deploys / funds the wallet deployment for you.</li>
            </ul>
            <Button
              className="bg-buttonOrange transition-colors hover:bg-buttonOrangeHover text-white px-4 h-10 rounded-lg"
              title="Deploy Smart Account"
              isLoading={deployLoading1}
              onClickFunc={deploySmartAccount1}
            />
          </div>
          <div className="w-full flex flex-col gap-8 items-center justify-center border-2 border-dashed h-full rounded-2xl border-white hover:border-textPrimary transition-colors p-10">
            <h2 className="text-2xl text-textPrimary">
              Deploy Account along with first transaction.
            </h2>
            <ul className="flex list-disc flex-col text-center items-center justify-center gap-2 text-white">
              <li>User pay for deployment along with the first transaction.</li>
              <li>
                Select bundled transaction which deploys the wallet and add
                liquidity to Hyphen bridge.
              </li>
            </ul>
            <Button
              className="bg-buttonOrange transition-colors hover:bg-buttonOrangeHover text-white px-4 h-10 rounded-lg"
              title="Go to Use Cases"
              onClickFunc={() => setValue(2)}
            />
          </div>
          <div className="w-full flex flex-col gap-8 items-center justify-center border-2 border-dashed h-full rounded-2xl border-white hover:border-textPrimary transition-colors p-10">
            <h2 className="text-2xl text-textPrimary">
              User pays for wallet deployment cost.
            </h2>
            <ul className="flex list-disc flex-col text-center items-center justify-center gap-2 text-white">
              <li>You have to deposit funds in the counter factual address.</li>
              <li>Copy your counter factual address from navbar.</li>
              <li>Get USDC funds from our testnet faucet and deploy.</li>
            </ul>
            <Button
              className="bg-buttonOrange transition-colors hover:bg-buttonOrangeHover text-white px-4 h-10 rounded-lg"
              title="Deploy Smart Account"
              isLoading={deployLoading2}
              onClickFunc={deploySmartAccount2}
            />
          </div>
        </div>
      )}
    </main>
  );
};

export default Onboarding;
