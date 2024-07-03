import React, { useState } from "react";
import { makeStyles } from "@mui/styles";
import ControlPointDuplicateIcon from "@mui/icons-material/ControlPointDuplicate";
import CollectionsIcon from "@mui/icons-material/Collections";
import Button from "../../Button";
import { useSmartAccountContext } from "../../../contexts/SmartAccountContext";
import { Address, Hex, encodeAbiParameters } from "viem";
import { ModuleType, OWNABLE_EXECUTOR, OWNABLE_VALIDATOR, createOwnableValidatorModule } from "@biconomy/account";
import { useAccount } from "wagmi";
import BasicModal from "../../Modal";
import OwnableExecutor from "./OwnableExecutor";
import K1Validator from "./K1Validator";

const NexusModulesPlayground: React.FC = () => {
  const classes = useStyles();
  const [loading, setLoading] = useState(false);
  const { installedModules, smartAccount } = useSmartAccountContext();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const installModule = async () => {
    console.log("opening modal");
    setIsModalOpen(true);
    // if(title === "Ownable Validator") {
    //   const ownableValidatorInstallData = encodeAbiParameters(
    //     [
    //       { name: 'threshold', type: 'uint256' },
    //       { name: 'owners', type: 'address[]' },
    //     ],
    //     [BigInt(2), [account!.address!, ]],
    //   )
    //   await smartAccount?.installModule(address, ModuleType.Validation, data)
    // }
  }

  return (
    <main className={classes.main}>
      <h3 className={classes.subTitle}>Nexus SA Modules</h3>
      <p>Interact with Nexus Modules</p>
      <p>Installed modules:</p>
      <ul>
        {installedModules.map(module => <li>{module.address} - {module.moduleName}</li>)}
      </ul>
      
      <div className={classes.cardContainer}>
        <OwnableExecutor />
        <K1Validator />
      </div>
    </main>
  );
};

const useStyles = makeStyles(() => ({
  main: {
    padding: "10px 40px",
    width: "100%",
    color: "#e6e6e6",
  },
  subTitle: {
    color: "#FFB999",
    fontSize: 36,
    margin: 0,
  },
  textBox: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    "@media (max-width:1640px)": {
      alignItems: "start",
    },
  },
  subSubTitle: {
    fontFamily: "Rubik",
    color: "#BDC2FF",
    fontSize: 20,
    margin: 20,
  },
  cardContainer: {
    display: "flex",
    flexWrap: "wrap",
    flexDirection: "row",
    justifyContent: "start",
    alignItems: "center",
    gap: 20,
    cursor: "pointer",
    "@media (max-width:1640px)": {
      flexDirection: "column",
    },
  },
  card: {
    // width: "25%",
    maxWidth: 300,
    aspectRatio: 1,
    backgroundColor: "#151520",
    borderRadius: 12,
    padding: 16,
    border: "1px solid #5B3320",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    gap: 8,
    alignItems: "center",
    "@media (max-width:1640px)": {
      flexDirection: "row-reverse",
      width: "100%",
      maxWidth: "unset",
      aspectRatio: "unset",
      justifyContent: "space-between",
    },
  },
}));

export default NexusModulesPlayground;
