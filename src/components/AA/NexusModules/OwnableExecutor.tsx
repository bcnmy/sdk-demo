import { makeStyles } from '@mui/styles';
import Person3Icon from '@mui/icons-material/Person3';
import { useEffect, useState } from 'react';
import { useSmartAccountContext } from '../../../contexts/SmartAccountContext';
import { ModuleType, OWNABLE_EXECUTOR, SENTINEL_ADDRESS, createOwnableExecutorModule } from '@biconomy/account';
import { Address, Hex, encodeAbiParameters, encodePacked, stringToBytes, toHex } from 'viem';
import Button from '../../Button';
import { showSuccessMessage } from '../../../utils';
import { toast } from 'react-toastify';
import { useAccount } from 'wagmi';

const OwnableExecutor = () => {

    const [loading, setLoading] = useState(false);
    const [owners, setOwners] = useState<Address[]>([]);
    const [isInstalled, setIsInstalled] = useState(false);
    const [isOwnerExecutor, setIsOwnerExecutor] = useState<boolean | null>(null);
    
    const { smartAccount, scwAddress } = useSmartAccountContext();
    const { address: eoaAddress } = useAccount();

    const classes = useStyles();

    useEffect(() => {
        const checkIfInstalled = async () => {
          try {
            const isInstalled = await smartAccount!.isModuleInstalled({moduleType: ModuleType.Execution, moduleAddress: OWNABLE_EXECUTOR});
            setIsInstalled(isInstalled);
          } catch (error) {
            toast.error("Account not deployed yet. Please deploy account first.");
          }
        }
        checkIfInstalled();
    }, [smartAccount])
    
    useEffect(() => {
        getModuleOwners();
    }, [smartAccount])

    const installModule = async () => {
        setLoading(true);
        const activeModule = smartAccount?.activeValidationModule;
        console.log(activeModule, "activeModule");
        const receipt = await smartAccount!.installModule({moduleAddress: OWNABLE_EXECUTOR, moduleType: ModuleType.Execution, data: encodePacked(['address'], [eoaAddress as Hex])});
        showSuccessMessage(`Installed Ownable Executor Module ${receipt.userOpHash}`, receipt.userOpHash);
        setLoading(false);
    }

    const isOwner = async (ownedAddressToCheck: Address, eoa?: boolean) => {
      const owners: Address[] = await getModuleOwners(ownedAddressToCheck as Hex);
      if(eoa){
        const eoaOwner = smartAccount?.getSmartAccountOwner();
        const eoaOwnerAddress = await eoaOwner?.getAddress();
        const result = owners.includes(eoaOwnerAddress ?? "0x");
        setIsOwnerExecutor(result);
        return result;
      }
      const result = owners.includes(scwAddress as Hex);
      setIsOwnerExecutor(result);
      return result;
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
        const receipt = await smartAccount!.uninstallModule({moduleAddress: OWNABLE_EXECUTOR, moduleType: ModuleType.Execution, data: deInitData});
        showSuccessMessage(`Uninstalled Ownable Executor Module ${receipt.userOpHash}`, receipt.userOpHash);
        setLoading(false);
    }

    const addOwner = async () => {
        setLoading(true);
        const module = await createOwnableExecutorModule(smartAccount!);
        const receipt = await module.addOwner("0x34f91c37900339eBd7146E50BA4d4d1983d94228");
        showSuccessMessage(`Added a new owner ${receipt.userOpHash}`, receipt.userOpHash);
        setLoading(false);
    }

    const removeOwner = async () => {
        setLoading(true);
        const module = await createOwnableExecutorModule(smartAccount!);
        const receipt = await module.removeOwner("0x34f91c37900339eBd7146E50BA4d4d1983d94228");
        showSuccessMessage(`Removed an owner ${receipt.userOpHash}`, receipt.userOpHash);
        setLoading(false);
    }

    const getModuleOwners = async (saAddress?: Address): Promise<any[]> => {
      try {
        setLoading(true);
        const module = await createOwnableExecutorModule(smartAccount!);
        const owners = await module.getOwners(saAddress);
        setOwners(owners);
        setLoading(false);
        return owners;
      } catch (error) {
        toast.error(`Error fetching owners`);
        return []
      }
    }
    
  return (
    <div
            onClick={(e) => {}}
            className={classes.card}
          >
            <Person3Icon style={{
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
                Ownable Executor
                <p style={isInstalled ? {color: 'green'} : {color: 'red'}}>{isInstalled ? "Installed" : "Not installed"}</p>
              </h3>
              <p
                style={{
                  fontSize: 14,
                  margin: 0,
                }}
              >
                The Ownable Executor module is a module that allows users to designate an owner that can execute transactions on their behalf and pays for gas.
              </p>
              <div style={{ display: 'flex', flexDirection: 'row', gap: '10px' }}>
                <Button title="Install Module" isLoading={loading} onClickFunc={async () => await installModule()} />
                <Button title="Uninstall Module" isLoading={loading} onClickFunc={() => uninstallModule()} />
                <Button title="Add Owner" isLoading={loading} onClickFunc={() => addOwner()} />
                <Button title="Remove Owner" isLoading={loading} onClickFunc={() => removeOwner()} />
              </div>
              <div>
                <p>Check if you are an executor owner of another Smart Account.</p>
               <input onChange={e => isOwner(e.target.value as Hex, true)} style={{width: '100%'}} placeholder='Enter owned SA address'/>
               {
                isOwnerExecutor !== null 
                  ? isOwnerExecutor ?
                    <p>You are an owner</p> 
                  : <p>You are not an owner</p>
                : ""
               }
              </div>
              <div>
                <h3>Current Owners</h3>
                <ul>{owners.map(owner => <li>{owner}</li>)}</ul>
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

export default OwnableExecutor