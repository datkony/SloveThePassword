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

const cryptoJsKey = "agfawehkfgsjefygerylfgaejgaevbrjhrvbjhfghbvdzjhfrbguiegjhlaghlqjhhhh";
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

// FTUE State Variables
let isFTUEActive = false;
let currentFTUEStep = 0;

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

// ── UI HELPERS ────────────────────────────────────────────────────────────────

/**
 * Bước 5: Hiển thị toast message ở góc dưới bên phải
 * @param {string} message
 * @param {'error'|'success'|'warning'|'info'} type
 * @param {number} duration ms
 */
function showToast(message, type = 'error', duration = 3000) {
    const icons = { error: '❌', success: '✅', warning: '⚠️', info: 'ℹ️' };
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<span class="toast-icon">${icons[type] || 'ℹ️'}</span><span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('toast-out');
        setTimeout(() => toast.remove(), 350);
    }, duration);
}

/**
 * Bước 5: Rung lắc phần tử khi có lỗi
 * @param {string} elementId
 */
function shakeElement(elementId) {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.classList.remove('shake');
    void el.offsetWidth; // reflow để restart animation
    el.classList.add('shake');
    el.addEventListener('animationend', () => el.classList.remove('shake'), { once: true });
}

/**
 * Bước 5: Cập nhật thanh tiến trình timer
 */
function updateTimerBar() {
    const bar = document.getElementById('timer-bar');
    const timerEl = document.getElementById('timer');
    if (!bar) return;
    const pct = Math.max(0, (numOfSecondLeft / timesForEachPlay) * 100);
    bar.style.width = pct + '%';

    bar.classList.remove('warning', 'danger');
    timerEl.classList.remove('timer-warning', 'timer-danger');

    if (pct <= 20) {
        bar.classList.add('danger');
        timerEl.classList.add('timer-danger');
    } else if (pct <= 40) {
        bar.classList.add('warning');
        timerEl.classList.add('timer-warning');
    }
}

/**
 * Bước 5: Hiệu ứng confetti khi thắng
 */
function launchConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext('2d');
    const pieces = [];
    const colors = ['#7c3aed', '#a78bfa', '#f59e0b', '#fcd34d', '#10b981', '#34d399', '#ef4444', '#f472b6'];
    const total = 160;
    for (let i = 0; i < total; i++) {
        pieces.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            w: Math.random() * 12 + 5,
            h: Math.random() * 6 + 3,
            color: colors[Math.floor(Math.random() * colors.length)],
            speed: Math.random() * 3 + 2,
            angle: Math.random() * Math.PI * 2,
            spin: (Math.random() - 0.5) * 0.2
        });
    }
    let frames = 0;
    const maxFrames = 200;
    function animateConfetti() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        pieces.forEach(p => {
            p.y += p.speed;
            p.x += Math.sin(p.angle) * 1.5;
            p.angle += p.spin;
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.angle);
            ctx.fillStyle = p.color;
            ctx.globalAlpha = Math.max(0, 1 - frames / maxFrames);
            ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
            ctx.restore();
        });
        frames++;
        if (frames < maxFrames) requestAnimationFrame(animateConfetti);
        else ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    animateConfetti();
}

// ── END UI HELPERS ────────────────────────────────────────────────────────────

//Trạng thái chưa sẵn sàng
lockScreen();
updateTimerBar();

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

        if (numOfBuyRemaining == 1) {
            document.getElementById("buy-number-button").innerHTML = "🛒 Mua";
            document.getElementById("buy-number-button").style.display = "none";
        } else {
            let buyNumberCostNext = buyNumberCost[buyNumberCost.length + 1 - numOfBuyRemaining];
            document.getElementById("buy-number-button").innerHTML = "🛒 Mua (- " + buyNumberCostNext + "s)";
        }

        numOfBuyRemaining--;
        addAvailableNumbers();
        document.getElementById("remaining-buy").innerHTML = "Còn " + numOfBuyRemaining + " lượt";

        document.getElementById("player-numbers").innerText = availableNumbers.join(" ")
    } catch (err) {
        document.getElementById("throw-error4").innerHTML = err;
    }
}

