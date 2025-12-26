import { Client, Databases, Account, ID, Query } from 'node-appwrite';
import { PUBLIC_APPWRITE_ENDPOINT, PUBLIC_APPWRITE_PROJECT_ID } from '$env/static/public';
import { APPWRITE_API_KEY } from '$env/static/private';

const buildClient = () =>
  new Client()
    .setEndpoint(PUBLIC_APPWRITE_ENDPOINT)
    .setProject(PUBLIC_APPWRITE_PROJECT_ID)
    .setKey(APPWRITE_API_KEY);

export class AppwriteAdmin {
  readonly client: Client;
  readonly databases: Databases;
  readonly account: Account;

  constructor() {
    this.client = buildClient();
    this.databases = new Databases(this.client);
    this.account = new Account(this.client);
  }
}

const adminClient = buildClient();

export const adminAccount = new Account(adminClient);
export const adminDatabases = new Databases(adminClient);

export { ID, Query };
