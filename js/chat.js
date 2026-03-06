// Update dynamic viewport height for mobile
function setVh() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}
window.addEventListener('resize', setVh);
setVh();

/*******************************************************
 * Default Responses (Fallback)
 *******************************************************/
const defaultResponses = {
  nudgeResponses: [
    "Oi, that's a strong nudge!",
    "Stop nudging me, I'm fragile!",
    "Another nudge? I'll remember this...",
    "Nudge accepted. Please hold."
  ],
  greetingResponses: [
    "Hey, how's it going?",
    "Hello there! Lovely day, isn't it?",
    "Hiya, what's new?"
  ],
  farewellResponses: [
    "Bye, talk soon!",
    "See ya later!",
    "Cya, have a good one!"
  ],
  questionResponses: [
    "That's a tricky one, not sure!",
    "Hmm, ask again later maybe?",
    "I honestly don't know. Sorry!"
  ],
  generalResponses: [
    "I'm just chilling, you know?",
    "Huh, interesting. Tell me more!",
    "Yeah, that sounds about right."
  ]
};

/*******************************************************
 * Load External Responses (if available)
 *******************************************************/
let responses = defaultResponses;
fetch('responses.json')
  .then(response => response.json())
  .then(data => { responses = data; })
  .catch(error => {
    console.error('Failed to load responses.json, using default responses.', error);
  });

/*******************************************************
 * DOM References & Navigation
 *******************************************************/
const homeScreen = document.getElementById('home-screen');
const chattertrapScreen = document.getElementById('chattertrap');
const chatEl = document.getElementById('chat');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const backBtn = document.getElementById('backBtn');
const nudgeBtn = document.getElementById('nudgeBtn');
const menuBtn = document.getElementById('menuBtn');
const menuDropdown = document.getElementById('menuDropdown');
const modeToggleBtn = document.getElementById('modeToggleBtn');
const openSettingsBtn = document.getElementById('openSettingsBtn');
const settingsModal = document.getElementById('settingsModal');
const saveSettingsBtn = document.getElementById('saveSettingsBtn');
const themeSelect = document.getElementById('themeSelect');
const customStatusInput = document.getElementById('customStatus');
const chatNameEl = document.getElementById('chatName');
const chatStatusEl = document.getElementById('chatStatus');
let isDark = false;

// When a conversation item is clicked, show the chat screen with that conversation's name and status.
document.querySelectorAll('.conversation-item').forEach(conversationItem => {
  conversationItem.addEventListener('click', () => {
    const name = conversationItem.querySelector('.conversation-name').innerText;
    const status = conversationItem.querySelector('.conversation-status').innerText;
    chatNameEl.innerText = name;
    chatStatusEl.innerText = status;
    homeScreen.style.display = 'none';
    chattertrapScreen.style.display = 'flex';
    autoScroll();
  });
});

backBtn.addEventListener('click', () => {
  chattertrapScreen.style.display = 'none';
  homeScreen.style.display = 'flex';
});

/*******************************************************
 * Settings Modal
 *******************************************************/
openSettingsBtn.addEventListener('click', () => {
  settingsModal.style.display = 'flex';
});

settingsModal.addEventListener('click', (e) => {
  if (e.target === settingsModal) {
    settingsModal.style.display = 'none';
  }
});

saveSettingsBtn.addEventListener('click', () => {
  if (themeSelect.value === 'dark') {
    document.body.classList.add('dark-theme');
    document.body.classList.remove('light-theme');
    isDark = true;
  } else {
    document.body.classList.add('light-theme');
    document.body.classList.remove('dark-theme');
    isDark = false;
  }

  const customStatus = customStatusInput.value.trim();
  if (customStatus) {
    chatStatusEl.innerText = customStatus;
  }

  settingsModal.style.display = 'none';
});

/*******************************************************
 * Theme Toggle in Chat Menu
 *******************************************************/
modeToggleBtn.addEventListener('click', () => {
  if (isDark) {
    document.body.classList.add('light-theme');
    document.body.classList.remove('dark-theme');
    modeToggleBtn.innerText = 'Switch to Dark Mode';
    isDark = false;
  } else {
    document.body.classList.add('dark-theme');
    document.body.classList.remove('light-theme');
    modeToggleBtn.innerText = 'Switch to Light Mode';
    isDark = true;
  }
});

menuBtn.addEventListener('click', () => {
  menuBtn.classList.toggle('open');
});

document.addEventListener('click', (e) => {
  if (!menuBtn.contains(e.target) && !menuDropdown.contains(e.target)) {
    menuBtn.classList.remove('open');
  }
});

/*******************************************************
 * Demo Status Rotation
 *******************************************************/
