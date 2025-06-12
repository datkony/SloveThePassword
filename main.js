const letterChars = ['a', 'b', 'c', 'd'];
const numChars = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
const mathChars = ['+', '-', '*', '(', ')', ' '];
const timesForEachPlay = 600;
const compareExpressionCost = 20;
const checkPropertiesCost = 15;
const matchCodeCost = 60;
const buyNumberCost = [30, 45, 60]; //Giá cho mỗi lần mua chữ số
const maxNumOfSubmitAnswerTurn = 3;
const numOfFreeNumbers = 3;

let numOfSecondLeft = timesForEachPlay;
let isPlaying = false;
let secretCode = [Math.round(Math.random() * 9), Math.round(Math.random() * 9), Math.round(Math.random() * 9), Math.round(Math.random() * 9)];
let availableNumbers = [];
let searchedInformation = "";
let numOfBuyRemaining = buyNumberCost.length;
let numOfSubmitRemaining = maxNumOfSubmitAnswerTurn;

freeNumber();
document.getElementById("startIntro").innerHTML = "Các chữ số trong tập sẽ xuất hiện ở đây<br/>Khi bắt đầu, bạn sẽ được phát miễn phí<br/>" 
                                                + numOfFreeNumbers + " chữ số làm khởi điểm";

document.getElementById("compareExpression").style.display = "none";
document.getElementById("checkProperties").style.display = "none";
document.getElementById("matchCode").style.display = "none";
document.getElementById("introContent").style.display = "block";
document.getElementById("remainingbuy").innerHTML = "Số lượt mua còn lại: " + numOfBuyRemaining; 
document.getElementById("remainingsubmit").innerHTML = "Số lượt nhập còn lại: " + numOfSubmitRemaining;
document.getElementById("timer").innerHTML = "Thời gian còn lại: " + numOfSecondLeft + "s";

document.getElementById("tab1").innerHTML = "So sánh<br/>(Giá: " + compareExpressionCost + "s)";
document.getElementById("tab2").innerHTML = "Ghép số<br/>(Giá: " + checkPropertiesCost + "s)";
document.getElementById("tab3").innerHTML = "Đối chiếu<br/>(Giá: " + matchCodeCost + "s)";

//Trạng thái chưa sẵn sàng
lockScreen();

//Làm sạch tập số hiện tại và cấp phát các chữ số miễn phí mới
function freeNumber() {
    while (availableNumbers.length != 0) {
        availableNumbers.pop();
    }

    for (let i = 0; i < numOfFreeNumbers; i++) {
        availableNumbers.push(Math.round(Math.random() * 8) + 1);
    }
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
            document.getElementById("changeCost").innerHTML = "Mua số";
            document.getElementById("buyNumberButton").style.display = "none";
        } else { 
            let buyNumberCostNext = buyNumberCost[buyNumberCost.length + 1 - numOfBuyRemaining];
            document.getElementById("changeCost").innerHTML = "Mua số (Giá: " + buyNumberCostNext + "s)";
        }

        numOfBuyRemaining--;
        availableNumbers.push(Math.round(Math.random() * 9));
        document.getElementById("player-numbers").innerText = availableNumbers.join(" ");
        document.getElementById("remainingbuy").innerHTML = "Số lượt mua còn lại: " + numOfBuyRemaining;
    } catch(err) {
        document.getElementById("throwError4").innerHTML = err;
    }
}
        
// So sánh

function compareExpression() {
    try {
        let latex1 = document.getElementById("expression1").value;
        let latex2 = document.getElementById("expression2").value;

        checkExpression(latex1,latex2);

        let result1 = eval(exchangeLetterToNumber(latex1));
        let result2 = eval(latex2);

        pricePay(compareExpressionCost);
        if (result1 > result2) {
            addSearchResult(standarlizationExpression(latex1) + " &gt " + standarlizationExpression(latex2));
        } else if (result1 < result2) {
            addSearchResult(standarlizationExpression(latex1) + " &lt " + standarlizationExpression(latex2));
        } else {
            addSearchResult(standarlizationExpression(latex1) + " = " + standarlizationExpression(latex2));
        }

        document.getElementById("throwError1").innerHTML = "";
    } catch(err) {
        document.getElementById("throwError1").innerHTML = "Không hợp lệ! " + err;
    }
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
                    throw "Mọi chữ số ở biểu thức 1 đều không được phép đứng cạnh nhau.";
                }

                if (markLetterChars[j]) {
                    counter++;
                    markLetterChars[j] = false;
                    mark = false;
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

    if (counter < 2 || counter > 3) {
        throw "Mỗi biểu thức đều phải dùng 2 hoặc 3 chữ số.";
    }

    for (let i = 0; i < latex2.length; i++) {
        if (numChars.includes(latex2.charAt(i))) {
            if (i != 0 && numChars.includes(latex2.charAt(i - 1))) {
                throw "Mọi chữ số ở biểu thức 2 đều không được phép đứng cạnh nhau.";
            }

            let markErr = true;

            for (let j = 0; j < availableNumbers.length; j++) {
                if (((latex2.charAt(i) - '0') == availableNumbers[j]) && markAvailableNums[j]) {
                    counter--;
                    markAvailableNums[j] = false;
                    markErr = false;
                    break;    
                }
            }

            if (markErr) {
                throw "Chỉ được sủ dụng các chữ số từ tập số hiện tại và mỗi vị trí trong tập chỉ được sử dụng một lần ở biểu thức 2.";
            }
        } else if (!mathChars.includes(latex2.charAt(i))) {
            throw "Chỉ được sử dụng các dấu +, -, *, () và các chữ số ở tập số hiện tại để nhập biểu thức 2.";
        }
    }

    if (counter != 0) {
        throw "Số lượng chữ số sử dụng ở hai biểu thức phải bằng nhau.";
    } 
}

