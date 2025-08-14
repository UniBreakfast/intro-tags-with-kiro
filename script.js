class ConceptQuizApp {
  constructor(courseId = 'html-tags') {
    this.courseId = courseId;
    this.currentCardIndex = 0;
    this.cards = [];
    this.conceptCards = [];
    this.quizQuestions = [];
    this.courseData = null;
    this.availableCourses = [];
    this.quizScore = 0;
    this.totalQuizQuestions = 0;
    this.autoAdvanceTimeout = null;
    this.answeredQuestions = new Set();
    this.currentLanguage = 'en';
    this.uiTranslations = {};
    this.courseTranslations = {};
    this.init();
  }

  async loadLanguage(lang) {
    try {
      // Load UI translations
      const uiResponse = await fetch(`lang/${lang}.json`);
      if (uiResponse.ok) {
        this.uiTranslations = await uiResponse.json();
      } else {
        console.warn(`UI translations not found for ${lang}, falling back to English`);
        const fallbackResponse = await fetch(`lang/en.json`);
        this.uiTranslations = await fallbackResponse.json();
      }

      // Load course translations
      try {
        const courseResponse = await fetch(`courses/${this.courseId}/${lang}.json`);
        if (courseResponse.ok) {
          this.courseTranslations = await courseResponse.json();
        } else {
          console.warn(`Course translations not found for ${lang}, falling back to English`);
          const fallbackResponse = await fetch(`courses/${this.courseId}/en.json`);
          this.courseTranslations = await fallbackResponse.json();
        }
      } catch (courseError) {
        console.error(`Failed to load course translations for ${lang}:`, courseError);
        // Try to load English as fallback
        try {
          const fallbackResponse = await fetch(`courses/${this.courseId}/en.json`);
          this.courseTranslations = await fallbackResponse.json();
        } catch (fallbackError) {
          console.error('Failed to load fallback course translations:', fallbackError);
          this.courseTranslations = {};
        }
      }

      this.currentLanguage = lang;
      this.updateAllTexts();

      // Update course selector with new language
      await this.populateCourseSelector();

      // If we have cards already, just update their content
      if (this.cards.length > 0) {
        this.updateCardContent();
        this.updateCourseTitle();
      } else {
        // First time loading, load course data and generate cards
        await this.loadCourseData();
        this.updateCourseTitle();
        this.conceptCards = this.generateConceptCards();
        this.quizQuestions = this.generateQuizQuestions();
        this.generateCards();
        this.showCard(0);
        this.updateUI();
      }
    } catch (error) {
      console.error('Failed to load language:', error);
    }
  }

  async loadAvailableCourses() {
    try {
      // For now, we'll hardcode the available courses
      // In the future, this could scan the courses directory
      this.availableCourses = ['html-tags'];
      await this.populateCourseSelector();
    } catch (error) {
      console.error('Failed to load available courses:', error);
    }
  }

  async populateCourseSelector() {
    if (!this.courseSelect) return;

    this.courseSelect.innerHTML = '';

    for (const courseId of this.availableCourses) {
      try {
        const response = await fetch(`courses/${courseId}/index.json`);
        const courseNames = await response.json();

        const option = document.createElement('option');
        option.value = courseId;
        option.textContent = courseNames[this.currentLanguage] || courseNames['en'] || courseId;
        option.selected = courseId === this.courseId;

        this.courseSelect.appendChild(option);
      } catch (error) {
        console.error(`Failed to load course names for ${courseId}:`, error);
      }
    }
  }

  async loadCourse(courseId) {
    if (courseId === this.courseId) return;

    this.courseId = courseId;
    this.currentCardIndex = 0;
    this.cards = [];
    this.quizScore = 0;
    this.answeredQuestions.clear();

    // Reload the course with current language
    await this.loadLanguage(this.currentLanguage);
  }

  async loadCourseData() {
    try {
      const response = await fetch(`courses/${this.courseId}/course.json`);
      this.courseData = await response.json();
    } catch (error) {
      console.error('Failed to load course data:', error);
    }
  }

  updateCourseTitle() {
    const titleElement = document.getElementById('courseTitle');
    const subtitleElement = document.getElementById('courseSubtitle');

    if (titleElement && this.courseData && this.courseData.title) {
      titleElement.textContent = this.getText(this.courseData.title);
    }

    if (subtitleElement && this.courseData && this.courseData.subtitle) {
      subtitleElement.textContent = this.getText(this.courseData.subtitle);
    }
  }

  getText(key) {
    // Try course translations first, then UI translations
    return this.courseTranslations[key] || this.uiTranslations[key] || key;
  }

  updateAllTexts() {
    // Update all elements with data-text attributes
    document.querySelectorAll('[data-text]').forEach(element => {
      const key = element.getAttribute('data-text');
      element.textContent = this.getText(key);
    });
  }

  updateCardContent() {
    // Update existing cards with new language content
    const newConceptCards = this.generateConceptCards();
    const rawQuizData = this.generateQuizQuestions();

    this.cards.forEach((card, index) => {
      if (card.type === 'concept') {
        // Update concept card content
        if (index < newConceptCards.length) {
          card.title = newConceptCards[index].title;
          card.content = newConceptCards[index].content;
        }
      } else if (card.type === 'quiz') {
        // Update quiz card content using the stored original question data
        if (card.originalQuestionData) {
          // Find the same question in the raw data by matching the question key
          const originalQuestionKey = card.originalQuestionData.questionKey;
          const rawQuestion = rawQuizData.find(q => q.questionKey === originalQuestionKey);

          if (rawQuestion) {
            // Process the raw question data into final format
            let correct = this.getText(rawQuestion.correctKey);
            let incorrect = this.getText(rawQuestion.incorrectKey);

            // Add code elements where needed (same logic as in generateQuizQuestions)
            if (rawQuestion.correctCode) {
              correct = `<span class="inline-code">${rawQuestion.correctCode}</span> ${correct}`;
            }
            if (rawQuestion.incorrectCode) {
              incorrect = `<span class="inline-code">${rawQuestion.incorrectCode}</span> ${incorrect}`;
            }
            if (rawQuestion.correctCodeBlock) {
              correct = `<div class="code-example">${rawQuestion.correctCodeBlock}</div>${correct}`;
            }
            if (rawQuestion.incorrectCodeBlock) {
              incorrect = `<div class="code-example">${rawQuestion.incorrectCodeBlock}</div>${incorrect}`;
            }

            // Update the card
            card.question = this.getText(rawQuestion.questionKey);

            // Update options while preserving the order
            card.options.forEach(option => {
              if (option.correct) {
                option.text = correct;
              } else {
                option.text = incorrect;
              }
            });
          }
        }
      }
    });

    // Refresh the current card display
    this.showCard(this.currentCardIndex);
  }

  regenerateCards() {
    const wasAtEnd = this.currentCardIndex >= this.cards.length - 1;
    this.conceptCards = this.generateConceptCards();
    this.quizQuestions = this.generateQuizQuestions();
    this.generateCards();

    // Maintain position or go to start if we were at the end
    if (wasAtEnd || this.currentCardIndex >= this.cards.length) {
      this.currentCardIndex = 0;
    }

    this.showCard(this.currentCardIndex);
    this.updateUI();
  }

  generateConceptCards() {
    if (!this.courseData || !this.courseData.concepts) {
      return [];
    }

    return this.courseData.concepts.map(concept => {
      const contentParts = this.getText(concept.contentKey).split('|');
      const content = `
        <p>${contentParts[0]}</p>
        <div class="code-example">${concept.codeExample}</div>
        <p>${contentParts[1] || ''}</p>
      `;

      return {
        type: 'concept',
        title: this.getText(concept.titleKey),
        content: content
      };
    });
  }

  generateQuizQuestions() {
    if (!this.courseData || !this.courseData.quiz) {
      return [];
    }

    return this.courseData.quiz;
  }

  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  generateCards() {
    // Start with concept cards
    this.cards = [...this.conceptCards];

    // Get raw quiz data and shuffle it
    const rawQuizData = this.generateQuizQuestions();
    const shuffledRawData = this.shuffleArray(rawQuizData);
    this.totalQuizQuestions = shuffledRawData.length;

    // Process each raw question into final format
    shuffledRawData.forEach((rawQuestion, index) => {
      // Process the raw question data into final format
      let correct = this.getText(rawQuestion.correctKey);
      let incorrect = this.getText(rawQuestion.incorrectKey);

      // Add code elements where needed
      if (rawQuestion.correctCode) {
        correct = `<span class="inline-code">${rawQuestion.correctCode}</span> ${correct}`;
      }
      if (rawQuestion.incorrectCode) {
        incorrect = `<span class="inline-code">${rawQuestion.incorrectCode}</span> ${incorrect}`;
      }
      if (rawQuestion.correctCodeBlock) {
        correct = `<div class="code-example">${rawQuestion.correctCodeBlock}</div>${correct}`;
      }
      if (rawQuestion.incorrectCodeBlock) {
        incorrect = `<div class="code-example">${rawQuestion.incorrectCodeBlock}</div>${incorrect}`;
      }

      // Randomly decide if correct option comes first or second
      const correctFirst = Math.random() < 0.5;
      this.cards.push({
        type: 'quiz',
        questionId: `quiz_${index}`,
        originalQuestionData: rawQuestion, // Store the raw question data
        question: this.getText(rawQuestion.questionKey),
        options: correctFirst ? [
          { text: correct, correct: true },
          { text: incorrect, correct: false }
        ] : [
          { text: incorrect, correct: false },
          { text: correct, correct: true }
        ]
      });
    });
  }

  async init() {
    this.cardContainer = document.getElementById('cardContainer');
    this.prevBtn = document.getElementById('prevBtn');
    this.nextBtn = document.getElementById('nextBtn');
    this.cardCounter = document.getElementById('cardCounter');
    this.progressFill = document.getElementById('progressFill');
    this.languageSelect = document.getElementById('languageSelect');
    this.courseSelect = document.getElementById('courseSelect');

    this.prevBtn.addEventListener('click', () => this.previousCard());
    this.nextBtn.addEventListener('click', () => this.nextCard());
    this.languageSelect.addEventListener('change', (e) => this.loadLanguage(e.target.value));
    this.courseSelect.addEventListener('change', (e) => this.loadCourse(e.target.value));

    // Load available courses and default language
    await this.loadAvailableCourses();
    await this.loadLanguage('en');
  }

  showCard(index) {
    const card = this.cards[index];
    this.cardContainer.innerHTML = '';

    if (card.type === 'concept') {
      this.showConceptCard(card);
    } else if (card.type === 'quiz') {
      this.showQuizCard(card);
    }
  }

  showConceptCard(card) {
    const cardElement = document.createElement('div');
    cardElement.className = 'card';
    cardElement.innerHTML = `
            <h2>${card.title}</h2>
            ${card.content}
        `;
    this.cardContainer.appendChild(cardElement);
  }

  showQuizCard(card) {
    const cardElement = document.createElement('div');
    cardElement.className = 'card quiz-card';

    const optionsHTML = card.options.map((option, index) => `
            <div class="quiz-option" data-correct="${option.correct}" onclick="app.selectQuizOption(this)">
                <h3>${option.correct ? this.getText('correct') : this.getText('incorrect')}</h3>
                <p>${option.text}</p>
            </div>
        `).join('');

    cardElement.innerHTML = `
            <div style="grid-column: 1 / -1; margin-bottom: 20px;">
                <h2>${card.question}</h2>
            </div>
            ${optionsHTML}
        `;

    this.cardContainer.appendChild(cardElement);
  }

  selectQuizOption(optionElement) {
    const isCorrect = optionElement.dataset.correct === 'true';
    const allOptions = optionElement.parentElement.querySelectorAll('.quiz-option');
    const currentCard = this.cards[this.currentCardIndex];

    // Mark this question as answered
    if (currentCard.questionId) {
      this.answeredQuestions.add(currentCard.questionId);
    }

    // Track score
    if (isCorrect) {
      this.quizScore++;
    }

    // Reveal the correct/incorrect labels and apply styling
    allOptions.forEach(option => {
      option.style.pointerEvents = 'none';
      option.classList.add('revealed');
      if (option.dataset.correct === 'true') {
        option.classList.add('correct');
      } else {
        option.classList.add('incorrect');
      }
    });

    // Clear any existing timeout
    if (this.autoAdvanceTimeout) {
      clearTimeout(this.autoAdvanceTimeout);
    }

    // Set new timeout for auto-advance
    this.autoAdvanceTimeout = setTimeout(() => {
      if (this.currentCardIndex < this.cards.length - 1) {
        this.nextCard();
      } else {
        this.showFinishDialog();
      }
      this.autoAdvanceTimeout = null;
    }, 2000);
  }

  showFinishDialog() {
    const percentage = Math.round((this.quizScore / this.totalQuizQuestions) * 100);
    let messageKey = '';

    if (percentage >= 90) {
      messageKey = 'excellent_message';
    } else if (percentage >= 70) {
      messageKey = 'great_message';
    } else if (percentage >= 50) {
      messageKey = 'good_message';
    } else {
      messageKey = 'keep_learning_message';
    }

    const finishDialog = document.createElement('div');
    finishDialog.className = 'card finish-dialog';
    finishDialog.innerHTML = `
            <h2>${this.getText('quiz_complete')}</h2>
            <div class="score">${this.quizScore}/${this.totalQuizQuestions}</div>
            <div class="message">${this.getText(messageKey)}</div>
            <button class="restart-btn" onclick="app.restart()">${this.getText('try_again')}</button>
        `;

    this.cardContainer.innerHTML = '';
    this.cardContainer.appendChild(finishDialog);

    // Hide navigation buttons
    this.prevBtn.style.display = 'none';
    this.nextBtn.style.display = 'none';
    this.cardCounter.style.display = 'none';
  }

  restart() {
    this.currentCardIndex = 0;
    this.quizScore = 0;
    this.answeredQuestions.clear();
    this.generateCards();
    this.showCard(0);
    this.updateUI();

    // Show navigation buttons again
    this.prevBtn.style.display = 'block';
    this.nextBtn.style.display = 'block';
    this.cardCounter.style.display = 'block';
  }

  nextCard() {
    // Clear any pending auto-advance timeout
    if (this.autoAdvanceTimeout) {
      clearTimeout(this.autoAdvanceTimeout);
      this.autoAdvanceTimeout = null;
    }

    const currentCard = this.cards[this.currentCardIndex];

    // If current card is an unanswered quiz question, move it to the end
    if (currentCard.type === 'quiz' && currentCard.questionId && !this.answeredQuestions.has(currentCard.questionId)) {
      // Remove current card and add it to the end
      const skippedCard = this.cards.splice(this.currentCardIndex, 1)[0];
      this.cards.push(skippedCard);

      // Don't increment currentCardIndex since we removed the current card
      // Show the card that's now at the current index
      if (this.currentCardIndex < this.cards.length) {
        this.showCard(this.currentCardIndex);
        this.updateUI();
      }
    } else {
      // Normal navigation for concept cards or answered quiz questions
      if (this.currentCardIndex < this.cards.length - 1) {
        this.currentCardIndex++;
        this.showCard(this.currentCardIndex);
        this.updateUI();
      }
    }
  }

  previousCard() {
    // Clear any pending auto-advance timeout
    if (this.autoAdvanceTimeout) {
      clearTimeout(this.autoAdvanceTimeout);
      this.autoAdvanceTimeout = null;
    }

    if (this.currentCardIndex > 0) {
      this.currentCardIndex--;
      this.showCard(this.currentCardIndex);
      this.updateUI();
    }
  }

  updateUI() {
    this.prevBtn.disabled = this.currentCardIndex === 0;
    this.nextBtn.disabled = this.currentCardIndex === this.cards.length - 1;

    this.cardCounter.textContent = `${this.currentCardIndex + 1} / ${this.cards.length}`;

    const progress = ((this.currentCardIndex + 1) / this.cards.length) * 100;
    this.progressFill.style.width = `${progress}%`;
  }
}

// Initialize the app when the page loads
const app = new ConceptQuizApp('html-tags');