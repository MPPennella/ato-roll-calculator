# Aeon Trespass: Odyssey Power Roll Calculator

## Overview

App is used to calculate chance of certain combat outcomes in the board game Aeon Trespass: Odyssey using their custom D6 "Power Die".

The user inputs their target Aeon Trespass threshold and number of Break Tokens able to be used, then can add Power Dice of any mix of Red, Black, and White types, up to a total of eight dice. The app then calculates the percentage chance that rolling the chosen dice will meet or exceed the target AT threshold. The average AT value is also displayed.

The user can also select individual faces for each die, representing the result of the dice. The user then inputs how many Power Die Rerolls are available, and the app will calculate which dice would provide the best chance of success (including using fewer than the maximum number of rerolls) and highlight those dice.

---

## Version History

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