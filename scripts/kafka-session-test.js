#!/usr/bin/env node

/**
 * Kafka Session Test Message Generator
 * 
 * This script generates Debezium-formatted messages for testing session 
 * notification triggers. It creates messages with sessions starting at 
 * different time intervals to test email notifications.
 */

const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

// Convert JavaScript Date to microseconds timestamp (Debezium format)
function toMicrosecondTimestamp(date) {
    return date.getTime() * 1000;
}

// Generate a session message for testing
function generateSessionMessage(sessionConfig) {
    const {
        sessionId = uuidv4(),
        eventId = uuidv4(),
        startTime,
        endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000), // 2 hours after start
        status = 'ON_SALE',
        sessionType = 'PHYSICAL',
        venueName = 'Test Event Center',
        venueAddress = 'Test Location',
        latitude = 7.2513,
        longitude = 80.3464,
        salesStartTime = new Date(Date.now() - 24 * 60 * 60 * 1000) // 24 hours ago
    } = sessionConfig;

    const venueDetails = {
        name: venueName,
        address: venueAddress,
        latitude: latitude,
        longitude: longitude,
        onlineLink: null
    };

    const beforeState = status === 'ON_SALE' ? {
        id: sessionId,
        event_id: eventId,
        start_time: toMicrosecondTimestamp(startTime),
        end_time: toMicrosecondTimestamp(endTime),
        status: 'SCHEDULED',
        venue_details: JSON.stringify(venueDetails),
        session_type: sessionType,
        sales_start_time: toMicrosecondTimestamp(salesStartTime)
    } : null;

    const afterState = {
        id: sessionId,
        event_id: eventId,
        start_time: toMicrosecondTimestamp(startTime),
        end_time: toMicrosecondTimestamp(endTime),
        status: status,
        venue_details: JSON.stringify(venueDetails),
        session_type: sessionType,
        sales_start_time: toMicrosecondTimestamp(salesStartTime)
    };

    return {
        schema: {
            type: "struct",
            fields: [
                {
                    type: "struct",
                    fields: [
                        { type: "string", optional: false, name: "io.debezium.data.Uuid", version: 1, field: "id" },
                        { type: "string", optional: false, name: "io.debezium.data.Uuid", version: 1, field: "event_id" },
                        { type: "int64", optional: false, name: "io.debezium.time.MicroTimestamp", version: 1, field: "start_time" },
                        { type: "int64", optional: false, name: "io.debezium.time.MicroTimestamp", version: 1, field: "end_time" },
                        { type: "string", optional: false, field: "status" },
                        { type: "string", optional: true, name: "io.debezium.data.Json", version: 1, field: "venue_details" },
                        { type: "string", optional: false, field: "session_type" },
                        { type: "int64", optional: true, name: "io.debezium.time.MicroTimestamp", version: 1, field: "sales_start_time" }
                    ],
                    optional: true,
                    name: "dbz.ticketly.public.event_sessions.Value",
                    field: "before"
                },
                {
                    type: "struct",
                    fields: [
                        { type: "string", optional: false, name: "io.debezium.data.Uuid", version: 1, field: "id" },
                        { type: "string", optional: false, name: "io.debezium.data.Uuid", version: 1, field: "event_id" },
                        { type: "int64", optional: false, name: "io.debezium.time.MicroTimestamp", version: 1, field: "start_time" },
                        { type: "int64", optional: false, name: "io.debezium.time.MicroTimestamp", version: 1, field: "end_time" },
                        { type: "string", optional: false, field: "status" },
                        { type: "string", optional: true, name: "io.debezium.data.Json", version: 1, field: "venue_details" },
                        { type: "string", optional: false, field: "session_type" },
                        { type: "int64", optional: true, name: "io.debezium.time.MicroTimestamp", version: 1, field: "sales_start_time" }
                    ],
                    optional: true,
                    name: "dbz.ticketly.public.event_sessions.Value",
                    field: "after"
                },
                {
                    type: "struct",
                    fields: [
                        { type: "string", optional: false, field: "version" },
                        { type: "string", optional: false, field: "connector" },
                        { type: "string", optional: false, field: "name" },
                        { type: "int64", optional: false, field: "ts_ms" },
                        { type: "string", optional: true, name: "io.debezium.data.Enum", version: 1, parameters: { allowed: "true,last,false,incremental" }, default: "false", field: "snapshot" },
                        { type: "string", optional: false, field: "db" },
                        { type: "string", optional: true, field: "sequence" },
                        { type: "string", optional: false, field: "schema" },
                        { type: "string", optional: false, field: "table" },
                        { type: "int64", optional: true, field: "txId" },
                        { type: "int64", optional: true, field: "lsn" },
                        { type: "int64", optional: true, field: "xmin" }
                    ],
                    optional: false,
                    name: "io.debezium.connector.postgresql.Source",
                    field: "source"
                },
                { type: "string", optional: false, field: "op" },
                { type: "int64", optional: true, field: "ts_ms" },
                {
                    type: "struct",
                    fields: [
                        { type: "string", optional: false, field: "id" },
                        { type: "int64", optional: false, field: "total_order" },
                        { type: "int64", optional: false, field: "data_collection_order" }
                    ],
                    optional: true,
                    name: "event.block",
                    version: 1,
                    field: "transaction"
                }
            ],
            optional: false,
            name: "dbz.ticketly.public.event_sessions.Envelope",
            version: 1
        },
        payload: {
            before: beforeState,
            after: afterState,
            source: {
                version: "2.5.4.Final",
                connector: "postgresql",
                name: "dbz.ticketly",
                ts_ms: Date.now(),
                snapshot: "false",
                db: "event_service",
                sequence: `["${Date.now()}","${Date.now() + 1}"]`,
                schema: "public",
                table: "event_sessions",
                txId: Math.floor(Math.random() * 10000),
                lsn: Math.floor(Math.random() * 100000000),
                xmin: null
            },
            op: beforeState ? "u" : "c", // update if before exists, create otherwise
            ts_ms: Date.now(),
            transaction: null
        }
    };
}

