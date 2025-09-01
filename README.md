# FirstSpirit Connect for Commerce Shopify Preview

This repository provides a reference implementation for building a headless storefront that integrates FirstSpirit Connect for Commerce with Shopify Hydrogen (Remix).

Hydrogen is Shopify’s stack for headless commerce. Hydrogen is designed to dovetail with Remix, Shopify’s full stack web framework.
The reference implementations is based on the [Hydrogen Demo Store template](https://github.com/Shopify/hydrogen-demo-store).

For further information, please refer to the following documentation:
- [Hydrogen](https://shopify.dev/custom-storefronts/hydrogen)
- [Remix](https://remix.run/docs/en/v1)

## Table of Contents
- [What's included](#whats-included)
- [Prerequisites](#prerequisites)
- [Environment variables](#environment-variables)
- [Install dependencies](#install-dependencies)
- [Configuring Content Security Policies](#configuring-content-security-policies)
- [Using Caddy for Local HTTPS Development](#using-caddy-for-local-https-development)
  - [Install on macOS using Homebrew](#install-on-macos-using-homebrew)
  - [Install on Linux \(Debian\/Ubuntu\)](#install-on-linux-debianubuntu)
  - [Install on Windows using Chocolatey](#install-on-windows-using-chocolatey)
  - [Configure Caddyfile](#configure-caddyfile)
  - [SSL Certificate Setup](#ssl-certificate-setup)
- [Starting the Development Server](#starting-the-development-server)
- [Port Configuration](#port-configuration)
- [Building for production](#building-for-production)
- [Setup for using Customer Account API \(`/account` section\)](#setup-for-using-customer-account-api-account-section)
  - [Setup domain using Caddy](#setup-domain-using-caddy)
  - [Include public domain in Customer Account API settings](#include-public-domain-in-customer-account-api-settings)
- [Troubleshooting](#troubleshooting)
  - [SSL certificate errors](#ssl-certificate-errors)
  - [Environment variables not applied](#environment-variables-not-applied)
  - [Customer Account API redirect errors](#customer-account-api-redirect-errors)
  - [Content Security Policy issues](#content-security-policy-issues)
  - [Wrong base URL](#wrong-base-url)
- [Legal Notices](#legal-notices)
- [Disclaimer](#disclaimer)

## What's included

- Remix
- Hydrogen
- Oxygen
- Shopify CLI
- ESLint
- Prettier
- GraphQL generator
- TypeScript and JavaScript flavors
- Tailwind CSS (via PostCSS)
- Full-featured setup of components and routes
- FirstSpirit Connect for Commerce Frontend API integration and section components
- Caddy for local HTTPS development

## Prerequisites

- Shopify store with Storefront API access
- Published Hydrogen or Headless channel/app in Shopify Admin
- Familiarity with the FirstSpirit Connect for Commerce Frontend API.
  Information can be found in the [documentation](https://docs.e-spirit.com/ecom/fsconnect-com-api/fsconnect-com-frontend-api/latest/).
- Node.js version 20.0.0 or higher and npm
- Caddy for local HTTPS development (see below)

## Environment variables

Rename `.env.template` to `.env` and fill in the fields described below:

| Property                              | Description                                                                                                                              |
|---------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------|
| SESSION_SECRET                        | Secret used for session encryption.                                                                                                      |
| PUBLIC_STOREFRONT_API_TOKEN           | Public API token for accessing the Shopify Storefront API.                                                                               |
| PUBLIC_STORE_DOMAIN                   | Your Shopify store domain (e.g. `your-shop.myshopify.com`).                                                                              |
| PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID | Client ID for the Shopify Customer Account API.                                                                                          |
| PUBLIC_CHECKOUT_DOMAIN                | Domain used for checkout (e.g. `checkout.hydrogen.shop`).                                                                                |
| SHOP_ID                               | The unique ID of your Shopify shop.                                                                                                      |
| VITE_ECOM_API_URL                     | The url to your Frontend API backend service.                                                                                            |
| VITE_ECOM_API_LOCALE                  | The default locale to use. Default is set to `en_GB`.                                                                                    |
| VITE_HYDROGEN_BASE_URL                | The absolute base URL for the Hydrogen app.                                                                                              |
| VITE_LOG_LEVEL                        | Numeric representation of log levels:<ul><li>DEBUG = 0</li><li>INFO = 1</li><li>WARNING = 2</li><li>ERROR = 3</li><li>NONE = 4</li></ul> |

## Install dependencies

```bash
npm install
```

### Configuring Content Security Policies
The CSP configuration is located in `app/entry.server.tsx` and needs to be customized to allow resources from your FirstSpirit origin and any other domains you need to access.
Replace all placeholder domains in the configuration with your actual domains.

### Using Caddy for Local HTTPS Development

This project uses [Caddy](https://caddyserver.com/) as a reverse proxy to enable HTTPS during local development.

#### Install on macOS using Homebrew
```bash
brew install caddy
```

#### Install on Linux (Debian/Ubuntu)
```bash
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install caddy
```

#### Install on Windows using Chocolatey
```powershell
choco install caddy
```

### Configure Caddyfile

Specify the paths to the SSL certificates in the provided `Caddyfile`.
If you changed the default port, make sure to update it here accordingly.

Add the following entry to `/etc/hosts` with sudo privileges:

```bash
   127.0.0.1 your-domain.com
```

### SSL Certificate Setup

Before starting Caddy, ensure SSL certificates exist at the specified paths in the `Caddyfile`.

## Starting the Development Server

1. **Start your [Hydrogen](https://hydrogen.shopify.dev/) storefront**:
   ```bash
   # Starts the Hydrogen storefront on port 3020.

   npm run dev
   ```

2. **Start [Caddy](https://caddyserver.com/) in a separate terminal**:
   ```bash
   # Starts the HTTPS proxy on port 4200.

   npm run caddy
   ```

3. **Access your application**:
- `https://your-domain.com:4200` (HTTPS)
- `http://localhost:3020` (HTTP)

## Port Configuration

- The port for the Vite dev server is configured in `vite.config.ts`. It defaults to port `3020`.
- The Caddy HTTPS proxy is configured in the `Caddyfile`. It defaults to port `4200`.

## Building for production

```bash
npm run build
```

## Setup for using Customer Account API (`/account` section)

### Setup domain using Caddy

1. Set up Caddy as described above.
2. Ensure your Caddy server is running with the HTTPS proxy on port `4200`.

### Include public domain in Customer Account API settings

1. Go to your Shopify admin => `Hydrogen` or `Headless` app/channel => Customer Account API => Application setup.
2. Edit `Callback URI(s)` to include `https://your-domain.com:4200/account/authorize`
3. Edit `Javascript origin(s)` to include your public domain `https://your-domain.com:4200` or keep it blank.
4. Edit `Logout URI` to include your public domain `https://your-domain.com:4200` or keep it blank.

## Troubleshooting

### SSL certificate errors:
Verify that the defined cert/key paths in the `Caddyfile` and also the `/etc/hosts` entry exists.

### Environment variables not applied:
Ensure that the `.env.template` was renamed to `.env` and that the variable names match.

### Customer Account API redirect errors:
URIs in the Shopify settings must match `VITE_HYDROGEN_BASE_URL` and the paths above.

### Content Security Policy issues:
Make sure to include `https://your-domain.com:4200` in `script-src`, `connect-src`, and `frame-ancestors` in `./app/entry.server.tsx`.

### Wrong base URL:
When using the HTTPS proxy, set `VITE_HYDROGEN_BASE_URL` to `https://your-domain.com:4200` to avoid redirect and cookie issues.

## Legal Notices

The Connect for Commerce Frontend API module is a product of [Crownpeak Technology GmbH](https://www.crownpeak.com/), Dortmund, Germany. The Connect for Commerce Frontend API module is subject to the Apache-2.0 license.

Details regarding any third-party software products in use but not created by Crownpeak Technology GmbH, as well as the third-party licenses and, if applicable, update information can be found [here](THIRD-PARTY.txt).

## Disclaimer

This document is provided for information purposes only. Crownpeak may change the contents hereof without notice. This document is not warranted to be error-free, nor subject to any other warranties or conditions, whether expressed orally or implied in law, including implied warranties and conditions of merchantability or fitness for a particular purpose. Crownpeak specifically disclaims any liability with respect to this document and no contractual obligations are formed either directly or indirectly by this document. The technologies, functionality, services, and processes described herein are subject to change without notice.
