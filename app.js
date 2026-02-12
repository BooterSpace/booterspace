const state = {
  user: JSON.parse(localStorage.getItem('bs_user') || '{"name":"Alex Morgan","title":"Product Designer at BooterSpace","about":"Building meaningful digital products."}'),
  posts: JSON.parse(localStorage.getItem('bs_posts') || '[]'),
  network: JSON.parse(localStorage.getItem('bs_network') || '[{"name":"Priya Nair","role":"Frontend Engineer","company":"Pixel Labs"},{"name":"Diego Chen","role":"Data Analyst","company":"North Metrics"},{"name":"Sara Ali","role":"HR Manager","company":"PeopleOps"}]'),
  jobs: JSON.parse(localStorage.getItem('bs_jobs') || '[{"title":"Frontend Developer","company":"NovaSoft","location":"Remote","type":"Full-time"},{"title":"Product Manager","company":"BrightFlow","location":"New York","type":"Hybrid"},{"title":"UI/UX Designer","company":"Orbit Studio","location":"Berlin","type":"On-site"}]'),
  messages: JSON.parse(localStorage.getItem('bs_messages') || '[{"from":"Priya Nair","text":"Hey! Want to collaborate on a design sprint?"},{"from":"Diego Chen","text":"I can share the analytics dashboard mockups."}]'),
  notifications: JSON.parse(localStorage.getItem('bs_notifications') || '[{"text":"Priya Nair viewed your profile"},{"text":"You have 3 new job recommendations"}]')
};

function save() {
  localStorage.setItem('bs_user', JSON.stringify(state.user));
  localStorage.setItem('bs_posts', JSON.stringify(state.posts));
  localStorage.setItem('bs_network', JSON.stringify(state.network));
  localStorage.setItem('bs_jobs', JSON.stringify(state.jobs));
  localStorage.setItem('bs_messages', JSON.stringify(state.messages));
  localStorage.setItem('bs_notifications', JSON.stringify(state.notifications));
}

function initials(name) {
  return name.split(' ').map(part => part[0]).slice(0, 2).join('').toUpperCase();
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
      { author: 'BooterSpace Team', text: 'Welcome to your professional community! Share updates, hire talent, and grow your network.', likes: 11, comments: 2 }
    ];
  }

  list.innerHTML = state.posts.map((post, idx) => `
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
  `).join('');

  list.querySelectorAll('[data-like]').forEach(btn => {
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
  const matches = state.network.filter(p =>
    `${p.name} ${p.role} ${p.company}`.toLowerCase().includes(query)
  );
  list.innerHTML = matches.map(person => `
    <div class="list-item row space">
      <div>
        <strong>${person.name}</strong>
        <p class="muted">${person.role} • ${person.company}</p>
      </div>
      <button class="btn secondary">Connect</button>
    </div>
  `).join('') || '<p class="muted">No people found.</p>';
}

function renderJobs() {
  const list = document.getElementById('job-list');
  if (!list) return;
  const query = (document.getElementById('job-search')?.value || '').toLowerCase();
  const matches = state.jobs.filter(j =>
    `${j.title} ${j.company} ${j.location} ${j.type}`.toLowerCase().includes(query)
  );
  list.innerHTML = matches.map(job => `
    <div class="list-item">
      <strong>${job.title}</strong>
      <p class="muted mt8">${job.company} • ${job.location} • ${job.type}</p>
      <button class="btn mt12">Easy Apply</button>
    </div>
  `).join('') || '<p class="muted">No jobs found.</p>';
}

function renderMessages() {
  const list = document.getElementById('message-list');
  if (!list) return;
  list.innerHTML = state.messages.map(msg => `
    <div class="list-item">
      <strong>${msg.from}</strong>
      <p class="mt8">${msg.text}</p>
    </div>
  `).join('');
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
  list.innerHTML = state.notifications.map(n => `<div class="list-item">${n.text}</div>`).join('');
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

function setupAuthForms() {
  const login = document.getElementById('login-form');
  const signup = document.getElementById('signup-form');

  if (login) {
    login.addEventListener('submit', (e) => {
      e.preventDefault();
      window.location.href = 'index.html';
    });
  }

  if (signup) {
    signup.addEventListener('submit', (e) => {
      e.preventDefault();
      const fullName = document.getElementById('signup-name').value.trim();
      if (fullName) {
        state.user.name = fullName;
        save();
      }
      window.location.href = 'index.html';
    });
  }
}

function boot() {
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
  setupAuthForms();

  document.getElementById('network-search')?.addEventListener('input', renderNetwork);
  document.getElementById('job-search')?.addEventListener('input', renderJobs);
}

document.addEventListener('DOMContentLoaded', boot);
