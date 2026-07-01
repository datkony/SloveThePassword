const timesForEachPlay = 600;
const compareExpressionCost = 12;
const checkPropertiesCost = 9;
const matchCodeCost = 18;
const buyNumberCost = [36, 54]; //Giá cho mỗi lần mua chữ số
const maxNumOfSubmitAnswerTurn = 3;
const numOfFreeNumbers = 4;

const letterChars = ['a', 'b', 'c', 'd'];
const mathChars = ['+', '-', '*', '(', ')'];

const TRANSLATIONS = {
    vi: {
        title: "Truy tìm mật mã",
        startIntro: "Khởi điểm: {num} chữ số",
        remainingBuy: "Còn {num} lượt",
        remainingSubmit: "Còn {num} lượt",
        timer: "🕑 {num}s",
        tab1: "SO SÁNH<br/>- {cost}s",
        tab2: "GHÉP SỐ<br/>- {cost}s",
        tab3: "ĐỐI CHIẾU<br/>- {cost}s",
        buyButton: "🛒 Mua",
        buyButtonCost: "🛒 Mua (- {cost}s)",
        confirmButton: "✔ Xác nhận",
        compareButton: "So sánh",
        checkPropertiesButton: "Kiểm tra",
        matchCodeButton: "Đối chiếu",
        expression1Placeholder: "ví dụ: a + b + c",
        expression2Placeholder: "ví dụ: {ex}",
        numToCheckPropertiesPlaceholder: "ví dụ: ab{ex}",
        matchInputPlaceholder: "ví dụ: {ex}",
        clueSquareNumber: "{input} là một số chính phương",
        cluePerfectNumber: "{input} là một số hoàn hảo",
        cluePrimeNumber: "{input} là một số nguyên tố",
        clueNoneNumber: "{input} đều không phải số chính phương, hoàn hảo hay số nguyên tố",
        clueMatchResult: "{input}: {rightPos} chữ số đúng và ở đúng vị trí, {wrongPos} chữ số đúng nhưng ở sai vị trí.",
        errorTitle: "Không hợp lệ! ",
        errorEval: "Không thể thực hiện tính toán các biểu thức vừa nhập.",
        errorExp1Merge: "Không được ghép bất kỳ hai chữ số trở nên nào ở biểu thức 1 để tạo thành số mới.",
        errorExp1Once: "Các chữ số ở mật mã chỉ được sử dụng duy nhất một lần ở biểu thức 1.",
        errorExp1Chars: "Chỉ được sử dụng các dấu +, -, *, () và các chữ số a, b, c, d ở mật mã để nhập biểu thức 1.",
        errorExpDigits: "Mọi biểu thức đều phải dùng 3 chữ số.",
        errorExp2Merge: "Không được ghép bất kỳ hai chữ số trở nên nào ở biểu thức 2 để tạo thành số mới.",
        errorExp2Available: "Chỉ được sử dụng các chữ số từ tập số được dùng và mỗi vị trí trong tập chỉ được sử dụng một lần ở biểu thức 2.",
        errorExp2Chars: "Chỉ được sử dụng các dấu +, -, *, () và các chữ số ở tập số được dùng để nhập biểu thức 2.",
        errorExpDiff: "Số lượng từng loại dấu (kể cả dấu ngoặc) và thứ tự các dấu ở hai biểu thức phải giống hệt nhau.",
        errorPropsDigits: "Số được nhập phải có từ 2 đến 4 chữ số.",
        errorPropsOnce: "Các chữ số ở mật mã chỉ được sử dụng duy nhất một lần.",
        errorPropsAvailable: "Chỉ được sử dụng các chữ số từ mật mã hoặc tập số được dùng và mỗi vị trí chỉ được sử dụng một lần.",
        errorPropsMinLetters: "Phải sử dụng ít nhất hai chữ số từ mật mã.",
        errorMatchDigits: "Số nhập vào phải có đúng 4 chữ số.",
        errorMatchNotDigits: "Không được sử dụng các ký tự không phải là các chữ số.",
        errorMatchAvailable: "Chỉ được sử dụng các chữ số từ tập số được dùng và mỗi vị trí chỉ được sử dụng một lần.",
        errorNoTime: "Bạn không còn đủ thời gian để sử dụng công cụ này.",
        errorSubmitInvalid: "Không hợp lệ. Mật mã phải nằm trong đoạn từ 0 đến 9999!",
        errorSubmitIncorrect: "Mật mã không chính xác. Mời thử lại!",
        successTitle: "🎉 GIẢI MÃ THÀNH CÔNG!",
        successContent: "Xin chúc mừng! Bạn đã hoàn thành hóa giải mật mã.",
        successButton: "Tuyệt! 🚀",
        failTitle: ":( GIẢI MÃ THẤT BẠI",
        failContent: "Rất tiếc, mật mã đã không thể bị hóa giải. Chúc bạn may mắn lần sau!",
        failButton: "Thử lại! 💪",
        helpTitleIntro: "Hướng dẫn chơi",
        helpTitleAvailable: "Tập số được dùng là gì?",
        helpButtonClose: "&#10006",
        ftueStepCounter: "Bước {current} / {total}",
        ftueNext: "Tiếp tục",
        ftueStart: "Bắt đầu",
        introContentText: "🔍 Hãy chọn một công cụ để<br>thu thập manh mối!",
        ftueStep1: "Mật mã là một số trong khoảng từ <i>0-9999</i> được mã hóa thành <b>abcd</b> với a,b,c,d là 4 chữ số.<br><br><b>Nhiệm vụ của bạn là phải GIẢI ĐƯỢC MẬT MÃ TRONG THỜI GIAN QUY ĐỊNH</b>",
        ftueStep2: "Đây là thanh thời gian và bộ đếm thời gian. Bạn sẽ có tổng cộng {times} giây.",
        ftueStep3: "Bạn sẽ nhập mật mã trên đây.<br><br>Bạn KHÔNG ĐƯỢC PHÉP NHẬP SAI {maxTurns} LẦN.",
        ftueStep4: "Đây là tập số được dùng. Bạn chỉ được phép dùng các chữ số trong tập số này.<br><br>Trong mỗi lượt sử dụng, bạn KHÔNG ĐƯỢC PHÉP DÙNG BẤT KỲ CHỮ SỐ NÀO LẶP LẠI QUÁ SỐ LẦN XUẤT HIỆN CỦA NÓ.",
        ftueStep5: "Bạn có thể mua thêm TỐI ĐA {maxBuy} chữ số qua công cụ này.<br><br>Mỗi lần mua bạn sẽ bị trừ một lượng thời gian nhất định.",
        ftueStep6: "Bạn sẽ thu thập manh mối thông qua các công cụ sau.<br><br>Mỗi lượt sử dụng bạn cũng sẽ bị trừ một lượng thời gian nhất định.",
        ftueStep7: "Đây là công cụ So sánh, bạn sẽ nhập vào một biểu thức chứa 3 chữ số trong mật mã (a, b, c, d) và một biểu thức chứa 3 chữ số trong tập <b>số được dùng</b>.<br><br>Hãy nhập thử và nhấn So sánh!",
        ftueStep8: "Manh mối thu thập được sẽ xuất hiện ở đây. Công cụ này sẽ cho bạn biết kết quả so sánh giữa hai biểu thức trên (>, <, hoặc =).",
        ftueStep9: "Đây là công cụ Ghép số, bạn sẽ nhập một số có từ 2 đến 4 chữ số bằng các chữ số trong mật mã hoặc tập <b>số được dùng</b>.<br><br>Hãy nhập thử và nhấn Kiểm tra!",
        ftueStep10: "Tương tự, manh mối xuất hiện ở đây. Công cụ này sẽ tập trung vào tính chất của số, cho bạn biết số vừa nhập là số chính phương, nguyên tố hay hoàn hảo.",
        ftueStep11: "Đây là công cụ Đối chiếu, bạn sẽ nhập một số có 4 chữ số bằng các chữ số trong tập <b>số được dùng</b>.<br><br>Hãy thử nhập và ấn Đối chiếu!",
        ftueStep12: "Công cụ này sẽ đối chiếu số bạn vừa nhập với mật mã và cho bạn biết có bao nhiêu chữ số đúng ở đúng vị trí và bao nhiêu chữ số đúng nhưng bị sai vị trí.",
        ftueStep13: "Bạn đã hoàn thành phần hướng dẫn!<br><br> Bạn có thể xem lại thông tin bất cứ lúc nào bằng cách nhấn vào một trong các nút <button id=\"help-button\">?</button><br><br> Chúc bạn may mắn!"
    },
    en: {
        title: "Finding the Password",
        startIntro: "Start: {num} digits",
        remainingBuy: "{num} turns remaining",
        remainingSubmit: "{num} turns remaining",
        timer: "🕑 {num}s",
        tab1: "COMPARE<br/>- {cost}s",
        tab2: "PROPERTIES<br/>- {cost}s",
        tab3: "MATCH<br/>- {cost}s",
        buyButton: "🛒 Buy",
        buyButtonCost: "🛒 Buy (- {cost}s)",
        confirmButton: "✔ Confirm",
        compareButton: "Compare",
        checkPropertiesButton: "Check",
        matchCodeButton: "Match",
        expression1Placeholder: "e.g., a + b + c",
        expression2Placeholder: "e.g., {ex}",
        numToCheckPropertiesPlaceholder: "e.g., ab{ex}",
        matchInputPlaceholder: "e.g., {ex}",
        clueSquareNumber: "{input} is a perfect square number",
        cluePerfectNumber: "{input} is a perfect number",
        cluePrimeNumber: "{input} is a prime number",
        clueNoneNumber: "{input} is not a perfect square, perfect, or prime number",
        clueMatchResult: "{input}: {rightPos} correct digits in correct position, {wrongPos} correct digits but in wrong position.",
        errorTitle: "Invalid! ",
        errorEval: "Could not calculate the entered expressions.",
        errorExp1Merge: "Do not combine any two or more digits in Expression 1 to form a new number.",
        errorExp1Once: "The password digits can only be used once in Expression 1.",
        errorExp1Chars: "Only use signs +, -, *, () and the password digits a, b, c, d in Expression 1.",
        errorExpDigits: "Every expression must use exactly 3 digits.",
        errorExp2Merge: "Do not combine any two or more digits in Expression 2 to form a new number.",
        errorExp2Available: "Only use digits from the available numbers pool and each position in the pool can only be used once in Expression 2.",
        errorExp2Chars: "Only use signs +, -, *, () and digits from the available numbers pool in Expression 2.",
        errorExpDiff: "The quantity of each sign type (including parentheses) and the order of the signs in both expressions must be identical.",
        errorPropsDigits: "The entered number must have between 2 and 4 digits.",
        errorPropsOnce: "The password digits can only be used once.",
        errorPropsAvailable: "Only use digits from the password or the available numbers pool and each position can only be used once.",
        errorPropsMinLetters: "At least two digits from the password must be used.",
        errorMatchDigits: "The entered number must have exactly 4 digits.",
        errorMatchNotDigits: "Do not use characters other than digits.",
        errorMatchAvailable: "Only use digits from the available numbers pool and each position can only be used once.",
        errorNoTime: "You do not have enough time to use this tool.",
        errorSubmitInvalid: "Invalid. The password must be between 0 and 9999!",
        errorSubmitIncorrect: "Incorrect password. Please try again!",
        successTitle: "🎉 SUCCESSFULLY SOLVED!",
        successContent: "Congratulations! You have successfully deciphered the password.",
        successButton: "Awesome! 🚀",
        failTitle: ":( SOLVING FAILED",
        failContent: "Unfortunately, the password could not be deciphered. Better luck next time!",
        failButton: "Try again! 💪",
        helpTitleIntro: "How to Play",
        helpTitleAvailable: "What is the available numbers pool?",
        helpButtonClose: "&#10006",
        ftueStepCounter: "Step {current} / {total}",
        ftueNext: "Next",
        ftueStart: "Start",
        introContentText: "🔍 Choose a tool to<br>gather clues!",
        ftueStep1: "The password is a number between <i>0-9999</i> encoded as <b>abcd</b> where a,b,c,d are 4 digits.<br><br><b>Your mission is to DECIPHER THE PASSWORD WITHIN THE TIME LIMIT</b>",
        ftueStep2: "This is the timer bar and timer display. You will have a total of {times} seconds.",
        ftueStep3: "You will enter the password here.<br><br>You ARE NOT ALLOWED TO FAIL {maxTurns} TIMES.",
        ftueStep4: "This is the available numbers pool. You are only allowed to use digits from this pool.<br><br>In each turn using a tool, you CANNOT REPEAT ANY DIGIT MORE THAN THE NUMBER OF TIMES IT APPEARS.",
        ftueStep5: "You can buy at most {maxBuy} extra digits using this tool.<br><br>Each purchase will deduct a certain amount of time.",
        ftueStep6: "You will gather clues using the following tools.<br><br>Each tool use will also deduct a certain amount of time.",
        ftueStep7: "This is the Compare tool. You will enter an expression containing 3 digits of the password (a, b, c, d) and an expression containing 3 digits from the <b>available numbers</b> pool.<br><br>Try typing one and click Compare!",
        ftueStep8: "The gathered clues will appear here. This tool will show you the comparison result between the two expressions above (>, <, or =).",
        ftueStep9: "This is the Properties tool. You will enter a number of 2 to 4 digits using the password digits or <b>available numbers</b> pool.<br><br>Try typing one and click Check!",
        ftueStep10: "Similarly, clues will appear here. This tool focuses on number properties, showing if the entered number is a perfect square, prime, or perfect number.",
        ftueStep11: "This is the Match tool. You will enter a 4-digit number using digits from the <b>available numbers</b> pool.<br><br>Try typing one and click Match!",
        ftueStep12: "This tool will match your entered number against the password and tell you how many digits are correct and in the correct position, and how many are correct but in the wrong position.",
        ftueStep13: "You have completed the tutorial!<br><br>You can review this information anytime by clicking one of the <button id=\"help-button\">?</button> buttons.<br><br>Good luck!"
    }
};