const statusOptions = ['Online', 'Away', 'Busy'];
setInterval(() => {
  const previousStatus = chatStatusEl.innerText;
  let nextStatus = previousStatus;

  while (nextStatus === previousStatus) {
    nextStatus = statusOptions[Math.floor(Math.random() * statusOptions.length)];
  }

  chatStatusEl.innerText = nextStatus;
  if (nextStatus === 'Online') chatStatusEl.style.color = 'green';
  else if (nextStatus === 'Away') chatStatusEl.style.color = 'orange';
  else if (nextStatus === 'Busy') chatStatusEl.style.color = 'red';
}, 30000);

/*******************************************************
 * Nudge Functionality
 *******************************************************/
nudgeBtn.addEventListener('click', () => {
  const chattertrapContainer = document.querySelector('.chattertrap-container');
  chattertrapContainer.classList.add('nudge');
  setTimeout(() => {
    chattertrapContainer.classList.remove('nudge');
  }, 500);

  const nudgeSound = document.getElementById('nudgeSound');
  if (nudgeSound) nudgeSound.play();

  addMessage('Jacko', '*Nudge*', 'jacko');
  autoScroll();
  showTypingIndicator();

  setTimeout(() => {
    hideTypingIndicator();
    addMessage(chatNameEl.innerText, getResponse('', true), 'pasky');
    autoScroll();
  }, 1500);
});

/*******************************************************
 * Send Message
 *******************************************************/
sendBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keydown', handleKeyDown);

function sendMessage() {
  const msg = messageInput.value.trim();
  if (!msg) return;

  addMessage('Jacko', msg, 'jacko');
  messageInput.value = '';
  autoScroll();
  showTypingIndicator();

  setTimeout(() => {
    hideTypingIndicator();
    addMessage(chatNameEl.innerText, getResponse(msg), 'pasky');
    autoScroll();
  }, 1500);
}

function handleKeyDown(e) {
  if (e.key === 'Enter') {
    e.preventDefault();
    sendMessage();
  }
}

/*******************************************************
 * Add Message to Chat
 *******************************************************/
function addMessage(username, text, userClass) {
  const block = document.createElement('div');
  block.classList.add('message-block', userClass);

  const avatar = document.createElement('div');
  avatar.classList.add('bubble-avatar');
  avatar.innerText = userClass === 'jacko' ? '🤖' : '👤';

  const bubble = document.createElement('div');
  bubble.classList.add('bubble');

  const nameEl = document.createElement('div');
  nameEl.classList.add('bubble-username');
  nameEl.innerText = username;

  const textEl = document.createElement('div');
  textEl.innerText = text;

  bubble.appendChild(nameEl);
  bubble.appendChild(textEl);

  if (userClass === 'pasky') {
    block.appendChild(avatar);
    block.appendChild(bubble);
  } else {
    block.appendChild(bubble);
    block.appendChild(avatar);
  }

  chatEl.appendChild(block);
}

/*******************************************************
 * Typing Indicator
 *******************************************************/
let typingEl = null;

function showTypingIndicator() {
  typingEl = document.createElement('div');
  typingEl.classList.add('typing-indicator');

  const avatar = document.createElement('div');
  avatar.classList.add('bubble-avatar');
  avatar.innerText = '👤';

  const bubble = document.createElement('div');
  bubble.classList.add('bubble');
  bubble.innerText = `${chatNameEl.innerText} is typing...`;

  typingEl.appendChild(avatar);
  typingEl.appendChild(bubble);
  chatEl.appendChild(typingEl);
  autoScroll();
}

function hideTypingIndicator() {
  if (typingEl && chatEl.contains(typingEl)) {
    chatEl.removeChild(typingEl);
    typingEl = null;
  }
}

/*******************************************************
 * Response Logic
 *******************************************************/
function getResponse(userMsg, isNudge = false) {
  if (isNudge) {
    return pickRandom(responses.nudgeResponses);
  }

  const lower = userMsg.toLowerCase();
  if (lower.includes('bye') || lower.includes('cya') || lower.includes('later') || lower.includes('goodbye')) {
    return pickRandom(responses.farewellResponses);
  }

  if (lower.startsWith('hi') || lower.startsWith('hello') || lower.startsWith('hey')) {
    return pickRandom(responses.greetingResponses);
  }

  if (lower.endsWith('?')) {
    return pickRandom(responses.questionResponses);
  }

  return pickRandom(responses.generalResponses);
}

function pickRandom(arr) {
  if (!arr || !arr.length) return 'Hmm... I have no words right now.';
  return arr[Math.floor(Math.random() * arr.length)];
}

/*******************************************************
 * Auto-scroll Chat to Bottom
 *******************************************************/
function autoScroll() {
  setTimeout(() => {
    chatEl.scrollTop = chatEl.scrollHeight;
  }, 50);
}
