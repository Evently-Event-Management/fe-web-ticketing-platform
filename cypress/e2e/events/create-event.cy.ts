// cypress/e2e/events/create-event.cy.ts

describe('Event Creation Flow', () => {
    const eventTitle = `Sample Event ${Date.now()}`;
    const eventDescription = 'This is a sample event description for testing.';
    const eventOverview = 'An overview of the test event goes here. Sample overview.';
    const tierName = 'General Admission';
    const ticketPrice = 1000;
    const capacity = 10;
    const onlineLink = 'https://zoom.com';
    
    beforeEach(() => {
        // Mock user's organizations
        cy.intercept('GET', '**/api/**/organizations/my', {
            statusCode: 200,
            body: [
                {
                    id: '00000000-0000-0000-0000-000000000000',
                    name: 'Test Organization',
                    website: 'https://testorg.com',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                
                }
            ]
        }).as('getMyOrganizations');
        
        // Category data for dropdown
        cy.intercept('GET', '**/api/**/categories', {
            statusCode: 200,
            body: [
                { 
                    id: '00000000-0000-0000-0000-000000000000',
                    name: 'Entertainment',
                    subCategories: [
                        { id: 'bb2785ee-2a92-4e79-a6a4-ab4ae8c71020', name: 'Random', parentId: '00000000-0000-0000-0000-000000000000' },
                    ]
                }
            ]
        }).as('getCategories');
        
        // Events list
        cy.intercept('GET', '**/api/organizations/*/events*', {
            statusCode: 200,
            body: []
        }).as('getEvents');
        
        // Event creation endpoint
        cy.intercept('POST', '**/api/events', {
            statusCode: 201,
            body: {
                id: 'mock-event-id-1',
                title: eventTitle,
                status: 'PENDING'
            }
        }).as('createEvent');
        
        // Mock file uploads for cover images
        cy.intercept('POST', '**/api/upload', {
            statusCode: 200,
            body: {
                urls: ['https://example.com/mock-image.jpg']
            }
        }).as('uploadImage');
        
        // Now perform login
        cy.login();
        cy.url().should('include', 'localhost:8090');
    });

    it('should create an event successfully', () => {
        // Navigate to create event page via the menu
        cy.get('button').contains('Create Events').click();

        // Wait for organizations to load
        cy.wait('@getMyOrganizations');
        // Add a small delay to ensure the UI is ready
        cy.wait(1000);
        
        // Click menu item and wait for navigation to complete
        cy.contains('Create an Event').click();
        cy.url().should('include', '/event/create');
        
        // Step 1: Core Details
        // Fill in event title
        cy.get('input[id*="-form-item"]').first().clear().type(eventTitle);
        
        // Fill in event description
        cy.get('textarea[id*="-form-item"]').first().clear().type(eventDescription);
        
        // Click edit markdown button for overview
        cy.get('button[aria-label="Edit code (ctrl + 7)"]').click();
        
        // Fix for type error: Target the specific textarea for markdown editing
        // First make sure we're in edit mode and there's only one relevant textarea
        cy.get('div.border-t textarea.w-md-editor-text-input').clear().type(eventOverview);
        
        // Select category (using more specific selectors)
        cy.contains('button', 'Select a category for your event').click();
        cy.get('[role="option"]').contains('Random').click();        // Go to next step
        cy.contains('button', 'Next Step').click();
        
        // Wait for page to transition to step 2 (don't expect toast for step transitions)
        cy.contains('h1', 'Create New Event').should('exist');
        cy.contains('Ticket Tiers').should('be.visible');
        
        // Step 2: Ticket Tiers
        // Add a ticket tier
        cy.contains('button', 'Add New Tier').click();
        
        // Wait for dialog to appear before interacting with form fields
        cy.get('form').should('be.visible');
        
        // Target inputs within the dialog's form context
        // Use more specific selectors to ensure we're targeting the correct elements
        cy.get('form').within(() => {
            // Fill in tier name
            cy.get('input#name').clear().type(tierName);
            
            // Fill in price
            cy.get('input#price').clear().type(ticketPrice.toString());
            
            // Select a color (optional)
            cy.get('input[type="color"]').first().invoke('val', '#3B82F6').trigger('change');
        });
        
        // Save the tier
        cy.contains('button', 'Save').click();
        
        // Go to next step
        cy.contains('button', 'Next Step').click();
        
        // Step 3: Scheduling
        // Add a session
        cy.contains('button', 'Add Single Session').click();
        
        // Wait for the session dialog to appear
        cy.get('form').contains('Add Session').should('be.visible');
        
        // Instead of trying to use the calendar UI (which can be flaky),
        // let's use the default values that are pre-filled
        // Most of the form fields should already have sensible defaults
        
        // If we need to explicitly set any values, do it here
        // For example, to set the session name:
        cy.get('input[placeholder="e.g., Opening Night, Day 1"]').type(' - Test Session');
        
        // Just make sure the form is fully loaded and ready for submission
        cy.get('form').should('be.visible');
        
        // Fill in time details (these are likely pre-populated)
        
        // Add the session
        cy.contains('button', 'Add Session').click();
        
        // Add location
        cy.contains('button', 'Add Location').click();
        
        // Wait for the location dialog to appear
        cy.contains('Choose Session Type').should('be.visible');
        
        // Select online option
        cy.get('div[role="radiogroup"]').within(() => {
            cy.contains('label', 'Online').click();
        });
        
        // Fill in online link after the online section appears
        cy.get('label').contains('Online Link').parent().within(() => {
            cy.get('input').type(onlineLink);
        });
        
        // Save location
        cy.contains('button', 'Save Location').click();
        
        // Go to next step
        cy.contains('button', 'Next Step').click();
        
        // Step 4: Seating
        // Configure seating
        cy.contains('button', 'Configure Seating').click();
        
        // Wait for the seating configuration dialog to appear
        cy.contains('Capacity Configuration').should('be.visible');
        
        // Set capacity in the dialog
        cy.get('form').within(() => {
            cy.get('input#capacity').clear().type(capacity.toString());
        });
        
        // Select the tier
        cy.get('form').contains('Select Tier').click();
        cy.get('[role="option"]').contains(tierName).click();
        
        // Set capacity & tier
        cy.contains('button', 'Set Capacity').click();
        
        // Apply to all sessions
        cy.contains('button', 'Apply to all online sessions').click();
        
        // Go to next step
        cy.contains('button', 'Next Step').click();
        
        // Step 5: Discounts (skip for now)
        cy.contains('button', 'Next Step').click();
        
        // Step 6: Review and submit
        cy.contains('button', 'Submit Event').click();
        
        // Wait for confirmation dialog to appear and click confirm
        cy.contains('Ready to Submit?').should('be.visible');
        cy.contains('button', 'Confirm Submit').click();
        
        // Wait for API call to complete
        cy.wait('@createEvent');
        
        // Verify success toast (with retry capability)
        cy.verifyToast('Event submitted successfully!', { timeout: 10000 });
        
        // Verify redirection to events page (with wait to ensure navigation completes)
        cy.url().should('include', '/manage/organization/');
        cy.url().should('include', '/event', { timeout: 10000 });
    });
    
    afterEach(() => {
        // Clean up test events to keep the environment clean
        cy.cleanupTestEvents('Sample Event');
    });
});