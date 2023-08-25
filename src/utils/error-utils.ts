// Desc: Error handling utilities
type ErrorCode = "AA21" | "AA10";

// Add more error code and action items as needed
const errorCodeToActionMapping = {
    "AA21" : "Send some native tokens in your smart wallet to be able to resolve the error.",
    "AA10" : "Your smart wallet is already created but you are still sending initcode in userOp"
}

export const getActionForErrorMessage = (errorString: string) => {
    // if string contains error code anywhere, return the action
    const errorCode = errorString.match(/(AA\d{2})/g)?.[0] as ErrorCode;
    return errorCodeToActionMapping[errorCode];
}

