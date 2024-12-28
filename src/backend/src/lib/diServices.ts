import { TableClient, TableServiceClient } from '@azure/data-tables';
import { BlobServiceClient, ContainerClient } from '@azure/storage-blob';
import { QueueClient, QueueServiceClient } from '@azure/storage-queue';
import { ManagementClient } from 'auth0';
import Container from 'typedi';
import {
    EVENT_QUEUE_NAME,
    MEETING_TABLE_NAME,
    MEETINGAUDIO_AZURE_CONTAINER
} from './meetingTypes';

export function registerAzureServices(container: typeof Container) {
    if (!process.env.AZURE_TABLES_CONNECTION_STRING) {
        throw new Error(
            'Environment variable AZURE_TABLES_CONNECTION_STRING is missing'
        );
    }
    if (!process.env.AZURE_STORAGE_CONNECTION_STRING) {
        throw new Error(
            'Environment variable AZURE_STORAGE_CONNECTION_STRING is missing'
        );
    }
    if (!process.env.AZURE_QUEUE_CONNECTION_STRING) {
        throw new Error(
            'Environment variable AZURE_QUEUE_CONNECTION_STRING is missing'
        );
    }

    container.set(
        BlobServiceClient,
        BlobServiceClient.fromConnectionString(
            process.env.AZURE_STORAGE_CONNECTION_STRING
        )
    );
    container.set(
        QueueServiceClient,
        QueueServiceClient.fromConnectionString(
            process.env.AZURE_QUEUE_CONNECTION_STRING
        )
    );
    container.set(
        TableServiceClient,
        TableServiceClient.fromConnectionString(
            process.env.AZURE_TABLES_CONNECTION_STRING
        )
    );

    container.set<TableClient>(
        'meetingsTable',
        TableClient.fromConnectionString(
            process.env.AZURE_TABLES_CONNECTION_STRING,
            MEETING_TABLE_NAME
        )
    );

    container.set<QueueClient>(
        'eventQueue',
        container.get(QueueServiceClient).getQueueClient(EVENT_QUEUE_NAME)
    );

    container.set<ContainerClient>(
        'meetingAudioContainerClient',
        container
            .get(BlobServiceClient)
            .getContainerClient(MEETINGAUDIO_AZURE_CONTAINER)
    );
}
