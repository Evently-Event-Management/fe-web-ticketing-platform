import React from 'react'

describe('Simple Test', () => {
  it('passes', () => {
    cy.mount(<div>Hello World</div>)
    cy.contains('Hello World')
  })
})