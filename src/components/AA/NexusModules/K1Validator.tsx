import { makeStyles } from '@mui/styles';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import { useEffect, useState } from 'react';
import { useSmartAccountContext } from '../../../contexts/SmartAccountContext';
import { K1_VALIDATOR, ModuleType, SENTINEL_ADDRESS } from '@biconomy/account';
import { Address, Hex, encodeAbiParameters, encodePacked, stringToBytes, toHex } from 'viem';
import Button from '../../Button';
import { showSuccessMessage } from '../../../utils';
import { toast } from 'react-toastify';

const K1Validator = () => {

    const [loading, setLoading] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);
    const [validators, setValidators] = useState<Address[]>([]);
    
    const { smartAccount, scwAddress } = useSmartAccountContext();

    const classes = useStyles();

    console.log(validators, "validators");

    useEffect(() => {
        const checkIfInstalled = async () => {
          try {
            const isInstalled = await smartAccount!.isModuleInstalled({moduleType: ModuleType.Validation, moduleAddress: K1_VALIDATOR});
            setIsInstalled(isInstalled);
          } catch (error) {
            toast.error("Account not deployed yet. Please deploy account first.");
          }
        }
        checkIfInstalled();
    }, [smartAccount])

    useEffect(() => {
      getInstalledValidators();
    }, [smartAccount])

    const getInstalledValidators = async () => {
      try {
        setValidators((await smartAccount?.getInstalledValidators()!) as Address[]);
      } catch (error) {
        toast.error(`Error fetching installed validators`);
      }
    }

    const installModule = async () => {
        setLoading(true);
        const activeModule = await smartAccount?.activeValidationModule;
        console.log(activeModule, "activeModule");
        const receipt = await smartAccount!.installModule({moduleAddress: K1_VALIDATOR, moduleType: ModuleType.Validation, data: encodePacked(['address'], [scwAddress as Hex])});
        showSuccessMessage(`Installed K1 Validator Module ${receipt.userOpHash}`, receipt.userOpHash);
        setLoading(false);
    }

    const uninstallModule = async () => {
        setLoading(true);
        const deInitData = encodeAbiParameters(
            [
              { name: "prev", type: "address" },
              { name: "disableModuleData", type: "bytes" }
            ],
            [SENTINEL_ADDRESS as Hex, toHex(stringToBytes(""))]
          )
        const receipt = await smartAccount!.uninstallModule({moduleAddress: K1_VALIDATOR, moduleType: ModuleType.Validation, data: deInitData});
        showSuccessMessage(`Uninstalled K1 Validator Module ${receipt.userOpHash}`, receipt.userOpHash);
        setLoading(false);
    }

  return (
    <div
            onClick={(e) => {}}
            className={classes.card}
          >
            <DriveFileRenameOutlineIcon style={{
                color: "#FFB999",
                fontSize: 72,
            }}/>
            <div className={classes.textBox}>
              <h3
                style={{
                  color: "#FFB999",
                  textAlign: "start",
                  fontSize: "auto",
                  margin: 0,
                }}
              >
                K1 Validator
                <p style={isInstalled ? {color: 'green'} : {color: 'red'}}>{isInstalled ? "Installed" : "Not installed"}</p>
                <small style={{color: 'red'}}>{validators.length === 1 ? 'Cannot uninstall last validator': ''}</small>
              </h3>
              <p
                style={{
                  fontSize: 14,
                  margin: 0,
                }}
              >
                The K1 Validator module is a validator module that validates user ops using K1 signature.
              </p>
              <div style={{ display: 'flex', flexDirection: 'row', gap: '10px' }}>
                <Button title="Install Module" isLoading={loading} onClickFunc={async () => await installModule()} />
                <Button disabled={validators.length === 1} title="Uninstall Module" isLoading={loading} onClickFunc={() => uninstallModule()} />
                <Button title="Sign message" isLoading={loading} onClickFunc={() => uninstallModule()} />
              </div>
            </div>
          </div>
  )
}

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

export default K1Validator