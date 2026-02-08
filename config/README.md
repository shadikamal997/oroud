# Firebase Configuration

## Setup Instructions

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (or create a new one)
3. Go to **Project Settings** > **Service Accounts**
4. Click **Generate New Private Key**
5. Download the JSON file
6. Rename it to `firebase-service-account.json`
7. Place it in this `config` folder

## Security Note

⚠️ **NEVER commit the actual `firebase-service-account.json` file to version control!**

The file contains sensitive credentials. It's already added to `.gitignore`.

Only commit the `firebase-service-account.example.json` as a template.
