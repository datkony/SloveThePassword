const timesForEachPlay = 600;
const compareExpressionCost = 20;
const checkPropertiesCost = 15;
const matchCodeCost = 30;
const buyNumberCost = [60, 90]; //Giá cho mỗi lần mua chữ số
const maxNumOfSubmitAnswerTurn = 3;
const numOfFreeNumbers = 4;

const letterChars = ['a', 'b', 'c', 'd'];
const mathChars = ['+', '-', '*', '(', ')'];

let timer = null; //Biến cài đặt interval để tính giờ

const cryptoJsKey = "dit-cu-may-thich-doc-trom-dap-an-khong?";
let encryptedSecretCode;
let availableNumbers = [];

let numOfSecondLeft = timesForEachPlay;
let isPlaying = false;
let searchedInformation = "";
let numOfBuyRemaining = buyNumberCost.length;
let numOfSubmitRemaining = maxNumOfSubmitAnswerTurn;

let isCompareExpressionIntroDisplay = false;
let isCheckPropertiesIntroDisplay = false;
let isMatchCodeIntroDisplay = false;

document.getElementById("start-intro").innerHTML = "Khởi điểm: " + numOfFreeNumbers + " chữ số";

document.getElementById("compare-expression").style.display = "none";
document.getElementById("check-properties").style.display = "none";
document.getElementById("match-code").style.display = "none";
document.getElementById("intro-content").style.display = "block";

document.getElementById("remaining-buy").innerHTML = "Còn " + numOfBuyRemaining + " lượt"; 
document.getElementById("remaining-submit").innerHTML = "Còn " + numOfSubmitRemaining + " lượt";
document.getElementById("timer").innerHTML = "🕑 " + numOfSecondLeft + "s";

document.getElementById("tab1").innerHTML = "So sánh<br/>- " + compareExpressionCost + "s";
document.getElementById("tab2").innerHTML = "Ghép số<br/>- " + checkPropertiesCost + "s";
document.getElementById("tab3").innerHTML = "Đối chiếu<br/>- " + matchCodeCost + "s";

document.getElementById("compare-expression-intro").style.display = "none";
document.getElementById("check-properties-intro").style.display = "none";
document.getElementById("match-code-intro").style.display = "none";

//Trạng thái chưa sẵn sàng
lockScreen();

//Làm sạch tập số hiện tại và cấp phát các chữ số miễn phí mới

function freeNumbers() {
    while (availableNumbers.length != 0) {
        availableNumbers.pop();
    }

    const digits = [...Array(10).keys()]; // [0,1,2,...,9]
  
    // Fisher-Yates Shuffle
    for (let i = digits.length - 1; i >= numOfFreeNumbers; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [digits[i], digits[j]] = [digits[j], digits[i]];
    }

    for (let i = 0; i < numOfFreeNumbers; i++) {
        availableNumbers.push(digits[i]);
    }

    executeReceivedAvailableNumbers();
}

function generateNewSecretCode() {
    let secretCode = Math.floor(Math.random() * 10000);
    encryptSecretCode(secretCode);
}

function encryptSecretCode(secretCode) {
    encryptedSecretCode = CryptoJS.AES.encrypt(secretCode.toString(), cryptoJsKey).toString();
}

function decryptSecretCode() {
    const bytes = CryptoJS.AES.decrypt(encryptedSecretCode, cryptoJsKey);
    return parseInt(bytes.toString(CryptoJS.enc.Utf8));
}

function addAvailableNumbers() {
    availableNumbers.push(Math.floor(Math.random() * 10));
}

function executeReceivedAvailableNumbers() {
    let message = availableNumbers.join(" ");
    document.getElementById("player-numbers").innerText = message;

    document.getElementById("expression1").placeholder = "ví dụ: a + b + c";
    document.getElementById("expression2").placeholder = "ví dụ: " + message.charAt(0) + " + " + message.charAt(2) + " + " + message.charAt(4);
    document.getElementById("num-to-check-properties").placeholder = "ví dụ: ab" + message.charAt(0) + message.charAt(2);
    document.getElementById("match-input").placeholder = "ví dụ: " + message.charAt(0) + message.charAt(2) + message.charAt(4) + message.charAt(6);
}

