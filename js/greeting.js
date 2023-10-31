const greetingText = [
  "Good morning!",
  "Good afternoon!",
  "Good evening!",
  "Good night!",
];

const phrases = [
  "Explore the flavor of data with Data Bites.",
  "Savor the insights, one byte at a time.",
  "Feeding your hunger for data-driven discoveries.",
];

function updateGreeting() {
  const now = new Date();
  const currentHour = now.getHours();
  let greeting;

  if (currentHour >= 4 && currentHour < 12) {
    greeting = greetingText[0];
  } else if (currentHour >= 12 && currentHour < 17) {
    greeting = greetingText[1];
  } else if (currentHour >= 17 && currentHour < 20) {
    greeting = greetingText[2];
  } else {
    greeting = greetingText[3];
  }

  const greetingElement = document.getElementById("greeting");
  greetingElement.textContent = greeting;
}

function animatePhrases() {
  const phrasesElement = document.getElementById("phrases");
  let phraseIndex = 0;
  let charIndex = 0;
  let isBackspacing = false;
  let isTyping = true;

  const animate = () => {
    const phrase = phrases[phraseIndex];
    let text = phrase.substring(0, charIndex);

    if (isBackspacing) {
      text = phrase.substring(0, charIndex);
      charIndex--;
    } else if (charIndex < phrase.length) {
      text += phrase[charIndex];
      charIndex++;
    } else if (!isBackspacing && charIndex === phrase.length) {
      isBackspacing = true;
    }

    phrasesElement.textContent = text;

    if (isBackspacing && text === phrase) {
      isBackspacing = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
      charIndex = 0;
      isTyping = false;
      setTimeout(animate, 1000); // Delay before the next phrase
    } else if (!isTyping && text === "") {
      isTyping = true;
      setTimeout(animate, 100); // Adjust the timing here if needed
    } else {
      setTimeout(animate, 100); // Adjust the timing here if needed
    }
  };

  animate(); // Start the animation
}

updateGreeting();
animatePhrases();

updateGreeting();
animatePhrases();