let timer = null; //Biến cài đặt interval để tính giờ

const cryptoJsKey = "agfawehkfgsjefygerylfgaejgaevbrjhrvbjhfghbvdzjhfrbguiegjhlaghlqjhhhh";
let encryptedSecretCode;
let availableNumbers = [];
let clueLog = [];

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

// FTUE Toggle Initialization
const ftueToggle = document.getElementById('ftue-toggle');
if (ftueToggle) {
    // Luôn mặc định là bật khi load trang theo yêu cầu
    ftueToggle.checked = true;

    // Lưu lại lựa chọn trong phiên chơi nếu người dùng thay đổi
    ftueToggle.addEventListener('change', () => {
        localStorage.setItem("showTutorialOnStart", ftueToggle.checked);
    });
}

let currentLanguage = 'vi'; // Mặc định là Tiếng Việt
const activeErrorState = {};

function setLanguage(lang) {
    currentLanguage = lang;
    document.documentElement.setAttribute('lang', lang);
    localStorage.setItem("gameLanguage", lang);
    applyTranslations();
}

function updateLangLabels() {
    const labelVi = document.getElementById('label-vi');
    const labelEn = document.getElementById('label-en');
    const langToggle = document.getElementById('language-toggle');
    if (langToggle) {
        langToggle.checked = (currentLanguage === 'en');
    }
    if (labelVi && labelEn) {
        if (currentLanguage === 'en') {
            labelEn.classList.add('active-lang');
            labelVi.classList.remove('active-lang');
        } else {
            labelVi.classList.add('active-lang');
            labelEn.classList.remove('active-lang');
        }
    }
}

