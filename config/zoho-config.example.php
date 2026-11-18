<?php
/*
 * Zoho CRM for website enquiries — the config (read by public/api/zoho.php).
 *
 * Copy this file to the folder ABOVE public_html, as nexera-private/zoho-config.php, e.g. on Hostinger
 *   /home/<user>/domains/nexerapower.com/nexera-private/zoho-config.php
 * (never into public_html: it is not part of the built site, and the deploy never uploads it).
 * Environment variables ZOHO_ENABLED, ZOHO_TEST, ZOHO_ACTION_URL and ZOHO_CRON_SECRET, if set, win.
 *
 * The values come from the Zoho webform's source code ("Nexera Website Enquiry Form"): the form's
 * action URL and its hidden fields. They are not secret, but they stay out of the site and the JavaScript.
 */
return [
    // false: nothing goes to Zoho and the forms behave exactly as before. Switch on only after the test.
    "enabled" => false,

    // true: every Lead's Description starts "TEST – " (for the first trial; Lead Source stays "Website",
    // because the webform's Lead Source picklist has no TEST value).
    "test" => true,

    // The webform's action URL (the fetch() URL in its source code).
    "action_url" => "https://crm.zoho.in/crm/WebToLeadForm",

    // The webform's hidden fields, as in its source code.
    "hidden" => [
        "xnQsjsdp" => "PASTE_FROM_THE_WEBFORM_SOURCE",
        "zc_gad" => "",
        "xmIwtLD" => "PASTE_FROM_THE_WEBFORM_SOURCE",
        "actionType" => "TGVhZHM=",
        "returnURL" => "null",
    ],

    // The webform's own honeypot field name (always sent empty).
    "honeypot" => "aG9uZXlwb3Q",

    // A value from the webform's Lead Source picklist.
    "lead_source" => "Website",

    // At least 24 random characters: the key for the retry cron URL
    // https://nexerapower.com/api/zoho-retry.php?key=<this>. Empty: the cron URL is off.
    "cron_secret" => "",

    // Seconds to wait for Zoho (the visitor never waits: they have their answer before this starts).
    "timeout" => 10,
];
