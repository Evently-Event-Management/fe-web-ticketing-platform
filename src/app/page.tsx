// app/page.tsx
'use client'

import keycloak from '@/lib/keycloak'

export default function HomePage() {
  return (
      <main>
        <h1>Hello, you&#39;re logged in!</h1>
        <p>Token: {keycloak.token?.slice(0, 20)}...</p>

        <button onClick={() => keycloak.logout({ redirectUri: window.location.origin })}>
          Logout
        </button>
          <button onClick={() => keycloak.accountManagement()}>
              Edit Profile
          </button>

      </main>
  )
}
