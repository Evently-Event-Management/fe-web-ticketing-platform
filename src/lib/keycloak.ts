// lib/keycloak.ts
'use client'

import Keycloak from 'keycloak-js'

const keycloak = new Keycloak({
    url: 'http://auth.ticketly.com:8080',
    realm: 'event-ticketing',
    clientId: 'web-frontend',
})

export default keycloak
