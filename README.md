# T4-SDK
The software development repository for Terminal Four in the CSO

## Structure of Project

**high_chart_fix**
: Solution to printing highcharts without truncating the side.
This fix replaces the interactive chart with an svg when printing by ctrl+p or when called explicitly by adding ?export2pdf to the end of the url

**html2image**
: add a wrapper around a block of code (e.g. infobyte or mini visualisation) to add a download symbol which offers a download of jpg, png or svg

**html2pdf**
: add a wrapper around a block of code to add a download symbol which offers a pdf download
After the chart has been fixed, 'export2pdf_completed' has been applied. This can be used from backend side to detect when process has been finished.

**t4_media**
: this library contains the T4 assets of the website
| directory | assets |
| --------- | ------ |
| css | media library extracted js |
| - core | universal |
| - module | feature-specific |
| --------- | ------ |
| from_db |  |
| - blank |  |
| - html |  |
| - html_old_ver |  |
| - js | multi-use scripts extracted from page layouts |
| - non-automated |  |
| --------- | ------ |
| html |  |
| - content_type | extracted and synced content types |
| - layout | extracted and synced page layouts |
| -- landing pages | 1:1 layouts used for a single page |
| -- templates | layouts used for multiple pages |
| -- themes | themed areas of the site e.g. surveys and careers |
| - ManuallyAdded | Added after the initial extraction |
| -- Extracted | Refactoring assets |
| -- megaNav | Meganav POC assets |
| --------- | ------ |
| includes | reusable code included via navigation objects |
| - manually_edited | new includes for Refactor |
| --------- | ------ |
| js | media library extracted js files |

**t4-sdk-bootstrap**
: bootstrap assets

**includes.html**
: definition needed

**poc.html**
: definition needed