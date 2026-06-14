const app = {
    data: { exams: [] },
    currentView: 'home',
    currentExamId: null,
    currentSubjectId: null,
    currentCardIndex: 0,
    showAnswer: false,

    async init() {
        await this.fetchData();
        this.showHome();
    },

    async fetchData() {
        const res = await fetch('/api/data');
        this.data = await res.json();
    },

    async saveData() {
        await fetch('/api/data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(this.data)
        });
    },

    render() {
        const main = document.getElementById('main-content');
        const breadcrumb = document.getElementById('breadcrumb');
        main.innerHTML = '';
        breadcrumb.innerHTML = '';

        if (this.currentView === 'home') {
            this.renderHome(main);
        } else if (this.currentView === 'subjects') {
            this.renderSubjects(main, breadcrumb);
        } else if (this.currentView === 'study') {
            this.renderStudy(main, breadcrumb);
        } else if (this.currentView === 'create-card') {
            this.renderCreateCard(main, breadcrumb);
        }

        // KaTeXの自動レンダリング
        if (window.renderMathInElement) {
            renderMathInElement(main, {
                delimiters: [
                    {left: "$$", right: "$$", display: true},
                    {left: "$", right: "$", display: false}
                ]
            });
        }
    },

    showHome() {
        this.currentView = 'home';
        this.currentExamId = null;
        this.currentSubjectId = null;
        this.render();
    },

    renderHome(container) {
        container.innerHTML = `
            <h2>試験一覧</h2>
            <div class="list-container">
                ${this.data.exams.map(exam => `
                    <div class="item-card">
                        <span onclick="app.showSubjects('${exam.id}')" style="flex-grow:1">${exam.name}</span>
                        <div class="button-group" style="margin-top:0">
                            <button class="secondary" onclick="app.editExam('${exam.id}')">編集</button>
                            <button class="danger" onclick="app.deleteExam('${exam.id}')">削除</button>
                        </div>
                    </div>
                `).join('')}
                <button class="secondary" onclick="app.addExam()">+ 新しい試験を追加</button>
            </div>
        `;
    },

    showSubjects(examId) {
        this.currentView = 'subjects';
        this.currentExamId = examId;
        this.render();
    },

    renderSubjects(container, breadcrumb) {
        const exam = this.data.exams.find(e => e.id === this.currentExamId);
        breadcrumb.innerHTML = `<span>${exam.name}</span>`;
        container.innerHTML = `
            <h2>教科一覧</h2>
            <div class="list-container">
                ${exam.subjects.map(subj => `
                    <div class="item-card">
                        <span onclick="app.startStudy('${subj.id}')" style="flex-grow:1">${subj.name} (${subj.cards.length} 枚)</span>
                        <div class="button-group" style="margin-top:0">
                            <button class="secondary" onclick="app.editSubject('${subj.id}')">編集</button>
                            <button class="danger" onclick="app.deleteSubject('${subj.id}')">削除</button>
                        </div>
                    </div>
                `).join('')}
                <button class="secondary" onclick="app.addSubject()">+ 新しい教科を追加</button>
            </div>
            <div class="button-group">
                <button onclick="app.showHome()">戻る</button>
            </div>
        `;
    },

    startStudy(subjectId) {
        this.currentView = 'study';
        this.currentSubjectId = subjectId;
        this.currentCardIndex = 0;
        this.showAnswer = false;
        this.render();
    },

    renderStudy(container, breadcrumb) {
        const exam = this.data.exams.find(e => e.id === this.currentExamId);
        const subj = exam.subjects.find(s => s.id === this.currentSubjectId);
        const card = subj.cards[this.currentCardIndex];

        breadcrumb.innerHTML = `<span>${exam.name} > ${subj.name}</span>`;

        if (!card) {
            container.innerHTML = `
                <div class="flashcard">
                    <div class="content">カードがありません。</div>
                    <button class="primary" onclick="app.showCreateCard()">カードを追加する</button>
                </div>
                <div class="button-group">
                    <button onclick="app.showSubjects('${this.currentExamId}')">戻る</button>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="flashcard-container">
                <div class="flashcard">
                    <div class="content">${card.question.replace(/\n/g, '<br>')}</div>
                    ${this.showAnswer ? `
                        <div class="answer-area">
                            <div class="content">${card.answer.replace(/\n/g, '<br>')}</div>
                        </div>
                    ` : ''}
                </div>
            </div>
            <div class="button-group">
                ${!this.showAnswer ? `
                    <button class="primary" onclick="app.revealAnswer()">答えを見る (Space)</button>
                ` : `
                    <button class="primary" onclick="app.nextCard()">次のカードへ (Enter)</button>
                `}
            </div>
            <div class="button-group" style="margin-top:40px">
                <button class="secondary" onclick="app.showCreateCard()">+ カードを追加</button>
                <button class="secondary" onclick="app.showEditCard()">このカードを編集</button>
                <button class="danger" onclick="app.deleteCard()">このカードを削除</button>
                <button onclick="app.showSubjects('${this.currentExamId}')">中断して戻る</button>
            </div>
            <p style="text-align:center; color:#666;">${this.currentCardIndex + 1} / ${subj.cards.length}</p>
        `;
    },

    revealAnswer() {
        this.showAnswer = true;
        this.render();
    },

    nextCard() {
        const exam = this.data.exams.find(e => e.id === this.currentExamId);
        const subj = exam.subjects.find(s => s.id === this.currentSubjectId);

        this.currentCardIndex++;
        if (this.currentCardIndex >= subj.cards.length) {
            alert('全カードが終了しました！');
            this.showSubjects(this.currentExamId);
        } else {
            this.showAnswer = false;
            this.render();
        }
    },

    showCreateCard() {
        this.currentView = 'create-card';
        this.isEditingCard = false;
        this.render();
    },

    showEditCard() {
        this.currentView = 'create-card';
        this.isEditingCard = true;
        this.render();
    },

    renderCreateCard(container, breadcrumb) {
        const exam = this.data.exams.find(e => e.id === this.currentExamId);
        const subj = exam.subjects.find(s => s.id === this.currentSubjectId);
        const card = this.isEditingCard ? subj.cards[this.currentCardIndex] : null;

        breadcrumb.innerHTML = `<span>${exam.name} > ${subj.name} > ${this.isEditingCard ? 'カード編集' : '新規カード'}</span>`;

        container.innerHTML = `
            <div class="form-container">
                <h2>${this.isEditingCard ? 'カードを編集' : '新しいカードを追加'}</h2>
                <div class="form-group">
                    <label>問題 (LaTeX可)</label>
                    <textarea id="card-q" placeholder="例: $E = mc^2$">${card ? card.question : ''}</textarea>
                </div>
                <div class="form-group">
                    <label>答え・解説 (LaTeX可)</label>
                    <textarea id="card-a">${card ? card.answer : ''}</textarea>
                </div>
                <div class="button-group">
                    <button class="primary" onclick="app.submitCard()">${this.isEditingCard ? '更新' : '保存'}</button>
                    <button onclick="app.startStudy('${this.currentSubjectId}')">キャンセル</button>
                </div>
            </div>
        `;
    },

    async submitCard() {
        const q = document.getElementById('card-q').value;
        const a = document.getElementById('card-a').value;
        if (!q || !a) return alert('入力してください');

        const exam = this.data.exams.find(e => e.id === this.currentExamId);
        const subj = exam.subjects.find(s => s.id === this.currentSubjectId);

        if (this.isEditingCard) {
            const card = subj.cards[this.currentCardIndex];
            card.question = q;
            card.answer = a;
        } else {
            subj.cards.push({
                id: 'card-' + Date.now(),
                question: q,
                answer: a
            });
        }

        await this.saveData();
        this.startStudy(this.currentSubjectId);
    },

    async deleteCard() {
        if (!confirm('このカードを削除してもよろしいですか？')) return;
        const exam = this.data.exams.find(e => e.id === this.currentExamId);
        const subj = exam.subjects.find(s => s.id === this.currentSubjectId);
        
        subj.cards.splice(this.currentCardIndex, 1);
        await this.saveData();

        if (subj.cards.length === 0) {
            this.showSubjects(this.currentExamId);
        } else {
            if (this.currentCardIndex >= subj.cards.length) {
                this.currentCardIndex = subj.cards.length - 1;
            }
            this.showAnswer = false;
            this.render();
        }
    },

    async addExam() {
        const name = prompt('試験名を入力してください');
        if (!name) return;
        this.data.exams.push({
            id: 'exam-' + Date.now(),
            name: name,
            subjects: []
        });
        await this.saveData();
        this.render();
    },

    async editExam(id) {
        const exam = this.data.exams.find(e => e.id === id);
        const newName = prompt('試験名を編集してください', exam.name);
        if (!newName || newName === exam.name) return;
        exam.name = newName;
        await this.saveData();
        this.render();
    },

    async deleteExam(id) {
        if (!confirm('この試験と含まれるすべての教科・カードを削除してもよろしいですか？')) return;
        this.data.exams = this.data.exams.filter(e => e.id !== id);
        await this.saveData();
        this.render();
    },

    async addSubject() {
        const name = prompt('教科名を入力してください');
        if (!name) return;
        const exam = this.data.exams.find(e => e.id === this.currentExamId);
        exam.subjects.push({
            id: 'subj-' + Date.now(),
            name: name,
            cards: []
        });
        await this.saveData();
        this.render();
    },

    async editSubject(id) {
        const exam = this.data.exams.find(e => e.id === this.currentExamId);
        const subj = exam.subjects.find(s => s.id === id);
        const newName = prompt('教科名を編集してください', subj.name);
        if (!newName || newName === subj.name) return;
        subj.name = newName;
        await this.saveData();
        this.render();
    },

    async deleteSubject(id) {
        if (!confirm('この教科と含まれるすべてのカードを削除してもよろしいですか？')) return;
        const exam = this.data.exams.find(e => e.id === this.currentExamId);
        exam.subjects = exam.subjects.filter(s => s.id !== id);
        await this.saveData();
        this.render();
    }
};

// キーボード操作
window.addEventListener('keydown', (e) => {
    if (app.currentView === 'study') {
        if (e.code === 'Space' && !app.showAnswer) {
            e.preventDefault();
            app.revealAnswer();
        } else if (app.showAnswer) {
            if (e.code === 'Enter') {
                e.preventDefault();
                app.nextCard();
            }
        }
    }
});

app.init();