// So sánh

function compareExpressions() {
    let isEvalError = false;

    try {
        let latex1 = deleteSpaceInExpression(document.getElementById("expression1").value);
        let latex2 = deleteSpaceInExpression(document.getElementById("expression2").value);

        checkExpression(latex1, latex2);

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

        if (isFTUEActive && FTUE_STEPS[currentFTUEStep].action === "waitForCompare") {
            currentFTUEStep++;
            setTimeout(showFTUEStep, 500);
        }
    } catch (err) {
        if (isEvalError) {
            err = "Không thể thực hiện tính toán các biểu thức vừa nhập.";
        }
        const msg = "Không hợp lệ! " + err;
        document.getElementById("throw-error1").innerHTML = msg;
        shakeElement("compare-expression");
        showToast(msg, 'error');
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

    return standarlizatedString.substring(0, standarlizatedString.length - 1)
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

        if (isFTUEActive && FTUE_STEPS[currentFTUEStep].action === "waitForCheckProperties") {
            currentFTUEStep++;
            setTimeout(showFTUEStep, 500);
        }
    } catch (err) {
        const msg = "Không hợp lệ! " + err;
        document.getElementById("throw-error2").innerHTML = msg;
        shakeElement("check-properties");
        showToast(msg, 'error');
    }
}

function checkNumberForProperties(input) {
    if (input.length < 2 || input.length > 4) {
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

        if (isFTUEActive && FTUE_STEPS[currentFTUEStep].action === "waitForMatchCode") {
            currentFTUEStep++;
            setTimeout(showFTUEStep, 500);
        }
    } catch (err) {
        const msg = "Không hợp lệ! " + err;
        document.getElementById("throw-error3").innerHTML = msg;
        shakeElement("match-code");
        showToast(msg, 'error');
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
    } catch (err) {
        throw err;
    }
}

//Bổ sung kết quả thu được vào trong bảng tổng hợp (dạng clue-item card)
function addSearchResult(result) {
    const log = document.getElementById("search-log");
    const item = document.createElement('div');
    item.className = 'clue-item';
    item.innerHTML = result;
    log.appendChild(item);
    // Scroll to bottom
    const searchBox = document.getElementById('search-box-id');
    searchBox.scrollTop = searchBox.scrollHeight;
}

// Submit đáp án
async function submitTheAnswer() {
    let answer = parseInt(document.getElementById("answer").value);

    if (!(answer >= 0 && answer <= 9999)) {
        document.getElementById("submit-answer").innerHTML = "Không hợp lệ. Mật mã phải nằm trong đoạn từ 0 đến 9999!";
    } else if (answer == decryptSecretCode()) {
        popupResult(true);
    } else {
        numOfSubmitRemaining--;
        const remainingSubmitEl = document.getElementById("remaining-submit");
        const answerInput = document.getElementById("answer");

        remainingSubmitEl.innerHTML = "Còn " + numOfSubmitRemaining + " lượt";

        // Cập nhật màu chữ cho số lượt nhập
        if (numOfSubmitRemaining < maxNumOfSubmitAnswerTurn) {
            remainingSubmitEl.classList.add('low-turns');
        } else {
            remainingSubmitEl.classList.remove('low-turns');
        }

        // Cập nhật viền bóng đỏ nếu còn 1 lượt
        if (numOfSubmitRemaining === 1) {
            answerInput.classList.add('critical-turns');
        } else {
            answerInput.classList.remove('critical-turns');
        }

        if (numOfSubmitRemaining == 0) {
            popupResult(false);
        } else {
            document.getElementById("submit-answer").innerHTML = "Mật mã không chính xác. Mời thử lại!";
            shakeElement("answer"); // Hiệu ứng rung cho ô nhập mật mã
        }
    }
}

