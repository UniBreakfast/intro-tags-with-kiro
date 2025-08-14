class HTMLTagsApp {
  constructor() {
    this.currentCardIndex = 0;
    this.conceptCards = this.generateConceptCards();
    this.quizQuestions = this.generateQuizQuestions();
    this.cards = [];
    this.quizScore = 0;
    this.totalQuizQuestions = 0;
    this.autoAdvanceTimeout = null;
    this.answeredQuestions = new Set();
    this.init();
  }

  generateConceptCards() {
    return [
      {
        type: 'concept',
        title: 'What is an HTML Tag?',
        content: `
                    <p>An HTML tag is a keyword enclosed in angle brackets that tells the browser how to structure and display content.</p>
                    <div class="code-example">&lt;p&gt;This is a paragraph&lt;/p&gt;</div>
                    <p>Tags are the building blocks of HTML documents and define the structure and meaning of web content.</p>
                `
      },
      {
        type: 'concept',
        title: 'Opening Tags',
        content: `
                    <p>An opening tag marks the beginning of an HTML element. It consists of the tag name enclosed in angle brackets.</p>
                    <div class="code-example">&lt;h1&gt; &lt;p&gt; &lt;div&gt; &lt;span&gt;</div>
                    <p>Opening tags tell the browser <span class="highlight">where an element starts</span>.</p>
                `
      },
      {
        type: 'concept',
        title: 'Closing Tags',
        content: `
                    <p>A closing tag marks the end of an HTML element. It's identical to the opening tag but includes a forward slash.</p>
                    <div class="code-example">&lt;/h1&gt; &lt;/p&gt; &lt;/div&gt; &lt;/span&gt;</div>
                    <p>Closing tags tell the browser <span class="highlight">where an element ends</span>.</p>
                `
      },
      {
        type: 'concept',
        title: 'Paired Tags',
        content: `
                    <p>Most HTML tags come in pairs - an opening tag and a closing tag that work together to wrap content.</p>
                    <div class="code-example">&lt;h1&gt;Welcome to my website&lt;/h1&gt;<br>&lt;p&gt;This is a paragraph of text.&lt;/p&gt;</div>
                    <p>The content between paired tags is what gets formatted or structured by the element.</p>
                `
      },
      {
        type: 'concept',
        title: 'Void Tags (Self-Closing)',
        content: `
                    <p>Some HTML tags don't need closing tags because they don't contain content. These are called void or self-closing tags.</p>
                    <div class="code-example">&lt;br&gt; &lt;img&gt; &lt;input&gt; &lt;hr&gt; &lt;meta&gt;</div>
                    <p>Void tags represent elements that are <span class="highlight">complete by themselves</span>.</p>
                `
      },
      {
        type: 'concept',
        title: 'Simple Tags (No Attributes)',
        content: `
                    <p>Simple tags contain only the tag name without any additional information or attributes.</p>
                    <div class="code-example">&lt;h1&gt;Main Heading&lt;/h1&gt;<br>&lt;p&gt;Simple paragraph&lt;/p&gt;<br>&lt;br&gt;</div>
                    <p>These tags use their <span class="highlight">default behavior and styling</span>.</p>
                `
      },
      {
        type: 'concept',
        title: 'Tags with Attributes',
        content: `
                    <p>Tags can include attributes that provide additional information or modify the element's behavior.</p>
                    <div class="code-example">&lt;img src="photo.jpg" alt="A beautiful sunset"&gt;<br>&lt;a href="https://example.com"&gt;Click here&lt;/a&gt;</div>
                    <p>Attributes are written as <span class="highlight">name="value"</span> pairs inside the opening tag.</p>
                `
      },
      {
        type: 'concept',
        title: 'Tags vs Elements',
        content: `
                    <p>A <strong>tag</strong> is the code you write. An <strong>element</strong> is what the browser creates from that tag at runtime.</p>
                    <div class="code-example">Tag: &lt;p&gt;Hello World&lt;/p&gt;<br>Element: The actual paragraph displayed on the page</div>
                    <p>Think of tags as <span class="highlight">instructions</span> and elements as the <span class="highlight">result</span>.</p>
                `
      },
      {
        type: 'concept',
        title: 'Tag Nesting',
        content: `
                    <p>HTML tags can be nested inside other tags to create complex structures and hierarchies.</p>
                    <div class="code-example">&lt;div&gt;<br>&nbsp;&nbsp;&lt;h2&gt;Section Title&lt;/h2&gt;<br>&nbsp;&nbsp;&lt;p&gt;Some &lt;strong&gt;bold&lt;/strong&gt; text.&lt;/p&gt;<br>&lt;/div&gt;</div>
                    <p>Nested tags create a <span class="highlight">parent-child relationship</span> in the document structure.</p>
                `
      },
      {
        type: 'concept',
        title: 'Proper Nesting Rules',
        content: `
                    <p>Tags must be properly nested - they cannot overlap. The last opened tag must be the first one closed.</p>
                    <div class="code-example">✅ Correct: &lt;p&gt;&lt;strong&gt;Bold text&lt;/strong&gt;&lt;/p&gt;<br>❌ Wrong: &lt;p&gt;&lt;strong&gt;Bold text&lt;/p&gt;&lt;/strong&gt;</div>
                    <p>Think of it like <span class="highlight">balanced parentheses</span> in mathematics.</p>
                `
      }
    ];
  }

  generateQuizQuestions() {
    return [
      {
        question: 'Which statement about HTML tags is correct?',
        correct: 'HTML tags are keywords enclosed in angle brackets that structure content.',
        incorrect: 'HTML tags are only used for styling and have no structural purpose.'
      },
      {
        question: 'What makes a closing tag different from an opening tag?',
        correct: 'A closing tag includes a forward slash (/) before the tag name.',
        incorrect: 'A closing tag uses square brackets instead of angle brackets.'
      },
      {
        question: 'Which of these is a void (self-closing) tag?',
        correct: '<span class="inline-code">&lt;img&gt;</span> - it doesn\'t need a closing tag because it doesn\'t contain content.',
        incorrect: '<span class="inline-code">&lt;p&gt;</span> - it always needs a closing tag to wrap text content.'
      },
      {
        question: 'What\'s the difference between tags and elements?',
        correct: 'Tags are the code you write; elements are what the browser creates at runtime.',
        incorrect: 'Tags and elements are exactly the same thing with different names.'
      },
      {
        question: 'Which nesting example is correct?',
        correct: '<div class="code-example">&lt;p&gt;<br>&nbsp;&nbsp;&lt;strong&gt;Bold&lt;/strong&gt;<br>&lt;/p&gt;</div>- properly nested without overlap.',
        incorrect: '<div class="code-example">&lt;p&gt;<br>&nbsp;&nbsp;&lt;strong&gt;Bold&lt;/p&gt;<br>&lt;/strong&gt;</div>- tags overlap incorrectly.'
      },
      {
        question: 'What do angle brackets indicate in HTML?',
        correct: 'Angle brackets <span class="inline-code">&lt; &gt;</span> mark the beginning and end of HTML tags.',
        incorrect: 'Angle brackets are used to create comments in HTML code.'
      },
      {
        question: 'Which statement about paired tags is true?',
        correct: 'Paired tags work together to wrap and format content between them.',
        incorrect: 'Paired tags must always be identical without any differences.'
      },
      {
        question: 'What happens if you forget a closing tag?',
        correct: 'The browser may not display content correctly or may auto-close the tag.',
        incorrect: 'Nothing happens - closing tags are optional in modern HTML.'
      },
      {
        question: 'Which is an example of proper attribute syntax?',
        correct: '<div class="code-example">&lt;img src="photo.jpg"<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;alt="description"&gt;</div>- attributes use name="value" format.',
        incorrect: '<div class="code-example">&lt;img (src=photo.jpg)<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;(alt=description)&gt;</div>- attributes use parentheses format.'
      },
      {
        question: 'What makes void tags special?',
        correct: 'Void tags are complete by themselves and don\'t contain other content.',
        incorrect: 'Void tags are deprecated and should not be used in modern HTML.'
      },
      {
        question: 'Which HTML tag structure is valid?',
        correct: '<div class="code-example">&lt;div class="container"&gt;<br>&nbsp;&nbsp;Content<br>&lt;/div&gt;</div>- proper opening and closing with attribute.',
        incorrect: '<div class="code-example">&lt;div class="container"&gt;<br>&nbsp;&nbsp;Content<br>&lt;div&gt;</div>- missing forward slash in closing tag.'
      },
      {
        question: 'What is the purpose of the DOCTYPE declaration?',
        correct: '<span class="inline-code">&lt;!DOCTYPE html&gt;</span> tells the browser which version of HTML to use.',
        incorrect: '<span class="inline-code">&lt;!DOCTYPE html&gt;</span> is used to add comments to HTML documents.'
      },
      {
        question: 'Which statement about HTML comments is correct?',
        correct: '<div class="code-example">&lt;!-- This is a comment --&gt;</div>- comments are not displayed on the webpage.',
        incorrect: '<div class="code-example">&lt;comment&gt;<br>&nbsp;&nbsp;This is a comment<br>&lt;/comment&gt;</div>- comments use regular tag syntax.'
      },
      {
        question: 'What happens with multiple attributes in a tag?',
        correct: '<div class="code-example">&lt;input type="text"<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;name="username"<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;required&gt;</div>- attributes are separated by spaces.',
        incorrect: '<div class="code-example">&lt;input type="text",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;name="username",<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;required&gt;</div>- attributes are separated by commas.'
      },
      {
        question: 'Which tag correctly creates a line break?',
        correct: '<span class="inline-code">&lt;br&gt;</span> - a void tag that creates a line break without content.',
        incorrect: '<div class="code-example">&lt;break&gt;<br>&lt;/break&gt;</div>- line breaks require opening and closing tags.'
      }
    ];
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

  init() {
    this.cardContainer = document.getElementById('cardContainer');
    this.prevBtn = document.getElementById('prevBtn');
    this.nextBtn = document.getElementById('nextBtn');
    this.cardCounter = document.getElementById('cardCounter');
    this.progressFill = document.getElementById('progressFill');

    this.prevBtn.addEventListener('click', () => this.previousCard());
    this.nextBtn.addEventListener('click', () => this.nextCard());

    this.generateCards();
    this.showCard(0);
    this.updateUI();
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
                <h3>${option.correct ? 'Correct' : 'Incorrect'}</h3>
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
    let message = '';

    if (percentage >= 90) {
      message = 'Excellent! You have mastered HTML tags!';
    } else if (percentage >= 70) {
      message = 'Great job! You have a solid understanding of HTML tags.';
    } else if (percentage >= 50) {
      message = 'Good effort! Review the concepts and try again to improve.';
    } else {
      message = 'Keep learning! Review the concept cards and try the quiz again.';
    }

    const finishDialog = document.createElement('div');
    finishDialog.className = 'card finish-dialog';
    finishDialog.innerHTML = `
            <h2>Quiz Complete!</h2>
            <div class="score">${this.quizScore}/${this.totalQuizQuestions}</div>
            <div class="message">${message}</div>
            <button class="restart-btn" onclick="app.restart()">Try Again</button>
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