function getErrorText(errorKey, includeTitle = true) {
    const t = TRANSLATIONS[currentLanguage];
    const message = t[errorKey] || String(errorKey || '');
    return includeTitle ? t.errorTitle + message : message;
}

function setErrorMessage(elementId, errorKey, includeTitle = true) {
    activeErrorState[elementId] = { errorKey, includeTitle };
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = getErrorText(errorKey, includeTitle);
    }
}

function clearErrorMessage(elementId) {
    delete activeErrorState[elementId];
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = "";
    }
}

function renderActiveErrors() {
    Object.keys(activeErrorState).forEach(elementId => {
        const state = activeErrorState[elementId];
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = getErrorText(state.errorKey, state.includeTitle);
        }
    });
}

function getFTUEStepText(index) {
    const t = TRANSLATIONS[currentLanguage];
    switch (index) {
        case 0: return t.ftueStep1;
        case 1: return t.ftueStep2.replace("{times}", timesForEachPlay);
        case 2: return t.ftueStep3.replace("{maxTurns}", maxNumOfSubmitAnswerTurn);
        case 3: return t.ftueStep4;
        case 4: return t.ftueStep5.replace("{maxBuy}", buyNumberCost.length);
        case 5: return t.ftueStep6;
        case 6: return t.ftueStep7;
        case 7: return t.ftueStep8;
        case 8: return t.ftueStep9;
        case 9: return t.ftueStep10;
        case 10: return t.ftueStep11;
        case 11: return t.ftueStep12;
        case 12: return t.ftueStep13;
        default: return "";
    }
}