function standarlizationExpression(input) {
    let standarlizatedString = "";

    for (let i = 0; i < input.length; i++) {
        if (input.charAt(i) != ' ') {
            if (input.charAt(i) == '*') {
                standarlizatedString += "&#215 ";
            } else {
                standarlizatedString += input.charAt(i) + " ";
            }
        }
    }

    return standarlizatedString.substring(0,standarlizatedString.length - 1)
}

// Ghép số

function checkProperties() {
    try {
        let input = document.getElementById("numToCheckProperties").value;

        checkNumberForProperties(input);

        let numberExchanged = parseInt(exchangeLetterToNumber(input));
        let sqrt = Math.sqrt(numberExchanged);

        if (sqrt == Math.round(sqrt)) {
            pricePay(checkPropertiesCost);
            addSearchResult(input + " là một số chính phương.");
        } else {
            let sumOfDivisior = 1;

            for (let i = 2; i < sqrt; i++) {
                if (numberExchanged % i == 0) {
                    sumOfDivisior += (i + numberExchanged / i); 
                }
            }

            pricePay(checkPropertiesCost);
            if (sumOfDivisior == numberExchanged) {
                addSearchResult(input + " là một số hoàn hảo.");
            } else if (sumOfDivisior == 1) {
                addSearchResult(input + " là một số nguyên tố.");
            } else {
                addSearchResult(input + " đều không phải số chính phương, hoàn hảo hay số nguyên tố.");
            }
        }

        document.getElementById("throwError2").innerHTML = "";
    } catch(err) {
        document.getElementById("throwError2").innerHTML = "Không hợp lệ! " + err;
    }
}

function checkNumberForProperties(input) {
    if(input.length < 2 || input.length > 4) {
        throw "Số được nhập phải có từ 2 đến 4 chữ số";
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
                throw "Chỉ được sủ dụng các chữ số từ mật mã hoặc tập số hiện tại và mỗi vị trí chỉ được sử dụng một lần.";
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
        let inputCode = document.getElementById("match-input").value;

        checkNumberForMatchCode(inputCode);

        let numberAtRightPosition = 0;
        let rightNumberButWrongPosition = 0;
        let unmatchedPlaceAtAnswer = [true, true, true, true];
        let unmatchedPlaceAtInput = [true, true, true, true];

        for (let i = 0; i < 4; i++) {
            if ((inputCode.charAt(i) - '0') == secretCode[i]) {
                numberAtRightPosition++;
                unmatchedPlaceAtAnswer[i] = false;
                unmatchedPlaceAtInput[i] = false;
            }
        }

        for (let i = 0; i < 4; i++) {
            if (unmatchedPlaceAtInput[i]) {
                for (let j = 0; j < 4; j++) {
                    if (i != j && unmatchedPlaceAtAnswer[j] && (inputCode.charAt(i) - '0') == secretCode[j]) {
                        rightNumberButWrongPosition++;
                        unmatchedPlaceAtAnswer[j] = false;
                        break;
                    }
                }
            }
        }

        pricePay(matchCodeCost);
        addSearchResult(inputCode + ": " + numberAtRightPosition + " chữ số ở đúng vị trí, " 
                    + rightNumberButWrongPosition + " chữ số đúng nhưng ở sai vị trí.");

        document.getElementById("throwError3").innerHTML = "";
    } catch(err) {
        document.getElementById("throwError3").innerHTML = "Không hợp lệ! " + err;
    }
}

