const timesForEachPlay = 600;
const compareExpressionCost = 20;
const checkPropertiesCost = 15;
const matchCodeCost = 30;
const buyNumberCost = [60, 90]; //Giá cho mỗi lần mua chữ số
const maxNumOfSubmitAnswerTurn = 3;
const numOfFreeNumbers = 4;

let numOfSecondLeft = timesForEachPlay;
let isPlaying = false;
let searchedInformation = "";
let numOfBuyRemaining = buyNumberCost.length;
let numOfSubmitRemaining = maxNumOfSubmitAnswerTurn;

let isCompareExpressionIntroDisplay = false;
let isCheckPropertiesIntroDisplay = false;
let isMatchCodeIntroDisplay = false;

// Nhận message từ server
const socket = new WebSocket("wss://slove-the-password-backend.onrender.com");

socket.onopen = () => {
    socket.send(JSON.stringify({ type: "Hello Server!" })); // ✅ Gửi sau khi đã kết nối
};

socket.onmessage = (event) => {
    const data = JSON.parse(event.data);

    switch(data.type) {
        case "Hello Client!":
            window.alert('🟢 Server đã kết nối thành công. 🎮 Trò chơi đã sẵn sàng!');
            break;
        case "compareExpressions":
            printCompareExpressionsResult(data.message);
            break;
        case "checkProperties":
            printCheckPropertiesResult(data.message);
            break;
        case "matchCode":
            printMatchCodeResult(data.message);
            break;
        case "submitResult":
            executeTheSubmitResult(data.message, data.answer);
            break;
        case "availableNumbers":
            executeReceivedAvailableNumbers(data.message);
            break;
        case "compareSecretCodeWithMidResult":
            findTheSecretCodeThenPopupWhenFalse(data.message, data.lower, data.upper);
            break;
        default:
            window.alert("Không thể nhận diện message gửi từ client: " + data.type);
            break;
    }
};


document.getElementById("start-intro").innerHTML = "Khởi điểm: " + numOfFreeNumbers + " chữ số";

document.getElementById("compare-expression").style.display = "none";
document.getElementById("check-properties").style.display = "none";
document.getElementById("match-code").style.display = "none";
document.getElementById("intro-content").style.display = "block";

document.getElementById("remaining-buy").innerHTML = "Còn " + numOfBuyRemaining + " lượt"; 
document.getElementById("remaining-submit").innerHTML = "Còn " + numOfSubmitRemaining + " lượt";
document.getElementById("timer").innerHTML = "🕑 " + numOfSecondLeft + "s";

document.getElementById("tab1").innerHTML = "So sánh<br/>🏷️" + compareExpressionCost + "s";
document.getElementById("tab2").innerHTML = "Ghép số<br/>🏷️" + checkPropertiesCost + "s";
document.getElementById("tab3").innerHTML = "Đối chiếu<br/>🏷️" + matchCodeCost + "s";

document.getElementById("compare-expression-intro").style.display = "none";
document.getElementById("check-properties-intro").style.display = "none";
document.getElementById("match-code-intro").style.display = "none";

//Trạng thái chưa sẵn sàng
lockScreen();

//Làm sạch tập số hiện tại và cấp phát các chữ số miễn phí mới
function freeNumber() {
    socket.send(JSON.stringify({ type: "freeNumbers" }));
}
function generateNewSecretCode() {
    socket.send(JSON.stringify({ type: "generate" }));
}

function addAvailableNumbers() {
    socket.send(JSON.stringify({ type: "addAvailableNumbers" }));
}

function executeReceivedAvailableNumbers(message) {
    document.getElementById("player-numbers").innerText = message;

    document.getElementById("expression1").placeholder = "ví dụ: a + b";
    document.getElementById("expression2").placeholder = "ví dụ: " + message.charAt(0) + " * " + message.charAt(2);
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
            document.getElementById("buy-number-button").innerHTML = "🛒 (🏷️" + buyNumberCostNext + "s)";
        }

        numOfBuyRemaining--;
        addAvailableNumbers();
        document.getElementById("remaining-buy").innerHTML = "Còn " + numOfBuyRemaining + " lượt";
    } catch(err) {
        document.getElementById("throw-error4").innerHTML = err;
    }
}
        
// So sánh

function sendCompareExpressionsRequest() {
    let latex1 = document.getElementById("expression1").value;
    let latex2 = document.getElementById("expression2").value;

    socket.send(JSON.stringify({ type: "compareExpressions", latex1: latex1, latex2: latex2 }));
}

