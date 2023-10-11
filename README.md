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
: local bootstrap assets create db using this method:
How to do prefix:
Notepad++
find:(\.)([a-zA-Z]+[-][a-zA-Z]+[-]?[a-zA-Z]*)
replace:$1t4-sdk-$2
It adds t4-sdk- prefix to .css  class.
There is no local bootstrap.js , t4-sdk-megaNav.js is used to create meganav functionality

**includes.html**
:  Working file helps to create includes related with this project using VS Code formatting

**megaNav**
: Changes related with content of megaNav, should be pasted here:
https://test-t4.cso.ie/terminalfour/page/content#edit/47688/360608

**FullEditorUpgrade**
:Custom TinyMCE plugin
https://test-t4.cso.ie/terminalfour/page/htmleditorconfig#htmleditors

**https://dev-incubator.cso.ie/t4sdk/t4helper/client/t4_helper.html**

ReadMe file : Z:\t4sdk\t4helper\readme\readme.txt
ReadMe file : Z:\t4sdk\t4helper\readme\readme.txt


**source code for C# for T4Helper**
Z:\t4sdk\T4_MetaData