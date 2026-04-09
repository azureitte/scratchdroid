import * as Keychain from 'react-native-keychain';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Cookies } from '@preeternal/react-native-cookie-manager';

import type { StoredAccount, StoredPublicAccount } from './types/app/accounts.types';

export async function addAccount (account: StoredAccount) {
    await Keychain.setGenericPassword(
        account.username,
        account.password,
        {
            accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED,
            service: `com.scratchdroid.account.${account.username}.password`,
        }
    );

    const publicAccount: StoredPublicAccount = {
        username: account.username,
        id: account.id,
        cookies: account.cookies,
    };

    const accounts = await getAccounts();

    const idx = accounts.findIndex(a => a.username === account.username);
    if (idx === -1) {
        accounts.push(publicAccount);
    } else {
        accounts[idx] = publicAccount;
    }
    await saveAccounts(accounts);
}

export async function updateAccountCookies (username: string, cookies: Cookies) {
    const accounts = await getAccounts();
    const account = accounts.find(a => a.username === username);
    if (!account) return;

    account.cookies = cookies;
    await saveAccounts(accounts);
}

export async function getAccounts (): Promise<StoredPublicAccount[]> {
    const existingRecord = await AsyncStorage.getItem('accounts');
    return existingRecord ? JSON.parse(existingRecord) : [];
}

export async function getAccountCredentials (username: string): Promise<StoredAccount|null> {
    const accounts = await getAccounts();
    const account = accounts.find(a => a.username === username);
    if (!account) return null;

    const passwordCred = await Keychain.getGenericPassword({
        service: `com.scratchdroid.account.${account.username}.password`,
    });
    if (!passwordCred) return null;
    const password = passwordCred.password;

    return {
        username: account.username,
        id: account.id,
        password: password,
        cookies: account.cookies,
    };
}

export async function getActiveAccount (): Promise<string|null> {
    const activeUsername = await AsyncStorage.getItem('activeAccount');
    if (!activeUsername) return null;
    return activeUsername;
}

export async function setActiveAccount (username: string|null) {
    if (username === null) await AsyncStorage.removeItem('activeAccount');
    else await AsyncStorage.setItem('activeAccount', username);
}

export async function clearAccounts () {
    const accounts = await getAccounts();
    await Promise.all(accounts.flatMap(account => Keychain.resetGenericPassword({
        service: `com.scratchdroid.account.${account.username}.password`,
    })));

    await AsyncStorage.removeItem('accounts');
    await AsyncStorage.removeItem('activeAccount');
}


async function saveAccounts (accounts: StoredPublicAccount[]) {
    await AsyncStorage.setItem('accounts', JSON.stringify(accounts));
}