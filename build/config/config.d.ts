declare const _default: {
    host: string;
    port: string | number;
    mongoUsername: string | undefined;
    mongoPassword: string | undefined;
    testDb: string;
    productionDb: string;
    mongoOptions: {
        retryWrites: boolean;
        w: string;
    };
    secretKey: string;
    resetDelay: number;
    ownerEmail: string;
    domainEmail: string;
    domainEmailPassowrd: string;
    emailHostServiceProvider: string;
    apiKey: string;
};
export default _default;
