# World of Tank statistics
 
## Overview
 
### What is this website for?
 
This is a website for players of the World of Tanks Game which want to see statistics on their performance:
1.  Overall statistics
2.  Winrate statistics based on the level of their tank (1 to 10)
3.  Winrate statistics based on the type of tank (Medium, Heavy, Light, Tank Destroyer, SPG(artillery))
4.  Winrate statistics based on the nation their tanks belong to
5.  Main feature are the interactive Graphs that allow you to make selections which are directly applied to the DataTable and other charts

 
### What does it do?
 
This site makes use of the official worls of tanks API (https://developers.wargaming.net/reference/all/wot/account/list/?application_id=5d6d1657c5bc736658f1e6aa3dcb5f6e&r_realm=eu)
Based on the nickname statistics are requested from the API.
Main goal is to give players extra performance information about which level, tank type and nation (with what do they excel, or where they should improve...)

Main focus are to have a excellent view on Desktop sized screens, bacause scaling of graphs and DataTables are not wel represented on small portrait devices.

Nicknames that can be used to see it work are:
1.  Loef78
2.  Xen_tro
3.  Hardhead_2014
4.  ROLO_NL
5.  Quillerin
 
### How does it work
 
The site makes use of the World of Tanks API
Based on the nickname (if valid) it gives back an Account_ID which is needed for further searches.
1.  General Account statistics
2.  Statistics for all the tanks that they played with
3.  All tanks and specifications belonging with those tanks

If the Nickname is not valid, it should give an alertbox and stops the code
If the nickname is valid, present the data from the API in DC graphs/Table

The site is styled with **Bootstrap**. 
This site uses **DC Graphs** for the dimensional charts
For showing and hiding sections, button interactions, **JQuery** is used
For structuring data **Javascript** is used

The site can be viewed [HERE](<insert guithub pages>)

## Features
 
### Existing Features
- Searchbox for nickname
- Interactive graphs for custom selections and battle statistics (winrate)
- Information about which tans they have played with

### Features Left to Implement
- I'm planning to make this a real website that should compete with existing websites. In order to achive that, i should build in battle performance rating.
- In order to achive that, i have to calculate the WN8 score (http://wiki.wnefficiency.net/pages/WN8), use the foundations JSON File (http://www.wnefficiency.net/wnexpected/)
- Extend my API call with battle performance statistics per tank

## Tech Used

### The tech used includes:
- **HTML** and **CSS**
  - Base languages used to create website
- [Bootstrap](http://getbootstrap.com/)
    - We use **Bootstrap** to give our project a simple, responsive layout
- [JQuery](https://jquery.com)
    - Use **JQuery** for boostrap and button interactions
- [DC Graphs](https://dc-js.github.io/dc.js//)
- **Javascript**
    - Used to structure and combine data from the API calls
- **Hoover effects** (https://ianlunn.github.io/Hover/)

## Testing
- All code used on the site has been tested to ensure everything is working as expected
- Used not existing NickNames in order to give an Alert and stops showing empty Graphs
- Site viewed and tested in the following browsers:
  - Google Chrome
  - Opera
  - Safari

## Contributing

 -  World of Tanks Developers Forum
 -  DC Graphs
 -  Stackoverflow
 -  W3schools
 
### Getting the code up and running
1. You will need to clone this repository by running the ```git clone(https://github.com/MartinLoef/Project-IFD)``` command


## Credits

### Media
- The background used on this site cam from Alpha Coders (https://wall.alphacoders.com/by_sub_category.php?id=177783&name=World+Of+Tanks+Wallpapers)


### Information
- [World of Tanks API](https://developers.wargaming.net/reference/all/wot/account/list/?application_id=5d6d1657c5bc736658f1e6aa3dcb5f6e&r_realm=eu)
- [World of Tanks Developers forum](http://forum.worldoftanks.eu/index.php?/forum/1781-wargaming-developer-partner-program/)
- [Bootstrap](http://getbootstrap.com/)
- [JQuery](https://jquery.com)
- [DC Graphs](https://dc-js.github.io/dc.js//)
- **Javascript**
- **Hoover effects** (https://ianlunn.github.io/Hover/)