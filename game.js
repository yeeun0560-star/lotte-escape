/**
 * 롯데백화점 탈출하기 - 게임 로직
 * 
 * 구조:
 *  1. 지점 선택 → 2. 난이도 선택 → 3. 퍼즐 5단계 → 4. 성공/실패
 * 
 * 퍼즐 순서:
 *  B1 식품관 (레시피 순서) → 1F 화장품 (컬러 조합) →
 *  3F 패션 (코디 맞추기) → 5F 키즈 (동물 퀴즈) → 출구 (단어 맞추기)
 */

class EscapeGame {
    constructor() {
        this.currentStage = 0;
        this.totalStages = 5;
        this.timeLeft = 600;
        this.timerInterval = null;
        this.hintsLeft = 3;
        this.startTime = null;
        this.selectedBranch = null;
        this.transitioning = false;

        this.branches = [
            { id: 'jamsil', name: '잠실점', sub: '서울 송파구', icon: '🏢', image: 'images/jamsil.jpg', coupon: '잠실점 전 매장 5% 할인' },
            { id: 'bonjeom', name: '본점', sub: '서울 중구', icon: '⭐', image: 'images/bonjeom.jpg', coupon: '본점 전 매장 5% 할인' },
            { id: 'gangnam', name: '강남점', sub: '서울 강남구', icon: '💎', image: 'images/gangnam.jpg', coupon: '강남점 뷰티 15% 할인' },
            { id: 'busan', name: '부산본점', sub: '부산 부산진구', icon: '🌊', image: 'images/busan.jpg', coupon: '부산본점 전 매장 5% 할인' },
            { id: 'daejeon', name: '대전점', sub: '대전 서구', icon: '🌳', image: 'images/daejeon.jpg', coupon: '대전점 전 매장 5% 할인' },
            { id: 'gwangbok', name: '광복점', sub: '부산 중구', icon: '⛵', image: 'images/gwangbok.jpg', coupon: '광복점 패션 10% 할인' },
            { id: 'centum', name: '센텀시티점', sub: '부산 해운대구', icon: '🏖️', image: 'images/centum.jpg', coupon: '센텀시티점 전 매장 5% 할인' },
            { id: 'daegu', name: '대구점', sub: '대구 동구', icon: '🌸', image: 'images/daegu.jpg', coupon: '대구점 패션 10% 할인' },
            { id: 'gwangju', name: '광주점', sub: '광주 동구', icon: '☀️', image: 'images/gwangju.jpg', coupon: '광주점 전 매장 5% 할인' },
            { id: 'suwon', name: '수원점', sub: '경기 수원시', icon: '🏯', image: 'images/suwon.jpg', coupon: '수원점 전 매장 5% 할인' },
            { id: 'incheon', name: '인천터미널점', sub: '인천 미추홀구', icon: '✈️', image: 'images/incheon.jpg', coupon: '인천터미널점 리빙 10% 할인' },
            { id: 'dongtan', name: '동탄점', sub: '경기 화성시', icon: '🏙️', image: 'images/dongtan.jpg', coupon: '동탄점 전 매장 5% 할인' },
        ];

        this.stageImages = [
            'images/stage1.jpg',
            'images/stage2.jpg',
            'images/stage3.jpg',
            'images/stage4.jpg',
            'images/stage5.jpg'
        ];

        this.stages = [
            { floor: 'B1', name: '식품관', title: '🍳 셰프의 레시피를 완성하세요!', description: '롯데문화센터에서 배운 레시피를 떠올려\n식품관에서 재료를 준비하고, 요리해보세요!\n(올바른 조리 순서대로 정렬하세요.)' },
            { floor: '1F', name: '화장품', title: '💄 뷰티 전문관 오픈!', description: '신상 립스틱의 시그니처 컬러를 조합하세요.\n3가지 색상을 올바른 순서로 선택하면 됩니다!' },
            { floor: '3F', name: '패션', title: '👔 남성복 브랜드 \'테일던\' 1호 매장 오픈!', description: 'VIP 고객의 스타일링을 완성해주세요.\n어울리는 아이템 3개를 골라주세요!' },
            { floor: '5F', name: '키즈', title: '🧸 킨더유니버스 탈출!', description: '킨더유니버스 친구들을 만나보세요!\n사진과 설명을 보고 이름을 맞춰주세요.' },
            { floor: '출구', name: '탈출!', title: '🚪 최종 탈출 암호!', description: '마지막 관문! 탈출 암호를 맞추면 백화점을 빠져나갈 수 있습니다.' }
        ];

        this.hints = [
            '조리 순서를 생각해보세요: 준비 → 가열 → 조리 → 마무리',
            '꽃 이름이 붙은 색 → 과일 이름이 붙은 색 → 순수한 색상 이름',
            '비즈니스 캐주얼은 격식과 편안함의 조화! 정장 구성 요소를 떠올려보세요.',
            '이미지에 답이 있어요~',
            '지금 여러분이 있는 곳의 이름이에요!'
        ];

        this.init();
    }

