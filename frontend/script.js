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

// Tạo mật mã 
firstGenerateNewSecretCode();

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
            document.getElementById("changeCost").innerHTML = "Mua số";
            document.getElementById("buyNumberButton").style.display = "none";
        } else { 
            let buyNumberCostNext = buyNumberCost[buyNumberCost.length + 1 - numOfBuyRemaining];
            document.getElementById("changeCost").innerHTML = "Mua số (Giá: " + buyNumberCostNext + "s)";
        }

        numOfBuyRemaining--;
        addAvailableNumbers();
        document.getElementById("player-numbers").innerText = availableNumbers.join(" ");
        document.getElementById("remainingbuy").innerHTML = "Số lượt mua còn lại: " + numOfBuyRemaining;
    } catch(err) {
        document.getElementById("throwError4").innerHTML = err;
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

        document.getElementById("throwError1").innerHTML = "";
    } catch(err) {    
        document.getElementById("throwError1").innerHTML = "Không hợp lệ! " + err;
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
        let input = document.getElementById("numToCheckProperties").value;

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
            addSearchResult(input + " là một số chính phương.");
        } else if (message == 'số hoàn hảo') {
            pricePay(checkPropertiesCost);
            addSearchResult(input + " là một số hoàn hảo.");
        } else if (message == 'số nguyên tố') {
            pricePay(checkPropertiesCost);
            addSearchResult(input + " là một số nguyên tố.");
        } else if (message == 'không là gì cả') {
            pricePay(checkPropertiesCost);
            addSearchResult(input + " đều không phải số chính phương, hoàn hảo hay số nguyên tố.");
        } else {
            throw message;
        }
        
        document.getElementById("throwError2").innerHTML = "";
    } catch(err) {
        document.getElementById("throwError2").innerHTML = "Không hợp lệ! " + err;
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
            addSearchResult(message + ".");
        } else {
            throw message;
        }

        document.getElementById("throwError3").innerHTML = "";
    } catch(err) {
        document.getElementById("throwError3").innerHTML = "Không hợp lệ! " + err;
    }
}

//Bổ sung kết quả thu được vào trong bảng tổng hợp
function addSearchResult(result) {
    searchedInformation += result + "<br/>" + "<br/>";
    document.getElementById("searchLog").innerHTML = searchedInformation;
}

// Submit đáp án
async function submitTheAnswer() {
    let answer = parseInt(document.getElementById("answer").value);

    if (!(answer >= 0 && answer <= 9999)) {
        document.getElementById("submitAnswer").innerHTML = "Không hợp lệ. Mật mã phải nằm trong đoạn từ 0 đến 9999!";
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
                document.getElementById("submitAnswer").innerHTML = "Mật mã không chính xác. Mời thử lại!";
                numOfSubmitRemaining--;
                document.getElementById("remainingsubmit").innerHTML = "Số lượt nhập còn lại: " + numOfSubmitRemaining;

                if (numOfSubmitRemaining == 0) {
                    popupResult(false);    
                }
            }
        } catch(err) {
            document.getElementById("submitAnswer").innerHTML = "Lỗi kết nối đến máy chủ.";
        }
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
        document.getElementById("closePopup").innerHTML = "Tuyệt!";
        document.getElementById("closePopup").style.backgroundColor = "#015901";
    } else {
        document.getElementById("result-title").innerHTML = "Giải mã thất bại";
        document.getElementById("result-title").style.color = "red";
        document.getElementById("result-content").innerHTML = "Rất tiếc, bạn đã không tìm được đáp án chính xác. Chúc bạn may mắn lần sau!";
        document.getElementById("closePopup").innerHTML = "Lại!";
        document.getElementById("closePopup").style.backgroundColor = "#6c0703";
    }

    if (correctAnswer != -1) {
        document.getElementById("correctAnswer").innerHTML = "Mật mã được ẩn giấu là " + correctAnswer + ".";
        document.getElementById("result-popup").style.display = "block";
    } else {
        document.getElementById("correctAnswer").innerHTML = "Xin lỗi hệ thống không thể trích xuất đáp án từ máy chủ server!";
    }

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
        popupResult (false);
    }
}, 1000);

function pricePay(cost) {
    if (numOfSecondLeft < cost) {
        throw "Bạn không còn đủ thời gian để sử dụng công cụ này.";
    }

    numOfSecondLeft -= cost;
    document.getElementById("timer").innerHTML = "Thời gian còn lại: " + numOfSecondLeft + "s";
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