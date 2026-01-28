import { ID, AuthenticatorType } from "@appwrite.io/console";
import { sdk } from "../appwrite"

export const login = async (email: string, password: string) => {
    try {
        const response = await sdk.forConsole.account.createEmailPasswordSession({
            email,
            password
        });
        return response;
    } catch (error: any) {
        throw new Error(error.message || error);
    }
}

export const signup = async (email: string, password: string, name?: string) => {
    try {
        const response = await sdk.forConsole.account.create({
            userId: ID.unique(),
            email,
            password,
            name: name ?? ''
        });
        return response;
  } catch (error: any) {
        throw new Error(error.message || error);
    }
}

export const logout = async () => {
    try {
        const response = await sdk.forConsole.account.deleteSession({ sessionId: 'current' });
        return response;
    } catch (error: any) {
        throw new Error(error.message || error);
    }
}

export const getCurrentUser = async () => {
    try {
        const response = await sdk.forConsole.account.get();
        return response;
    } catch (error: any) {
        throw new Error(error.message || error);
    }
}

export const getUserAvatar = (name: string) => {
    const modifiedName = name.trim().split(/\s+/).join('+');
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(modifiedName)}&background=random&color=fff&size=100`;
};

export const listIdentities = async () => {
    try {
        const response = await sdk.forConsole.account.listIdentities();
        return response;
    } catch (error: any) {
        throw new Error(error.message || error);
    }
}

export const deleteIdentity = async (identityId: string) => {
    try {
        const response = await sdk.forConsole.account.deleteIdentity({ identityId });
        return response;
    } catch (error: any) {
        throw new Error(error.message || error);
    }
}

export const updatePassword = async (password: string, oldPassword?: string) => {
    try {
        const response = await sdk.forConsole.account.updatePassword({
            password,
            oldPassword
        });
        return response;
    } catch (error: any) {
        throw new Error(error.message || error);
    }
}

export const listFactors = async () => {
    try {
        const response = await sdk.forConsole.account.listMfaFactors();
        return response;
    } catch (error: any) {
        throw new Error(error.message || error);
    }
}

export const updateMFA = async (mfa: boolean) => {
    try {
        const response = await sdk.forConsole.account.updateMFA({ mfa });
        return response;
    } catch (error: any) {
        throw new Error(error.message || error);
    }
}

export const createMFAAuthenticator = async (type: AuthenticatorType) => {
    try {
        const response = await sdk.forConsole.account.createMFAAuthenticator({ type });
        return response;
    } catch (error: any) {
        throw new Error(error.message || error);
    }
}

export const updateMFAAuthenticator = async (type: AuthenticatorType, otp: string) => {
    try {
        const response = await sdk.forConsole.account.updateMFAAuthenticator({ type, otp });
        return response;
    } catch (error: any) {
        throw new Error(error.message || error);
    }
}

export const deleteMFAAuthenticator = async (type: AuthenticatorType) => {
    try {
        const response = await sdk.forConsole.account.deleteMFAAuthenticator({ type });
        return response;
    } catch (error: any) {
        throw new Error(error.message || error);
    }
}

export const createMFARecoveryCodes = async () => {
    try {
        const response = await sdk.forConsole.account.createMFARecoveryCodes();
        return response;
    } catch (error: any) {
        throw new Error(error.message || error);
    }
}

export const updateMFARecoveryCodes = async () => {
    try {
        const response = await sdk.forConsole.account.updateMFARecoveryCodes();
        return response;
    } catch (error: any) {
        throw new Error(error.message || error);
    }
}

export const createVerification = async (url: string) => {
    try {
        const response = await sdk.forConsole.account.createVerification({ url });
        return response;
    } catch (error: any) {
        throw new Error(error.message || error);
    }
}


export const deleteAccount = async () => {
    try {
        const response = await sdk.forConsole.account.delete();
        return response;
    } catch (error: any) {
        throw new Error(error.message || error);
    }
}
