export const environment = {
  production: false,
  application: {
    baseUrl: 'http://localhost:4200',
    name: 'DirektSatis'
  },
  oAuthConfig: {
    issuer: 'https://ds-auth.direktsatis.com/',
    redirectUri: 'http://localhost:4200',
    clientId: 'DirektSatis_App',
    responseType: 'code',
    scope: 'offline_access DirektSatis',
    requireHttps: true
  },
  apis: {
    default: {
      url: 'https://ds-api.direktsatis.com',
      rootNamespace: 'DirektSatis'
    },
    AbpAccountPublic: {
      url: 'https://ds-auth.direktsatis.com',
      rootNamespace: 'AbpAccountPublic'
    }
  }
};
