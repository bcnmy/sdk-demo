import {
  DEFAULT_ERC20_MODULE,
  SessionLocalStorage,
  type SessionType
} from "@biconomy-devx/account"
import { useMemo, useState } from "react"
import type { Hex } from "viem"

// Should not be used in production. This is just a mock implementation
export const useHasSession = (
  smartAccountAddress: Hex | undefined,
  sessionType: SessionType
) => {
  const [hasSession, setHasSession] = useState(false)
  useMemo(() => {
    if (smartAccountAddress) {
      const storageClient = new SessionLocalStorage(smartAccountAddress)
      ;(async () => {
        const allSessions = await storageClient.getAllSessionData()
        if (allSessions.length > 0) {
          const lastSession = allSessions[allSessions.length - 1]
          const lastSessionIsForDan = !!lastSession?.danModuleInfo
          switch (sessionType) {
            case "BATCHED":
              setHasSession(
                !!allSessions[allSessions.length - 2] &&
                  !allSessions[allSessions.length - 2]?.danModuleInfo
              )
              break
            case "STANDARD":
              setHasSession(!lastSessionIsForDan)
              break
            case "DISTRIBUTED_KEY":
              setHasSession(!!lastSessionIsForDan)
              break
            default:
              setHasSession(true)
              break
          }
        }
      })()
    }
    return false
  }, [smartAccountAddress, sessionType])
  return hasSession
}