function showSlide(slideId) {
    document.querySelectorAll('.slide').forEach(slide => slide.classList.remove('active'));
    document.getElementById(slideId).classList.add('active');
    document.querySelectorAll('.nav button').forEach(button => button.classList.remove('active'));
    document.getElementById('nav-' + slideId).classList.add('active');
}


//Mua một số ngẫu nhiên

function buyRandomNumber() {
    try {
        pricePay(buyNumberCost[buyNumberCost.length - numOfBuyRemaining]);

        if (numOfBuyRemaining == 1){
            document.getElementById("buy-number-button").innerHTML = "🛒";
            document.getElementById("buy-number-button").style.display = "none";
        } else { 
            let buyNumberCostNext = buyNumberCost[buyNumberCost.length + 1 - numOfBuyRemaining];
            document.getElementById("buy-number-button").innerHTML = "🛒 (- " + buyNumberCostNext + "s)";
        }

        numOfBuyRemaining--;
        addAvailableNumbers();
        document.getElementById("remaining-buy").innerHTML = "Còn " + numOfBuyRemaining + " lượt";

        document.getElementById("player-numbers").innerText = availableNumbers.join(" ")
    } catch(err) {
        document.getElementById("throw-error4").innerHTML = err;
    }
}
        
// So sánh

function compareExpressions() {
    let isEvalError = false;

    try {   
        let latex1 = deleteSpaceInExpression(document.getElementById("expression1").value);
        let latex2 = deleteSpaceInExpression(document.getElementById("expression2").value);

        checkExpression(latex1,latex2);

        isEvalError = true;
        let result1 = eval(exchangeLetterToNumber(latex1));
        let result2 = eval(latex2);
        isEvalError = false;

        if (result1 > result2) {
            pricePay(compareExpressionCost);
            addSearchResult(standarlizationExpression(latex1) + " &gt " + standarlizationExpression(latex2));
        } else if (result1 < result2) {
            pricePay(compareExpressionCost);
            addSearchResult(standarlizationExpression(latex1) + " &lt " + standarlizationExpression(latex2));
        } else {
            pricePay(compareExpressionCost);
            addSearchResult(standarlizationExpression(latex1) + " = " + standarlizationExpression(latex2));
        }

        document.getElementById("throw-error1").innerHTML = "";
    } catch(err) {
        if (isEvalError) {
            err = "Không thể thực hiện tính toán các biểu thức vừa nhập.";
        }

        document.getElementById("throw-error1").innerHTML = "Không hợp lệ! " + err;
    }
}

function deleteSpaceInExpression(input) {
    let output = "";

    for (let i = 0; i < input.length; i++) {
        if (input.charAt(i) != ' ') {
            output += input.charAt(i);
        }
    }

    return output;
}