function printCompareExpressionsResult(message) {
    try {
        let latex1 = document.getElementById("expression1").value;
        let latex2 = document.getElementById("expression2").value;
        
        if (message == 'expression 1 value bigger') {
            pricePay(compareExpressionCost);
            addSearchResult(standarlizationExpression(latex1) + " &gt " + standarlizationExpression(latex2));
        } else if (message == 'expression 2 value bigger') {
            pricePay(compareExpressionCost);
            addSearchResult(standarlizationExpression(latex1) + " &lt " + standarlizationExpression(latex2));
        } else if (message == '2 expressions value are equal') {
            pricePay(compareExpressionCost);
            addSearchResult(standarlizationExpression(latex1) + " = " + standarlizationExpression(latex2));
        } else {
            throw message;
        }

        document.getElementById("throw-error1").innerHTML = "";
    } catch(err) {    
        document.getElementById("throw-error1").innerHTML = "Không hợp lệ! " + err;
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

function sendCheckPropertiesRequest() {
    let input = document.getElementById("num-to-check-properties").value;

    socket.send(JSON.stringify({ type: "checkProperties", input: input }));
}

function printCheckPropertiesResult(message) {
    try {
        let input = document.getElementById("num-to-check-properties").value;

        if (message == 'số chính phương') {
            pricePay(checkPropertiesCost);
            addSearchResult(input + " là một số chính phương");
        } else if (message == 'số hoàn hảo') {
            pricePay(checkPropertiesCost);
            addSearchResult(input + " là một số hoàn hảo");
        } else if (message == 'số nguyên tố') {
            pricePay(checkPropertiesCost);
            addSearchResult(input + " là một số nguyên tố");
        } else if (message == 'không là gì cả') {
            pricePay(checkPropertiesCost);
            addSearchResult(input + " đều không phải số chính phương, hoàn hảo hay số nguyên tố");
        } else {
            throw message;
        }
        
        document.getElementById("throw-error2").innerHTML = "";
    } catch(err) {
        document.getElementById("throw-error2").innerHTML = "Không hợp lệ! " + err;
    }
}

// Đối chiếu

function sendMatchCodeRequest() {
    let inputCode = document.getElementById("match-input").value;

    socket.send(JSON.stringify({ type: "matchCode", inputCode: inputCode }));
}

function printMatchCodeResult(message) {
    try {
        if (message.charAt(message.length - 1) != '.') {
            pricePay(matchCodeCost);
            addSearchResult(message);
        } else {
            throw message;
        }

        document.getElementById("throw-error3").innerHTML = "";
    } catch(err) {
        document.getElementById("throw-error3").innerHTML = "Không hợp lệ! " + err;
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
    } else {
        socket.send(JSON.stringify({ type: "checkGuess", guess: answer }));
    }
}

function executeTheSubmitResult(result, answer) {
    try {
        if (result == 'correct') {
            popupResult(true, answer);
        } else {
            document.getElementById("submit-answer").innerHTML = "Mật mã không chính xác. Mời thử lại!";
            numOfSubmitRemaining--;
            document.getElementById("remaining-submit").innerHTML = "Còn " + numOfSubmitRemaining + " lượt";

            if (numOfSubmitRemaining == 0) {
                findTheSecretCodeThenPopupWhenFalse();    
            }
        }
    } catch(err) {
        document.getElementById("submit-answer").innerHTML = "Lỗi kết nối đến máy chủ.";
    }
}

// Hàm dò mật mã bằng binary search rồi thông báo kết quả qua popup trong trường hợp thất bại
function findTheSecretCodeThenPopupWhenFalse(message = "", lower = 0, upper = 9999) {
    if (message == 'equal') {
        popupResult(false, parseInt((lower + upper) / 2)); 
    } else {
        socket.send(JSON.stringify({ type: "compareSecretCodeWithMid", lower: lower, upper: upper }));
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
            isPlaying = false;
            
            searchedInformation = "";
            numOfBuyRemaining = buyNumberCost.length;
            numOfSubmitRemaining = maxNumOfSubmitAnswerTurn;
            numOfSecondLeft = timesForEachPlay;

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

            document.getElementById("timer").innerHTML = "🕑 " + numOfSecondLeft + "s";

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
            freeNumber();
            generateNewSecretCode();

            isPlaying = true;
            unlockScreen();

            document.getElementById("status").innerHTML = "&#8634";
            document.getElementById("status").style.backgroundColor = "#6c0703";
            document.getElementById("start-intro").style.display = "none";
            document.getElementById("buy-number-button").innerHTML = "🛒 (🏷️" + buyNumberCost[0] + "s)";
        }
    } catch(err) {
        window.alert(err);
    }
}

function popupResult(isWon, correctAnswer) {
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

    document.getElementById("correct-answer").innerHTML = "abcd = " + correctAnswer;
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


//cài đặt bộ đếm thời gian
setInterval(function countDown() {
    if(isPlaying) {
        numOfSecondLeft--;
        document.getElementById("timer").innerHTML = "🕑 " + numOfSecondLeft + "s";
    }

    if(numOfSecondLeft <= 0) {
        findTheSecretCodeThenPopupWhenFalse();
    }
}, 1000);

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