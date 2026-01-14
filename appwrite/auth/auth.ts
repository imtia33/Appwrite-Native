import { ID } from "@appwrite.io/console";
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