// Generate test scenarios
function generateTestScenarios() {
    const now = new Date();
    
    return [
        {
            name: "Session starting in 1 hour (should trigger notification)",
            config: {
                startTime: new Date(now.getTime() + 60 * 60 * 1000), // 1 hour from now
                venueName: "Test Venue - 1 Hour",
                venueAddress: "Test Location A"
            }
        },
        {
            name: "Session starting in 59 minutes (should trigger notification)",
            config: {
                startTime: new Date(now.getTime() + 59 * 60 * 1000), // 59 minutes from now
                venueName: "Test Venue - 59 Minutes",
                venueAddress: "Test Location B"
            }
        },
        {
            name: "Session starting in 61 minutes (should NOT trigger notification yet)",
            config: {
                startTime: new Date(now.getTime() + 61 * 60 * 1000), // 61 minutes from now
                venueName: "Test Venue - 61 Minutes", 
                venueAddress: "Test Location C"
            }
        },
        {
            name: "Session starting in 30 minutes (should trigger notification)",
            config: {
                startTime: new Date(now.getTime() + 30 * 60 * 1000), // 30 minutes from now
                venueName: "Test Venue - 30 Minutes",
                venueAddress: "Test Location D"
            }
        },
        {
            name: "Session starting in 2 hours (should NOT trigger notification)",
            config: {
                startTime: new Date(now.getTime() + 2 * 60 * 60 * 1000), // 2 hours from now
                venueName: "Test Venue - 2 Hours",
                venueAddress: "Test Location E"
            }
        },
        {
            name: "Session that already started (should NOT trigger notification)",
            config: {
                startTime: new Date(now.getTime() - 30 * 60 * 1000), // 30 minutes ago
                status: 'ACTIVE',
                venueName: "Test Venue - Already Started",
                venueAddress: "Test Location F"
            }
        }
    ];
}

