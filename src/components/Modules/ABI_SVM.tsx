
import { useState } from 'react';
import { Contract, ethers  } from 'ethers'
import abis from "../../utils/configs/contractsInfo.json";
import { useSmartAccountContext } from '../../contexts/SmartAccountContext';
import { useAccount } from 'wagmi';
import CreateABISVM from './CreateABISVM';
import { ABI_SVM } from '../../utils/constants';


export default function ABISVM() {
  const { address } = useAccount();
  const { smartAccount, scwAddress } = useSmartAccountContext();
  const [loading, setLoading] = useState<boolean>(false);
  const [provider, setProvider] = useState<ethers.providers.Provider | null>(null)

  const [mockStake, setMockStake] = useState<Contract>();
  
  const connect = async () => {
    // @ts-ignore
    const { ethereum } = window;
    try {
      setLoading(true)
      const provider = new ethers.providers.Web3Provider(ethereum)
      await provider.send("eth_requestAccounts", []);
      setProvider(provider)

      setMockStake(mockStake);
      setLoading(false)
    } catch (error) {
      console.error(error);
    }
  };

  console.log(smartAccount);
  console.log(provider);

  return (
    <>
      <main >
        <h1>ABI SVM Demo</h1>
        {!loading && !address && <button onClick={connect} >Connect to Web3</button>}
        {loading && <p>Loading Smart Account...</p>}
        {scwAddress && <h2>Smart Account: {scwAddress}</h2>}

        {
          smartAccount && (
            <CreateABISVM
              smartAccount={smartAccount}
              address={scwAddress}
              provider={provider!}
              nftContract={new ethers.Contract(
                "0x1758f42Af7026fBbB559Dc60EcE0De3ef81f665e",
                abis.nft.abi,
                provider!
              )!}
              abiSVMAddress={ABI_SVM}
            />
          )
        }
      </main>
    </>
  )
}