import * as electron from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import * as randomString from 'crypto-random-string';
import { screen } from 'electron';

export enum ConfigKeys {
    apiKey = 'apiKey',
    username = 'username',
    password = 'password',
    psk = 'psk',
    sshId = 'sshId',
    windowPosition = 'windowPosition',
    region = 'region'
}

class Store {
    path: string;
    data: any;

    constructor(configName: string) {
        const userDataPath = (electron.app || electron.remote.app).getPath('userData');
        this.path = path.join(userDataPath, configName + '.json');
        console.log(this.path);
        this.initData();
    }

    public get(key: ConfigKeys) {
        if (!this.data[key]) {
            this.data[key] = this.generateData(key);
        }
        return this.data[key];
    }

    public set(key: ConfigKeys, val: any) {
        this.data[key] = val;
        fs.writeFileSync(this.path, JSON.stringify(this.data));
    }

    private initData() {
        try {
            this.data = JSON.parse(fs.readFileSync(this.path).toString());
        } catch (err) {
            console.log(err);
            this.data = {
                [ConfigKeys.apiKey]: '',
            };
            this.regenerateKeys();
            fs.writeFileSync(this.path, JSON.stringify(this.data));
        }
    }

    public regenerateKeys() {
        this.data[ConfigKeys.username] = this.generateData(ConfigKeys.username);
        this.data[ConfigKeys.password] = this.generateData(ConfigKeys.password);
        this.data[ConfigKeys.psk] = this.generateData(ConfigKeys.psk);
    }

    private generateData(key: ConfigKeys) {
        switch (key) {
            case ConfigKeys.username: {
               return this.generateString(8);
            }
            case ConfigKeys.password: {
                return this.generateString(24);
            }
            case ConfigKeys.psk: {
                return this.generateString(24);
            }
            case ConfigKeys.windowPosition: {
                const size = screen.getPrimaryDisplay().workAreaSize;
                return { x: size.width / 2 - 200, y: size.height / 2 - 250 };
            }
            case ConfigKeys.region: {
                return 'ams3';
            }
            default: {
               return '';
            }
         }
    }

    private generateString(len) {
        return randomString({
            length: len,
            characters: 'ABCDEFGHIJKLMNOPRSTUVYZXWabcdefghijklmoprstuvyz0123456789'
        });
    }
}

export const config: Store = new Store('user-preferences');