function checkExpression(latex1, latex2) {
    let markLetterChars = [true, true, true, true];
    let markAvailableNums = [];
    let counter = 0;

    
    for (i in availableNumbers) {
        markAvailableNums.push(true);
    }

    for (let i = 0; i < latex1.length; i++) {
        let mark = true;
        for (let j = 0; j < 4; j++) {
            if (latex1.charAt(i) == letterChars[j]) {
                if (i != 0 && letterChars.includes(latex1.charAt(i - 1))) {
                    throw "Không được ghép bất kỳ hai chữ số trở nên nào ở biểu thức 1 để tạo thành số mới.";
                }

                if (markLetterChars[j]) {
                    markLetterChars[j] = false;
                    mark = false;
                    counter++;
                    break;
                } else {
                    throw "Các chữ số ở mật mã chỉ được sử dụng duy nhất một lần ở biểu thức 1.";
                }
            }
        }

        if (mark && !mathChars.includes(latex1.charAt(i))) {
            throw "Chỉ được sử dụng các dấu +, -, *, () và các chữ số a, b, c, d ở mật mã để nhập biểu thức 1.";
        }
    }

    if (counter != 3) {
        throw "Mọi biểu thức đều phải dùng 3 chữ số.";
    }

    for (let i = 0; i < latex2.length; i++) {
        if (/^[0-9]$/.test(latex2.charAt(i))) {
            if (i != 0 && /^[0-9]$/.test(latex2.charAt(i - 1))) {
                throw "Không được ghép bất kỳ hai chữ số trở nên nào ở biểu thức 2 để tạo thành số mới.";
            }

            let markErr = true;

            for (let j = 0; j < availableNumbers.length; j++) {
                if (((latex2.charAt(i) - '0') == availableNumbers[j]) && markAvailableNums[j]) {
                    markAvailableNums[j] = false;
                    markErr = false;
                    counter--;
                    break;    
                }
            }

            if (markErr) {
                throw "Chỉ được sử dụng các chữ số từ tập số được dùng và mỗi vị trí trong tập chỉ được sử dụng một lần ở biểu thức 2.";
            }
        } else if (!mathChars.includes(latex2.charAt(i))) {
            throw "Chỉ được sử dụng các dấu +, -, *, () và các chữ số ở tập số được dùng để nhập biểu thức 2.";
        } else if (i >= latex1.length || latex2.charAt(i) != latex1.charAt(i)) {
            throw "Số lượng từng loại dấu (kể cả dấu ngoặc) và thứ tự các dấu ở hai biểu thức phải giống hệt nhau.";
        }
    }

    if (counter != 0) {
        throw "Mọi biểu thức đều phải dùng 3 chữ số.";
    }

}


function standarlizationExpression(input) {
    let standarlizatedString = "";

    for (let i = 0; i < input.length; i++) {
        if (input.charAt(i) == '*') {
            standarlizatedString += "&#215 ";
        } else {
            standarlizatedString += input.charAt(i) + " ";
        }
    }

    return standarlizatedString.substring(0,standarlizatedString.length - 1)
}

// Ghép số

function checkProperties() {
    try {
        let input = document.getElementById("num-to-check-properties").value;

        checkNumberForProperties(input);

        let numberExchanged = parseInt(exchangeLetterToNumber(input));
        let sqrt = Math.sqrt(numberExchanged);

        if (sqrt == Math.round(sqrt)) {
            pricePay(checkPropertiesCost);
            addSearchResult(input + " là một số chính phương");
        } else {
            let sumOfDivisior = 1;

            for (let i = 2; i < sqrt; i++) {
                if (numberExchanged % i == 0) {
                    sumOfDivisior += (i + numberExchanged / i); 
                }
            }

            if (sumOfDivisior == numberExchanged) {
                pricePay(checkPropertiesCost);
                addSearchResult(input + " là một số hoàn hảo");
            } else if (sumOfDivisior == 1) {
                pricePay(checkPropertiesCost);
                addSearchResult(input + " là một số nguyên tố");
            } else {
                pricePay(checkPropertiesCost);
                addSearchResult(input + " đều không phải số chính phương, hoàn hảo hay số nguyên tố");
            }
        }

        document.getElementById("throw-error2").innerHTML = "";
    } catch(err) {
        document.getElementById("throw-error2").innerHTML = "Không hợp lệ! " + err;
    }
}