function applyTranslations() {
    const t = TRANSLATIONS[currentLanguage];

    // Title
    document.title = t.title;

    // Help button title tooltips
    const openIntroPopupBtn = document.getElementById("open-intro-popup");
    if (openIntroPopupBtn) openIntroPopupBtn.setAttribute("title", t.helpTitleIntro);

    const openTimerIntroBtn = document.getElementById("open-timer-intro-popup");
    if (openTimerIntroBtn) openTimerIntroBtn.setAttribute("title", t.helpTitleAvailable);

    const ftueToggleContainer = document.getElementById("ftue-toggle-container");
    if (ftueToggleContainer) {
        ftueToggleContainer.setAttribute("title", currentLanguage === 'vi' ? "Bật/Tắt hướng dẫn người chơi mới" : "Toggle new player tutorial");
    }

    // Dynamic values
    const startIntroEl = document.getElementById("start-intro");
    if (startIntroEl) startIntroEl.innerHTML = t.startIntro.replace("{num}", numOfFreeNumbers);

    const remainingBuyEl = document.getElementById("remaining-buy");
    if (remainingBuyEl) remainingBuyEl.innerHTML = t.remainingBuy.replace("{num}", numOfBuyRemaining);

    const remainingSubmitEl = document.getElementById("remaining-submit");
    if (remainingSubmitEl) remainingSubmitEl.innerHTML = t.remainingSubmit.replace("{num}", numOfSubmitRemaining);

    const timerEl = document.getElementById("timer");
    if (timerEl) timerEl.innerHTML = "🕑 " + numOfSecondLeft + "s";

    // Tab labels
    const tab1El = document.getElementById("tab1");
    if (tab1El) tab1El.innerHTML = t.tab1.replace("{cost}", compareExpressionCost);

    const tab2El = document.getElementById("tab2");
    if (tab2El) tab2El.innerHTML = t.tab2.replace("{cost}", checkPropertiesCost);

    const tab3El = document.getElementById("tab3");
    if (tab3El) tab3El.innerHTML = t.tab3.replace("{cost}", matchCodeCost);

    // Intro Content Text
    const introContent = document.getElementById("intro-content");
    if (introContent) {
        introContent.innerHTML = t.introContentText;
    }

    // Buy button text
    const buyBtn = document.getElementById("buy-number-button");
    if (buyBtn) {
        if (isPlaying) {
            if (numOfBuyRemaining > 0) {
                let cost = buyNumberCost[buyNumberCost.length - numOfBuyRemaining];
                buyBtn.innerHTML = t.buyButtonCost.replace("{cost}", cost);
            } else {
                buyBtn.innerHTML = t.buyButton;
            }
        } else {
            buyBtn.innerHTML = t.buyButton;
        }
    }

    // Submit confirm button
    const submitBtn = document.getElementById("submit-button");
    if (submitBtn) {
        submitBtn.innerHTML = t.confirmButton;
    }

    // Available numbers placeholders
    executeReceivedAvailableNumbers();

    // Re-render clue log in active language
    renderClueLog();

    renderActiveErrors();

    // Update labels VI / EN state
    updateLangLabels();

    // Update current FTUE step if active
    if (isFTUEActive) {
        const counter = document.getElementById('ftue-step-counter');
        if (counter) {
            counter.textContent = t.ftueStepCounter.replace("{current}", currentFTUEStep + 1).replace("{total}", FTUE_STEPS.length);
        }

        const ftueText = document.getElementById("ftue-text");
        if (ftueText) {
            ftueText.innerHTML = getFTUEStepText(currentFTUEStep);
        }

        const nextBtn = document.getElementById("ftue-next");
        if (nextBtn) {
            let step = FTUE_STEPS[currentFTUEStep];
            if (step.action === "next") {
                nextBtn.innerHTML = t.ftueNext;
            } else if (step.action === "finish") {
                nextBtn.innerHTML = t.ftueStart;
            }
        }
    }
}