// Điều khiển Slide (Bước 3: dùng CSS class thay vì inline style)
function showSlide(slide) {
    resetSlide();

    if (slide == 1) {
        document.getElementById("compare-expression").style.display = "block";
        document.getElementById("tab1").classList.add('tab-active');
        document.getElementById("tab1").style.pointerEvents = "none";
    } else if (slide == 2) {
        document.getElementById("check-properties").style.display = "block";
        document.getElementById("tab2").classList.add('tab-active');
        document.getElementById("tab2").style.pointerEvents = "none";
    } else {
        document.getElementById("match-code").style.display = "block";
        document.getElementById("tab3").classList.add('tab-active');
        document.getElementById("tab3").style.pointerEvents = "none";
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

            if (isFTUEActive) {
                isFTUEActive = false;
                document.body.classList.remove('ftue-active');
                document.getElementById("ftue-overlay").style.display = "none";
                document.getElementById("ftue-tooltip").style.display = "none";
                document.querySelectorAll('.ftue-highlight').forEach(el => {
                    el.classList.remove('ftue-highlight');
                    el.style.backgroundColor = "";
                    el.style.padding = "";
                });
            }

            document.getElementById("intro-content").style.display = "block";
            document.getElementById("remaining-buy").innerHTML = "Còn " + numOfBuyRemaining + " lượt";

            const remainingSubmitEl = document.getElementById("remaining-submit");
            remainingSubmitEl.innerHTML = "Còn " + numOfSubmitRemaining + " lượt";
            remainingSubmitEl.classList.remove('low-turns');

            const answerInput = document.getElementById("answer");
            answerInput.classList.remove('critical-turns');

            document.getElementById("start-intro").style.display = "block";

            document.getElementById("search-log").innerHTML = "";
            updateTimerBar();

            lockScreen();
            document.getElementById("status").innerHTML = "&#9205";
            document.getElementById("status").style.background = "linear-gradient(135deg, var(--color-success), var(--color-success-dark))";
            document.getElementById("status").style.boxShadow = "var(--shadow-glow-success)";

            document.getElementById("buy-number-button").innerHTML = "🛒 Mua";
            document.getElementById("buy-number-button").style.display = "block";

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
            document.getElementById("status").style.background = "linear-gradient(135deg, var(--color-danger), var(--color-danger-dark))";
            document.getElementById("status").style.boxShadow = "var(--shadow-glow-danger)";
            document.getElementById("start-intro").style.display = "none";
            document.getElementById("buy-number-button").innerHTML = "🛒 Mua (- " + buyNumberCost[0] + "s)";

            startFTUE();
        }
    } catch (err) {
        showToast(String(err), 'error');
    }
}

