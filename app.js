const STORAGE_KEY = 'booterspace_state_v1';

const firebaseConfig = {
  apiKey: 'AIzaSyAlZvTQfhpjPl0rAe_TjUeZdEOnNFt713k',
  authDomain: 'space-fc8d3.firebaseapp.com',
  projectId: 'space-fc8d3',
  storageBucket: 'space-fc8d3.firebasestorage.app',
  messagingSenderId: '131082481895',
  appId: '1:131082481895:web:4c84476d219a52012c7242',
  measurementId: 'G-ZHZN0T43XN',
};

const defaults = {
  auth: {
    isAuthenticated: false,
    email: '',
  },
  user: {
    name: 'Alex Morgan',
    title: 'Full Stack Developer',
    about: 'I build web experiences and enjoy mentoring early-career developers.',
  },
  posts: [],
  network: [
    { name: 'Jordan Lee', role: 'Product Designer', company: 'Nimbus Labs' },
    { name: 'Taylor Kim', role: 'Frontend Engineer', company: 'Aurora Tech' },
    { name: 'Riley Chen', role: 'Recruiter', company: 'BrightPath' },
  ],
  jobs: [
    { title: 'Frontend Developer', company: 'Skyline Inc.', location: 'Remote', type: 'Full-time' },
    { title: 'UI Engineer', company: 'PixelForge', location: 'New York, NY', type: 'Hybrid' },
    { title: 'Software Engineer', company: 'LaunchOps', location: 'Austin, TX', type: 'On-site' },
  ],
  messages: [
    { from: 'Jordan Lee', text: 'Hey Alex, would love your feedback on a new dashboard concept.' },
    { from: 'Hiring Team', text: 'Your application has moved to the next round. Congrats!' },
  ],
  notifications: [
    { text: 'Riley Chen viewed your profile.' },
    { text: 'New job match: Frontend Developer at Skyline Inc.' },
    { text: 'Jordan Lee accepted your connection request.' },
  ],
};

let state = load();

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...defaults, ...JSON.parse(raw) } : structuredClone(defaults);
  } catch {
    return structuredClone(defaults);
  }
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function initials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}

function isAuthPage() {
  return /login\.html|signup\.html/.test(window.location.pathname);
}

function initFirebaseAuth() {
  if (!window.firebase) return null;
  if (!window.firebase.apps.length) {
    window.firebase.initializeApp(firebaseConfig);
  }
  return window.firebase.auth();
}

function mapAuthError(error) {
  const code = error?.code || '';
  if (code.includes('email-already-in-use')) return 'This email is already in use.';
  if (code.includes('invalid-email')) return 'Please enter a valid email address.';
  if (code.includes('weak-password')) return 'Password should be at least 6 characters.';
  if (code.includes('user-not-found') || code.includes('wrong-password') || code.includes('invalid-credential')) {
    return 'Invalid email or password.';
  }
  if (code.includes('too-many-requests')) return 'Too many attempts. Please try again later.';
  return 'Something went wrong. Please try again.';
}

function setAuthMessage(message, kind = '') {
  const node = document.getElementById('auth-message');
  if (!node) return;
  node.textContent = message;
  node.className = `auth-message mt12 ${kind}`.trim();
}

function synchronizeAuthState(user) {
  state.auth = {
    isAuthenticated: !!user,
    email: user?.email || '',
  };

  if (user?.displayName) {
    state.user.name = user.displayName;
  }

  save();
}

function runAfterAuthCheck(runApp) {
  const auth = initFirebaseAuth();

  if (!auth) {
    if (isAuthPage()) {
      setAuthMessage('Authentication is unavailable right now.', 'error');
      return;
    }

    window.location.replace('login.html');
    return;
  }

  auth.onAuthStateChanged((user) => {
    if (!isAuthPage() && !user) {
      window.location.replace('login.html');
      return;
    }

    if (isAuthPage() && user) {
      window.location.replace('index.html');
      return;
    }

    synchronizeAuthState(user);
    runApp(auth);
  });
}

function renderMiniProfile() {
  const root = document.getElementById('mini-profile');
  if (!root) return;
  root.innerHTML = `
    <div class="avatar">${initials(state.user.name)}</div>
    <h3>${state.user.name}</h3>
    <p class="muted mt8">${state.user.title}</p>
  `;
}

function renderFeed() {
  const list = document.getElementById('feed-list');
  if (!list) return;
  if (!state.posts.length) {
    state.posts = [
      { author: 'BooterSpace Team', text: 'Welcome to your professional community! Share updates, hire talent, and grow your network.', likes: 11, comments: 2 },
    ];
  }

  list.innerHTML = state.posts
    .map(
      (post, idx) => `
    <article class="post">
      <div class="row">
        <div class="avatar" style="width:44px;height:44px;font-size:0.9rem">${initials(post.author)}</div>
        <div>
          <strong>${post.author}</strong>
          <p class="muted">${post.comments} comments</p>
        </div>
      </div>
      <p class="mt12">${post.text}</p>
      <div class="post-actions">
        <button data-like="${idx}">👍 Like (${post.likes})</button>
        <button>💬 Comment</button>
        <button>↗ Share</button>
      </div>
    </article>
  `
    )
    .join('');

  list.querySelectorAll('[data-like]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const index = Number(btn.dataset.like);
      state.posts[index].likes += 1;
      save();
      renderFeed();
    });
  });
}