function checkNumberForMatchCode(input) {
    if (input.length != 4) {
        throw "Số nhập vào phải có đúng 4 chữ số";
    }

    let markAvailableNums = [];

    for (i in availableNumbers) {
        markAvailableNums.push(true);
    }

    for (let i = 0; i < input.length; i++) {
        let mark = true;

        if (!numChars.includes(input.charAt(i))) {
            throw "Không được sử dụng các ký tự không phải là các chữ số";
        }

        for (let j = 0; j < availableNumbers.length; j++) {
            if (((input.charAt(i) - '0') == availableNumbers[j]) && markAvailableNums[j]) {
                markAvailableNums[j] = false;
                mark = false;
                break;    
            }
        }

        if (mark) {
            throw "Chỉ được sử dụng các chữ số từ tập số hiện tại và mỗi vị trí chỉ được sử dụng một lần.";
        }
    }
} 

//Bổ sung kết quả thu được vào trong bảng tổng hợp
function addSearchResult(result) {
    searchedInformation += result + "<br/>" + "<br/>";
    document.getElementById("searchLog").innerHTML = searchedInformation;
}

// Quy đổi các chữ a,b,c,d về các số trong mật mã
function exchangeLetterToNumber(latex) {
    let exchangedExpression = "";
    
    for (let i = 0; i < latex.length; i++) {
        let mark = true;

        for (let j = 0; j < 4; j++) {
            if (latex.charAt(i) == letterChars[j]) {
                exchangedExpression += "" + secretCode[j];
                mark = false;
                break;
            }
        }

        if (mark) {
            exchangedExpression += latex.charAt(i);
        }
    }

    return exchangedExpression;
}

// Submit đáp án
function submitTheAnswer() {
    let answer = parseInt(document.getElementById("answer").value);
    let correctAnswer = secretCode[0] * 1000 + secretCode[1] * 100 + secretCode[2] * 10 + secretCode[3];

    if (answer >= 0 && answer <= 9999) {
        if (answer == correctAnswer) {
            popupResult(true, correctAnswer);
        } else {
            document.getElementById("submitAnswer").innerHTML = "Mật mã không chính xác. Mời thử lại!";
            numOfSubmitRemaining--;
            document.getElementById("remainingsubmit").innerHTML = "Số lượt nhập còn lại: " + numOfSubmitRemaining;
        }
    } else {
        document.getElementById("submitAnswer").innerHTML = "Không hợp lệ. Mật mã phải nằm trong đoạn từ 0 đến 9999!";
    }

    if (numOfSubmitRemaining == 0) {
        popupResult(false, correctAnswer);    
    }
}

// Điều khiển Slide
function showSlide(slide) {
    resetSlide();

    if (slide == 1) {
        document.getElementById("compareExpression").style.display = "block";
        document.getElementById("tab1").style.pointerEvents = "none";
        document.getElementById('tab1').style.backgroundColor = "#ffeb3b";
        document.getElementById('tab1').style.color = "#000000";
    } else if (slide == 2) {
        document.getElementById("checkProperties").style.display = "block";
        document.getElementById("tab2").style.pointerEvents = "none";
        document.getElementById('tab2').style.backgroundColor = "#ffeb3b";
        document.getElementById('tab2').style.color = "#000000";
    } else {
        document.getElementById("matchCode").style.display = "block";
        document.getElementById("tab3").style.pointerEvents = "none";
        document.getElementById('tab3').style.backgroundColor = "#ffeb3b";
        document.getElementById('tab3').style.color = "#000000";
    }
}

function changeStatus() {
    if (isPlaying) {
        isPlaying = false;

        secretCode = [Math.round(Math.random() * 9), Math.round(Math.random() * 9), Math.round(Math.random() * 9), Math.round(Math.random() * 9)];
        freeNumber();
        searchedInformation = "";
        numOfBuyRemaining = buyNumberCost.length;
        numOfSubmitRemaining = maxNumOfSubmitAnswerTurn;
        numOfSecondLeft = timesForEachPlay;

        document.getElementById("player-numbers").innerText = "";
        resetSlide();
        
        document.getElementById("introContent").style.display = "block";
        document.getElementById("remainingbuy").innerHTML = "Số lượt mua còn lại: " + numOfBuyRemaining; 
        document.getElementById("remainingsubmit").innerHTML = "Số lượt nhập còn lại: " + numOfSubmitRemaining;
        document.getElementById("startIntro").style.display = "block";
        
        document.getElementById("searchLog").innerHTML = "";

        lockScreen();
        document.getElementById("status").innerHTML = "Start";
        document.getElementById("status").style.backgroundColor = "#015901";

        document.getElementById("timer").innerHTML = "Thời gian còn lại: " + numOfSecondLeft + "s";

        document.getElementById("changeCost").innerHTML = "Mua số";
        document.getElementById("buyNumberButton").style.display = "block";
        document.getElementById("buyNumberButton").style.marginLeft = "70px";
    } else {
        isPlaying = true;
        unlockScreen();

        document.getElementById("status").innerHTML = "Restart";
        document.getElementById("status").style.backgroundColor = "#6c0703";
        document.getElementById("player-numbers").innerText = availableNumbers.join(" ");
        document.getElementById("startIntro").style.display = "none";

        document.getElementById("changeCost").innerHTML = "Mua số (Giá: " + buyNumberCost[0] + "s)";
    }
}

