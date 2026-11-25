# Preston & Rachel's Wedding Website

A responsive, single-page wedding website built with plain HTML, CSS, and JavaScript. No build step is required.

## Preview

Open `index.html` in a browser or run a static file server:

```sh
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## RSVP setup

The guest RSVP form posts to the public Apps Script web app. Responses are stored in the `RSVPs` sheet with columns for timestamp, name, attendance, guest count, and message.

The private manager is a separate standalone Apps Script project so it cannot make the public guest endpoint expose RSVP records:

1. In the spreadsheet's bound Apps Script project, update `Code.gs` with `RSVP_APPS_SCRIPT.js`. In **Deploy → Manage deployments**, edit the existing guest deployment, select **New version**, and deploy without changing its URL or public access.
2. Create a new standalone project at [script.google.com](https://script.google.com). Copy `RSVP_ADMIN_APPS_SCRIPT.js` into `Code.gs` and replace `PASTE_YOUR_GOOGLE_SHEET_ID_HERE` with the ID from the spreadsheet URL (the text between `/d/` and `/edit`).
3. Add an HTML file named `RSVP_Admin` and copy in `RSVP_Admin.html`.
4. Deploy the standalone project as a web app that executes as yourself and is accessible to **Only myself**. Keep this private URL for your own RSVP entry and tracking.

The guest form and private manager read and write the same spreadsheet. Never make the admin deployment public.

The map and Google Fonts require an internet connection.
