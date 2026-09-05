import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState } from "react";
const RequesterContext = createContext(undefined);
export function RequesterProvider({ children }) {
    const [requester, setRequester] = useState(null);
    return (_jsx(RequesterContext.Provider, { value: { requester, setRequester }, children: children }));
}
export function useRequester() {
    const context = useContext(RequesterContext);
    if (context === undefined) {
        throw new Error("useRequester must be used within a RequesterProvider");
    }
    return context;
}
