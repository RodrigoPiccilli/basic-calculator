// FSM States
const ERROR = "Error";
const WAITING_FIRST_OPERAND = "Waiting For First Operand";
const WAITING_OPERATOR = "Waiting For Operator";
const WAITING_SECOND_OPERAND = "Waiting For Second Operand";
const COMPUTATION_READY = "Computation Ready";

// Current State of FSM
let currentState = WAITING_FIRST_OPERAND;

// Calculation Variables
let firstOperand;
let operator;
let secondOperand;

// Calculator Buttons
const buttons = document.querySelectorAll("#calculator-commands li button");
buttons.forEach(button => {
    button.addEventListener("click", calculatorTransition );
});



// Clear Button
const clearButton = document.querySelector("#clear");

// Calculator Display
const display = document.querySelector("#calculator-input input");
display.addEventListener("keydown", calculatorTransition);
display.scrollLeft = display.scrollWidth;

document.addEventListener("keydown", () => {
    display.focus();
});

display.addEventListener("blur", () => {
    setTimeout(() => display.focus(), 0);
});

// Valid Input for Operands
const operandKeys = "0123456789";

// Valid Input for Operators
const operatorKeys = "+-*/"

// History Display
const historyDisplay = document.querySelector("#history-display"); 
historyDisplay.addEventListener("click", (event) => {

    let fromHistory = event.target.textContent;

    if(currentState === WAITING_FIRST_OPERAND) {

        currentState = WAITING_OPERATOR;

        display.value = fromHistory;

        firstOperand = fromHistory;

    }

    if(currentState === WAITING_SECOND_OPERAND) {

        currentState = COMPUTATION_READY;

        display.value += fromHistory;

        secondOperand = fromHistory;

    }


});
let striped = false; // Flag used to determine background color of next history input on display.
let previousResult = false; // Keeps track of the previous history div, so we can place new results above it.

// Clear History Button
const clearHistory = document.querySelector("#clear-history");
clearHistory.addEventListener("click", () => {

    historyDisplay.innerHTML = '';
    previousResult = false;

});

// Show History Checkbox
const showHistory = document.querySelector("#show-history");
showHistory.addEventListener("change", event => {

    if(event.target.checked) {

        historyContainer.classList.remove("collapse");
        historyOn = true;

    } else {

        historyContainer.classList.add("collapse");
        historyOn = false;

    }

});

// Entire History Container
const historyContainer = document.querySelector("#history");
let historyOn = true; // Flag indicating if history display is turned on or off.

// Radio buttons for selecting the theme.
const themes = document.querySelectorAll("#themes input");

// HTML Components that will require styling changes for each theme.
const calculatorContainer = document.querySelector("#calculator");
const calculatorButtons = document.querySelector("#calculator-commands");
const settingsMenu = document.querySelector("#settings-menu");
const themesMenu = document.querySelector("#themes");
const pageBody = document.querySelector("body");

