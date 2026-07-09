# Vivtrack 4 Builder

Standalone static product builder app for the Vivalux range.

## Open locally

Open `index.html` in a browser.

## Included

- Backlit builder (`index.html`)
- Edgelit builder (`edgelit.html`)
- Palisade builder (`palisade.html`)
- Cube builder (`cube.html`)
- R300 builder (`r300/`)
- Shared Vivad branding and product imagery

## Login, access request and cart-click emails

Login validation, login notifications, access request emails and add-to-cart click emails require a deployed Google Apps Script Web App. To send from `vivad1958@gmail.com`, sign in to Apps Script as `vivad1958@gmail.com`, copy `login-notification-apps-script.gs` into Apps Script, deploy it as a Web App with "Execute as me" and access set to "Anyone", then paste the `/exec` Web App URL into `LOGIN_NOTIFICATION_URL` in `auth.js`.

After changing `login-notification-apps-script.gs`, redeploy the Apps Script as a new version so the live `/exec` URL can handle login notifications, `Builder Access Request` emails to `sales@vivad.com.au`, and add-to-cart click emails to `jtlog@vivad.com.au`.

The user/password Google Sheet is now read only by Apps Script. After redeploying, set the Sheet sharing back to restricted/private and make sure the Google account that owns/runs the Apps Script has access to the Sheet.

Unrelated apps, generated verification files, and source spreadsheet inspection scripts are intentionally left out of this split project.
