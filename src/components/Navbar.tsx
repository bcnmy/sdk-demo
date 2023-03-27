import { useState } from "react";
import { AppBar, MenuItem, Select } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { useWeb3AuthContext } from "../contexts/SocialLoginContext";
import BicoLogo from "../img/bico-theme.svg";
import { useSmartAccountContext } from "../contexts/SmartAccountContext";
import Button from "./Button";
import {
  copyToClipBoard,
  ellipseAddress,
  // showErrorMessage,
  // showSuccessMessage,
} from "../utils";

const Navbar = () => {
  const { disconnect } = useWeb3AuthContext();
  const {
    // getSmartAccount,
    loading,
    selectedAccount,
    smartAccountsArray,
    setSelectedAccount,
  } = useSmartAccountContext();

  const [showModal, setShowModal] = useState(false);
  const toggleSwitchButton = () => {
    showModal ? setShowModal(false) : setShowModal(true);
  };

  // const getSmartAccountFunc = async () => {
  //   const error = await getSmartAccount();
  //   if (error) showErrorMessage(error);
  //   else showSuccessMessage("Fetched smart account state");
  // };

  const disconnectWallet = () => {
    disconnect();
    setShowModal(false);
  };

  return (
    // <AppBar position="static" className="bg-transparent w-full h-20 flex items-center justify-between">
    //   <div className="w-full px-20 flex items-center justify-between">
    //     <img
    //       src={BicoLogo}
    //       className=""
    //       alt=""
    //     />
    //     <div className={classes.walletBtnContainer}>
    //       {selectedAccount?.smartAccountAddress && (
    //         <p className={classes.btnTitle}>Smart Account Address</p>
    //       )}
    //       <Button
    //         title={
    //           selectedAccount
    //             ? ellipseAddress(selectedAccount.smartAccountAddress, 8)
    //             : "Connect Wallet"
    //         }
    //         onClickFunc={toggleLogoutButton}
    //         isLoading={loading}
    //         // style={{ marginTop: 6 }}
    //       >
    //         {showModal && (
    //           <div className={classes.modal}>
    //             {smartAccountsArray.length &&
    //               smartAccountsArray.map((smartAcc, index) => (
    //                 <div className={classes.element} key={index}>
    //                   {/* <p className={classes.elementText}>v{smartAcc.version}</p> */}
    //                   <p
    //                     className={classes.elementText}
    //                     onClick={() => setSelectedAccount(smartAcc)}
    //                   >
    //                     {ellipseAddress(smartAcc.smartAccountAddress, 6)}
    //                   </p>
    //                   <p
    //                     onClick={() =>
    //                       copyToClipBoard(
    //                         selectedAccount?.smartAccountAddress || ""
    //                       )
    //                     }
    //                     className={classes.copyText}
    //                   >
    //                     📁
    //                   </p>
    //                 </div>
    //               ))}
    //           </div>
    //         )}
    //       </Button>
    //       {/* <FormControl className={classes.formControl}>
    //         <InputLabel id="demo-simple-select-label">Version</InputLabel>
    //         <Select
    //           labelId="demo-simple-select-label"
    //           id="demo-simple-select"
    //           value={version}
    //           onChange={(event) => setVersion(event.target.value as string)}
    //         >
    //           <MenuItem value="">
    //             <em>None</em>
    //           </MenuItem>

    //           {versions.map((ver) => (
    //             <MenuItem value={ver}>{ver}</MenuItem>
    //           ))}
    //         </Select>
    //       </FormControl> */}
    //       <Button title="Logout" onClickFunc={disconnectWallet} />
    //     </div>
    //   </div>
    // </AppBar>
    <div className="w-full p-4 flex items-center justify-between">
      <img src={BicoLogo} className="" alt="" />
      <div className="flex items-center justify-center gap-4">
        <Button
          className="bg-buttonOrange transition-colors hover:bg-buttonOrangeHover text-white w-40 h-10 rounded-lg"
          title={
            selectedAccount
              ? ellipseAddress(selectedAccount.smartAccountAddress, 6)
              : "Connect Wallet"
          }
          onClickFunc={toggleSwitchButton}
        >
          {showModal ? (
            <div className="w-40 rounded-lg border-buttonOrange bg-blue-10 border-2 relative translate-y-5 left-0 origin-top-left">
              {smartAccountsArray.length
                ? smartAccountsArray.map((smartAcc, index) => (
                    <div
                      className={`flex items-center justify-between ${
                        index !== smartAccountsArray.length - 1
                          ? " border-b-2 "
                          : ""
                      } px-2 w-full h-10 border-buttonOrange`}
                      key={index}
                    >
                      <p
                        className="text-sm"
                        onClick={() => setSelectedAccount(smartAcc)}
                      >
                        {ellipseAddress(smartAcc.smartAccountAddress, 6)}
                      </p>
                      <p
                        className="text-xs"
                        onClick={() =>
                          copyToClipBoard(
                            selectedAccount?.smartAccountAddress || ""
                          )
                        }
                      >
                        📄
                      </p>
                    </div>
                  ))
                : null}
            </div>
          ) : null}
        </Button>
        <Button
          className="bg-buttonOrange transition-colors hover:bg-buttonOrangeHover text-white w-24 h-10 rounded-lg"
          title="Logout"
          onClickFunc={disconnectWallet}
        />
      </div>
    </div>
  );
};

export default Navbar;
