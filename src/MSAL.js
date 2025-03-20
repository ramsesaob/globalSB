export const msalConfig = {
    auth: {
        clientId: '7899cf26-d1e0-4a34-ba51-eec955a6255f',
        authority: 'https://login.microsoftonline.com/db9de744-c6ef-4e5c-9077-466ebe9c283a',
        redirectUri: 'http://localhost:5173/'
    }
};

export const loginRequest = {
    scopes: ['User.Read', 'User.ReadBasic.All']
};