// Transitions our FSM.
function calculatorTransition(event) {

    if(event.type === "click") {

        const button = event.target;

        if(currentState != ERROR) {

            if(button.id === "random") {

                display.value = Math.random().toFixed(5);

                firstOperand = display.value;

                currentState = WAITING_OPERATOR;

            }

            if(button.id === "reverse") {

                if(currentState === WAITING_OPERATOR) {

                    display.value *= -1;

                    firstOperand = display.value;


                } else if (currentState === COMPUTATION_READY) {

                    let operatorDisplay;

                    if(operator === "add" || operator === "+") {
                        operatorDisplay = "+";
                    } 

                    if(operator === "multiply" || operator === "*") {
                        operatorDisplay = "\u00D7";
                    }

                    if(operator === "divide" || operator === "/") {
                        operatorDisplay = "\u00F7";
                    }

                    if(operator === "subtract"|| operator === "-") {

                        operatorDisplay = "-";

                        display.value = display.value.substring(0, display.value.lastIndexOf(operatorDisplay));

                        display.value += "+";

                        display.value += secondOperand;

                        secondOperand *= -1;

                    } else {

                        display.value = display.value.substring(0, display.value.lastIndexOf(operatorDisplay) + 1);

                        secondOperand *= -1;

                        display.value += secondOperand;

                    }

                }

            }

            if(button.id === "percent") {

                if(currentState === WAITING_OPERATOR) {

                    display.value /= 100;

                    firstOperand = display.value;

                } else if (currentState === COMPUTATION_READY) {

                    let operatorDisplay;

                    if(operator === "add" || operator === "+") {
                        operatorDisplay = "+";
                    } 

                    if(operator === "subtract"|| operator === "-") {
                        operatorDisplay = "-";
                    }

                    if(operator === "multiply" || operator === "*") {
                        operatorDisplay = "\u00D7";
                    }

                    if(operator === "divide" || operator === "/") {
                        operatorDisplay = "\u00F7";
                    }


                    display.value = display.value.substring(0, display.value.indexOf(operatorDisplay) + 1);

                    secondOperand /= 100;

                    display.value += secondOperand;

                }

            }

        }

        if(currentState === WAITING_FIRST_OPERAND && button.className === "operand") {

            toWaitingOperator(event);

        } else if(currentState === WAITING_OPERATOR && (button.className === "operand" || button.id === "period")) {
        
            if(!(firstOperand.includes(".") && button.id === "period")) {
                
                display.value += button.textContent;

                firstOperand = display.value;

            }
        
        } else if(currentState === WAITING_OPERATOR && button.className === "operator") {

            toSecondOperand(event);

        } else if(currentState === WAITING_SECOND_OPERAND && button.className === "operator") {

            display.value = display.value.substring(0, display.value.length - 1); 
            
            display.value += button.textContent;

            operator = button.id;

    
        } else if(currentState === WAITING_SECOND_OPERAND && button.className === "operand") {

            toComputationReady(event);

        } else if(currentState === COMPUTATION_READY && (button.className === "operand" || button.id === "period")) {

            if(!(secondOperand.includes(".") && button.id === "period")) {

                display.value += button.textContent;

                secondOperand += button.textContent;
            }

        } else if(currentState === COMPUTATION_READY && (button.className === "operator" || button.id === "solve")) {

            let result = compute(firstOperand, secondOperand, operator);

            if(!isFinite(result)) {

                toError();
        
            } else {

                toNextComputation(result, event);

                addToHistory(result);

            }

        
        

        } else if(currentState === ERROR && button.id === "clear") {

            toFirstOperand();

        } else if(button.id === "clear") {

            if(button.textContent === "AC") {

                toFirstOperand();

            } else {

                if(currentState === WAITING_OPERATOR) {

                    display.value = display.value.substring(0, display.value.length - 1);

                    firstOperand = display.value;

                    if(display.value === "") {

                        toFirstOperand();
                        
                    }

                } else if(currentState === WAITING_SECOND_OPERAND) {

                    display.value = display.value.substring(0, display.value.length - 1);

                    if(operandKeys.includes(display.value.charAt(display.value.length - 1))) {

                        currentState = WAITING_OPERATOR;

                    }

                } else if(currentState === COMPUTATION_READY) {

                    display.value = display.value.substring(0, display.value.length - 1);

                    secondOperand = secondOperand.substring(0, secondOperand.length - 1);

                    if(!operandKeys.includes(display.value.charAt(display.value.length - 1))) {

                        currentState = WAITING_SECOND_OPERAND;

                    }

                }

            }

        }


    } else if(event.type === "keydown") {

        validateInput(event);
        animateButton(event.key);

        if(currentState === WAITING_FIRST_OPERAND && operandKeys.includes(event.key)) {

            toWaitingOperator(event);

            
        } else if(currentState === WAITING_OPERATOR && (operandKeys.includes(event.key) || event.key === ".")) {

            if(!(firstOperand.includes(".") && event.key === ".")) {
            
                firstOperand += event.key;
    
            } else {

                event.preventDefault();
            }
                    
        } else if(currentState === WAITING_OPERATOR && operatorKeys.includes(event.key)) {

            toSecondOperand(event);

        } else if(currentState === WAITING_SECOND_OPERAND && operatorKeys.includes(event.key)) {

            event.preventDefault();

            display.value = display.value.substring(0, display.value.length - 1); 

            if(event.key === "*" || event.key === "/") {

                display.value = display.value.substring(0, display.value.length - 1); 

                display.value += (event.key === "*") ? "\u00D7" : "\u00F7";

            } else {

                display.value += event.key;

            }

            operator = event.key;

        } else if(currentState === WAITING_SECOND_OPERAND && operandKeys.includes(event.key)) {

            toComputationReady(event);

        } else if(currentState === COMPUTATION_READY && (operandKeys.includes(event.key) || event.key === ".")) {

            if(!(secondOperand.includes(".") && event.key === ".")) {
                
                secondOperand += event.key;
        
            } else {
                    
                event.preventDefault();

            }

        } else if(currentState === COMPUTATION_READY && (operatorKeys.includes(event.key) || event.key === "Enter")) {

            let result = compute(firstOperand, secondOperand, operator);

            if(!isFinite(result)) {

                toError();
        
            } else {

                toNextComputation(result, event);

                addToHistory(result);

            }
           

       


        }

    } else if(currentState === ERROR) {

        event.preventDefault();
    
    }

}

