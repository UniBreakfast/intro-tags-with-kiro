class HTMLTagsApp {
  constructor() {
    this.currentCardIndex = 0;
    this.cards = [];
    this.quizScore = 0;
    this.totalQuizQuestions = 0;
    this.autoAdvanceTimeout = null;
    this.answeredQuestions = new Set();
    this.currentLanguage = 'en';
    this.translations = {};
    this.init();
  }

  async loadLanguage(lang) {
    try {
      const response = await fetch(`lang/${lang}.json`);
      this.translations = await response.json();
      this.currentLanguage = lang;
      this.updateAllTexts();
      this.regenerateCards();
    } catch (error) {
      console.error('Failed to load language:', error);
    }
  }

  getText(key) {
    return this.translations[key] || key;
  }

  updateAllTexts() {
    // Update all elements with data-text attributes
    document.querySelectorAll('[data-text]').forEach(element => {
      const key = element.getAttribute('data-text');
      element.textContent = this.getText(key);
    });
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
    const conceptData = [
      {
        titleKey: 'concept_what_is_tag_title',
        contentKey: 'concept_what_is_tag_content',
        codeExample: '&lt;p&gt;This is a paragraph&lt;/p&gt;'
      },
      {
        titleKey: 'concept_opening_tags_title',
        contentKey: 'concept_opening_tags_content',
        codeExample: '&lt;h1&gt; &lt;p&gt; &lt;div&gt; &lt;span&gt;'
      },
      {
        titleKey: 'concept_closing_tags_title',
        contentKey: 'concept_closing_tags_content',
        codeExample: '&lt;/h1&gt; &lt;/p&gt; &lt;/div&gt; &lt;/span&gt;'
      },
      {
        titleKey: 'concept_paired_tags_title',
        contentKey: 'concept_paired_tags_content',
        codeExample: '&lt;h1&gt;Welcome to my website&lt;/h1&gt;<br>&lt;p&gt;This is a paragraph of text.&lt;/p&gt;'
      },
      {
        titleKey: 'concept_void_tags_title',
        contentKey: 'concept_void_tags_content',
        codeExample: '&lt;br&gt; &lt;img&gt; &lt;input&gt; &lt;hr&gt; &lt;meta&gt;'
      },
      {
        titleKey: 'concept_simple_tags_title',
        contentKey: 'concept_simple_tags_content',
        codeExample: '&lt;h1&gt;Main Heading&lt;/h1&gt;<br>&lt;p&gt;Simple paragraph&lt;/p&gt;<br>&lt;br&gt;'
      },
      {
        titleKey: 'concept_tags_with_attributes_title',
        contentKey: 'concept_tags_with_attributes_content',
        codeExample: '&lt;img src="photo.jpg" alt="A beautiful sunset"&gt;<br>&lt;a href="https://example.com"&gt;Click here&lt;/a&gt;'
      },
      {
        titleKey: 'concept_tags_vs_elements_title',
        contentKey: 'concept_tags_vs_elements_content',
        codeExample: 'Tag: &lt;p&gt;Hello World&lt;/p&gt;<br>Element: The actual paragraph displayed on the page'
      },
      {
        titleKey: 'concept_tag_nesting_title',
        contentKey: 'concept_tag_nesting_content',
        codeExample: '&lt;div&gt;<br>&nbsp;&nbsp;&lt;h2&gt;Section Title&lt;/h2&gt;<br>&nbsp;&nbsp;&lt;p&gt;Some &lt;strong&gt;bold&lt;/strong&gt; text.&lt;/p&gt;<br>&lt;/div&gt;'
      },
      {
        titleKey: 'concept_proper_nesting_title',
        contentKey: 'concept_proper_nesting_content',
        codeExample: '✅ Correct: &lt;p&gt;&lt;strong&gt;Bold text&lt;/strong&gt;&lt;/p&gt;<br>❌ Wrong: &lt;p&gt;&lt;strong&gt;Bold text&lt;/p&gt;&lt;/strong&gt;'
      }
    ];

    return conceptData.map(concept => {
      const contentParts = this.getText(concept.contentKey).split('|');
      const content = `
        <p>${contentParts[0]}</p>
        <div class="code-example">${concept.codeExample}</div>
        <p>${contentParts[1] ? contentParts[1].replace(/where an element starts|where an element ends|complete by themselves|default behavior and styling|name="value"|instructions|result|parent-child relationship|balanced parentheses/, '<span class="highlight">$&</span>') : ''}</p>
      `;
      
      return {
        type: 'concept',
        title: this.getText(concept.titleKey),
        content: content
      };
    });
  }

  generateQuizQuestions() {
    const quizData = [
      {
        questionKey: 'quiz_html_tags_correct_question',
        correctKey: 'quiz_html_tags_correct_correct',
        incorrectKey: 'quiz_html_tags_correct_incorrect'
      },
      {
        questionKey: 'quiz_closing_tag_question',
        correctKey: 'quiz_closing_tag_correct',
        incorrectKey: 'quiz_closing_tag_incorrect'
      },
      {
        questionKey: 'quiz_void_tag_question',
        correctKey: 'quiz_void_tag_correct',
        incorrectKey: 'quiz_void_tag_incorrect',
        correctCode: '&lt;img&gt;',
        incorrectCode: '&lt;p&gt;'
      },
      {
        questionKey: 'quiz_tags_vs_elements_question',
        correctKey: 'quiz_tags_vs_elements_correct',
        incorrectKey: 'quiz_tags_vs_elements_incorrect'
      },
      {
        questionKey: 'quiz_nesting_question',
        correctKey: 'quiz_nesting_correct',
        incorrectKey: 'quiz_nesting_incorrect',
        correctCodeBlock: '&lt;p&gt;<br>&nbsp;&nbsp;&lt;strong&gt;Bold&lt;/strong&gt;<br>&lt;/p&gt;',
        incorrectCodeBlock: '&lt;p&gt;<br>&nbsp;&nbsp;&lt;strong&gt;Bold&lt;/p&gt;<br>&lt;/strong&gt;'
      },
      {
        questionKey: 'quiz_angle_brackets_question',
        correctKey: 'quiz_angle_brackets_correct',
        incorrectKey: 'quiz_angle_brackets_incorrect',
        correctCode: '&lt; &gt;'
      },
      {
        questionKey: 'quiz_paired_tags_question',
        correctKey: 'quiz_paired_tags_correct',
        incorrectKey: 'quiz_paired_tags_incorrect'
      },
      {
        questionKey: 'quiz_missing_closing_question',
        correctKey: 'quiz_missing_closing_correct',
        incorrectKey: 'quiz_missing_closing_incorrect'
      },
      {
        questionKey: 'quiz_attribute_syntax_question',
        correctKey: 'quiz_attribute_syntax_correct',
        incorrectKey: 'quiz_attribute_syntax_incorrect',
        correctCodeBlock: '&lt;img src="photo.jpg"<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;alt="description"&gt;',
        incorrectCodeBlock: '&lt;img (src=photo.jpg)<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;(alt=description)&gt;'
      },
      {
        questionKey: 'quiz_void_tags_special_question',
        correctKey: 'quiz_void_tags_special_correct',
        incorrectKey: 'quiz_void_tags_special_incorrect'
      },
      {
        questionKey: 'quiz_tag_structure_question',
        correctKey: 'quiz_tag_structure_correct',
        incorrectKey: 'quiz_tag_structure_incorrect',
        correctCodeBlock: '&lt;div class="container"&gt;<br>&nbsp;&nbsp;Content<br>&lt;/div&gt;',
        incorrectCodeBlock: '&lt;div class="container"&gt;<br>&nbsp;&nbsp;Content<br>&lt;div&gt;'
      },
      {
        questionKey: 'quiz_doctype_question',
        correctKey: 'quiz_doctype_correct',
        incorrectKey: 'quiz_doctype_incorrect',
        correctCode: '&lt;!DOCTYPE html&gt;',
        incorrectCode: '&lt;!DOCTYPE html&gt;'
      },
      {
        questionKey: 'quiz_comments_question',
        correctKey: 'quiz_comments_correct',
        incorrectKey: 'quiz_comments_incorrect',
        correctCodeBlock: '&lt;!-- This is a comment --&gt;',
        incorrectCodeBlock: '&lt;comment&gt;<br>&nbsp;&nbsp;This is a comment<br>&lt;/comment&gt;'
      },
      {
        questionKey: 'quiz_multiple_attributes_question',
        correctKey: 'quiz_multiple_attributes_correct',
        incorrectKey: 'quiz_multiple_attributes_incorrect',
        correctCodeBlock: '&lt;input type="text"<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;name="username"<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;required&gt;',
        incorrectCodeBlock: '&lt;input type="text",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;name="username",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;required&gt;'
      },
      {
        questionKey: 'quiz_line_break_question',
        correctKey: 'quiz_line_break_correct',
        incorrectKey: 'quiz_line_break_incorrect',
        correctCode: '&lt;br&gt;',
        incorrectCodeBlock: '&lt;break&gt;<br>&lt;/break&gt;'
      }
    ];

    return quizData.map(quiz => {
      let correct = this.getText(quiz.correctKey);
      let incorrect = this.getText(quiz.incorrectKey);

      // Add code elements where needed
      if (quiz.correctCode) {
        correct = `<span class="inline-code">${quiz.correctCode}</span> ${correct}`;
      }
      if (quiz.incorrectCode) {
        incorrect = `<span class="inline-code">${quiz.incorrectCode}</span> ${incorrect}`;
      }
      if (quiz.correctCodeBlock) {
        correct = `<div class="code-example">${quiz.correctCodeBlock}</div>${correct}`;
      }
      if (quiz.incorrectCodeBlock) {
        incorrect = `<div class="code-example">${quiz.incorrectCodeBlock}</div>${incorrect}`;
      }

      return {
        question: this.getText(quiz.questionKey),
        correct: correct,
        incorrect: incorrect
      };
    });
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

    // Add shuffled quiz cards
    const shuffledQuestions = this.shuffleArray(this.quizQuestions);
    this.totalQuizQuestions = shuffledQuestions.length;

    shuffledQuestions.forEach((question, index) => {
      // Randomly decide if correct option comes first or second
      const correctFirst = Math.random() < 0.5;
      this.cards.push({
        type: 'quiz',
        questionId: `quiz_${index}`,
        question: question.question,
        options: correctFirst ? [
          { text: question.correct, correct: true },
          { text: question.incorrect, correct: false }
        ] : [
          { text: question.incorrect, correct: false },
          { text: question.correct, correct: true }
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

    this.prevBtn.addEventListener('click', () => this.previousCard());
    this.nextBtn.addEventListener('click', () => this.nextCard());
    this.languageSelect.addEventListener('change', (e) => this.loadLanguage(e.target.value));

    // Load default language
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
const app = new HTMLTagsApp();