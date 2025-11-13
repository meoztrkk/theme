export const environment = {
  production: true,
  application: {
    baseUrl: 'https://ds.direktsatis.com',
    name: 'DirektSatis'
  },
  oAuthConfig: {
    issuer: 'https://ds-auth.direktsatis.com/',
    redirectUri: 'https://ds.direktsatis.com',
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
