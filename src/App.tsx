import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { ToastContainer } from "react-toastify";
import Navbar from "./components/Navbar";
import TabsBody from "./components/TabsBody";
import { useSmartAccountContext } from "./contexts/SmartAccountContext";
import { useWeb3AuthContext } from "./contexts/SocialLoginContext";
import Button from "./components/Button";
import CandySVG from "./img/candy.svg";
import BicoLogo from "./img/bico-theme.svg";

const App: React.FC = () => {
  const { connect, address, loading: eoaWalletLoading } = useWeb3AuthContext();
  console.log("🚀 ~ file: App.tsx:14 ~ address:", address);
  const { loading } = useSmartAccountContext();

  return (
    <>
      {/* {!address && 
        } */}
      {address && !loading ? (
        <div className="flex flex-col gap-4 items-start justify-start bg-gradient-to-br w-screen h-screen overflow-hidden from-gradientFrom to-gradientTo">
          <Navbar />
          <TabsBody />
          <ToastContainer />
        </div>
      ) : (
        <>
          <img
            src={BicoLogo}
            className="z-10 absolute translate-x-4 translate-y-4"
            alt=""
          />
          <div className="p-8 flex items-center justify-start bg-gradient-to-br from-gradientFrom to-gradientTo w-screen h-screen">
            <div className="p-12 flex rounded-2xl items-center justify-between gap-8 w-full lg:w-2/3 max-w-[960px] h-2/3 bg-blue-10">
              <div className="w-1/2 flex items-center justify-center">
                <img src={CandySVG} className="w-[330px]" alt="" />
              </div>
              <div>
                <h1 className="text-5xl text-textPrimary">Biconomy SDK Demo</h1>
                <p className="text-textWhite pb-16">Welcome to the SDK Demo, connect your wallet to get started!</p>
                <Button
                  className="bg-buttonOrange transition-colors hover:bg-buttonOrangeHover text-white w-32 h-12 rounded-lg"
                  title="Connect Wallet"
                  onClickFunc={connect}
                  isLoading={loading}
                />
              </div>
            </div>
          </div>
        </>
      )}
      <ToastContainer />
    </>
  );
};

export default App;