function checkNumberForProperties(input) {
    if(input.length < 2 || input.length > 4) {
        throw "Số được nhập phải có từ 2 đến 4 chữ số.";
    }

    let markLetterChars = [true, true, true, true];
    let markAvailableNums = [];
    let letterCounter = 0;

    for (i in availableNumbers) {
        markAvailableNums.push(true);
    }

    for (let i = 0; i < input.length; i++) {
        let mark = true;
        for (let j = 0; j < 4; j++) {
            if (input.charAt(i) == letterChars[j]) {
                if (markLetterChars[j]) {
                    letterCounter++;
                    markLetterChars[j] = false;
                    mark = false;
                    break;
                } else {
                    throw "Các chữ số ở mật mã chỉ được sử dụng duy nhất một lần.";
                }
            }
        }

        if (mark) {
            for (let j = 0; j < availableNumbers.length; j++) {
                if (((input.charAt(i) - '0') == availableNumbers[j]) && markAvailableNums[j]) {
                    markAvailableNums[j] = false;
                    mark = false;
                    break;    
                }
            }

            if (mark) {
                throw "Chỉ được sử dụng các chữ số từ mật mã hoặc tập số được dùng và mỗi vị trí chỉ được sử dụng một lần.";
            }
        }
    }

    if (letterCounter < 2) {
        throw "Phải sử dụng ít nhất hai chữ số từ mật mã.";
    }
}

// Đối chiếu

function matchCode() {
    try {
        let secretCodeString = decryptSecretCode().toString();
        
        while (secretCodeString.length != 4) {
            secretCodeString = '0' + secretCodeString;
        }

        let inputCode = document.getElementById("match-input").value;

        checkNumberForMatchCode(inputCode);

        let numberAtRightPosition = 0;
        let rightNumberButWrongPosition = 0;
        let unmatchedPlaceAtAnswer = [true, true, true, true];
        let unmatchedPlaceAtInput = [true, true, true, true];

        for (let i = 0; i < 4; i++) {
            if (inputCode.charAt(i) == secretCodeString.charAt(i)) {
                numberAtRightPosition++;
                unmatchedPlaceAtAnswer[i] = false;
                unmatchedPlaceAtInput[i] = false;
            }
        }

        for (let i = 0; i < 4; i++) {
            if (unmatchedPlaceAtInput[i]) {
                for (let j = 0; j < 4; j++) {
                    if (i != j && unmatchedPlaceAtAnswer[j] && inputCode.charAt(i) == secretCodeString.charAt(j)) {
                        rightNumberButWrongPosition++;
                        unmatchedPlaceAtAnswer[j] = false;
                        break;
                    }
                }
            }
        }

        pricePay(matchCodeCost);
        addSearchResult(inputCode + ": " + numberAtRightPosition + " chữ số đúng và ở đúng vị trí, " 
                        + rightNumberButWrongPosition + " chữ số đúng nhưng ở sai vị trí.");
        document.getElementById("throw-error3").innerHTML = "";
    } catch(err) {
        document.getElementById("throw-error3").innerHTML = "Không hợp lệ! " + err;
    }
}

function checkNumberForMatchCode(input) {
    if (input.length != 4) {
        throw "Số nhập vào phải có đúng 4 chữ số.";
    }

    let markAvailableNums = [];

    for (i in availableNumbers) {
        markAvailableNums.push(true);
    }

    for (let i = 0; i < input.length; i++) {
        let mark = true;

        if (!/^[0-9]$/.test(input.charAt(i))) {
            throw "Không được sử dụng các ký tự không phải là các chữ số.";
        }

        for (let j = 0; j < availableNumbers.length; j++) {
            if (((input.charAt(i) - '0') == availableNumbers[j]) && markAvailableNums[j]) {
                markAvailableNums[j] = false;
                mark = false;
                break;    
            }
        }

        if (mark) {
            throw "Chỉ được sử dụng các chữ số từ tập số được dùng và mỗi vị trí chỉ được sử dụng một lần.";
        }
    }
}