    // ===== 초기화 =====
    init() {
        this.renderBranchList();

        document.querySelectorAll('.btn-difficulty').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.timeLeft = parseInt(e.target.dataset.time);
                this.startGame();
            });
        });

        document.getElementById('hint-btn').addEventListener('click', () => this.showHint());
        document.getElementById('btn-back-branch').addEventListener('click', () => this.showScreen('branch-screen'));
        document.getElementById('btn-restart').addEventListener('click', () => this.resetGame());
        document.getElementById('btn-retry').addEventListener('click', () => this.resetGame());
        document.getElementById('btn-share').addEventListener('click', () => this.shareResult());
    }

    // ===== 화면 전환 =====
    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById(screenId).classList.add('active');
    }

    // ===== 지점 선택 =====
    renderBranchList() {
        const container = document.getElementById('branch-list');
        container.innerHTML = this.branches.map(branch => `
            <button class="branch-btn" data-branch-id="${branch.id}">
                <div class="branch-info">
                    <div class="branch-name">${branch.icon} ${branch.name}</div>
                    <div class="branch-sub">${branch.sub}</div>
                </div>
            </button>
        `).join('');

        container.querySelectorAll('.branch-btn').forEach(btn => {
            btn.addEventListener('click', () => this.selectBranch(btn.dataset.branchId));
        });
    }

    selectBranch(branchId) {
        this.selectedBranch = this.branches.find(b => b.id === branchId);

        document.getElementById('branch-image').src = this.selectedBranch.image;
        document.getElementById('branch-image').alt = this.selectedBranch.name;
        document.getElementById('start-subtitle').innerHTML =
            `<strong>${this.selectedBranch.name}</strong>의 폐점 시간이 지났습니다!<br>` +
            `5개 층의 퍼즐을 풀고 백화점을 탈출하세요!<br>` +
            `<span style="font-size:13px; color:#aaa; margin-top:8px; display:inline-block;">🕐 영업시간 10:30 ~ 20:00</span>`;

        this.showScreen('start-screen');
    }

    // ===== 게임 시작 / 타이머 =====
    startGame() {
        this.startTime = Date.now();
        this.transitioning = false;
        this.showScreen('game-screen');
        this.updateProgressBar();
        this.loadPuzzle();
        this.startTimer();
    }

    startTimer() {
        this.updateTimerDisplay();
        this.timerInterval = setInterval(() => {
            this.timeLeft--;
            this.updateTimerDisplay();
            if (this.timeLeft <= 60) document.getElementById('timer').classList.add('warning');
            if (this.timeLeft <= 0) this.gameOver();
        }, 1000);
    }

    updateTimerDisplay() {
        const m = Math.floor(this.timeLeft / 60);
        const s = this.timeLeft % 60;
        document.getElementById('timer').textContent = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    }

    updateProgressBar() {
        document.querySelectorAll('.progress-step').forEach((step, idx) => {
            step.classList.remove('active', 'completed');
            if (idx < this.currentStage) step.classList.add('completed');
            if (idx === this.currentStage) step.classList.add('active');
        });
    }

    // ===== 퍼즐 로드 =====
    loadPuzzle() {
        const area = document.getElementById('puzzle-area');
        area.innerHTML = '';
        const stage = this.stages[this.currentStage];

        switch (this.currentStage) {
            case 0: this.loadRecipePuzzle(area, stage); break;
            case 1: this.loadColorPuzzle(area, stage); break;
            case 2: this.loadFashionPuzzle(area, stage); break;
            case 3: this.loadKidsPuzzle(area, stage); break;
            case 4: this.loadExitPuzzle(area, stage); break;
        }

        area.style.animation = 'none';
        area.offsetHeight;
        area.style.animation = 'slideIn 0.5s ease';
    }

    // ===== 퍼즐 1: 식품관 - 레시피 순서 =====
    loadRecipePuzzle(area, stage) {
        const correctOrder = ['재료 손질하기', '팬에 기름 두르기', '야채 볶기', '소스 넣기', '접시에 담기'];
        const shuffled = [...correctOrder].sort(() => Math.random() - 0.5);
        this.selectedOrder = [];

        area.innerHTML = `
            <img src="${this.stageImages[0]}" alt="식품관" class="puzzle-image">
            <h2 class="puzzle-title">${stage.title}</h2>
            <p class="puzzle-description">${stage.description}</p>
            <p style="font-size:13px; color:#aaa; margin-bottom:15px;">👆 아이템을 클릭하여 순서대로 선택하세요</p>
            <div class="puzzle-content">
                <div class="recipe-items">
                    ${shuffled.map(item => `
                        <div class="recipe-item" data-value="${item}">
                            <span class="recipe-number">-</span>
                            <span>${item}</span>
                        </div>
                    `).join('')}
                </div>
                <button class="btn-submit" id="btn-check">확인하기</button>
            </div>
        `;

        const items = area.querySelectorAll('.recipe-item');
        items.forEach(item => {
            item.addEventListener('click', () => {
                const value = item.dataset.value;
                if (item.classList.contains('selected')) {
                    item.classList.remove('selected');
                    this.selectedOrder = this.selectedOrder.filter(v => v !== value);
                } else {
                    item.classList.add('selected');
                    this.selectedOrder.push(value);
                }
                items.forEach(i => {
                    const idx = this.selectedOrder.indexOf(i.dataset.value);
                    i.querySelector('.recipe-number').textContent = idx >= 0 ? idx + 1 : '-';
                });
            });
        });

        document.getElementById('btn-check').addEventListener('click', () => {
            if (JSON.stringify(this.selectedOrder) === JSON.stringify(correctOrder)) {
                this.stageClear();
            } else {
                this.showFeedback(false);
                this.selectedOrder = [];
                items.forEach(i => { i.classList.remove('selected'); i.querySelector('.recipe-number').textContent = '-'; });
            }
        });
    }

    // ===== 퍼즐 2: 화장품 - 컬러 조합 =====
    loadColorPuzzle(area, stage) {
        const colors = [
            { name: '로즈', color: '#e91e63' },
            { name: '코랄', color: '#ff7043' },
            { name: '베리', color: '#9c27b0' },
            { name: '누드', color: '#d4a574' },
            { name: '레드', color: '#f44336' },
            { name: '피치', color: '#ffab91' },
            { name: '플럼', color: '#6a1b9a' },
            { name: '브릭', color: '#bf360c' }
        ];
        this.colorAnswer = ['로즈', '베리', '레드'];
        this.colorSelected = [];

        area.innerHTML = `
            <img src="${this.stageImages[1]}" alt="화장품 매장" class="puzzle-image">
            <h2 class="puzzle-title">${stage.title}</h2>
            <p class="puzzle-description">${stage.description}</p>
            <div class="puzzle-content">
                <p style="font-size:14px; color:#aaa; margin-bottom:10px;">목표 조합: 🌹 + 🫐 + ❤️</p>
                <p style="font-size:13px; color:#aaa; margin-bottom:15px;">해당하는 색상을 순서대로 3개 선택하세요</p>
                <div class="color-grid">
                    ${colors.map(c => `<div class="color-btn" data-name="${c.name}" style="background:${c.color};" title="${c.name}"></div>`).join('')}
                </div>
                <div style="margin-top:15px; display:flex; gap:10px; flex-wrap:wrap; justify-content:center;" id="color-selected-display"></div>
                <button class="btn-submit" id="btn-check">확인하기</button>
            </div>
        `;

        area.querySelectorAll('.color-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const name = btn.dataset.name;
                if (btn.classList.contains('selected')) {
                    btn.classList.remove('selected');
                    this.colorSelected = this.colorSelected.filter(n => n !== name);
                } else if (this.colorSelected.length < 3) {
                    btn.classList.add('selected');
                    this.colorSelected.push(name);
                }
                document.getElementById('color-selected-display').innerHTML = this.colorSelected.map(n =>
                    `<span style="background:rgba(255,255,255,0.1);padding:5px 12px;border-radius:20px;font-size:13px;">${n}</span>`
                ).join('');
            });
        });

        document.getElementById('btn-check').addEventListener('click', () => {
            if (JSON.stringify(this.colorSelected) === JSON.stringify(this.colorAnswer)) {
                this.stageClear();
            } else {
                this.showFeedback(false);
                this.colorSelected = [];
                area.querySelectorAll('.color-btn').forEach(b => b.classList.remove('selected'));
                document.getElementById('color-selected-display').innerHTML = '';
            }
        });
    }

    // ===== 퍼즐 3: 패션 - 코디 맞추기 =====
    loadFashionPuzzle(area, stage) {
        const items = [
            { emoji: '👔', name: '셔츠', correct: true },
            { emoji: '👖', name: '슬랙스', correct: true },
            { emoji: '👞', name: '로퍼', correct: true },
            { emoji: '🩳', name: '반바지', correct: false },
            { emoji: '🧤', name: '장갑', correct: false },
            { emoji: '🩴', name: '슬리퍼', correct: false },
            { emoji: '🎩', name: '중절모', correct: false },
            { emoji: '🧣', name: '목도리', correct: false },
            { emoji: '👒', name: '밀짚모자', correct: false },
        ];
        const shuffled = [...items].sort(() => Math.random() - 0.5);
        const answerNames = items.filter(i => i.correct).map(i => i.name);
        this.fashionSelected = [];

        area.innerHTML = `
            <img src="${this.stageImages[2]}" alt="패션 매장" class="puzzle-image">
            <h2 class="puzzle-title">${stage.title}</h2>
            <p class="puzzle-description">${stage.description}</p>
            <p style="font-size:13px; color:var(--primary); margin-bottom:15px;">💡 테마: "비즈니스 캐주얼 룩"</p>
            <div class="puzzle-content">
                <div class="fashion-grid">
                    ${shuffled.map(item => `
                        <div class="fashion-item" data-name="${item.name}">
                            ${item.emoji}
                            <span class="fashion-item-label">${item.name}</span>
                        </div>
                    `).join('')}
                </div>
                <button class="btn-submit" id="btn-check">코디 완성!</button>
            </div>
        `;

        area.querySelectorAll('.fashion-item').forEach(item => {
            item.addEventListener('click', () => {
                const name = item.dataset.name;
                if (item.classList.contains('selected')) {
                    item.classList.remove('selected');
                    this.fashionSelected = this.fashionSelected.filter(n => n !== name);
                } else if (this.fashionSelected.length < 3) {
                    item.classList.add('selected');
                    this.fashionSelected.push(name);
                }
            });
        });

        document.getElementById('btn-check').addEventListener('click', () => {
            const isCorrect = this.fashionSelected.length === 3 &&
                this.fashionSelected.every(name => answerNames.includes(name));
            if (isCorrect) {
                this.stageClear();
            } else {
                this.showFeedback(false);
                this.fashionSelected = [];
                area.querySelectorAll('.fashion-item').forEach(i => i.classList.remove('selected'));
            }
        });
    }

    // ===== 퍼즐 4: 키즈 - 킨더유니버스 캐릭터 맞추기 =====
    loadKidsPuzzle(area, stage) {
        // 캐릭터 풀 (캐릭터별 개별 이미지 + 친근한 설명)
        const allChars = [
            { name: '소소', desc: '🌸 릴라를 쫓아다니며 도와주는 요정이에요!', img: 'images/SOSO.png?v=7' },
            { name: '스티븐', desc: '🤖 책으로 세상을 배우는 똑똑한 로봇이에요!', img: 'images/STIVEN.png?v=7' },
            { name: '루카', desc: '🎀 아무 생각 없이 사는 귀여운 요정이에요!', img: 'images/LUKA.png?v=7' },
            { name: '모가나', desc: '🌿 불안과 걱정을 먹는 이끼 친구예요!', img: 'images/MOGANA.png?v=7' },
            { name: '알롱', desc: '🧦 코가 양말로 되어 있는 패셔니스타예요!', img: 'images/ALLONG.png?v=7' },
            { name: '더스틴', desc: '🌻 모든 걸 알고 있는 척척박사 꽃이에요!', img: 'images/DUSTIN.png?v=7' },
            { name: '트트', desc: '🌳 호기심 많은 능동적인 나무 친구예요!', img: 'images/TUTU.png?v=7' },
            { name: '랄라', desc: '😄 항상 해맑고 놀기를 좋아하는 아이예요!', img: 'images/LALLA.png?v=7' },
            { name: '달리', desc: '🐶 킨더유니버스까지 따라온 강아지 친구예요!', img: 'images/DALLI.png?v=7' },
        ];

        // 3문제 랜덤 선택
        this.kidsQuiz = [...allChars].sort(() => Math.random() - 0.5).slice(0, 3);
        this.kidsAllNames = allChars.map(c => c.name);
        this.currentQuizIndex = 0;

        const first = this.kidsQuiz[0];
        area.innerHTML = `
            <h2 class="puzzle-title">${stage.title}</h2>
            <p class="puzzle-description">${stage.description}</p>
            <div class="puzzle-content">
                <div class="kids-quiz">
                    <div class="kids-char-card">
                        <img id="kids-char-img" src="${first.img}" alt="캐릭터">
                    </div>
                    <div class="kids-desc" id="kids-desc">${first.desc}</div>
                    <p class="kids-question">이 캐릭터의 이름은 뭘까요? <span id="kids-progress">(1/3)</span></p>
                    <div class="kids-choices" id="kids-choices"></div>
                </div>
            </div>
        `;

        this.renderKidsChoices();
    }

    renderKidsChoices() {
        const quiz = this.kidsQuiz;
        const current = quiz[this.currentQuizIndex];

        // 정답 + 랜덤 오답 3개
        let choices = [current.name];
        const others = this.kidsAllNames.filter(n => n !== current.name);
        while (choices.length < 4) {
            const rand = others[Math.floor(Math.random() * others.length)];
            if (!choices.includes(rand)) choices.push(rand);
        }
        choices.sort(() => Math.random() - 0.5);

        const el = document.getElementById('kids-choices');
        el.innerHTML = choices.map(c => `<button class="kids-choice-btn">${c}</button>`).join('');

        el.querySelectorAll('.kids-choice-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (btn.textContent === current.name) {
                    // 정답
                    this.showFeedback(true);
                    this.currentQuizIndex++;
                    setTimeout(() => {
                        if (this.currentQuizIndex >= quiz.length) {
                            this.stageClear();
                        } else {
                            const next = quiz[this.currentQuizIndex];
                            document.getElementById('kids-char-img').src = next.img;
                            document.getElementById('kids-desc').textContent = next.desc;
                            document.getElementById('kids-progress').textContent = `(${this.currentQuizIndex + 1}/3)`;
                            this.renderKidsChoices();
                        }
                    }, 800);
                } else {
                    // 오답 - 같은 문제 다시
                    this.showFeedback(false);
                }
            });
        });
    }

    // ===== 퍼즐 5: 출구 - 단어 맞추기 =====
    loadExitPuzzle(area, stage) {
        this.exitAnswer = '롯데백화점';
        this.exitInput = [];
        const letters = '롯데백화점쇼핑몰라인마트'.split('');
        const shuffled = [...letters].sort(() => Math.random() - 0.5);

        area.innerHTML = `
            <img src="${this.stageImages[4]}" alt="출구" class="puzzle-image">
            <h2 class="puzzle-title">${stage.title}</h2>
            <p class="puzzle-description">${stage.description}</p>
            <div class="puzzle-content exit-puzzle">
                <div class="password-clue">
                    <p>🔍 <strong>최종 단서:</strong></p>
                    <p>• 이 건물의 이름은 무엇일까요?</p>
                    <p>• 5글자입니다</p>
                </div>
                <div class="word-slots" id="word-slots">
                    ${this.exitAnswer.split('').map(() => '<div class="word-slot"></div>').join('')}
                </div>
                <div class="letter-choices" id="letter-choices">
                    ${shuffled.map(l => `<button class="letter-btn" data-letter="${l}">${l}</button>`).join('')}
                </div>
                <button class="btn-submit" id="btn-reset-word" style="background:rgba(255,255,255,0.1);box-shadow:none;color:#fff;margin-top:15px;font-size:14px;padding:10px 20px;">다시 입력</button>
            </div>
        `;

        area.querySelectorAll('.letter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (btn.classList.contains('used') || this.exitInput.length >= this.exitAnswer.length) return;
                btn.classList.add('used');
                this.exitInput.push(btn.dataset.letter);
                this.updateWordSlots();

                if (this.exitInput.length === this.exitAnswer.length) {
                    setTimeout(() => {
                        if (this.exitInput.join('') === this.exitAnswer) {
                            this.stageClear();
                        } else {
                            this.showFeedback(false);
                            this.resetWordPuzzle();
                        }
                    }, 500);
                }
            });
        });

        document.getElementById('btn-reset-word').addEventListener('click', () => this.resetWordPuzzle());
    }

    resetWordPuzzle() {
        this.exitInput = [];
        document.querySelectorAll('.letter-btn').forEach(b => b.classList.remove('used'));
        this.updateWordSlots();
    }

    updateWordSlots() {
        document.querySelectorAll('#word-slots .word-slot').forEach((slot, idx) => {
            slot.textContent = idx < this.exitInput.length ? this.exitInput[idx] : '';
            slot.classList.toggle('filled', idx < this.exitInput.length);
        });
    }

    // ===== 공통: 힌트 =====
    showHint() {
        if (this.hintsLeft <= 0) return;
        this.hintsLeft--;
        document.getElementById('hint-count').textContent = this.hintsLeft;
        if (this.hintsLeft <= 0) document.getElementById('hint-btn').disabled = true;

        const modal = document.createElement('div');
        modal.className = 'hint-modal';
        modal.innerHTML = `
            <div class="hint-box">
                <h3>💡 힌트</h3>
                <p>${this.hints[this.currentStage]}</p>
                <button class="hint-close">확인</button>
            </div>
        `;
        document.body.appendChild(modal);
        modal.querySelector('.hint-close').addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
    }

    // ===== 공통: 스테이지 클리어 =====
    stageClear() {
        if (this.transitioning) return;
        this.transitioning = true;
        this.showFeedback(true);
        setTimeout(() => {
            this.currentStage++;
            if (this.currentStage >= this.totalStages) {
                this.gameWin();
            } else {
                this.updateProgressBar();
                this.loadPuzzle();
            }
            this.transitioning = false;
        }, 1200);
    }

    // ===== 공통: 피드백 =====
    showFeedback(isCorrect) {
        const el = document.createElement('div');
        el.className = `feedback ${isCorrect ? 'correct' : 'wrong'}`;
        el.textContent = isCorrect ? '✅ 정답!' : '❌ 다시 시도해보세요!';
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 1500);
    }

    // ===== 게임 승리 =====
    gameWin() {
        clearInterval(this.timerInterval);
        const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
        document.getElementById('clear-time').textContent = `${Math.floor(elapsed / 60)}분 ${elapsed % 60}초`;

        const branch = this.selectedBranch;
        document.getElementById('coupon-desc').innerHTML = branch.coupon;
        document.getElementById('coupon-branch').textContent = `📍 ${branch.name}`;
        document.getElementById('coupon-code').textContent =
            `LOTTE-${branch.id.toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

        this.showScreen('success-screen');
        this.createConfetti();
    }

    // ===== 게임 오버 =====
    gameOver() {
        clearInterval(this.timerInterval);
        const floorNames = ['B1 식품관', '1F 화장품', '3F 패션', '5F 키즈', '출구'];
        document.getElementById('fail-floor-text').textContent = floorNames[this.currentStage];
        this.showScreen('fail-screen');
    }

    // ===== 게임 리셋 =====
    resetGame() {
        clearInterval(this.timerInterval);
        this.currentStage = 0;
        this.hintsLeft = 3;
        this.selectedBranch = null;
        document.getElementById('hint-count').textContent = '3';
        document.getElementById('hint-btn').disabled = false;
        document.getElementById('timer').classList.remove('warning');
        this.showScreen('branch-screen');
    }

    // ===== 결과 공유 =====
    shareResult() {
        const time = document.getElementById('clear-time').textContent;
        const text = `🎉 롯데백화점 탈출 성공! ⏱️ ${time}\n나도 도전해보세요! #롯데백화점탈출`;
        if (navigator.share) {
            navigator.share({ title: '롯데백화점 탈출하기', text });
        } else {
            navigator.clipboard.writeText(text).then(() => alert('결과가 클립보드에 복사되었습니다!'));
        }
    }

    // ===== 축하 효과 =====
    createConfetti() {
        const container = document.getElementById('confetti');
        container.innerHTML = '';
        const colors = ['#c8e600', '#ffc107', '#4caf50', '#2196f3', '#e8ff4a', '#9c27b0'];
        for (let i = 0; i < 60; i++) {
            const piece = document.createElement('div');
            piece.className = 'confetti-piece';
            piece.style.left = Math.random() * 100 + '%';
            piece.style.background = colors[Math.floor(Math.random() * colors.length)];
            piece.style.animationDuration = (Math.random() * 2 + 2) + 's';
            piece.style.animationDelay = Math.random() * 2 + 's';
            piece.style.width = (Math.random() * 10 + 5) + 'px';
            piece.style.height = (Math.random() * 10 + 5) + 'px';
            piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
            container.appendChild(piece);
        }
    }
}

// 게임 시작
document.addEventListener('DOMContentLoaded', () => new EscapeGame());
