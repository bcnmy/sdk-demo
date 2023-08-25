import React, { useState } from "react";
import { ethers } from "ethers";
import { makeStyles } from "@mui/styles";
import { SessionKeyManagerModule } from "@biconomy-devx/modules";
import Button from "../Button";
import { useWeb3AuthContext } from "../../contexts/SocialLoginContext";
import { useSmartAccountContext } from "../../contexts/SmartAccountContext";
import { showErrorMessage, showInfoMessage } from "../../utils";
import { hexConcat, hexZeroPad } from "ethers/lib/utils";
import { getActionForErrorMessage } from "../../utils/error-utils";

const CreateSession: React.FC = () => {
  const classes = useStyles();
  const { web3Provider } = useWeb3AuthContext();
  const { smartAccount, scwAddress } = useSmartAccountContext();
  const [loading, setLoading] = useState(false);

  const createSession = async () => {
    if (!scwAddress || !smartAccount || !web3Provider) return;
    try {
      let biconomySmartAccount = smartAccount;
      const managerModuleAddr = "0x000000456b395c4e107e0302553B90D1eF4a32e9";
      const erc20ModuleAddr = "0x000000dB3D753A1da5A6074a9F74F39a0A779d33";

      // -----> enableModule session manager module
      const tx1 = await biconomySmartAccount.getEnableModuleData(
        managerModuleAddr
      );

      // -----> setMerkle tree tx flow
      // create dapp side session key
      const sessionSigner = ethers.Wallet.createRandom();
      const sessionKeyEOA = await sessionSigner.getAddress();
      console.log("sessionKeyEOA", sessionKeyEOA)
      // BREWARE JUST FOR DEMO: update local storage with session key
      window.localStorage.setItem("sessionPKey", sessionSigner.privateKey);

      // generate sessionModule
      const sessionModule = await SessionKeyManagerModule.create({
        moduleAddress: managerModuleAddr,
        sessionPubKey: sessionKeyEOA,
        smartAccountAddress: scwAddress,
      });

      // cretae session key data
      const sessionKeyData = hexConcat([
        hexZeroPad(sessionKeyEOA, 20),
        hexZeroPad("0xdA5289fCAAF71d52a80A254da614a192b693e977", 20), // erc20TokenAddress
        hexZeroPad("0x42138576848E839827585A3539305774D36B9602", 20), // random receiverAddress
        hexZeroPad(ethers.utils.parseUnits("50".toString(), 6).toHexString(), 32), // maxAmountToTransfer
      ]);
      const sessionTxData = await sessionModule.createSessionData({
        validUntil: 0,
        validAfter: 0,
        sessionValidationModule: erc20ModuleAddr,
        sessionPublicKey: sessionKeyEOA,
        sessionKeyData: sessionKeyData,
      });
      console.log("sessionTxData", sessionTxData);

      // tx to set session key
      const tx2 = {
        to: managerModuleAddr, // session manager module address
        data: sessionTxData,
      };
      // Remove tx2 once module has already been enabled..
      let partialUserOp = await biconomySmartAccount.buildUserOp(
        [tx1, tx2],
        {
          callGasLimit: 2000000,
          verificationGasLimit: 500000,
        },
        true
      );

      const userOpResponse = await biconomySmartAccount.sendUserOp(
        partialUserOp
      );
      console.log(`userOp Hash: ${userOpResponse.userOpHash}`);
      const transactionDetails = await userOpResponse.wait();
      console.log("txHash", transactionDetails.receipt.transactionHash);
      showInfoMessage("Session Created Successfully");
      // update the session key //enableModule
      await sessionModule.updateSessionStatus(
        {
          sessionPublicKey: sessionKeyEOA,
          sessionValidationModule: erc20ModuleAddr,
        },
        "ACTIVE"
      );
    } catch (err: any) {
      console.error(err);
      setLoading(false);
      const errorAction = getActionForErrorMessage(err.message);
      showErrorMessage(errorAction || err.message || "Error in sending the transaction");
    }
  };

  return (
    <main className={classes.main}>
      <p style={{ color: "#7E7E7E" }}>
        Use Cases {"->"} Session {"->"} Create Session
      </p>

      <h3 className={classes.subTitle}>Create Session Flow</h3>

      <p style={{ marginBottom: 20 }}>
        This is single transaction to enable the sesion manager module and set
        merkle root.
      </p>

      <Button
        title="Create Session"
        isLoading={loading}
        onClickFunc={createSession}
      />
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

export default CreateSession;