// Quy đổi các chữ a,b,c,d về các số trong mật mã
function exchangeLetterToNumber(latex) {
    try {
        let secretCodeString = decryptSecretCode().toString();
        
        while (secretCodeString.length != 4) {
            secretCodeString = '0' + secretCodeString;
        }

        let exchangedExpression = "";
        
        for (let i = 0; i < latex.length; i++) {
            let mark = true;

            for (let j = 0; j < 4; j++) {
                if (latex.charAt(i) == letterChars[j]) {
                    exchangedExpression += "" + secretCodeString.charAt(j);
                    mark = false;
                    break;
                }
            }

            if (mark) {
                exchangedExpression += latex.charAt(i);
            }
        }

        return exchangedExpression;
    } catch(err) {
        throw err;
    }
}

//Bổ sung kết quả thu được vào trong bảng tổng hợp
function addSearchResult(result) {
    searchedInformation += result + "<br/>" + "<br/>";
    document.getElementById("search-log").innerHTML = searchedInformation;
}

// Submit đáp án
async function submitTheAnswer() {
    let answer = parseInt(document.getElementById("answer").value);

    if (!(answer >= 0 && answer <= 9999)) {
        document.getElementById("submit-answer").innerHTML = "Không hợp lệ. Mật mã phải nằm trong đoạn từ 0 đến 9999!";
    } else if (answer == decryptSecretCode()) {
        popupResult(true);
    } else {
        document.getElementById("submit-answer").innerHTML = "Mật mã không chính xác. Mời thử lại!";
        numOfSubmitRemaining--;
        document.getElementById("remaining-submit").innerHTML = "Còn " + numOfSubmitRemaining + " lượt";

        if (numOfSubmitRemaining == 0) {
            popupResult(false);  
        }
    }
}

// Điều khiển Slide
function showSlide(slide) {
    resetSlide();

    if (slide == 1) {
        document.getElementById("compare-expression").style.display = "block";
        document.getElementById("tab1").style.pointerEvents = "none";
        document.getElementById('tab1').style.backgroundColor = "#ffeb3b";
        document.getElementById('tab1').style.color = "#000000";
    } else if (slide == 2) {
        document.getElementById("check-properties").style.display = "block";
        document.getElementById("tab2").style.pointerEvents = "none";
        document.getElementById('tab2').style.backgroundColor = "#ffeb3b";
        document.getElementById('tab2').style.color = "#000000";
    } else {
        document.getElementById("match-code").style.display = "block";
        document.getElementById("tab3").style.pointerEvents = "none";
        document.getElementById('tab3').style.backgroundColor = "#ffeb3b";
        document.getElementById('tab3').style.color = "#000000";
    }
}

function changeStatus() {
    try {
        if (isPlaying) {
            endCountDown();

            isPlaying = false;
            searchedInformation = "";
            numOfBuyRemaining = buyNumberCost.length;
            numOfSubmitRemaining = maxNumOfSubmitAnswerTurn;

            document.getElementById("player-numbers").innerText = "";
            resetSlide();
            
            document.getElementById("intro-content").style.display = "block";
            document.getElementById("remaining-buy").innerHTML = "Còn " + numOfBuyRemaining + " lượt"; 
            document.getElementById("remaining-submit").innerHTML = "Còn " + numOfSubmitRemaining + " lượt";
            document.getElementById("start-intro").style.display = "block";
            
            document.getElementById("search-log").innerHTML = "";

            lockScreen();
            document.getElementById("status").innerHTML = "&#9205";
            document.getElementById("status").style.backgroundColor = "#015901";

            document.getElementById("buy-number-button").innerHTML = "🛒";
            document.getElementById("buy-number-button").style.display = "block";
            document.getElementById("buy-number-button").style.marginLeft = "22.5%";
            
            document.getElementById("expression1").placeholder = "";
            document.getElementById("expression2").placeholder = "";
            document.getElementById("num-to-check-properties").placeholder = "";
            document.getElementById("match-input").placeholder = "";

            document.getElementById("answer").value = "";
            document.getElementById("expression1").value = "";
            document.getElementById("expression2").value = "";
            document.getElementById("num-to-check-properties").value = "";
            document.getElementById("match-input").value = "";
        } else {
            freeNumbers();
            generateNewSecretCode();

            isPlaying = true;
            unlockScreen();

            document.getElementById("status").innerHTML = "&#8634";
            document.getElementById("status").style.backgroundColor = "#6c0703";
            document.getElementById("start-intro").style.display = "none";
            document.getElementById("buy-number-button").innerHTML = "🛒 (- " + buyNumberCost[0] + "s)";

            startCountDown();
        }
    } catch(err) {
        window.alert(err);
    }
}