// Computes operation results.
function compute(firstOperand, secondOperand, operator) {

    let result = 0;

    if(operator === "add" || operator === "+") {
        result = parseFloat(firstOperand) + parseFloat(secondOperand);
    }

    if(operator === "subtract" || operator === "-") {
        result = parseFloat(firstOperand) - parseFloat(secondOperand);
    }

    if(operator === "multiply"  || operator === "*") {
        result = parseFloat(firstOperand) * parseFloat(secondOperand);
    }

    if(operator === "divide" || operator === "/") {

        result = (firstOperand % secondOperand === 0) ? parseInt(firstOperand) / parseInt(secondOperand) : (parseFloat(firstOperand) / parseFloat(secondOperand));
    
    }

    return result;

}

// Animates operand buttons when pressed on keyboard.
function animateButton(keyPressed) {

    let buttons = document.querySelectorAll(".operand, .operator, #clear");

    buttons.forEach((button) => {

        if(keyPressed === button.textContent) {

            button.classList.add("button-input");

            setTimeout(() => {
                button.classList.remove("button-input");
            }, 150);

            return;

        }
    });  
}

// Validates keyboard input.
function validateInput(keyPress) {

    const validInput = /^[0-9]+$/;

    if(!validInput.test(keyPress.key) && !operatorKeys.includes(keyPress.key) && keyPress.key != "Backspace" && keyPress.key != ".") {
        
        keyPress.preventDefault();

    } 

    if(keyPress.key === "*" || keyPress.key === "/") {

        keyPress.preventDefault();

        display.value += (keyPress.key === "*" ? "\u00D7" : "\u00F7");
    }

    if(keyPress.key === "Backspace") {

        keyPress.preventDefault();

        if(currentState === WAITING_OPERATOR) {

            display.value = display.value.substring(0, display.value.length - 1);

            firstOperand = display.value;

            if(display.value === "") {
                currentState = WAITING_FIRST_OPERAND;
                clearButton.textContent = "AC";
            }

        } else if(currentState === WAITING_SECOND_OPERAND) {

            display.value = display.value.substring(0, display.value.length - 1);

            if(operandKeys.includes(display.value.charAt(display.value.length - 1))) {

                currentState = WAITING_OPERATOR;

            }

        } else if(currentState === COMPUTATION_READY) {

            display.value = display.value.substring(0, display.value.length - 1);

            if(!operandKeys.includes(display.value.charAt(display.value.length - 1))) {

                currentState = WAITING_SECOND_OPERAND;

            }

            secondOperand = parseInt(secondOperand / 10) + "";

        }

    }

}

function toFirstOperand() {

    display.value = "";
    currentState = WAITING_FIRST_OPERAND;
    firstOperand = 0;
    secondOperand = 0;
    operator = 0;
    clearButton.textContent = "AC";

}

function toWaitingOperator(event) {

    clearButton.textContent = "\u232B";

    if(event.type === "click") {

        display.value += event.target.textContent;

        firstOperand = display.value;

    } else {

        firstOperand = event.key;

    }

    currentState = WAITING_OPERATOR;

}

function toSecondOperand(event) {

    clearButton.textContent = "\u232B";

    if(event.type === "click") {

        display.value += event.target.textContent;

        operator = event.target.id;
        
    } else {

        operator = event.key;

    }

    currentState = WAITING_SECOND_OPERAND;

}

