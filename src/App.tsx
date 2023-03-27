import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { ToastContainer } from "react-toastify";
import Navbar from "./components/Navbar";
import TabsBody from "./components/TabsBody";
import { useSmartAccountContext } from "./contexts/SmartAccountContext";
import { useWeb3AuthContext } from "./contexts/SocialLoginContext";
import Button from "./components/Button";
import CandySVG from "./img/candy.svg";
import BicoLogo from './img/bico-theme.svg';

const App: React.FC = () => {
  const classes = useStyles();
  const { connect, address, loading: eoaWalletLoading } = useWeb3AuthContext();
  console.log("🚀 ~ file: App.tsx:14 ~ address:", address)
  const { loading } = useSmartAccountContext();

  return <>
    {/* {!address && 
        } */}
    {address && !loading ? (
      <div className="">
        <Navbar />
        <TabsBody />
        <ToastContainer />
      </div>
    ) : (
      <>
<img src={BicoLogo} className="z-10 absolute translate-x-4 translate-y-4" alt="" />
      <div
    className="p-8 flex items-center justify-start bg-gradient-to-br from-gradientFrom to-gradientTo w-screen h-screen"
  >
      <div className="p-12 flex rounded-2xl items-center justify-between gap-8 w-full lg:w-2/3 max-w-[960px] h-2/3 bg-blue-10">
        <div className="w-1/2 flex items-center justify-center">
          <img src={CandySVG} className="w-[330px]" alt="" />
        </div>
        <div>
          <h1 className='text-5xl text-textPrimary'>Biconomy SDK Demo</h1>
          <p className='text-textWhite pb-16'>Welcome to the SDK Demo</p>
          <Button
            className="bg-buttonOrange transition-colors hover:bg-buttonOrangeHover text-white w-32 h-12 rounded-lg"
            title="Get Started"
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



  // return (
  //   <div className={classes.bgCover}>
  //     <Navbar />
  //     {loading ? (
  //       <div className={classes.container}>
  //         <img src="/logo.svg" className={classes.animateBlink} alt="" />
  //       </div>
  //     ) : (
  //       <TabsBody />
  //     )}
  //     <ToastContainer />
  //   </div>
  // );
};

const useStyles = makeStyles(() => ({
  bgCover: {
    backgroundColor: "#1a1e23",
    // backgroundImage: `url(/img/northern-lights-bg.png)`,
    backgroundSize: "cover",
    width: "100%",
    minHeight: "100vh",
    color: "#fff",
    fontStyle: "italic",
  },
  container: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    height: "80vh",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    marginBottom: 50,
    fontSize: 60,
    background: "linear-gradient(90deg, #12ECB8 -2.21%, #00B4ED 92.02%)",
    "-webkit-background-clip": "text",
    "-webkit-text-fill-color": "transparent",
  },
  animateBlink: {
    animation: "$bottom_up 2s linear infinite",
    "&:hover": {
      transform: "scale(1.2)",
    },
  },
  "@keyframes bottom_up": {
    "0%": {
      transform: "translateY(0px)",
    },
    "25%": {
      transform: "translateY(20px)",
    },
    "50%": {
      transform: "translateY(0px)",
    },
    "75%": {
      transform: "translateY(-20px)",
    },
    "100%": {
      transform: "translateY(0px)",
    },
  },
}));

export default App;
