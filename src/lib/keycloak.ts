// lib/keycloak.ts
'use client'

import Keycloak from 'keycloak-js'

const keycloak = new Keycloak({
    url: 'http://localhost:8080',
    realm: 'event-ticketing',
    clientId: 'web-frontend',
})

export default keycloak