function toComputationReady(event) {

    if(event.type === "click") {

        secondOperand = event.target.textContent;

        display.value += event.target.textContent;

    } else {

        secondOperand = event.key;

    }

    currentState = COMPUTATION_READY;



}

function toError() {

    currentState = ERROR;

    display.value = "Error"

    clearButton.textContent = "AC";

}

function toNextComputation(result, event) {

    if(event.type === "click" && event.target.id != "solve") {

        firstOperand = result;

        toSecondOperand(event);

        display.value = result + event.target.textContent;
    
    } else if(event.type === "keydown" && event.key != "Enter") {

        firstOperand = result;

        if(event.key === "*" || event.key === "/") {

            event.preventDefault();
            display.value = result + (event.key === "*" ? "\u00D7" : "\u00F7");

        } else {

            display.value = result;

        }   

        toSecondOperand(event);

    } else {
        
            currentState = WAITING_OPERATOR;

            firstOperand = result;

            display.value = result;

            clearButton.textContent = "AC";
    }
}

function addToHistory(result) {

    const historyItem = document.createElement("div");

    historyItem.textContent = result;

    if(striped) {

        historyItem.classList.add("stripe");
        striped = false;

    } else {

        striped = true;

    }

    if(!previousResult) {

        historyDisplay.append(historyItem);

    } else {

        historyDisplay.insertBefore(historyItem, previousResult);

    }

    previousResult = historyItem;
}

// Listens for changes in theme.
themes.forEach(theme => { 

    theme.addEventListener("change", event => {


        if(event.target.checked) {

           switch (event.target.value) {
                case "WOLFPACK":

                    calculatorContainer.classList = "wolfpack";
                    calculatorButtons.classList ="wolfpack";
                    historyContainer.classList = historyOn ? "wolfpack" : "wolfpack collapse";
                    historyDisplay.classList = "wolfpack";
                    clearHistory.classList = "wolfpack";
                    settingsMenu.classList = "wolfpack";
                    themesMenu.classList = "wolfpack";
                    showHistory.classList = "wolfpack";
                    pageBody.classList = "wolfpack";
                    
                    break;
            
                case "OCEAN":

                    calculatorContainer.classList = "ocean";
                    calculatorButtons.classList ="ocean";
                    historyContainer.classList = historyOn ? "ocean" : "ocean collapse";
                    historyDisplay.classList = "ocean";
                    clearHistory.classList = "ocean";
                    settingsMenu.classList = "ocean";
                    themesMenu.classList = "ocean";
                    showHistory.classList = "ocean";
                    pageBody.classList = "ocean";


                    
                    break;
            
                case "NATURE":

                    calculatorContainer.classList = "nature";
                    calculatorButtons.classList ="nature";
                    historyContainer.classList = historyOn ? "nature" : "nature collapse";
                    historyDisplay.classList = "nature";
                    clearHistory.classList = "nature";
                    settingsMenu.classList = "nature";
                    themesMenu.classList = "nature";
                    showHistory.classList = "nature";
                    pageBody.classList = "nature";

                    
                    break;
            
                case "VALENTINE":

                    calculatorContainer.classList = "valentine";
                    calculatorButtons.classList ="valentine";
                    historyContainer.classList = historyOn ? "valentine" : "valentine collapse";
                    historyDisplay.classList = "valentine";
                    clearHistory.classList = "valentine";
                    settingsMenu.classList = "valentine";
                    themesMenu.classList = "valentine";
                    showHistory.classList = "valentine";
                    pageBody.classList = "valentine";

                    
                    break;
            
                case "CHRISTMAS":

                    calculatorContainer.classList = "christmas";
                    calculatorButtons.classList ="christmas";
                    historyContainer.classList = historyOn ? "christmas" : "christmas collapse";
                    historyDisplay.classList = "christmas";
                    clearHistory.classList = "christmas";
                    settingsMenu.classList = "christmas";
                    themesMenu.classList = "christmas";
                    showHistory.classList = "christmas";
                    pageBody.classList = "christmas";

                    
                    break;
            
                default:
                    break;

            }

        }


    })




});










