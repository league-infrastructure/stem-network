// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    interface Locals {
      user: import('node-appwrite').Models.User<import('node-appwrite').Models.Preferences> | null;
    }
    // interface PageData {}
    // interface Platform {}
  }
}

export {};