// Initial UI display toggles
document.getElementById("compare-expression").style.display = "none";
document.getElementById("check-properties").style.display = "none";
document.getElementById("match-code").style.display = "none";
document.getElementById("intro-content").style.display = "block";

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
    const t = TRANSLATIONS[currentLanguage];
    let message = availableNumbers.join(" ");
    const playerNumbersEl = document.getElementById("player-numbers");
    if (playerNumbersEl) playerNumbersEl.innerText = message;

    const exp1 = document.getElementById("expression1");
    if (exp1) exp1.placeholder = t.expression1Placeholder;

    const exp2 = document.getElementById("expression2");
    if (exp2) {
        let exText = message.charAt(0) + " + " + message.charAt(2) + " + " + message.charAt(4);
        exp2.placeholder = t.expression2Placeholder.replace("{ex}", exText);
    }

    const numToCheck = document.getElementById("num-to-check-properties");
    if (numToCheck) {
        let exText = message.charAt(0) + message.charAt(2);
        numToCheck.placeholder = t.numToCheckPropertiesPlaceholder.replace("{ex}", exText);
    }

    const matchInput = document.getElementById("match-input");
    if (matchInput) {
        let exText = message.charAt(0) + message.charAt(2) + message.charAt(4) + message.charAt(6);
        matchInput.placeholder = t.matchInputPlaceholder.replace("{ex}", exText);
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

        const t = TRANSLATIONS[currentLanguage];

        if (numOfBuyRemaining == 1) {
            document.getElementById("buy-number-button").innerHTML = t.buyButton;
            document.getElementById("buy-number-button").style.display = "none";
        } else {
            let buyNumberCostNext = buyNumberCost[buyNumberCost.length + 1 - numOfBuyRemaining];
            document.getElementById("buy-number-button").innerHTML = t.buyButtonCost.replace("{cost}", buyNumberCostNext);
        }

        numOfBuyRemaining--;
        addAvailableNumbers();
        document.getElementById("remaining-buy").innerHTML = t.remainingBuy.replace("{num}", numOfBuyRemaining);

        document.getElementById("player-numbers").innerText = availableNumbers.join(" ")
    } catch (err) {
        const t = TRANSLATIONS[currentLanguage];

        setErrorMessage("throw-error4", err, false);
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
            addSearchResult({ type: "compare", result: standarlizationExpression(latex1) + " &gt " + standarlizationExpression(latex2) });
        } else if (result1 < result2) {
            pricePay(compareExpressionCost);
            addSearchResult({ type: "compare", result: standarlizationExpression(latex1) + " &lt " + standarlizationExpression(latex2) });
        } else {
            pricePay(compareExpressionCost);
            addSearchResult({ type: "compare", result: standarlizationExpression(latex1) + " = " + standarlizationExpression(latex2) });
        }

        clearErrorMessage("throw-error1");

        if (isFTUEActive && FTUE_STEPS[currentFTUEStep].action === "waitForCompare") {
            currentFTUEStep++;
            setTimeout(showFTUEStep, 500);
        }
    } catch (err) {
        const t = TRANSLATIONS[currentLanguage];
        if (isEvalError) {
            err = 'errorEval';
        }
        const errText = t[err] || String(err);
        const msg = t.errorTitle + errText;
        setErrorMessage("throw-error1", err);
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
                    throw 'errorExp1Merge';
                }

                if (markLetterChars[j]) {
                    markLetterChars[j] = false;
                    mark = false;
                    counter++;
                    break;
                } else {
                    throw 'errorExp1Once';
                }
            }
        }

        if (mark && !mathChars.includes(latex1.charAt(i))) {
            throw 'errorExp1Chars';
        }
    }

    if (counter != 3) {
        throw 'errorExpDigits';
    }

    for (let i = 0; i < latex2.length; i++) {
        if (/^[0-9]$/.test(latex2.charAt(i))) {
            if (i != 0 && /^[0-9]$/.test(latex2.charAt(i - 1))) {
                throw 'errorExp2Merge';
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
                throw 'errorExp2Available';
            }
        } else if (!mathChars.includes(latex2.charAt(i))) {
            throw 'errorExp2Chars';
        } else if (i >= latex1.length || latex2.charAt(i) != latex1.charAt(i)) {
            throw 'errorExpDiff';
        }
    }

    if (counter != 0) {
        throw 'errorExpDigits';
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
            addSearchResult({ type: "properties", propertyType: "square", input });
        } else {
            let sumOfDivisior = 1;

            for (let i = 2; i < sqrt; i++) {
                if (numberExchanged % i == 0) {
                    sumOfDivisior += (i + numberExchanged / i);
                }
            }

            if (sumOfDivisior == numberExchanged) {
                pricePay(checkPropertiesCost);
                addSearchResult({ type: "properties", propertyType: "perfect", input });
            } else if (sumOfDivisior == 1) {
                pricePay(checkPropertiesCost);
                addSearchResult({ type: "properties", propertyType: "prime", input });
            } else {
                pricePay(checkPropertiesCost);
                addSearchResult({ type: "properties", propertyType: "none", input });
            }
        }

        clearErrorMessage("throw-error2");

        if (isFTUEActive && FTUE_STEPS[currentFTUEStep].action === "waitForCheckProperties") {
            currentFTUEStep++;
            setTimeout(showFTUEStep, 500);
        }
    } catch (err) {
        const t = TRANSLATIONS[currentLanguage];
        const errText = t[err] || String(err);
        const msg = t.errorTitle + errText;
        setErrorMessage("throw-error2", err);
        shakeElement("check-properties");
        showToast(msg, 'error');
    }
}