function popupResult(isWon, correctAnswer) {
    changeStatus();

    if (isWon) {
        document.getElementById("result-title").innerHTML = "Giải mã thành công";
        document.getElementById("result-title").style.color = "lime";
        document.getElementById("result-content").innerHTML = "Xin chúc mừng! Bạn đã tìm ra đúng mật mã được ẩn giấu.";
        document.getElementById("closePopup").innerHTML = "Tuyệt!";
        document.getElementById("closePopup").style.backgroundColor = "#015901";
    } else {
        document.getElementById("result-title").innerHTML = "Giải mã thất bại";
        document.getElementById("result-title").style.color = "red";
        document.getElementById("result-content").innerHTML = "Rất tiếc, bạn đã không tìm được đáp án chính xác. Chúc bạn may mắn lần sau!";
        document.getElementById("closePopup").innerHTML = "Lại!";
        document.getElementById("closePopup").style.backgroundColor = "#6c0703";
    }

    document.getElementById("correctAnswer").innerHTML = "Mật mã được ẩn giấu là " + correctAnswer + ".";
    document.getElementById("result-popup").style.display = "block";
    document.getElementById("allScreen").style.display = "block";
    lockScreen();
}

function lockScreen() {
    document.getElementById("answer").disabled = true;
    document.getElementById("expression1").disabled = true;
    document.getElementById("expression2").disabled = true;
    document.getElementById("numToCheckProperties").disabled = true;
    document.getElementById("match-input").disabled = true;

    document.getElementById("buyNumberButton").disabled = true;
    document.getElementById("submitButton").disabled = true;
    document.getElementById("compare").disabled = true;
    document.getElementById("checkPropertiesButton").disabled = true;
    document.getElementById("matchCodeButton").disabled = true;

    document.getElementById("buyNumberButton").style.pointerEvents = "none";
    document.getElementById("submitButton").style.pointerEvents = "none";
    document.getElementById("compare").style.pointerEvents = "none";
    document.getElementById("checkPropertiesButton").style.pointerEvents = "none";
    document.getElementById("matchCodeButton").style.pointerEvents = "none";

    document.getElementById("throwError1").innerHTML = "";
    document.getElementById("throwError2").innerHTML = "";
    document.getElementById("throwError3").innerHTML = "";
    document.getElementById("throwError4").innerHTML = "";
    document.getElementById("submitAnswer").innerHTML = "";
}

function unlockScreen() {
    document.getElementById("answer").disabled = false;
    document.getElementById("expression1").disabled = false;
    document.getElementById("expression2").disabled = false;
    document.getElementById("numToCheckProperties").disabled = false;
    document.getElementById("match-input").disabled = false;

    document.getElementById("buyNumberButton").disabled = false;
    document.getElementById("submitButton").disabled = false;
    document.getElementById("compare").disabled = false;
    document.getElementById("checkPropertiesButton").disabled = false;
    document.getElementById("matchCodeButton").disabled = false;

    document.getElementById("buyNumberButton").style.pointerEvents = "auto";
    document.getElementById("submitButton").style.pointerEvents = "auto";
    document.getElementById("compare").style.pointerEvents = "auto";
    document.getElementById("checkPropertiesButton").style.pointerEvents = "auto";
    document.getElementById("matchCodeButton").style.pointerEvents = "auto";
}

function closePopup() {
    document.getElementById("allScreen").style.display = "none";
    document.getElementById("result-popup").style.display = "none";
}

function resetSlide() {
    document.getElementById("introContent").style.display = "none";
    document.getElementById("compareExpression").style.display = "none";
    document.getElementById("checkProperties").style.display = "none";
    document.getElementById("matchCode").style.display = "none";

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


//cài đặt bộ đếm thời gian
setInterval(function countDown() {
    if(isPlaying) {
        numOfSecondLeft--;
        document.getElementById("timer").innerHTML = "Thời gian còn lại: " + numOfSecondLeft + "s";
    }

    if(numOfSecondLeft <= 0) {
        let correctAnswer = secretCode[0] * 1000 + secretCode[1] * 100 + secretCode[2] * 10 + secretCode[3];
        popupResult (false, correctAnswer);
    }
}, 1000);

function pricePay(cost) {
    if (numOfSecondLeft < cost) {
        throw "Bạn không còn đủ thời gian để sử dụng công cụ này.";
    }

    numOfSecondLeft -= cost;
    document.getElementById("timer").innerHTML = "Thời gian còn lại: " + numOfSecondLeft + "s";
}