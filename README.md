# Aeon Trespass: Odyssey Power Roll Calculator

## Overview

App is used to calculate chance of certain combat outcomes in the board game Aeon Trespass: Odyssey using their custom D6 "Power Die".

The user inputs their target Aeon Trespass threshold and number of Break and other Tokens and Power Rerolls able to be used, then can add Power Dice of any mix of Red, Black, and White types, up to a total of eight dice. The app then calculates the percentage chance that rolling the chosen dice will meet or exceed the target AT threshold. The average AT value is also displayed.

The user can also select individual faces for each die, representing the result of the initial roll of the dice, and the app will calculate which dice to reroll in order to provide the best chance of success (including using fewer than the maximum number of rerolls) and highlight those dice.

---

## Version History

### 1.6.1

* Redid method of display for dice:
  * Instead of large colored die with traditional dropdown below, now displays a smaller colored die and face selectors to the side
  * The six faces are all visible with relevant symbol amounts, and will light up with a highlight when selected
  * Old method of display may return as an option in the future
* Added meta tags that should help with correct display of light/dark mode schemes on some browsers

### 1.5.3

* Implemented full functionality for Black Tokens - works with all types of Power Die, and in combination with regular Power Rerolls

### 1.5.2

* Implemented partial funcitonality for Black Tokens, only works if all reroll sources are one type (regular/Black), or enough Blacks to cover all needed rerolls
* Black Token targets are indicated by a purple highlight instead of the pale blue for standard

### 1.5.1

* Implemented full functionality for Hope tokens

### 1.4.1

* Added support for later-Cycle token types - Fire, Hope, and Black
  *  Note that full functionality for Hope and Black Tokens is not yet implemented, currently they are just treated as Break and Power Rerolls respectively instead
* Added toggle to select current Cycle to control which tokens are shown
* Reorganized visual elements to group inputs closer together
* Reworked some visuals to support relevant information in later Cycles

### 1.3.2

* Switched method of calculating overall chance with rerolls to be much more efficient, especially when using only or mostly one color of dice

### 1.3.1

* Added display for chance of success with given die pool including use of rerolls
* Added display for chance of success when using the highlighted rerolls

### 1.2.2

* Finished implementation of White Power Dice in reroll calculations
* Fixed some behind-the-scenes React issues
* Major updates to Readme including Overview and Version History sections

### 1.2.1

* Styling changes, including improvements to light/dark mode responsiveness
* Some codebase refactoring and cleanup

### 1.2.0

* Added re-roll functionality
* Dice now auto-sort by color
* Various visual adjustments

### 1.1.0

* Initial release version

---

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).