function setupComposer() {
  const form = document.getElementById('post-form');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = document.getElementById('post-text').value.trim();
    if (!text) return;
    state.posts.unshift({ author: state.user.name, text, likes: 0, comments: 0 });
    save();
    form.reset();
    renderFeed();
  });
}

function renderNetwork() {
  const list = document.getElementById('network-list');
  if (!list) return;
  const query = (document.getElementById('network-search')?.value || '').toLowerCase();
  const matches = state.network.filter((p) => `${p.name} ${p.role} ${p.company}`.toLowerCase().includes(query));
  list.innerHTML =
    matches
      .map(
        (person) => `
    <div class="list-item row space">
      <div>
        <strong>${person.name}</strong>
        <p class="muted">${person.role} • ${person.company}</p>
      </div>
      <button class="btn secondary">Connect</button>
    </div>
  `
      )
      .join('') || '<p class="muted">No people found.</p>';
}

function renderJobs() {
  const list = document.getElementById('job-list');
  if (!list) return;
  const query = (document.getElementById('job-search')?.value || '').toLowerCase();
  const matches = state.jobs.filter((j) => `${j.title} ${j.company} ${j.location} ${j.type}`.toLowerCase().includes(query));
  list.innerHTML =
    matches
      .map(
        (job) => `
    <div class="list-item">
      <strong>${job.title}</strong>
      <p class="muted mt8">${job.company} • ${job.location} • ${job.type}</p>
      <button class="btn mt12">Easy Apply</button>
    </div>
  `
      )
      .join('') || '<p class="muted">No jobs found.</p>';
}

function renderMessages() {
  const list = document.getElementById('message-list');
  if (!list) return;
  list.innerHTML = state.messages
    .map(
      (msg) => `
    <div class="list-item">
      <strong>${msg.from}</strong>
      <p class="mt8">${msg.text}</p>
    </div>
  `
    )
    .join('');
}

function setupMessageForm() {
  const form = document.getElementById('message-form');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const to = document.getElementById('message-to').value.trim() || 'New contact';
    const text = document.getElementById('message-text').value.trim();
    if (!text) return;
    state.messages.unshift({ from: to, text });
    save();
    form.reset();
    renderMessages();
  });
}

function renderNotifications() {
  const list = document.getElementById('notification-list');
  if (!list) return;
  list.innerHTML = state.notifications.map((n) => `<div class="list-item">${n.text}</div>`).join('');
}

function renderProfile() {
  const root = document.getElementById('profile-view');
  if (!root) return;
  root.innerHTML = `
    <div class="row">
      <div class="avatar">${initials(state.user.name)}</div>
      <div>
        <h2>${state.user.name}</h2>
        <p class="muted">${state.user.title}</p>
      </div>
    </div>
    <p class="mt12">${state.user.about}</p>
  `;
}

function setupProfileEditor() {
  const form = document.getElementById('profile-form');
  if (!form) return;
  form.name.value = state.user.name;
  form.title.value = state.user.title;
  form.about.value = state.user.about;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    state.user = {
      name: form.name.value.trim() || state.user.name,
      title: form.title.value.trim() || state.user.title,
      about: form.about.value.trim() || state.user.about,
    };
    save();
    renderMiniProfile();
    renderProfile();
    alert('Profile updated successfully.');
  });
}

function setupAuthForms(auth) {
  const login = document.getElementById('login-form');
  const signup = document.getElementById('signup-form');

  if (login) {
    login.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value.trim();
      const password = document.getElementById('login-password').value;

      try {
        setAuthMessage('Signing you in…');
        await auth.signInWithEmailAndPassword(email, password);
        setAuthMessage('Signed in! Redirecting…', 'success');
        window.location.href = 'index.html';
      } catch (error) {
        setAuthMessage(mapAuthError(error), 'error');
      }
    });
  }

  if (signup) {
    signup.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fullName = document.getElementById('signup-name').value.trim();
      const email = document.getElementById('signup-email').value.trim();
      const password = document.getElementById('signup-password').value;

      try {
        setAuthMessage('Creating account…');
        const credential = await auth.createUserWithEmailAndPassword(email, password);
        if (fullName) {
          await credential.user.updateProfile({ displayName: fullName });
          state.user.name = fullName;
        }
        save();
        setAuthMessage('Account created! Redirecting…', 'success');
        window.location.href = 'index.html';
      } catch (error) {
        setAuthMessage(mapAuthError(error), 'error');
      }
    });
  }
}

function setupLogout(auth) {
  const button = document.getElementById('logout-btn');
  if (!button) return;

  button.addEventListener('click', async () => {
    try {
      await auth.signOut();
      state.auth = { isAuthenticated: false, email: '' };
      save();
      window.location.href = 'login.html';
    } catch {
      alert('Unable to log out right now.');
    }
  });
}

function boot() {
  runAfterAuthCheck((auth) => {
    renderMiniProfile();
    renderFeed();
    setupComposer();
    renderNetwork();
    renderJobs();
    renderMessages();
    setupMessageForm();
    renderNotifications();
    renderProfile();
    setupProfileEditor();
    setupAuthForms(auth);
    setupLogout(auth);

    document.getElementById('network-search')?.addEventListener('input', renderNetwork);
    document.getElementById('job-search')?.addEventListener('input', renderJobs);
  });
}

document.addEventListener('DOMContentLoaded', boot);