//Popup thông báo kết quả lượt chơi
function popupResult(isWon) {
    changeStatus();

    if (isWon) {
        document.getElementById("result-title").innerHTML = "GIẢI MÃ THÀNH CÔNG";
        document.getElementById("result-title").style.color = "lime";
        document.getElementById("result-content").innerHTML = "🎉 Xin chúc mừng! Bạn đã hoàn thành hóa giải mật mã.";
        document.getElementById("close-popup").innerHTML = "Tuyệt!";
        document.getElementById("close-popup").style.backgroundColor = "#015901";
    } else {
        document.getElementById("result-title").innerHTML = "GIẢI MÃ THẤT BẠI";
        document.getElementById("result-title").style.color = "red";
        document.getElementById("result-content").innerHTML = "😞 Rất tiếc, mật mã đã không thể bị hóa giải. Chúc bạn may mắn lần sau!";
        document.getElementById("close-popup").innerHTML = "Lại!";
        document.getElementById("close-popup").style.backgroundColor = "#6c0703";
    }

    document.getElementById("correct-answer").innerHTML = "abcd = " + decryptSecretCode();
    document.getElementById("result-popup").style.display = "block";
    document.getElementById("all-screen").style.display = "block";
    lockScreen();
}

function lockScreen() {
    document.getElementById("answer").disabled = true;
    document.getElementById("expression1").disabled = true;
    document.getElementById("expression2").disabled = true;
    document.getElementById("num-to-check-properties").disabled = true;
    document.getElementById("match-input").disabled = true;

    document.getElementById("buy-number-button").disabled = true;
    document.getElementById("submit-button").disabled = true;
    document.getElementById("compare").disabled = true;
    document.getElementById("check-properties-button").disabled = true;
    document.getElementById("match-code-button").disabled = true;

    document.getElementById("buy-number-button").style.pointerEvents = "none";
    document.getElementById("submit-button").style.pointerEvents = "none";
    document.getElementById("compare").style.pointerEvents = "none";
    document.getElementById("check-properties-button").style.pointerEvents = "none";
    document.getElementById("match-code-button").style.pointerEvents = "none";

    document.getElementById("throw-error1").innerHTML = "";
    document.getElementById("throw-error2").innerHTML = "";
    document.getElementById("throw-error3").innerHTML = "";
    document.getElementById("throw-error4").innerHTML = "";
    document.getElementById("submit-answer").innerHTML = "";
}

function unlockScreen() {
    document.getElementById("answer").disabled = false;
    document.getElementById("expression1").disabled = false;
    document.getElementById("expression2").disabled = false;
    document.getElementById("num-to-check-properties").disabled = false;
    document.getElementById("match-input").disabled = false;

    document.getElementById("buy-number-button").disabled = false;
    document.getElementById("submit-button").disabled = false;
    document.getElementById("compare").disabled = false;
    document.getElementById("check-properties-button").disabled = false;
    document.getElementById("match-code-button").disabled = false;

    document.getElementById("buy-number-button").style.pointerEvents = "auto";
    document.getElementById("submit-button").style.pointerEvents = "auto";
    document.getElementById("compare").style.pointerEvents = "auto";
    document.getElementById("check-properties-button").style.pointerEvents = "auto";
    document.getElementById("match-code-button").style.pointerEvents = "auto";
}