// Save messages to files for different use cases
function saveTestMessages() {
    const scenarios = generateTestScenarios();
    const outputDir = path.join(__dirname, 'kafka-test-messages');
    
    // Create output directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    console.log('🚀 Generating Kafka test messages for session notifications...\n');

    scenarios.forEach((scenario, index) => {
        const message = generateSessionMessage(scenario.config);
        const filename = `session-${index + 1}-${scenario.name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}.json`;
        const filepath = path.join(outputDir, filename);
        
        fs.writeFileSync(filepath, JSON.stringify(message, null, 2));
        
        const startTime = new Date(message.payload.after.start_time / 1000);
        const timeFromNow = Math.round((startTime.getTime() - Date.now()) / (1000 * 60));
        
        console.log(`📄 ${filename}`);
        console.log(`   ${scenario.name}`);
        console.log(`   Start Time: ${startTime.toLocaleString()}`);
        console.log(`   Time from now: ${timeFromNow} minutes`);
        console.log(`   Status: ${message.payload.after.status}`);
        console.log('');
    });

    // Generate a combined messages file for batch processing
    const allMessages = scenarios.map(scenario => generateSessionMessage(scenario.config));
    fs.writeFileSync(
        path.join(outputDir, 'all-test-messages.json'), 
        JSON.stringify(allMessages, null, 2)
    );

    console.log(`✅ Generated ${scenarios.length} test messages in: ${outputDir}`);
    console.log('\n📋 Usage:');
    console.log('1. Individual files: Use for testing specific scenarios');
    console.log('2. all-test-messages.json: Batch process all scenarios');
    console.log('3. Send to Kafka topic for testing email notifications\n');
    
    return outputDir;
}

// Generate Kafka producer commands for easy testing
function generateKafkaCommands(outputDir) {
    const commandsFile = path.join(outputDir, 'kafka-commands.sh');
    const scenarios = generateTestScenarios();
    
    let commands = `#!/bin/bash
# Kafka Producer Commands for Session Notification Testing
# Make sure your Kafka cluster is running before executing these commands

KAFKA_TOPIC="event-sessions-topic"  # Update with your actual topic name
KAFKA_BOOTSTRAP_SERVER="localhost:9092"  # Update with your Kafka server

echo "🚀 Sending session test messages to Kafka..."
echo ""

`;

    scenarios.forEach((scenario, index) => {
        const filename = `session-${index + 1}-${scenario.name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}.json`;
        commands += `echo "📤 Sending: ${scenario.name}"\n`;
        commands += `kafka-console-producer --bootstrap-server $KAFKA_BOOTSTRAP_SERVER --topic $KAFKA_TOPIC < "${filename}"\n`;
        commands += `echo "✅ Sent message for session starting in $((($(date -d "$(node -p "new Date($(cat ${filename} | jq -r '.payload.after.start_time') / 1000).toISOString()")" +%s) - $(date +%s)) / 60)) minutes"\n`;
        commands += `echo ""\n\n`;
    });

    commands += `echo "🎉 All test messages sent!"\n`;
    commands += `echo "Check your notification system logs to verify email triggers."\n`;

    fs.writeFileSync(commandsFile, commands);
    fs.chmodSync(commandsFile, '755'); // Make executable
    
    console.log(`📜 Generated Kafka commands: ${commandsFile}`);
}

// Main execution
if (require.main === module) {
    try {
        const outputDir = saveTestMessages();
        generateKafkaCommands(outputDir);
        
        console.log('🎯 Test Messages Generated Successfully!');
        console.log('\n🔧 Next Steps:');
        console.log('1. Review the generated JSON files');
        console.log('2. Update Kafka topic name in kafka-commands.sh');
        console.log('3. Run: chmod +x scripts/kafka-test-messages/kafka-commands.sh');
        console.log('4. Execute: ./scripts/kafka-test-messages/kafka-commands.sh');
        console.log('\n💡 Tip: Messages with start times ≤ 60 minutes should trigger notifications');
        
    } catch (error) {
        console.error('❌ Error generating test messages:', error);
        process.exit(1);
    }
}

module.exports = {
    generateSessionMessage,
    generateTestScenarios,
    toMicrosecondTimestamp
};