//Popup thông báo kết quả lượt chơi (Bước 5: confetti khi thắng)
function popupResult(isWon) {
    changeStatus();

    if (isWon) {
        launchConfetti();
        document.getElementById("result-title").innerHTML = "🎉 GIẢI MÃ THÀNH CÔNG!";
        document.getElementById("result-title").style.color = "var(--color-success)";
        document.getElementById("result-content").innerHTML = "Xin chúc mừng! Bạn đã hoàn thành hóa giải mật mã.";
        document.getElementById("close-popup").innerHTML = "Tuyệt! 🚀";
        document.getElementById("close-popup").style.background = "linear-gradient(135deg, var(--color-success), var(--color-success-dark))";
    } else {
        document.getElementById("result-title").innerHTML = "😞 GIẢI MÃ THẤT BẠI";
        document.getElementById("result-title").style.color = "var(--color-danger)";
        document.getElementById("result-content").innerHTML = "Rất tiếc, mật mã đã không thể bị hóa giải. Chúc bạn may mắn lần sau!";
        document.getElementById("close-popup").innerHTML = "Thử lại! 💪";
        document.getElementById("close-popup").style.background = "linear-gradient(135deg, var(--color-danger), var(--color-danger-dark))";
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

    // Bước 3: dùng CSS class thay inline style
    document.getElementById("tab1").classList.remove('tab-active');
    document.getElementById("tab2").classList.remove('tab-active');
    document.getElementById("tab3").classList.remove('tab-active');
    document.getElementById("tab1").style.backgroundColor = "";
    document.getElementById("tab2").style.backgroundColor = "";
    document.getElementById("tab3").style.backgroundColor = "";
    document.getElementById("tab1").style.color = "";
    document.getElementById("tab2").style.color = "";
    document.getElementById("tab3").style.color = "";
}


//bộ đếm thời gian (Bước 5: cập nhật timer bar)
function startCountDown() {
    timer = setInterval(() => {
        numOfSecondLeft--;
        document.getElementById("timer").innerHTML = "🕑 " + numOfSecondLeft + "s";
        updateTimerBar();

        if (numOfSecondLeft <= 0) {
            popupResult(false)
        }
    }, 1000);
}

function endCountDown() {
    clearInterval(timer);
    timer = null;
    numOfSecondLeft = timesForEachPlay;
    document.getElementById("timer").innerHTML = "🕑 " + numOfSecondLeft + "s";
    document.getElementById('timer').classList.remove('timer-warning', 'timer-danger');
    const bar = document.getElementById('timer-bar');
    if (bar) { bar.style.width = '100%'; bar.classList.remove('warning', 'danger'); }
}

//Trừ thời gian cho mỗi lần dùng công cụ (Bước 5: cập nhật timer bar)
function pricePay(cost) {
    if (isFTUEActive) return;

    if (numOfSecondLeft < cost) {
        throw "Bạn không còn đủ thời gian để sử dụng công cụ này.";
    }

    numOfSecondLeft -= cost;
    document.getElementById("timer").innerHTML = "🕑 " + numOfSecondLeft + "s";
    updateTimerBar();
}

function changeIntro1Status() {
    if (isFTUEActive) return;
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
    if (isFTUEActive) return;
    if (isCheckPropertiesIntroDisplay) {
        document.getElementById("check-properties-intro").style.display = "none";
        document.getElementById("tool-intro2").innerHTML = "?";
    } else {
        document.getElementById("check-properties-intro").style.display = "block";
        document.getElementById("tool-intro2").innerHTML = "&#10006";
    }

    isCheckPropertiesIntroDisplay = !isCheckPropertiesIntroDisplay;
}

function changeIntro3Status() {
    if (isFTUEActive) return;
    if (isMatchCodeIntroDisplay) {
        document.getElementById("match-code-intro").style.display = "none";
        document.getElementById("tool-intro3").innerHTML = "?";
    } else {
        document.getElementById("match-code-intro").style.display = "block";
        document.getElementById("tool-intro3").innerHTML = "&#10006";
    }

    isMatchCodeIntroDisplay = !isMatchCodeIntroDisplay;
}

function openIntroPopup() {
    if (isFTUEActive) return;
    document.getElementById("all-screen").style.display = "block";
    document.getElementById("intro-popup").style.display = "block";
    document.getElementById("intro-popup-content").scrollTop = 0;
}

function closeIntroPopup() {
    document.getElementById("all-screen").style.display = "none";
    document.getElementById("intro-popup").style.display = "none";
}

function openAvailableNumberIntroPopup() {
    if (isFTUEActive) return;
    document.getElementById("all-screen").style.display = "block";
    document.getElementById("available-number-intro-popup").style.display = "block";
}

function closeAvailableNumberIntroPopup() {
    document.getElementById("all-screen").style.display = "none";
    document.getElementById("available-number-intro-popup").style.display = "none";
}

const FTUE_STEPS = [
    {
        target: "sub-title-merge",
        text: "Mật mã là một số trong khoảng từ 0-9999 được mã hóa thành abcd với a,b,c,d là 4 chữ số.<br><br><b>Nhiệm vụ của bạn là phải GIẢI ĐƯỢC MẬT MÃ TRONG THỜI GIAN QUY ĐỊNH</b>",
        action: "next"
    },
    {
        target: "timer-display-merge",
        text: "Đây là thanh thời gian và bộ đếm thời gian. Bạn sẽ có tổng cộng " + timesForEachPlay + " giây.",
        action: "next"
    },
    {
        target: "type-answer",
        text: "Bạn sẽ nhập mật mã trên đây.<br><br>Bạn KHÔNG ĐƯỢC PHÉP NHẬP SAI QUÁ " + maxNumOfSubmitAnswerTurn + " LẦN.",
        action: "next"
    },
    {
        target: "current-number",
        text: "Đây là tập số được dùng. Bạn chỉ được phép dùng các chữ số trong tập số này.",
        action: "next"
    },
    {
        target: "buy",
        text: "Bạn có thể mua thêm TỐI ĐA " + buyNumberCost.length + " chữ số qua công cụ này.<br><br>Mỗi lần mua bạn sẽ bị trừ một thời gian nhất định.",
        action: "next"
    },
    {
        target: "tool",
        text: "Bạn sẽ thu thập manh mối thông qua các công cụ sau.",
        action: "next"
    },
    {
        target: "compare-expression",
        text: "Đây là công cụ So sánh, bạn sẽ nhập vào một biểu thức chứa 3 chữ số trong mật mã (a, b, c, d) và một biểu thức chứa 3 chữ số trong tập số được dùng.<br><br>Hãy nhập thử và nhấn So sánh!",
        action: "waitForCompare",
        setup: function () { showSlide(1); }
    },
    {
        target: "search-box-id",
        text: "Manh mối thu thập được sẽ xuất hiện ở đây. Công cụ này sẽ cho bạn biết kết quả so sánh giữa hai biểu thức trên (>, <, hoặc =).",
        action: "next"
    },
    {
        target: "check-properties",
        text: "Đây là công cụ Ghép số, bạn sẽ nhập một số độ dài từ 2 đến 4 chữ số lấy từ các chữ số trong mật mã hoặc tập số được dùng.<br><br>Hãy nhập thử và nhấn Kiểm tra!",
        action: "waitForCheckProperties",
        setup: function () { showSlide(2); }
    },
    {
        target: "search-box-id",
        text: "Tương tự, manh mối xuất hiện ở đây. Công cụ này sẽ tập trung vào tính chất của số, cho bạn biết số vừa nhập là số chính phương, nguyên tố hay hoàn hảo.",
        action: "next"
    },
    {
        target: "match-code",
        text: "Đây là công cụ Đối chiếu, bạn sẽ nhập một số độ dài 4 chữ số lấy từ tập số được dùng.<br><br>Hãy thử nhập và ấn Đối chiếu!",
        action: "waitForMatchCode",
        setup: function () { showSlide(3); }
    },
    {
        target: "search-box-id",
        text: "Công cụ này sẽ đối chiếu số bạn vừa nhập với mật mã và cho bạn biết có bao nhiêu chữ số đúng ở đúng vị trí và bao nhiêu chữ số đúng nhưng bị sai vị trí.",
        action: "next"
    },
    {
        target: null,
        text: "Bạn đã hoàn thành phần hướng dẫn!<br><br> Bạn có thể xem lại thông tin bất cứ lúc nào bằng cách nhấn vào một trong các nút <button id=\"help-button\">?</button><br><br> Chúc bạn may mắn!",
        action: "finish"
    }
];

function startFTUE() {
    closeIntroPopup();
    closeAvailableNumberIntroPopup();

    if (isCompareExpressionIntroDisplay) {
        document.getElementById("compare-expression-intro").style.display = "none";
        document.getElementById("tool-intro1").innerHTML = "?";
        isCompareExpressionIntroDisplay = false;
    }
    if (isCheckPropertiesIntroDisplay) {
        document.getElementById("check-properties-intro").style.display = "none";
        document.getElementById("tool-intro2").innerHTML = "?";
        isCheckPropertiesIntroDisplay = false;
    }
    if (isMatchCodeIntroDisplay) {
        document.getElementById("match-code-intro").style.display = "none";
        document.getElementById("tool-intro3").innerHTML = "?";
        isMatchCodeIntroDisplay = false;
    }

    isFTUEActive = true;
    currentFTUEStep = 0;
    document.body.classList.add('ftue-active');
    document.getElementById("ftue-overlay").style.display = "block";
    showFTUEStep();
}

function stopFTUE() {
    isFTUEActive = false;
    document.body.classList.remove('ftue-active');
    document.getElementById("ftue-overlay").style.display = "none";
    document.getElementById("ftue-overlay").style.clipPath = "";
    document.getElementById("ftue-tooltip").style.display = "none";

    document.querySelectorAll('.ftue-highlight').forEach(el => {
        el.classList.remove('ftue-highlight');
        el.style.backgroundColor = "";
        el.style.padding = "";
    });

    localStorage.setItem("ftueHasCompletedV1", "true");

    // FIX 1: Giữ lại manh mối thu được trong hướng dẫn, không xóa search-log.
    // Chỉ xóa các ô input công cụ và thông báo lỗi để bắt đầu màn chơi sạch.
    document.getElementById("expression1").value = "";
    document.getElementById("expression2").value = "";
    document.getElementById("num-to-check-properties").value = "";
    document.getElementById("match-input").value = "";
    document.getElementById("throw-error1").innerHTML = "";
    document.getElementById("throw-error2").innerHTML = "";
    document.getElementById("throw-error3").innerHTML = "";

    unlockScreen();
    startCountDown();
}

function showFTUEStep() {
    // Xoá highlight step tr\u01b0\u1edbc v\u00e0 reset spotlight
    document.querySelectorAll('.ftue-highlight').forEach(el => {
        el.classList.remove('ftue-highlight');
        el.style.backgroundColor = "";
        el.style.padding = "";
    });
    // Reset clip-path \u0111\u1ec3 tr\u00e1nh l\u1ed7 h\u1ed5ng c\u0169 c\u00f2n s\u00f3t khi chuy\u1ec3n b\u01b0\u1edbc
    const overlayEl = document.getElementById('ftue-overlay');
    if (overlayEl) overlayEl.style.clipPath = "";

    if (currentFTUEStep >= FTUE_STEPS.length) {
        stopFTUE();
        return;
    }

    let step = FTUE_STEPS[currentFTUEStep];
    if (step.setup) step.setup();

    let tooltip = document.getElementById("ftue-tooltip");
    let text = document.getElementById("ftue-text");
    let nextBtn = document.getElementById("ftue-next");

    text.innerHTML = step.text;

    // Bước 4: Hiển thị step counter
    const counter = document.getElementById('ftue-step-counter');
    if (counter) {
        counter.textContent = `Bước ${currentFTUEStep + 1} / ${FTUE_STEPS.length}`;
    }

    // Re-animate tooltip
    tooltip.style.animation = 'none';
    void tooltip.offsetWidth;
    tooltip.style.animation = '';

    lockScreen();

    const overlay = document.getElementById('ftue-overlay');

    if (step.target) {
        let targetEl = document.getElementById(step.target) || document.querySelector('.' + step.target);
        if (targetEl) {
            targetEl.classList.add('ftue-highlight');
            if (step.target === "sub-title-merge") {
                targetEl.style.padding = "5px";
                targetEl.style.borderRadius = "5px";
            }

            // FIX 2: Spotlight bằng clip-path — tạo "lỗ hổng" đúng vị trí target
            // trên overlay. Không dùng z-index vì backdrop-filter trên container
            // cha tạo stacking context riêng khiến z-index: 10001 không đủ.
            // Sử dụng hàm cập nhật geometry để tính lại sau khi animation kết thúc
            const updateGeometry = () => {
                if (!isFTUEActive) return;
                let rect = targetEl.getBoundingClientRect();
                const pad = 0; // khoảng đệm xung quanh element
                const W = window.innerWidth;
                const H = window.innerHeight;
                const x1 = Math.max(0, rect.left - pad).toFixed(1);
                const y1 = Math.max(0, rect.top - pad).toFixed(1);
                const x2 = Math.min(W, rect.right + pad).toFixed(1);
                const y2 = Math.min(H, rect.bottom + pad).toFixed(1);

                // Outer rectangle (clockwise) + Inner hole (counter-clockwise)
                // Với nonzero fill-rule: phần giao của 2 paths bị loại trừ → tạo lỗ hổng
                const pathStr =
                    `M 0 0 L ${W} 0 L ${W} ${H} L 0 ${H} Z ` +
                    `M ${x1} ${y1} L ${x1} ${y2} L ${x2} ${y2} L ${x2} ${y1} Z`;
                overlay.style.clipPath = `path("${pathStr}")`;

                // Positioning tooltip
                tooltip.style.display = "block";

                let tooltipHeight = tooltip.offsetHeight || 160;
                let tooltipWidth = tooltip.offsetWidth || 320;

                let tooltipTop = rect.bottom + 14;
                let tooltipLeft = rect.left + (rect.width / 2) - (tooltipWidth / 2);

                if (tooltipTop > window.innerHeight - tooltipHeight - 10) {
                    tooltipTop = rect.top - tooltipHeight - 14;
                    if (tooltipTop < 10) tooltipTop = 10;
                }
                if (tooltipLeft < 10) tooltipLeft = 10;
                if (tooltipLeft + tooltipWidth > window.innerWidth) tooltipLeft = window.innerWidth - tooltipWidth - 10;

                tooltip.style.transform = "none";
                tooltip.style.top = tooltipTop + "px";
                tooltip.style.left = tooltipLeft + "px";
            };

            updateGeometry();
            // Cập nhật lại sau khi CSS animation (ví dụ slideIn 0.25s) hoàn tất
            // setTimeout(updateGeometry, 300);
        }
    } else {
        // Không có target → overlay phủ toàn màn hình bình thường (không clip)
        overlay.style.clipPath = "";
        tooltip.style.display = "block";
        tooltip.style.top = "40%";
        tooltip.style.left = "50%";
        tooltip.style.transform = "translate(-50%, -50%)";
    }

    if (step.action === "next") {
        nextBtn.style.display = "inline-block";
        nextBtn.innerHTML = "Tiếp tục";
        nextBtn.onclick = function () {
            currentFTUEStep++;
            showFTUEStep();
        };
    } else if (step.action === "finish") {
        nextBtn.style.display = "inline-block";
        nextBtn.innerHTML = "Bắt đầu";
        nextBtn.onclick = function () {
            stopFTUE();
        };
    } else if (step.action.startsWith("waitFor")) {
        nextBtn.style.display = "none";

        if (step.action === "waitForCompare") {
            document.getElementById("expression1").disabled = false;
            document.getElementById("expression2").disabled = false;
            document.getElementById("compare").disabled = false;
            document.getElementById("compare").style.pointerEvents = "auto";
        } else if (step.action === "waitForCheckProperties") {
            document.getElementById("num-to-check-properties").disabled = false;
            document.getElementById("check-properties-button").disabled = false;
            document.getElementById("check-properties-button").style.pointerEvents = "auto";
        } else if (step.action === "waitForMatchCode") {
            document.getElementById("match-input").disabled = false;
            document.getElementById("match-code-button").disabled = false;
            document.getElementById("match-code-button").style.pointerEvents = "auto";
        }
    }
}