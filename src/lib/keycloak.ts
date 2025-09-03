// lib/keycloak.ts
'use client'

import Keycloak from 'keycloak-js'

const keycloak = new Keycloak({
    url: 'https://auth.dpiyumal.me',
    realm: 'event-ticketing',
    clientId: 'web-frontend',
})

export default keycloak
