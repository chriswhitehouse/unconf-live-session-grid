# Unconference live session grid

Produces an easy-to-browse session listing site based off a Google Spreadsheet. Updates live when the spreadsheet is updated. [Made by Convivio](https://blog.weareconvivio.com/a-mobile-schedule-for-unconferences-cf78d73483b5)

**Demo spreadsheet:** https://docs.google.com/spreadsheets/d/1uyeVc73aeKG8xgHvUzqR_WYbr3WPhsrk9gj746Mayac/edit?usp=drive_web&ouid=101644837907742352061

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)


## Environment settings

```
// Required: Google Developer Authentication settings 
UKGC_PRIVATE_KEY
UKGC_CLIENT_EMAIL
// Required: The URL of the spreadsheet to pull from
UKGC_SPREADSHEET_URL
// Option: The number of seconds to pull new session information from the google sheet
// This is set to 5 seconds by default, increase this if you see the app struggling to serve requests in a timely fashion
CACHE_TIMEOUT
// The url of the logo image to use in the heading
LOGO_URL
// The name of the unconference for headings and meta tags
UNCONF_NAME
// Optionally set the year to filter the sessions by, defaults to current year.
UKGC_YEAR
```

## Setting up your spreadsheet

This tool was originally designed for [UKGovcamp](https://www.ukgovcamp.com/) and currently follows the structure of [their session spreadsheet.](https://docs.google.com/spreadsheets/d/1S6nemSPxSLrURGigaQZFKViWBoAhalpE2f0RtZ92Fpk/edit#gid=11) We'd recommend cloning that spreadsheet to ensure this works as expected.

If you'd like to deviate from the columns in the spreadsheet and would like support, feel free to open an issue.

### Google authentication set up

1. Go to the [Google Developers Console](https://console.developers.google.com/project)
2. Select your project or create a new one (and then select it)
3. Enable the Drive API for your project
  - In the sidebar on the left, expand __APIs & Services__ > __APIs__
  - Search for "google drive api"
  - Click on "Google Drive API"
  - click the blue "Enable" button
4. Create a service account for your project
  - In the sidebar on the left, expand __APIs & Services__ > __Credentials__
  - Click blue "Add credentials" button
  - Select the "Service account" option
  - Populate the Service account name field
  - Click create and continue
  - Under Grant this service account access to the project, select Owner
5. Set up an API Key
  - In the sidebar on the left, expand __IAM and Admin__ > __Service accounts__
  - Click on the three dots under Actions
  - Select manage keys
  - Click ADD KEY
  - Click Create new key
  - Select the JSON radio option
  - Click blue "Create" button
  - your JSON key file is generated and downloaded to your machine (__it is the only copy!__)
  - note your service account's email address (also available in the JSON key file)
6. Share the google sheet doc (or docs) with your service account using the email noted above

### Running the app

`npm run start`