function checkNumberForProperties(input) {
    if (input.length < 2 || input.length > 4) {
        throw 'errorPropsDigits';
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
                    throw 'errorPropsOnce';
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
                throw 'errorPropsAvailable';
            }
        }
    }

    if (letterCounter < 2) {
        throw 'errorPropsMinLetters';
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
        addSearchResult({ type: "match", input: inputCode, rightPos: numberAtRightPosition, wrongPos: rightNumberButWrongPosition });
        clearErrorMessage("throw-error3");

        if (isFTUEActive && FTUE_STEPS[currentFTUEStep].action === "waitForMatchCode") {
            currentFTUEStep++;
            setTimeout(showFTUEStep, 500);
        }
    } catch (err) {
        const t = TRANSLATIONS[currentLanguage];
        const errText = t[err] || String(err);
        const msg = t.errorTitle + errText;
        setErrorMessage("throw-error3", err);
        shakeElement("match-code");
        showToast(msg, 'error');
    }
}

function checkNumberForMatchCode(input) {
    if (input.length != 4) {
        throw 'errorMatchDigits';
    }

    let markAvailableNums = [];

    for (i in availableNumbers) {
        markAvailableNums.push(true);
    }

    for (let i = 0; i < input.length; i++) {
        let mark = true;

        if (!/^[0-9]$/.test(input.charAt(i))) {
            throw 'errorMatchNotDigits';
        }

        for (let j = 0; j < availableNumbers.length; j++) {
            if (((input.charAt(i) - '0') == availableNumbers[j]) && markAvailableNums[j]) {
                markAvailableNums[j] = false;
                mark = false;
                break;
            }
        }

        if (mark) {
            throw 'errorMatchAvailable';
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
function addSearchResult(clueObj) {
    clueLog.push(clueObj);
    renderClueLog();
}

function renderClueLog() {
    const log = document.getElementById("search-log");
    if (!log) return;
    log.innerHTML = "";

    const t = TRANSLATIONS[currentLanguage];

    clueLog.forEach(clue => {
        const item = document.createElement('div');
        item.className = 'clue-item';

        let htmlContent = "";
        if (clue.type === "compare") {
            htmlContent = clue.result;
        } else if (clue.type === "properties") {
            if (clue.propertyType === 'square') {
                htmlContent = t.clueSquareNumber.replace("{input}", clue.input);
            } else if (clue.propertyType === 'perfect') {
                htmlContent = t.cluePerfectNumber.replace("{input}", clue.input);
            } else if (clue.propertyType === 'prime') {
                htmlContent = t.cluePrimeNumber.replace("{input}", clue.input);
            } else {
                htmlContent = t.clueNoneNumber.replace("{input}", clue.input);
            }
        } else if (clue.type === "match") {
            htmlContent = t.clueMatchResult
                .replace("{input}", clue.input)
                .replace("{rightPos}", clue.rightPos)
                .replace("{wrongPos}", clue.wrongPos);
        }

        item.innerHTML = htmlContent;
        log.appendChild(item);
    });

    const searchBox = document.getElementById('search-box-id');
    if (searchBox) {
        searchBox.scrollTop = searchBox.scrollHeight;
    }
}

// Submit đáp án
async function submitTheAnswer() {
    let answer = parseInt(document.getElementById("answer").value);
    const t = TRANSLATIONS[currentLanguage];

    if (!(answer >= 0 && answer <= 9999)) {
        setErrorMessage("submit-answer", "errorSubmitInvalid", false);
    } else if (answer == decryptSecretCode()) {
        popupResult(true);
    } else {
        numOfSubmitRemaining--;
        const remainingSubmitEl = document.getElementById("remaining-submit");
        const answerInput = document.getElementById("answer");

        remainingSubmitEl.innerHTML = t.remainingSubmit.replace("{num}", numOfSubmitRemaining);

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
            setErrorMessage("submit-answer", "errorSubmitIncorrect", false);
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
        const t = TRANSLATIONS[currentLanguage];
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
            document.getElementById("remaining-buy").innerHTML = t.remainingBuy.replace("{num}", numOfBuyRemaining);

            const remainingSubmitEl = document.getElementById("remaining-submit");
            remainingSubmitEl.innerHTML = t.remainingSubmit.replace("{num}", numOfSubmitRemaining);
            remainingSubmitEl.classList.remove('low-turns');

            const answerInput = document.getElementById("answer");
            answerInput.classList.remove('critical-turns');

            document.getElementById("start-intro").style.display = "block";

            document.getElementById("search-log").innerHTML = "";
            clueLog = []; // clear clueLog array
            updateTimerBar();

            lockScreen();
            document.getElementById("status").innerHTML = "&#9205";
            document.getElementById("status").style.background = "linear-gradient(135deg, var(--color-success), var(--color-success-dark))";
            document.getElementById("status").style.boxShadow = "var(--shadow-glow-success)";

            document.getElementById("buy-number-button").innerHTML = t.buyButton;
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
            document.getElementById("buy-number-button").innerHTML = t.buyButtonCost.replace("{cost}", buyNumberCost[0]);

            if (ftueToggle && ftueToggle.checked) {
                startFTUE();
            } else {
                unlockScreen();
                startCountDown();
            }
        }
    } catch (err) {
        showToast(String(err), 'error');
    }
}

//Popup thông báo kết quả lượt chơi (Bước 5: confetti khi thắng)
function popupResult(isWon) {
    changeStatus();

    const t = TRANSLATIONS[currentLanguage];

    if (isWon) {
        launchConfetti();
        document.getElementById("result-title").innerHTML = t.successTitle;
        document.getElementById("result-title").style.color = "var(--color-success)";
        document.getElementById("result-content").innerHTML = t.successContent;
        document.getElementById("close-popup").innerHTML = t.successButton;
        document.getElementById("close-popup").style.background = "linear-gradient(135deg, var(--color-success), var(--color-success-dark))";
    } else {
        document.getElementById("result-title").innerHTML = t.failTitle;
        document.getElementById("result-title").style.color = "var(--color-danger)";
        document.getElementById("result-content").innerHTML = t.failContent;
        document.getElementById("close-popup").innerHTML = t.failButton;
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

    clearErrorMessage("throw-error1");
    clearErrorMessage("throw-error2");
    clearErrorMessage("throw-error3");
    clearErrorMessage("throw-error4");
    clearErrorMessage("submit-answer");
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
        throw 'errorNoTime';
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
        target: ["sub-title-merge"],
        text: "Mật mã là một số trong khoảng từ <i>0-9999</i> được mã hóa thành <b>abcd</b> với a,b,c,d là 4 chữ số.<br><br><b>Nhiệm vụ của bạn là phải GIẢI ĐƯỢC MẬT MÃ TRONG THỜI GIAN QUY ĐỊNH</b>",
        action: "next"
    },
    {
        target: ["timer-display-merge"],
        text: "Đây là thanh thời gian và bộ đếm thời gian. Bạn sẽ có tổng cộng " + timesForEachPlay + " giây.",
        action: "next"
    },
    {
        target: ["type-answer"],
        text: "Bạn sẽ nhập mật mã trên đây.<br><br>Bạn KHÔNG ĐƯỢC PHÉP NHẬP SAI " + maxNumOfSubmitAnswerTurn + " LẦN.",
        action: "next"
    },
    {
        target: ["current-number"],
        text: "Đây là tập số được dùng. Bạn chỉ được phép dùng các chữ số trong tập số này.<br><br>Trong mỗi lượt sử dụng, bạn KHÔNG ĐƯỢC PHÉP DÙNG BẤT KỲ CHỮ SỐ NÀO LẶP LẠI QUÁ SỐ LẦN XUẤT HIỆN CỦA NÓ.",
        action: "next"
    },
    {
        target: ["buy"],
        text: "Bạn có thể mua thêm TỐI ĐA " + buyNumberCost.length + " chữ số qua công cụ này.<br><br>Mỗi lần mua bạn sẽ bị trừ một lượng thời gian nhất định.",
        action: "next"
    },
    {
        target: ["tool"],
        text: "Bạn sẽ thu thập manh mối thông qua các công cụ sau.<br><br>Mỗi lượt sử dụng bạn cũng sẽ bị trừ một lượng thời gian nhất định.",
        action: "next"
    },
    {
        target: ["compare-expression", "current-number"],
        text: "Đây là công cụ So sánh, bạn sẽ nhập vào một biểu thức chứa 3 chữ số trong mật mã (a, b, c, d) và một biểu thức chứa 3 chữ số trong tập <b>số được dùng</b>.<br><br>Hãy nhập thử và nhấn So sánh!",
        action: "waitForCompare",
        setup: function () { showSlide(1); }
    },
    {
        target: ["search-box-id"],
        text: "Manh mối thu thập được sẽ xuất hiện ở đây. Công cụ này sẽ cho bạn biết kết quả so sánh giữa hai biểu thức trên (>, <, hoặc =).",
        action: "next"
    },
    {
        target: ["check-properties", "current-number"],
        text: "Đây là công cụ Ghép số, bạn sẽ nhập một số có từ 2 đến 4 chữ số bằng các chữ số trong mật mã hoặc <b>số được dùng</b>.<br><br>Hãy nhập thử và nhấn Kiểm tra!",
        action: "waitForCheckProperties",
        setup: function () { showSlide(2); }
    },
    {
        target: ["search-box-id"],
        text: "Tương tự, manh mối xuất hiện ở đây. Công cụ này sẽ tập trung vào tính chất của số, cho bạn biết số vừa nhập là số chính phương, nguyên tố hay hoàn hảo.",
        action: "next"
    },
    {
        target: ["match-code", "current-number"],
        text: "Đây là công cụ Đối chiếu, bạn sẽ nhập một số có 4 chữ số bằng các chữ số trong tập <b>số được dùng</b>.<br><br>Hãy thử nhập và ấn Đối chiếu!",
        action: "waitForMatchCode",
        setup: function () { showSlide(3); }
    },
    {
        target: ["search-box-id"],
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

    // Auto-uncheck toggle after first completion if desired, 
    // but the user asked for control so we'll keep it as per their toggle setting.
    // If they want it hidden, they'll uncheck it.

    // FIX 1: Giữ lại manh mối thu được trong hướng dẫn, không xóa search-log.
    // Chỉ xóa các ô input công cụ và thông báo lỗi để bắt đầu màn chơi sạch.
    document.getElementById("expression1").value = "";
    document.getElementById("expression2").value = "";
    document.getElementById("num-to-check-properties").value = "";
    document.getElementById("match-input").value = "";
    clearErrorMessage("throw-error1");
    clearErrorMessage("throw-error2");
    clearErrorMessage("throw-error3");

    unlockScreen();
    startCountDown();
}

function showFTUEStep() {
    // [Giữ nguyên đoạn code reset cũ ở đầu hàm của bạn]
    document.querySelectorAll('.ftue-highlight').forEach(el => {
        el.classList.remove('ftue-highlight');
        el.style.backgroundColor = "";
        el.style.padding = "";
    });
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

    text.innerHTML = getFTUEStepText(currentFTUEStep);
    const t = TRANSLATIONS[currentLanguage];

    const counter = document.getElementById('ftue-step-counter');
    if (counter) {
        counter.textContent = t.ftueStepCounter.replace("{current}", currentFTUEStep + 1).replace("{total}", FTUE_STEPS.length);
    }

    tooltip.style.animation = 'none';
    void tooltip.offsetWidth;
    tooltip.style.animation = '';

    lockScreen();
    const overlay = document.getElementById('ftue-overlay');

    // --- ĐOẠN ĐƯỢC CẢI TIẾN ĐỂ HỖ TRỢ NHIỀU TARGETS ---
    // Kiểm tra xem target có tồn tại và có phần tử nào không
    if (step.target && Array.isArray(step.target) && step.target.length > 0) {
        let validTargets = [];

        // Duyệt qua tất cả target trong mảng để add class highlight
        step.target.forEach(targetId => {
            let targetEl = document.getElementById(targetId) || document.querySelector('.' + targetId);
            if (targetEl) {
                targetEl.classList.add('ftue-highlight');
                if (targetId === "sub-title-merge") {
                    targetEl.style.padding = "5px";
                    targetEl.style.borderRadius = "5px";
                }
                validTargets.push(targetEl); // Lưu các phần tử hợp lệ lại để tính toán hình học
            }
        });

        const updateGeometry = () => {
            if (!isFTUEActive || validTargets.length === 0) return;

            const W = window.innerWidth;
            const H = window.innerHeight;

            // Khởi tạo chuỗi path SVG cho overlay (Vẽ khung bao phủ toàn màn hình trước)
            let pathStr = `M 0 0 L ${W} 0 L ${W} ${H} L 0 ${H} Z `;

            // Vòng lặp đục các lỗ hổng cho từng target tìm được
            validTargets.forEach(targetEl => {
                let rect = targetEl.getBoundingClientRect();
                const pad = 0; 
                const x1 = Math.max(0, rect.left - pad).toFixed(1);
                const y1 = Math.max(0, rect.top - pad).toFixed(1);
                const x2 = Math.min(W, rect.right + pad).toFixed(1);
                const y2 = Math.min(H, rect.bottom + pad).toFixed(1);

                // Thêm một lỗ thủng (vẽ ngược chiều kim đồng hồ) vào chuỗi path chung
                pathStr += `M ${x1} ${y1} L ${x1} ${y2} L ${x2} ${y2} L ${x2} ${y1} Z `;
            });

            // Áp dụng thuộc tính clipPath một lần duy nhất chứa tất cả các lỗ thủng
            overlay.style.clipPath = `path("${pathStr}")`;

            // ĐỊNH VỊ TOOLTIP (Dựa vào vị trí của TARGET ĐẦU TIÊN trong mảng)
            let primaryRect = validTargets[0].getBoundingClientRect();
            tooltip.style.display = "block";
            tooltip.classList.remove('arrow-top', 'arrow-bottom');

            let tooltipHeight = tooltip.offsetHeight || 160;
            let tooltipWidth = tooltip.offsetWidth || 320;

            let tooltipTop = primaryRect.bottom + 14;
            let tooltipLeft = primaryRect.left + (primaryRect.width / 2) - (tooltipWidth / 2);

            if (tooltipTop > window.innerHeight - tooltipHeight - 10) {
                tooltipTop = primaryRect.top - tooltipHeight - 14;
                if (tooltipTop < 10) tooltipTop = 10;
            }

            if (tooltipLeft < 10) tooltipLeft = 10;
            if (tooltipLeft + tooltipWidth > window.innerWidth) tooltipLeft = window.innerWidth - tooltipWidth - 10;

            tooltip.style.transform = "none";
            tooltip.style.top = tooltipTop + "px";
            tooltip.style.left = tooltipLeft + "px";

            if (tooltipTop > primaryRect.top) {
                tooltip.classList.add('arrow-top');
            } else {
                tooltip.classList.add('arrow-bottom');
            }

            let targetCenterX = primaryRect.left + primaryRect.width / 2;
            let arrowX = targetCenterX - tooltipLeft;
            arrowX = Math.max(25, Math.min(tooltipWidth - 25, arrowX));
            tooltip.style.setProperty('--arrow-left', arrowX + 'px');
        };

        updateGeometry();
    } else {
        // Không có target nào -> Overlay phủ kín
        overlay.style.clipPath = "";
        tooltip.style.display = "block";
        tooltip.classList.remove('arrow-top', 'arrow-bottom');
        tooltip.style.top = "40%";
        tooltip.style.left = "50%";
        tooltip.style.transform = "translate(-50%, -50%)";
    }

    // [Giữ nguyên đoạn code xử lý step.action ("next", "finish", "waitFor...") ở cuối hàm của bạn]
    if (step.action === "next") {
        nextBtn.style.display = "inline-block";
        nextBtn.innerHTML = t.ftueNext;
        nextBtn.onclick = function () {
            currentFTUEStep++;
            showFTUEStep();
        };
    } else if (step.action === "finish") {
        nextBtn.style.display = "inline-block";
        nextBtn.innerHTML = t.ftueStart;
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

// Initialize language from localStorage or default to Vietnamese
const savedLang = localStorage.getItem('gameLanguage') || 'vi';
const initLanguage = () => {
    const langToggle = document.getElementById('language-toggle');
    if (langToggle) {
        langToggle.checked = (savedLang === 'en');
        langToggle.addEventListener('change', () => {
            setLanguage(langToggle.checked ? 'en' : 'vi');
        });
    }
    setLanguage(savedLang);
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLanguage);
} else {
    initLanguage();
}