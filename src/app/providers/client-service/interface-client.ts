export interface IClient {
    connect(): Promise<any>;
    disconnect(): Promise<any>;
    isConnected(): Promise<boolean>;
    startNetworkMonitor(outputHandler: (output: string) => void): Promise<any>;
    stopNetworkMonitor();
}