function closePopup() {
    document.getElementById("all-screen").style.display = "none";
    document.getElementById("result-popup").style.display = "none";
}

function resetSlide() {
    document.getElementById("intro-content").style.display = "none";
    document.getElementById("compare-expression").style.display = "none";
    document.getElementById("check-properties").style.display = "none";
    document.getElementById("match-code").style.display = "none";

    document.getElementById("tab1").style.pointerEvents = "auto";
    document.getElementById("tab2").style.pointerEvents = "auto";
    document.getElementById("tab3").style.pointerEvents = "auto";

    document.getElementById("tab1").style.backgroundColor = "#015901";
    document.getElementById("tab2").style.backgroundColor = "#015901";
    document.getElementById("tab3").style.backgroundColor = "#015901";

    document.getElementById("tab1").style.color = "#f0f0f0";
    document.getElementById("tab2").style.color = "#f0f0f0";
    document.getElementById("tab3").style.color = "#f0f0f0";
}


//bộ đếm thời gian
function startCountDown() {
    timer = setInterval(() => {
        numOfSecondLeft--;
        document.getElementById("timer").innerHTML = "🕑 " + numOfSecondLeft + "s";

        if(numOfSecondLeft <= 0) {
            popupResult(false)
        }
    }, 1000);
}

function endCountDown() {
    clearInterval(timer);
    timer = null;
    numOfSecondLeft = timesForEachPlay;
    document.getElementById("timer").innerHTML = "🕑 " + numOfSecondLeft + "s";
}

//Trừ thời gian cho mỗi lần dùng công cụ
function pricePay(cost) {
    if (numOfSecondLeft < cost) {
        throw "Bạn không còn đủ thời gian để sử dụng công cụ này.";
    }

    numOfSecondLeft -= cost;
    document.getElementById("timer").innerHTML = "🕑 " + numOfSecondLeft + "s";
}

function changeIntro1Status() {
    if (isCompareExpressionIntroDisplay) {
        document.getElementById("compare-expression-intro").style.display = "none";
        document.getElementById("tool-intro1").innerHTML = "?";
    } else {
        document.getElementById("compare-expression-intro").style.display = "block";
        document.getElementById("tool-intro1").innerHTML = "&#10006";
    }

    isCompareExpressionIntroDisplay = !isCompareExpressionIntroDisplay;
}

function changeIntro2Status() {
    if (isCompareExpressionIntroDisplay) {
        document.getElementById("check-properties-intro").style.display = "none";
        document.getElementById("tool-intro2").innerHTML = "?";
    } else {
        document.getElementById("check-properties-intro").style.display = "block";
        document.getElementById("tool-intro2").innerHTML = "&#10006";
    }

    isCompareExpressionIntroDisplay = !isCompareExpressionIntroDisplay;
}

function changeIntro3Status() {
    if (isCompareExpressionIntroDisplay) {
        document.getElementById("match-code-intro").style.display = "none";
        document.getElementById("tool-intro3").innerHTML = "?";
    } else {
        document.getElementById("match-code-intro").style.display = "block";
        document.getElementById("tool-intro3").innerHTML = "&#10006";
    }

    isCompareExpressionIntroDisplay = !isCompareExpressionIntroDisplay;
}

function openIntroPopup() {
    document.getElementById("all-screen").style.display = "block";
    document.getElementById("intro-popup").style.display = "block";
    document.getElementById("intro-popup-content").scrollTop = 0;
}

function closeIntroPopup() {
    document.getElementById("all-screen").style.display = "none";
    document.getElementById("intro-popup").style.display = "none";
}

function openAvailableNumberIntroPopup() {
    document.getElementById("all-screen").style.display = "block";
    document.getElementById("available-number-intro-popup").style.display = "block";
}

function closeAvailableNumberIntroPopup() {
    document.getElementById("all-screen").style.display = "none";
    document.getElementById("available-number-intro-popup").style.display = "none";
}