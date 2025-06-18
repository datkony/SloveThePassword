const timesForEachPlay = 600;
const compareExpressionCost = 20;
const checkPropertiesCost = 15;
const matchCodeCost = 30;
const buyNumberCost = [60, 90]; //Giá cho mỗi lần mua chữ số
const maxNumOfSubmitAnswerTurn = 3;
const numOfFreeNumbers = 4;

let numOfSecondLeft = timesForEachPlay;
let isPlaying = false;
let availableNumbers = [];
let searchedInformation = "";
let numOfBuyRemaining = buyNumberCost.length;
let numOfSubmitRemaining = maxNumOfSubmitAnswerTurn;

let isCompareExpressionIntroDisplay = false;
let isCheckPropertiesIntroDisplay = false;
let isMatchCodeIntroDisplay = false;

// Tạo mật mã 
firstGenerateNewSecretCode();

freeNumber();
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
async function freeNumber() {
    try {
        const response = await fetch('https://slove-the-password-backend.onrender.com/removeAllAvailableNumbers', {
            method: 'POST',
        });

        const data = await response.json();

        if (!data.message) {
            throw "Không thể khởi tạo tập số mới. Hãy thử lại!";
        }

        while (availableNumbers.length != 0) {
            availableNumbers.pop();
        }

        for (let i = 0; i < numOfFreeNumbers; i++) {
            addAvailableNumbers();
        }
    } catch(err) {
        window.alert(err);
        freeNumber();
    }
}

async function addAvailableNumbers() {
    try {
        let newNumber = Math.round(Math.random() * 8) + 1
        availableNumbers.push(newNumber);

        const response = await fetch('https://slove-the-password-backend.onrender.com/pushAvailableNumbers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ newNumber })
        });

        const data = await response.json();

        if (!data.message) {
            throw "Không thể cấp phát chữ số mới. Hãy thử lại!";
        }
    } catch(err) {
        throw err;
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
            document.getElementById("buy-number-button").innerHTML = "🛒";
            document.getElementById("buy-number-button").style.display = "none";
        } else { 
            let buyNumberCostNext = buyNumberCost[buyNumberCost.length + 1 - numOfBuyRemaining];
            document.getElementById("buy-number-button").innerHTML = "🛒 (🏷️" + buyNumberCostNext + "s)";
        }

        numOfBuyRemaining--;
        addAvailableNumbers();
        document.getElementById("player-numbers").innerText = availableNumbers.join(" ");
        document.getElementById("remaining-buy").innerHTML = "Còn " + numOfBuyRemaining + " lượt";
    } catch(err) {
        document.getElementById("throw-error4").innerHTML = err;
    }
}
        
// So sánh

async function compareExpression() {
    try {
        let latex1 = document.getElementById("expression1").value;
        let latex2 = document.getElementById("expression2").value;

        const response = await fetch('https://slove-the-password-backend.onrender.com/compareExpressions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ latex1, latex2 })
        });

        const result = await response.json();
        const message = result.message;
        
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

async function checkProperties() {
    try {
        let input = document.getElementById("num-to-check-properties").value;

        const response = await fetch('https://slove-the-password-backend.onrender.com/checkProperties', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ input })
        });

        const result = await response.json();
        const message = result.message;

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

async function matchCode() {
    try {
        let inputCode = document.getElementById("match-input").value;

        const response = await fetch('https://slove-the-password-backend.onrender.com/matchCode', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ inputCode })
        });

        const result = await response.json();
        const message = result.message;

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
        try {
            const response = await fetch('https://slove-the-password-backend.onrender.com/check', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ guess: answer.toString() })
            });

            const data = await response.json();

            if (data.result === 'correct') {
                popupResult(true);
            } else {
                document.getElementById("submit-answer").innerHTML = "Mật mã không chính xác. Mời thử lại!";
                numOfSubmitRemaining--;
                document.getElementById("remaining-submit").innerHTML = "Còn " + numOfSubmitRemaining + " lượt";

                if (numOfSubmitRemaining == 0) {
                    popupResult(false);    
                }
            }
        } catch(err) {
            document.getElementById("submit-answer").innerHTML = "Lỗi kết nối đến máy chủ.";
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
            generateNewSecretCode();
            isPlaying = false;

            freeNumber();
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
            isPlaying = true;
            unlockScreen();

            document.getElementById("status").innerHTML = "&#8634";
            document.getElementById("status").style.backgroundColor = "#6c0703";
            document.getElementById("player-numbers").innerText = availableNumbers.join(" ");
            document.getElementById("start-intro").style.display = "none";

            document.getElementById("buy-number-button").innerHTML = "🛒 (🏷️" + buyNumberCost[0] + "s)";

            document.getElementById("expression1").placeholder = "ví dụ: a + b";
            document.getElementById("expression2").placeholder = "ví dụ: " + availableNumbers[0] + " * " + availableNumbers[1];
            document.getElementById("num-to-check-properties").placeholder = "ví dụ: ab" + availableNumbers[0] + availableNumbers[1];
            document.getElementById("match-input").placeholder = "ví dụ: " + availableNumbers[0] + availableNumbers[1] + availableNumbers[2] + availableNumbers[3];
        }
    } catch(err) {
        window.alert(err);
    }
}

async function popupResult(isWon) {
    let correctAnswer = -1;

    try {
        const response = await fetch('https://slove-the-password-backend.onrender.com/secret');
        const data = await response.json();
        correctAnswer = data.secret;
    } catch (error) {
        //Do nothing
    }

    changeStatus();

    if (isWon) {
        document.getElementById("result-title").innerHTML = "Giải mã thành công";
        document.getElementById("result-title").style.color = "lime";
        document.getElementById("result-content").innerHTML = "Xin chúc mừng! Bạn đã tìm ra đúng mật mã được ẩn giấu.";
        document.getElementById("close-popup").innerHTML = "Tuyệt!";
        document.getElementById("close-popup").style.backgroundColor = "#015901";
    } else {
        document.getElementById("result-title").innerHTML = "Giải mã thất bại";
        document.getElementById("result-title").style.color = "red";
        document.getElementById("result-content").innerHTML = "Rất tiếc, bạn đã không tìm được đáp án chính xác. Chúc bạn may mắn lần sau!";
        document.getElementById("close-popup").innerHTML = "Lại!";
        document.getElementById("close-popup").style.backgroundColor = "#6c0703";
    }

    if (correctAnswer != -1) {
        document.getElementById("correct-answer").innerHTML = "Mật mã được ẩn giấu là " + correctAnswer + ".";
        document.getElementById("result-popup").style.display = "block";
    } else {
        document.getElementById("correct-answer").innerHTML = "Xin lỗi hệ thống không thể trích xuất đáp án từ máy chủ server!";
    }

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
        popupResult (false);
    }
}, 1000);

function pricePay(cost) {
    if (numOfSecondLeft < cost) {
        throw "Bạn không còn đủ thời gian để sử dụng công cụ này.";
    }

    numOfSecondLeft -= cost;
    document.getElementById("timer").innerHTML = "🕑 " + numOfSecondLeft + "s";
}

async function generateNewSecretCode() {
    const response = await fetch('https://slove-the-password-backend.onrender.com/generate', {
        method: 'POST',
    });

    const data = await response.json();

    if (!data.message) {
        throw "Không thể tạo mật mã mới. Hãy thử lại!";
    }
}

function firstGenerateNewSecretCode() {
    try {
        generateNewSecretCode();
    } catch(err) {
        window.alert(err);
        firstGenerateNewSecretCode();
    }
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